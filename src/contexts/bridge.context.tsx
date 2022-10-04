import { BigNumber, constants as ethersConstants, PayableOverrides } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import axios, { AxiosRequestConfig } from "axios";
import {
  createContext,
  FC,
  useContext,
  useCallback,
  useRef,
  useMemo,
  PropsWithChildren,
} from "react";

import { useEnvContext } from "src/contexts/env.context";
import { useProvidersContext } from "src/contexts/providers.context";
import { usePriceOracleContext } from "src/contexts/price-oracle.context";
import { useTokensContext } from "src/contexts/tokens.context";
import { Bridge__factory } from "src/types/contracts/bridge";
import {
  BRIDGE_CALL_GAS_INCREASE_PERCENTAGE,
  FIAT_DISPLAY_PRECISION,
  PENDING_TX_TIMEOUT,
} from "src/constants";
import { calculateFee } from "src/utils/fees";
import { multiplyAmounts } from "src/utils/amounts";
import { serializeBridgeId } from "src/utils/serializers";
import { selectTokenAddress } from "src/utils/tokens";
import { getDeposit, getDeposits, getMerkleProof } from "src/adapters/bridge-api";
import {
  permit,
  isPermitSupported,
  getErc20TokenEncodedMetadata,
  hasTxBeenReverted,
  isTxCanceled,
  isTxMined,
} from "src/adapters/ethereum";
import {
  Env,
  Chain,
  Token,
  Bridge,
  OnHoldBridge,
  Deposit,
  EthereumChainId,
  PendingBridge,
} from "src/domain";
import { isAsyncTaskDataAvailable } from "src/utils/types";
import * as storage from "src/adapters/storage";

interface EstimateBridgeFee {
  from: Chain;
  token: Token;
  to: Chain;
  destinationAddress: string;
}

type GetBridgeParams = {
  env: Env;
  networkId: number;
  depositCount: number;
};

interface GetBridgesParams {
  env: Env;
  ethereumAddress: string;
  limit: number;
  offset: number;
  cancelToken?: AxiosRequestConfig["cancelToken"];
}

interface RefreshBridgesParams {
  env: Env;
  ethereumAddress: string;
  quantity: number;
}

type FetchBridgesParams = {
  env: Env;
  ethereumAddress: string;
} & (
  | {
      type: "load";
      limit: number;
      offset: number;
    }
  | {
      type: "reload";
      quantity: number;
    }
);

interface BridgeParams {
  from: Chain;
  token: Token;
  amount: BigNumber;
  to: Chain;
  destinationAddress: string;
}

interface ClaimParams {
  bridge: OnHoldBridge;
}

interface BridgeContext {
  estimateBridgeFee: (params: EstimateBridgeFee) => Promise<BigNumber>;
  getBridge: (params: GetBridgeParams) => Promise<Bridge>;
  fetchBridges: (params: FetchBridgesParams) => Promise<{
    bridges: Bridge[];
    total: number;
  }>;
  getPendingBridges: (bridges?: Bridge[]) => Promise<PendingBridge[]>;
  bridge: (params: BridgeParams) => Promise<void>;
  claim: (params: ClaimParams) => Promise<void>;
}

const bridgeContextNotReadyErrorMsg = "The bridge context is not yet ready";

const bridgeContext = createContext<BridgeContext>({
  estimateBridgeFee: () => {
    return Promise.reject(bridgeContextNotReadyErrorMsg);
  },
  getBridge: () => {
    return Promise.reject(bridgeContextNotReadyErrorMsg);
  },
  fetchBridges: () => {
    return Promise.reject(bridgeContextNotReadyErrorMsg);
  },
  getPendingBridges: () => {
    return Promise.reject(bridgeContextNotReadyErrorMsg);
  },
  bridge: () => {
    return Promise.reject(bridgeContextNotReadyErrorMsg);
  },
  claim: () => {
    return Promise.reject(bridgeContextNotReadyErrorMsg);
  },
});

const BridgeProvider: FC<PropsWithChildren> = (props) => {
  const env = useEnvContext();
  const { connectedProvider, account, changeNetwork } = useProvidersContext();
  const { getToken } = useTokensContext();
  const { getTokenPrice } = usePriceOracleContext();

  const estimateGasPrice = useCallback(
    ({ chain, gasLimit }: { chain: Chain; gasLimit: BigNumber }): Promise<BigNumber> => {
      return chain.provider.getFeeData().then((feeData) => {
        const fee = calculateFee(gasLimit, feeData);

        if (fee === undefined) {
          return Promise.reject(new Error("Fee data is not available"));
        } else {
          return Promise.resolve(fee);
        }
      });
    },
    []
  );

  const estimateBridgeGasLimit = useCallback(
    ({ from, to, token, destinationAddress }: EstimateBridgeFee) => {
      const amount = parseUnits("0", token.decimals);
      const contract = Bridge__factory.connect(from.contractAddress, from.provider);
      const overrides: PayableOverrides =
        token.address === ethersConstants.AddressZero ? { value: amount } : {};

      if (contract === undefined) {
        throw new Error("Bridge contract is not available");
      }

      return contract.estimateGas
        .bridge(selectTokenAddress(token, from), to.networkId, destinationAddress, amount, "0x", {
          ...overrides,
          from: destinationAddress,
        })
        .then((gasLimit) => {
          const gasIncrease = gasLimit.div(BRIDGE_CALL_GAS_INCREASE_PERCENTAGE);

          return gasLimit.add(gasIncrease);
        });
    },
    []
  );

  const estimateBridgeFee = useCallback(
    ({ from, ...rest }: EstimateBridgeFee) => {
      return estimateBridgeGasLimit({ from, ...rest }).then((safeGasLimit) =>
        estimateGasPrice({ chain: from, gasLimit: safeGasLimit })
      );
    },
    [estimateBridgeGasLimit, estimateGasPrice]
  );

  type Price = BigNumber | null;
  type TokenPrices = Partial<Record<string, Price>>;

  const refreshCancelTokenSource = useRef(axios.CancelToken.source());

  const getBridge = useCallback(
    async ({ env, networkId, depositCount }: GetBridgeParams): Promise<Bridge> => {
      const apiUrl = env.bridgeApiUrl;
      const apiDeposit = await getDeposit({
        apiUrl,
        networkId,
        depositCount,
      });

      const {
        network_id,
        dest_net,
        amount,
        dest_addr,
        deposit_cnt,
        tx_hash,
        claim_tx_hash,
        token_addr,
        orig_net,
        ready_for_claim,
      } = apiDeposit;

      const from = env.chains.find((chain) => chain.networkId === network_id);
      if (from === undefined) {
        throw new Error(
          `The specified network_id "${network_id}" can not be found in the list of supported Chains`
        );
      }

      const to = env.chains.find((chain) => chain.networkId === dest_net);
      if (to === undefined) {
        throw new Error(
          `The specified dest_net "${dest_net}" can not be found in the list of supported Chains`
        );
      }

      const token = await getToken({
        env,
        tokenAddress: token_addr,
        originNetwork: orig_net,
        chain: from,
      });

      const claim: Deposit["claim"] =
        claim_tx_hash !== null
          ? { status: "claimed", txHash: claim_tx_hash }
          : ready_for_claim
          ? { status: "ready" }
          : { status: "pending" };

      const tokenPrice: BigNumber | undefined = env.fiatExchangeRates.areEnabled
        ? await getTokenPrice({
            token,
            chain: from,
          }).catch(() => undefined)
        : undefined;

      const fiatAmount =
        tokenPrice &&
        multiplyAmounts(
          {
            value: tokenPrice,
            precision: FIAT_DISPLAY_PRECISION,
          },
          {
            value: BigNumber.from(amount),
            precision: token.decimals,
          },
          FIAT_DISPLAY_PRECISION
        );

      const id = serializeBridgeId({
        depositCount,
        networkId,
      });

      switch (claim.status) {
        case "pending": {
          return {
            status: "initiated",
            id,
            from,
            to,
            token,
            fiatAmount,
            amount: BigNumber.from(amount),
            destinationAddress: dest_addr,
            depositCount: deposit_cnt,
            depositTxHash: tx_hash,
            tokenOriginNetwork: orig_net,
          };
        }
        case "ready": {
          return {
            status: "on-hold",
            id,
            from,
            to,
            token,
            fiatAmount,
            amount: BigNumber.from(amount),
            destinationAddress: dest_addr,
            depositCount: deposit_cnt,
            depositTxHash: tx_hash,
            tokenOriginNetwork: orig_net,
          };
        }
        case "claimed": {
          return {
            status: "completed",
            id,
            from,
            to,
            token,
            fiatAmount,
            amount: BigNumber.from(amount),
            destinationAddress: dest_addr,
            depositCount: deposit_cnt,
            depositTxHash: tx_hash,
            tokenOriginNetwork: orig_net,
            claimTxHash: claim.txHash,
          };
        }
      }
    },
    [getTokenPrice, getToken]
  );

  const getBridges = useCallback(
    async ({
      env,
      ethereumAddress,
      limit,
      offset,
      cancelToken,
    }: GetBridgesParams): Promise<{
      bridges: Bridge[];
      total: number;
    }> => {
      const apiUrl = env.bridgeApiUrl;
      const { deposits: apiDeposits, total } = await getDeposits({
        apiUrl,
        ethereumAddress,
        limit,
        offset,
        cancelToken,
      });

      const deposits = await Promise.all(
        apiDeposits.map(async (apiDeposit): Promise<Deposit> => {
          const {
            network_id,
            dest_net,
            amount,
            dest_addr,
            deposit_cnt,
            tx_hash,
            claim_tx_hash,
            token_addr,
            orig_net,
            ready_for_claim,
          } = apiDeposit;

          const from = env.chains.find((chain) => chain.networkId === network_id);
          if (from === undefined) {
            throw new Error(
              `The specified network_id "${network_id}" can not be found in the list of supported Chains`
            );
          }

          const to = env.chains.find((chain) => chain.networkId === dest_net);
          if (to === undefined) {
            throw new Error(
              `The specified dest_net "${dest_net}" can not be found in the list of supported Chains`
            );
          }

          const token = await getToken({
            env,
            tokenAddress: token_addr,
            originNetwork: orig_net,
            chain: from,
          });

          return {
            token,
            amount: BigNumber.from(amount),
            fiatAmount: undefined,
            destinationAddress: dest_addr,
            depositCount: deposit_cnt,
            depositTxHash: tx_hash,
            from,
            to,
            tokenOriginNetwork: orig_net,
            claim:
              claim_tx_hash !== null
                ? { status: "claimed", txHash: claim_tx_hash }
                : ready_for_claim
                ? { status: "ready" }
                : { status: "pending" },
          };
        })
      );

      const tokenPrices: TokenPrices = env.fiatExchangeRates.areEnabled
        ? await deposits.reduce(
            async (
              accTokenPrices: Promise<TokenPrices>,
              deposit: Deposit
            ): Promise<TokenPrices> => {
              const tokenPrices = await accTokenPrices;
              const tokenCachedPrice = tokenPrices[deposit.token.address];
              const tokenPrice =
                tokenCachedPrice !== undefined
                  ? tokenCachedPrice
                  : await getTokenPrice({ token: deposit.token, chain: deposit.from }).catch(
                      () => null
                    );

              return {
                ...tokenPrices,
                [deposit.token.address]: tokenPrice,
              };
            },
            Promise.resolve({})
          )
        : {};

      const bridges = deposits.map((partialDeposit): Bridge => {
        const {
          token,
          amount,
          destinationAddress,
          depositCount,
          depositTxHash,
          from,
          to,
          tokenOriginNetwork,
          claim,
        } = partialDeposit;

        const tokenPrice = tokenPrices[token.address];

        const fiatAmount =
          tokenPrice !== undefined && tokenPrice !== null
            ? multiplyAmounts(
                {
                  value: tokenPrice,
                  precision: FIAT_DISPLAY_PRECISION,
                },
                {
                  value: amount,
                  precision: token.decimals,
                },
                FIAT_DISPLAY_PRECISION
              )
            : undefined;

        const id = serializeBridgeId({
          depositCount,
          networkId: from.networkId,
        });

        switch (claim.status) {
          case "pending": {
            return {
              status: "initiated",
              id,
              token,
              amount,
              destinationAddress,
              depositCount,
              depositTxHash,
              from,
              to,
              tokenOriginNetwork,
              fiatAmount,
            };
          }
          case "ready": {
            return {
              status: "on-hold",
              id,
              token,
              amount,
              destinationAddress,
              depositCount,
              depositTxHash,
              from,
              to,
              tokenOriginNetwork,
              fiatAmount,
            };
          }
          case "claimed": {
            return {
              status: "completed",
              id,
              token,
              amount,
              destinationAddress,
              depositCount,
              depositTxHash,
              from,
              to,
              tokenOriginNetwork,
              claimTxHash: claim.txHash,
              fiatAmount,
            };
          }
        }
      });

      return {
        bridges,
        total,
      };
    },
    [getTokenPrice, getToken]
  );

  const REFRESH_PAGE_SIZE = 100;

  const refreshBridges = useCallback(
    async ({
      env,
      ethereumAddress,
      quantity,
    }: RefreshBridgesParams): Promise<{
      bridges: Bridge[];
      total: number;
    }> => {
      refreshCancelTokenSource.current = axios.CancelToken.source();
      const completePages = Math.floor(quantity / REFRESH_PAGE_SIZE);
      const remainderBridges = quantity % REFRESH_PAGE_SIZE;
      const requiredRequests = Math.max(
        remainderBridges === 0 ? completePages : completePages + 1,
        1
      );
      return (
        await Promise.all(
          Array(requiredRequests)
            .fill(null)
            .map((_, index) => {
              const offset = index * REFRESH_PAGE_SIZE;
              const isLast = index + 1 === requiredRequests;
              const isRemainderRequestRequired = isLast && remainderBridges !== 0;
              const limit = isRemainderRequestRequired ? remainderBridges : REFRESH_PAGE_SIZE;
              return getBridges({
                env,
                ethereumAddress,
                limit,
                offset,
                cancelToken: refreshCancelTokenSource.current.token,
              });
            })
        )
      ).reduce((acc, curr) => ({ bridges: [...acc.bridges, ...curr.bridges], total: curr.total }), {
        bridges: [],
        total: 0,
      });
    },
    [getBridges]
  );

  const fetchBridges = useCallback(
    async (
      params: FetchBridgesParams
    ): Promise<{
      bridges: Bridge[];
      total: number;
    }> => {
      if (params.type === "load") {
        // fetching new data prevails over possible reloads in progress so we cancel them
        refreshCancelTokenSource.current.cancel();
        return getBridges({
          env: params.env,
          ethereumAddress: params.ethereumAddress,
          limit: params.limit,
          offset: params.offset,
        });
      } else {
        return refreshBridges({
          env: params.env,
          ethereumAddress: params.ethereumAddress,
          quantity: params.quantity,
        });
      }
    },
    [getBridges, refreshBridges]
  );

  const cleanPendingTxs = useCallback(
    (bridges: Bridge[]): Promise<void> => {
      if (!env) {
        return Promise.resolve();
      }

      const pendingTxs = storage.getPendingTxs(env);
      const isPendingDepositInApiBridges = (depositTxHash: string) => {
        return bridges.find((bridge) => {
          return (
            (bridge.status === "initiated" || bridge.status === "on-hold") &&
            bridge.depositTxHash === depositTxHash
          );
        });
      };
      const isPendingClaimInApiBridges = (claimTxHash: string) => {
        return bridges.find((bridge) => {
          return bridge.status === "completed" && bridge.claimTxHash === claimTxHash;
        });
      };

      return Promise.all(
        pendingTxs.map(async (pendingTx) => {
          if (
            pendingTx.type === "deposit" &&
            isPendingDepositInApiBridges(pendingTx.depositTxHash)
          ) {
            return storage.removePendingTx(pendingTx.depositTxHash);
          }
          if (pendingTx.type === "claim" && isPendingClaimInApiBridges(pendingTx.claimTxHash)) {
            return storage.removePendingTx(pendingTx.depositTxHash);
          }

          const txHash =
            pendingTx.type === "deposit" ? pendingTx.depositTxHash : pendingTx.claimTxHash;
          const provider =
            pendingTx.type === "deposit" ? pendingTx.from.provider : pendingTx.to.provider;
          const tx = await provider.getTransaction(txHash);

          if (isTxCanceled(tx)) {
            return storage.removePendingTx(pendingTx.depositTxHash);
          }

          if (isTxMined(tx)) {
            const txReceipt = await provider.getTransactionReceipt(txHash);

            if (hasTxBeenReverted(txReceipt)) {
              return storage.removePendingTx(pendingTx.depositTxHash);
            }
          }

          if (Date.now() > pendingTx.timestamp + PENDING_TX_TIMEOUT) {
            return storage.removePendingTx(pendingTx.depositTxHash);
          }
        })
      ).then();
    },
    [env]
  );

  const getPendingBridges = useCallback(
    async (bridges?: Bridge[]): Promise<PendingBridge[]> => {
      if (bridges) {
        await cleanPendingTxs(bridges);
      }

      if (!env) {
        throw new Error("Env is not available");
      }

      return Promise.all(
        storage.getPendingTxs(env).map(async (tx) => {
          const chain = env?.chains.find((chain) => chain.networkId === tx.networkId);
          const fiatAmount =
            chain && env.fiatExchangeRates.areEnabled
              ? await getTokenPrice({ token: tx.token, chain })
              : undefined;

          return {
            status: "pending",
            networkId: tx.networkId,
            from: tx.from,
            to: tx.to,
            depositTxHash: tx.depositTxHash,
            claimTxHash: tx.type === "claim" ? tx.claimTxHash : undefined,
            token: tx.token,
            amount: tx.amount,
            fiatAmount,
          };
        })
      );
    },
    [env, cleanPendingTxs, getTokenPrice]
  );

  const bridge = useCallback(
    async ({ from, token, amount, to, destinationAddress }: BridgeParams): Promise<void> => {
      if (connectedProvider === undefined) {
        throw new Error("Connected provider is not available");
      }

      if (!isAsyncTaskDataAvailable(account)) {
        throw new Error("User account is not available");
      }

      const contract = Bridge__factory.connect(
        from.contractAddress,
        connectedProvider.provider.getSigner()
      );
      const gasPrice = await from.provider.getGasPrice();
      const gasLimit = Object.values(EthereumChainId).includes(from.chainId)
        ? await estimateBridgeGasLimit({ from, to, token, destinationAddress })
        : 300000;
      const overrides: PayableOverrides = {
        value: token.address === ethersConstants.AddressZero ? amount : undefined,
        gasPrice,
        gasLimit,
      };
      const executeBridge = async () => {
        const canUsePermit = await isPermitSupported({
          account: account.data,
          chain: from,
          token,
        });
        const permitData = canUsePermit
          ? await permit({
              token,
              provider: connectedProvider.provider,
              owner: account.data,
              spender: from.contractAddress,
              value: amount,
            })
          : "0x";

        return contract
          .bridge(token.address, to.networkId, destinationAddress, amount, permitData, overrides)
          .then((txData) => {
            storage.addPendingTx({
              type: "deposit",
              depositTxHash: txData.hash,
              networkId: from.networkId,
              from,
              to,
              timestamp: Date.now(),
              token,
              amount,
            });
          });
      };

      if (from.chainId === connectedProvider.chainId) {
        return executeBridge();
      } else {
        return changeNetwork(from)
          .catch(() => {
            throw "wrong-network";
          })
          .then(executeBridge);
      }
    },
    [connectedProvider, account, estimateBridgeGasLimit, changeNetwork]
  );

  const claim = useCallback(
    async ({
      bridge: {
        token,
        amount,
        tokenOriginNetwork,
        from,
        to,
        destinationAddress,
        depositCount,
        depositTxHash,
      },
    }: ClaimParams): Promise<void> => {
      if (connectedProvider === undefined) {
        throw new Error("Connected provider is not available");
      }
      if (env === undefined) {
        throw new Error("Env is not available");
      }

      const contract = Bridge__factory.connect(
        to.contractAddress,
        connectedProvider.provider.getSigner()
      );

      const isL2Claim = to.key === "polygon-zkevm";

      const apiUrl = env.bridgeApiUrl;
      const networkId = from.networkId;

      const { merkleProof, mainExitRoot, rollupExitRoot } = await getMerkleProof({
        apiUrl,
        networkId,
        depositCount,
      });

      const isEtherToken = token.address === ethersConstants.AddressZero;
      const isTokenNativeOfToChain = token.chainId === to.chainId;
      const isMetadataRequired = !isEtherToken && !isTokenNativeOfToChain;
      const metadata = isMetadataRequired
        ? await getErc20TokenEncodedMetadata({ token, chain: from })
        : "0x";

      const executeClaim = () =>
        contract
          .claim(
            merkleProof,
            depositCount,
            mainExitRoot,
            rollupExitRoot,
            tokenOriginNetwork,
            token.address,
            to.networkId,
            destinationAddress,
            amount,
            metadata,
            isL2Claim ? { gasLimit: 500000, gasPrice: 0 } : {}
          )
          .then((txData) => {
            storage.addPendingTx({
              type: "claim",
              depositTxHash,
              claimTxHash: txData.hash,
              networkId,
              from,
              to,
              timestamp: Date.now(),
              token,
              amount,
            });
          });

      if (to.chainId === connectedProvider.chainId) {
        return executeClaim();
      } else {
        return changeNetwork(to)
          .catch(() => {
            throw "wrong-network";
          })
          .then(executeClaim);
      }
    },
    [changeNetwork, connectedProvider, env]
  );

  const value = useMemo(
    () => ({
      estimateBridgeFee,
      getBridge,
      fetchBridges,
      getPendingBridges,
      bridge,
      claim,
    }),
    [estimateBridgeFee, getBridge, fetchBridges, getPendingBridges, bridge, claim]
  );

  return <bridgeContext.Provider value={value} {...props} />;
};

const useBridgeContext = (): BridgeContext => {
  return useContext(bridgeContext);
};

export { BridgeProvider, useBridgeContext };
