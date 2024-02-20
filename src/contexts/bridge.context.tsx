import { BigNumber, CallOverrides, ContractTransaction } from "ethers";
import { FC, PropsWithChildren, createContext, useCallback, useContext, useMemo } from "react";

import { getDeposit, getDeposits, getMerkleProof } from "src/adapters/bridge-api";
import {
  getErc20TokenEncodedMetadata,
  hasTxBeenReverted,
  isTxCanceled,
  isTxMined,
  permit,
} from "src/adapters/ethereum";
import * as storage from "src/adapters/storage";
import {
  BRIDGE_CALL_GAS_LIMIT_INCREASE_PERCENTAGE,
  BRIDGE_CALL_PERMIT_GAS_LIMIT_INCREASE,
  FIAT_DISPLAY_PRECISION,
  GAS_PRICE_INCREASE_PERCENTAGE,
  PENDING_TX_TIMEOUT,
} from "src/constants";
import { useEnvContext } from "src/contexts/env.context";
import { usePriceOracleContext } from "src/contexts/price-oracle.context";
import { useProvidersContext } from "src/contexts/providers.context";
import { useTokensContext } from "src/contexts/tokens.context";
import {
  Bridge,
  Chain,
  Deposit,
  Env,
  Gas,
  OnHoldBridge,
  PendingBridge,
  Token,
  TokenSpendPermission,
} from "src/domain";
import { Bridge__factory } from "src/types/contracts/bridge";
import { multiplyAmounts } from "src/utils/amounts";
import { serializeBridgeId } from "src/utils/serializers";
import { isTokenEther, selectTokenAddress } from "src/utils/tokens";
import { isAsyncTaskDataAvailable } from "src/utils/types";

interface EstimateBridgeGasParams {
  destinationAddress: string;
  from: Chain;
  to: Chain;
  token: Token;
  tokenSpendPermission: TokenSpendPermission;
}

type FetchBridgeParams = {
  abortSignal?: AbortSignal;
  depositCount: number;
  env: Env;
  networkId: number;
};

interface GetBridgesParams {
  abortSignal?: AbortSignal;
  env: Env;
  ethereumAddress: string;
  limit: number;
  offset: number;
}

interface RefreshBridgesParams {
  abortSignal?: AbortSignal;
  env: Env;
  ethereumAddress: string;
  quantity: number;
}

type FetchBridgesParams = {
  abortSignal?: AbortSignal;
  env: Env;
  ethereumAddress: string;
} & (
    | {
      limit: number;
      offset: number;
      type: "load";
    }
    | {
      quantity: number;
      type: "reload";
    }
  );

interface BridgeParams {
  amount: BigNumber;
  destinationAddress: string;
  from: Chain;
  gas?: Gas;
  to: Chain;
  token: Token;
  tokenSpendPermission: TokenSpendPermission;
}

interface ClaimParams {
  bridge: OnHoldBridge;
}

interface BridgeContext {
  bridge: (params: BridgeParams) => Promise<ContractTransaction>;
  claim: (params: ClaimParams) => Promise<ContractTransaction>;
  estimateBridgeGas: (params: EstimateBridgeGasParams) => Promise<Gas>;
  fetchBridge: (params: FetchBridgeParams) => Promise<Bridge>;
  fetchBridges: (params: FetchBridgesParams) => Promise<{
    bridges: Bridge[];
    total: number;
  }>;
  getPendingBridges: (bridges?: Bridge[]) => Promise<PendingBridge[]>;
}

const bridgeContextNotReadyErrorMsg = "The bridge context is not yet ready";

const bridgeContext = createContext<BridgeContext>({
  bridge: () => {
    return Promise.reject(bridgeContextNotReadyErrorMsg);
  },
  claim: () => {
    return Promise.reject(bridgeContextNotReadyErrorMsg);
  },
  estimateBridgeGas: () => {
    return Promise.reject(bridgeContextNotReadyErrorMsg);
  },
  fetchBridge: () => {
    return Promise.reject(bridgeContextNotReadyErrorMsg);
  },
  fetchBridges: () => {
    return Promise.reject(bridgeContextNotReadyErrorMsg);
  },
  getPendingBridges: () => {
    return Promise.reject(bridgeContextNotReadyErrorMsg);
  },
});

const BridgeProvider: FC<PropsWithChildren> = (props) => {
  const env = useEnvContext();
  const { changeNetwork, connectedProvider } = useProvidersContext();
  const { addWrappedToken, getToken } = useTokensContext();
  const { getTokenPrice } = usePriceOracleContext();

  type Price = BigNumber | null;
  type TokenPrices = Partial<Record<string, Price>>;

  const fetchBridge = useCallback(
    async ({ abortSignal, depositCount, env, networkId }: FetchBridgeParams): Promise<Bridge> => {
      const apiUrl = env.bridgeApiUrl;
      const apiDeposit = await getDeposit({
        abortSignal,
        apiUrl,
        depositCount,
        networkId,
      });

      const {
        amount,
        block_num,
        claim_tx_hash,
        deposit_cnt,
        dest_addr,
        dest_net,
        global_index,
        network_id,
        orig_addr,
        orig_net,
        ready_for_claim,
        tx_hash,
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
        originNetwork: orig_net,
        tokenOriginAddress: orig_addr,
      });

      const claim: Deposit["claim"] =
        claim_tx_hash !== null
          ? { status: "claimed", txHash: claim_tx_hash }
          : ready_for_claim
            ? { status: "ready" }
            : { status: "pending" };

      const tokenPrice: BigNumber | undefined = env.fiatExchangeRates.areEnabled
        ? await getTokenPrice({
          chain: from,
          token,
        }).catch(() => undefined)
        : undefined;

      const fiatAmount =
        tokenPrice &&
        multiplyAmounts(
          {
            precision: FIAT_DISPLAY_PRECISION,
            value: tokenPrice,
          },
          {
            precision: token.decimals,
            value: BigNumber.from(amount),
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
            amount: BigNumber.from(amount),
            blockNumber: block_num,
            depositCount: deposit_cnt,
            depositTxHash: tx_hash,
            destinationAddress: dest_addr,
            fiatAmount,
            from,
            globalIndex: global_index,
            id,
            status: "initiated",
            to,
            token,
            tokenOriginNetwork: orig_net,
          };
        }
        case "ready": {
          return {
            amount: BigNumber.from(amount),
            blockNumber: block_num,
            depositCount: deposit_cnt,
            depositTxHash: tx_hash,
            destinationAddress: dest_addr,
            fiatAmount,
            from,
            globalIndex: global_index,
            id,
            status: "on-hold",
            to,
            token,
            tokenOriginNetwork: orig_net,
          };
        }
        case "claimed": {
          return {
            amount: BigNumber.from(amount),
            blockNumber: block_num,
            claimTxHash: claim.txHash,
            depositCount: deposit_cnt,
            depositTxHash: tx_hash,
            destinationAddress: dest_addr,
            fiatAmount,
            from,
            globalIndex: global_index,
            id,
            status: "completed",
            to,
            token,
            tokenOriginNetwork: orig_net,
          };
        }
      }
    },
    [getTokenPrice, getToken]
  );

  const getBridges = useCallback(
    async ({
      abortSignal,
      env,
      ethereumAddress,
      limit,
      offset,
    }: GetBridgesParams): Promise<{
      bridges: Bridge[];
      total: number;
    }> => {
      const apiUrl = env.bridgeApiUrl;
      const result = await getDeposits({
        abortSignal,
        apiUrl,
        ethereumAddress,
        limit,
        offset,
      });

      const apiDeposits = result.deposits; // `deposits` es ahora una constante.

      const deposits = await apiDeposits.reduce(
        async (acc: Promise<Deposit[]>, apiDeposit): Promise<Deposit[]> => {
          const {
            amount,
            block_num,
            claim_tx_hash,
            deposit_cnt,
            dest_addr,
            dest_net,
            global_index,
            network_id,
            orig_addr,
            orig_net,
            ready_for_claim,
            tx_hash,
          } = apiDeposit;

          const from = env.chains.find((chain) => chain.networkId === network_id);
          if (from === undefined) {
            return acc.then((accDeposits) => {return accDeposits})
          }

          const to = env.chains.find((chain) => chain.networkId === dest_net);
          if (to === undefined) {
            return acc.then((accDeposits) => {return accDeposits})
          }

          return acc.then((accDeposits) =>
            getToken({
              env,
              originNetwork: orig_net,

              tokenOriginAddress: orig_addr,
            }).then((token) => [
              ...accDeposits,
              {
                amount: BigNumber.from(amount),
                blockNumber: block_num,
                claim:
                  claim_tx_hash !== null
                    ? { status: "claimed", txHash: claim_tx_hash }
                    : ready_for_claim
                      ? { status: "ready" }
                      : { status: "pending" },
                depositCount: deposit_cnt,
                depositTxHash: tx_hash,
                destinationAddress: dest_addr,
                fiatAmount: undefined,
                from,
                globalIndex: global_index,
                to,
                token,
                tokenOriginNetwork: orig_net,
              },
            ])
          );
        },
        Promise.resolve([])
      );

      const total: number = deposits.length;

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
                : await getTokenPrice({ chain: deposit.from, token: deposit.token }).catch(
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
          amount,
          blockNumber,
          claim,
          depositCount,
          depositTxHash,
          destinationAddress,
          from,
          globalIndex,
          to,
          token,
          tokenOriginNetwork,
        } = partialDeposit;

        const tokenPrice = tokenPrices[token.address];

        const fiatAmount =
          tokenPrice !== undefined && tokenPrice !== null
            ? multiplyAmounts(
              {
                precision: FIAT_DISPLAY_PRECISION,
                value: tokenPrice,
              },
              {
                precision: token.decimals,
                value: amount,
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
              amount,
              blockNumber,
              depositCount,
              depositTxHash,
              destinationAddress,
              fiatAmount,
              from,
              globalIndex,
              id,
              status: "initiated",
              to,
              token,
              tokenOriginNetwork,
            };
          }
          case "ready": {
            return {
              amount,
              blockNumber,
              depositCount,
              depositTxHash,
              destinationAddress,
              fiatAmount,
              from,
              globalIndex,
              id,
              status: "on-hold",
              to,
              token,
              tokenOriginNetwork,
            };
          }
          case "claimed": {
            return {
              amount,
              blockNumber,
              claimTxHash: claim.txHash,
              depositCount,
              depositTxHash,
              destinationAddress,
              fiatAmount,
              from,
              globalIndex,
              id,
              status: "completed",
              to,
              token,
              tokenOriginNetwork,
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
      abortSignal,
      env,
      ethereumAddress,
      quantity,
    }: RefreshBridgesParams): Promise<{
      bridges: Bridge[];
      total: number;
    }> => {
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
                abortSignal,
                env,
                ethereumAddress,
                limit,
                offset,
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
        return getBridges({
          abortSignal: params.abortSignal,
          env: params.env,
          ethereumAddress: params.ethereumAddress,
          limit: params.limit,
          offset: params.offset,
        });
      } else {
        return refreshBridges({
          abortSignal: params.abortSignal,
          env: params.env,
          ethereumAddress: params.ethereumAddress,
          quantity: params.quantity,
        });
      }
    },
    [getBridges, refreshBridges]
  );

  const cleanPendingTxs = useCallback(
    async (bridges: Bridge[]): Promise<void> => {
      if (!env) {
        return Promise.reject("Env is not defined");
      }
      if (!isAsyncTaskDataAvailable(connectedProvider)) {
        return Promise.reject("connectedProvider data is not available");
      }

      const account = connectedProvider.data.account;
      const pendingTxs = storage.getAccountPendingTxs(account, env);
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

      await Promise.all(
        pendingTxs.map(async (pendingTx) => {
          if (
            pendingTx.type === "deposit" &&
            isPendingDepositInApiBridges(pendingTx.depositTxHash)
          ) {
            return storage.removeAccountPendingTx(account, env, pendingTx.depositTxHash);
          }

          if (pendingTx.type === "claim" && isPendingClaimInApiBridges(pendingTx.claimTxHash)) {
            return storage.removeAccountPendingTx(account, env, pendingTx.depositTxHash);
          }

          const txHash =
            pendingTx.type === "deposit" ? pendingTx.depositTxHash : pendingTx.claimTxHash;
          const provider =
            pendingTx.type === "deposit" ? pendingTx.from.provider : pendingTx.to.provider;
          const tx = await provider.getTransaction(txHash);

          if (isTxCanceled(tx)) {
            return storage.removeAccountPendingTx(account, env, pendingTx.depositTxHash);
          }

          if (isTxMined(tx)) {
            const txReceipt = await provider.getTransactionReceipt(txHash);

            if (txReceipt && hasTxBeenReverted(txReceipt)) {
              return storage.removeAccountPendingTx(account, env, pendingTx.depositTxHash);
            }
          }

          if (Date.now() > pendingTx.timestamp + PENDING_TX_TIMEOUT) {
            return storage.removeAccountPendingTx(account, env, pendingTx.depositTxHash);
          }
        })
      );
    },
    [connectedProvider, env]
  );

  const getPendingBridges = useCallback(
    async (bridges?: Bridge[]): Promise<PendingBridge[]> => {
      if (bridges) {
        await cleanPendingTxs(bridges);
      }

      if (!env) {
        throw new Error("Env is not available");
      }

      if (!isAsyncTaskDataAvailable(connectedProvider)) {
        return Promise.reject("connectedProvider data is not available");
      }

      return Promise.all(
        storage.getAccountPendingTxs(connectedProvider.data.account, env).map(async (tx) => {
          const chain = env.chains.find((chain) => chain.key === tx.from.key);
          const token = await addWrappedToken({ token: tx.token });
          const tokenPrice =
            chain && env.fiatExchangeRates.areEnabled
              ? await getTokenPrice({ chain, token: tx.token })
              : undefined;
          const fiatAmount =
            tokenPrice &&
            multiplyAmounts(
              {
                precision: FIAT_DISPLAY_PRECISION,
                value: tokenPrice,
              },
              {
                precision: token.decimals,
                value: tx.amount,
              },
              FIAT_DISPLAY_PRECISION
            );

          return {
            amount: tx.amount,
            claimTxHash: tx.type === "claim" ? tx.claimTxHash : undefined,
            depositTxHash: tx.depositTxHash,
            destinationAddress: tx.destinationAddress,
            fiatAmount,
            from: tx.from,
            status: "pending",
            to: tx.to,
            token,
          };
        })
      );
    },
    [env, connectedProvider, cleanPendingTxs, addWrappedToken, getTokenPrice]
  );

  const estimateBridgeGas = useCallback(
    async ({
      destinationAddress,
      from,
      to,
      token,
      tokenSpendPermission,
    }: EstimateBridgeGasParams): Promise<Gas> => {
      if (!env) {
        throw new Error("Env is not available");
      }

      const contract = Bridge__factory.connect(from.bridgeContractAddress, from.provider);
      const amount = BigNumber.from(0);
      const overrides: CallOverrides = isTokenEther(token)
        ? { from: destinationAddress, value: amount }
        : { from: destinationAddress };

      const tokenAddress = selectTokenAddress(token, from);
      const forceUpdateGlobalExitRoot =
        from.key === "polygon-zkevm" ? true : env.forceUpdateGlobalExitRootForL1;

      const gasLimit =
        from.key === "ethereum"
          ? await contract.estimateGas
            .bridgeAsset(
              to.networkId,
              destinationAddress,
              amount,
              tokenAddress,
              forceUpdateGlobalExitRoot,
              "0x",
              overrides
            )
            .then((gasLimit) => {
              const gasLimitIncrease = gasLimit
                .div(BigNumber.from(100))
                .mul(BRIDGE_CALL_GAS_LIMIT_INCREASE_PERCENTAGE);

              const increasedGasLimit = gasLimit.add(gasLimitIncrease);

              return tokenSpendPermission.type === "permit"
                ? increasedGasLimit.add(BRIDGE_CALL_PERMIT_GAS_LIMIT_INCREASE)
                : increasedGasLimit;
            })
          : BigNumber.from(300000);

      const { gasPrice, maxFeePerGas } = await from.provider.getFeeData();

      if (maxFeePerGas) {
        return { data: { gasLimit, maxFeePerGas }, type: "eip-1559" };
      } else {
        const legacyGasPrice = gasPrice || (await from.provider.getGasPrice());
        const gasPriceIncrease = legacyGasPrice
          .div(BigNumber.from(100))
          .mul(GAS_PRICE_INCREASE_PERCENTAGE);

        return {
          data: {
            gasLimit,
            gasPrice: legacyGasPrice.add(gasPriceIncrease),
          },
          type: "legacy",
        };
      }
    },
    [env]
  );

  const bridge = useCallback(
    async ({
      amount,
      destinationAddress,
      from,
      gas,
      to,
      token,
      tokenSpendPermission,
    }: BridgeParams): Promise<ContractTransaction> => {
      if (env === undefined) {
        throw new Error("Env is not available");
      }

      if (!isAsyncTaskDataAvailable(connectedProvider)) {
        throw new Error("Connected provider is not available");
      }

      const { account, chainId, provider } = connectedProvider.data;
      const contract = Bridge__factory.connect(from.bridgeContractAddress, provider.getSigner());
      const overrides: CallOverrides = {
        value: isTokenEther(token) ? amount : undefined,
        ...(gas
          ? gas.data
          : (await estimateBridgeGas({ destinationAddress, from, to, token, tokenSpendPermission }))
            .data),
      };

      const executeBridge = async () => {
        const permitData =
          tokenSpendPermission.type === "permit"
            ? await permit({
              account: account,
              from: from,
              permit: tokenSpendPermission.permit,
              provider: provider,
              spender: from.bridgeContractAddress,
              token,
              value: amount,
            })
            : "0x";

        const forceUpdateGlobalExitRoot =
          from.key === "polygon-zkevm" ? true : env.forceUpdateGlobalExitRootForL1;

        return contract
          .bridgeAsset(
            to.networkId,
            destinationAddress,
            amount,
            selectTokenAddress(token, from),
            forceUpdateGlobalExitRoot,
            permitData,
            overrides
          )
          .then((txData) => {
            storage.addAccountPendingTx(account, env, {
              amount,
              depositTxHash: txData.hash,
              destinationAddress,
              from,
              timestamp: Date.now(),
              to,
              token,
              type: "deposit",
            });

            return txData;
          });
      };

      if (from.chainId === chainId) {
        return executeBridge();
      } else {
        return changeNetwork(from)
          .catch(() => {
            throw "wrong-network";
          })
          .then(executeBridge);
      }
    },
    [env, connectedProvider, estimateBridgeGas, changeNetwork]
  );

  const claim = useCallback(
    async ({
      bridge: {
        amount,
        depositCount,
        depositTxHash,
        destinationAddress,
        from,
        globalIndex,
        to,
        token,
        tokenOriginNetwork,
      },
    }: ClaimParams): Promise<ContractTransaction> => {
      if (!isAsyncTaskDataAvailable(connectedProvider)) {
        throw new Error("Connected provider is not available");
      }
      if (env === undefined) {
        throw new Error("Env is not available");
      }

      const { account, chainId, provider } = connectedProvider.data;
      const contract = Bridge__factory.connect(to.bridgeContractAddress, provider.getSigner());
      const isL2Claim = to.key === "polygon-zkevm";
      const apiUrl = env.bridgeApiUrl;
      const networkId = from.networkId;

      const { mainExitRoot, merkleProof, rollupExitRoot, rollupMerkleProof } = await getMerkleProof(
        {
          apiUrl,
          depositCount,
          networkId,
        }
      );

      const isTokenNativeOfToChain = token.chainId === to.chainId;
      const isMetadataRequired = !isTokenEther(token) && !isTokenNativeOfToChain;
      const metadata = isMetadataRequired
        ? await getErc20TokenEncodedMetadata({ chain: from, token })
        : "0x";

      const executeClaim = () =>
        contract
          .claimAsset(
            merkleProof,
            rollupMerkleProof,
            globalIndex,
            mainExitRoot,
            rollupExitRoot,
            tokenOriginNetwork,
            token.address,
            to.networkId,
            destinationAddress,
            amount,
            metadata,
            isL2Claim ? { gasLimit: 1500000, gasPrice: 0 } : {}
          )
          .then((txData) => {
            storage.addAccountPendingTx(account, env, {
              amount,
              claimTxHash: txData.hash,
              depositTxHash,
              destinationAddress,
              from,
              timestamp: Date.now(),
              to,
              token,
              type: "claim",
            });

            return txData;
          });

      if (to.chainId === chainId) {
        return executeClaim();
      } else {
        return changeNetwork(to)
          .catch(() => {
            throw "wrong-network";
          })
          .then(executeClaim);
      }
    },
    [connectedProvider, env, changeNetwork]
  );

  const value = useMemo(
    () => ({
      bridge,
      claim,
      estimateBridgeGas,
      fetchBridge,
      fetchBridges,
      getPendingBridges,
    }),
    [estimateBridgeGas, fetchBridge, fetchBridges, getPendingBridges, bridge, claim]
  );

  return <bridgeContext.Provider value={value} {...props} />;
};

const useBridgeContext = (): BridgeContext => {
  return useContext(bridgeContext);
};

export { BridgeProvider, useBridgeContext };
