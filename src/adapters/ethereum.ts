import {
  TypeSafeTransactionReceipt,
  TypeSafeTransactionResponse,
} from "@ethersproject/abstract-provider";
import { JsonRpcProvider, Web3Provider } from "@ethersproject/providers";
import { BigNumber, constants as ethersConstants, utils as ethersUtils } from "ethers";
import { defaultAbiCoder, splitSignature } from "ethers/lib/utils";
import { z } from "zod";

import {
  DAI_PERMIT_TYPEHASH,
  EIP_2612_DOMAIN_TYPEHASH,
  EIP_2612_PERMIT_TYPEHASH,
  UNISWAP_DOMAIN_TYPEHASH,
} from "src/constants";
import { Chain, Permit, Token, TxStatus } from "src/domain";
import { Erc20__factory } from "src/types/contracts/erc-20";
import { calculateTransactionReceiptFee } from "src/utils/fees";
import { isTokenEther, selectTokenAddress } from "src/utils/tokens";
import { StrictSchema } from "src/utils/type-safety";

const ethereumAccountsParser = StrictSchema<string[]>()(z.array(z.string()));

const silentlyGetConnectedAccounts = (provider: Web3Provider): Promise<string[]> => {
  if (!provider.provider.request) {
    throw Error("No request method is available from the provider to get the Ethereum accounts");
  }
  return provider.provider
    .request({ method: "eth_accounts" })
    .then((accounts) => ethereumAccountsParser.parse(accounts));
};

const getBatchNumberOfL2Block = async (
  provider: JsonRpcProvider,
  blockNumber: number
): Promise<BigNumber> => {
  const batchNumberOfL2Block: unknown = await provider.send("zkevm_batchNumberByBlockNumber", [
    ethersUtils.hexlify(blockNumber),
  ]);

  return z
    .string()
    .transform((v) => BigNumber.from(v))
    .parse(batchNumberOfL2Block);
};

const getConnectedAccounts = (provider: Web3Provider): Promise<string[]> => {
  return provider
    .send("eth_requestAccounts", [])
    .then((accounts) => ethereumAccountsParser.parse(accounts));
};

interface GetPermitParams {
  chain: Chain;
  token: Token;
}

const getPermit = ({ chain, token }: GetPermitParams): Promise<Permit> => {
  if (isTokenEther(token)) {
    return Promise.reject(new Error("Native currency does't require permit"));
  }
  const contract = Erc20__factory.connect(selectTokenAddress(token, chain), chain.provider);
  return contract.PERMIT_TYPEHASH().then((permitTypehash) => {
    switch (permitTypehash) {
      case DAI_PERMIT_TYPEHASH: {
        return Permit.DAI;
      }
      case EIP_2612_PERMIT_TYPEHASH: {
        return Promise.any([contract.DOMAIN_TYPEHASH(), contract.EIP712DOMAIN_HASH()]).then(
          (domainTypehash) => {
            switch (domainTypehash) {
              case EIP_2612_DOMAIN_TYPEHASH: {
                return Permit.EIP_2612;
              }
              case UNISWAP_DOMAIN_TYPEHASH: {
                return Permit.UNISWAP;
              }
              default: {
                return Promise.reject(new Error(`Unsupported domain typehash: ${domainTypehash}`));
              }
            }
          }
        );
      }
      default: {
        return Promise.reject(new Error(`Unsupported permit typehash: ${permitTypehash}`));
      }
    }
  });
};

interface ApproveParams {
  amount: BigNumber;
  from: Chain;
  owner: string;
  provider: Web3Provider;
  spender: string;
  token: Token;
}

const approve = async ({
  amount,
  from,
  owner,
  provider,
  spender,
  token,
}: ApproveParams): Promise<void> => {
  if (isTokenEther(token)) {
    throw new Error("Cannot perform an approve on ETH");
  }

  const erc20Contract = Erc20__factory.connect(
    selectTokenAddress(token, from),
    provider.getSigner()
  );
  const hasAllowance = await isContractAllowedToSpendToken({
    amount,
    from,
    owner,
    provider,
    spender,
    token,
  });

  if (!hasAllowance) {
    const tx = await erc20Contract.approve(spender, ethersConstants.MaxUint256);

    await tx.wait();
  }
};

interface IsContractAllowedToSpendTokenParams {
  amount: BigNumber;
  from: Chain;
  owner: string;
  provider: JsonRpcProvider;
  spender: string;
  token: Token;
}

const isContractAllowedToSpendToken = async ({
  amount,
  from,
  owner,
  provider,
  spender,
  token,
}: IsContractAllowedToSpendTokenParams): Promise<boolean> => {
  if (isTokenEther(token)) {
    throw new Error("Cannot check the allowance of ETH");
  }

  const erc20Contract = Erc20__factory.connect(selectTokenAddress(token, from), provider);
  const allowance = await erc20Contract.allowance(owner, spender);

  return allowance.gte(amount);
};

interface PermitParams {
  account: string;
  from: Chain;
  permit: Permit;
  provider: Web3Provider;
  spender: string;
  token: Token;
  value: BigNumber;
}

const permit = async ({
  account,
  from,
  permit,
  provider,
  spender,
  token,
  value,
}: PermitParams): Promise<string> => {
  if (isTokenEther(token)) {
    throw new Error("Cannot perform a permit on ETH");
  }

  const signer = provider.getSigner();
  const tokenAddress = selectTokenAddress(token, from);
  const erc20Contract = Erc20__factory.connect(tokenAddress, signer);
  const nonce = await erc20Contract.nonces(account);
  const name = await erc20Contract.name();
  const { MaxUint256 } = ethersConstants;
  const chainId = (await provider.getNetwork()).chainId;

  switch (permit) {
    case Permit.DAI: {
      const domain = {
        chainId,
        name,
        verifyingContract: tokenAddress,
        version: "1",
      };

      const types = {
        Permit: [
          { name: "holder", type: "address" },
          { name: "spender", type: "address" },
          { name: "nonce", type: "uint256" },
          { name: "expiry", type: "uint256" },
          { name: "allowed", type: "bool" },
        ],
      };

      const values = {
        allowed: true,
        expiry: MaxUint256,
        holder: account,
        nonce,
        spender,
      };

      const signature = await signer._signTypedData(domain, types, values);
      const { r, s, v } = splitSignature(signature);

      const ifacePermitDAI = new ethersUtils.Interface([
        "function permit(address,address,uint256,uint256,bool,uint8,bytes32,bytes32)",
      ]);

      return ifacePermitDAI.encodeFunctionData("permit", [
        account,
        spender,
        nonce,
        MaxUint256,
        true,
        v,
        r,
        s,
      ]);
    }
    case Permit.EIP_2612:
    case Permit.UNISWAP: {
      const eip2612StandardDomain = {
        chainId,
        name,
        verifyingContract: tokenAddress,
        version: "1",
      };

      const eip2612UniswapDomain = {
        chainId,
        name,
        verifyingContract: tokenAddress,
      };

      const domain = permit === Permit.EIP_2612 ? eip2612StandardDomain : eip2612UniswapDomain;

      const types = {
        Permit: [
          { name: "owner", type: "address" },
          { name: "spender", type: "address" },
          { name: "value", type: "uint256" },
          { name: "nonce", type: "uint256" },
          { name: "deadline", type: "uint256" },
        ],
      };

      const values = {
        deadline: MaxUint256,
        nonce,
        owner: account,
        spender,
        value,
      };

      const signature = await signer._signTypedData(domain, types, values);
      const { r, s, v } = splitSignature(signature);

      return erc20Contract.interface.encodeFunctionData("permit", [
        account,
        spender,
        value,
        MaxUint256,
        v,
        r,
        s,
      ]);
    }
  }
};

interface GetErc20TokenMetadataParams {
  chain: Chain;
  token: Token;
}

const getErc20TokenMetadata = async ({
  chain,
  token,
}: GetErc20TokenMetadataParams): Promise<{
  decimals: number;
  name: string;
  symbol: string;
}> => {
  const erc20Contract = Erc20__factory.connect(selectTokenAddress(token, chain), chain.provider);
  const [name, symbol, decimals] = await Promise.all([
    erc20Contract.name(),
    erc20Contract.symbol(),
    erc20Contract.decimals(),
  ]);
  return {
    decimals,
    name,
    symbol,
  };
};

interface GetErc20TokenEncodedMetadataParams {
  chain: Chain;
  token: Token;
}

const getErc20TokenEncodedMetadata = async ({
  chain,
  token,
}: GetErc20TokenEncodedMetadataParams): Promise<string> => {
  const { decimals, name, symbol } = await getErc20TokenMetadata({
    chain,
    token,
  });
  return defaultAbiCoder.encode(["string", "string", "uint8"], [name, symbol, decimals]);
};

interface GetTxFeePaidParams {
  chain: Chain;
  txHash: string;
}

function getTxFeePaid({ chain, txHash }: GetTxFeePaidParams): Promise<BigNumber | undefined> {
  return chain.provider.getTransactionReceipt(txHash).then((txReceipt) => {
    if (txReceipt) {
      if (txReceipt.effectiveGasPrice) {
        return calculateTransactionReceiptFee({ txReceipt, type: "eip-1559" });
      }

      return chain.provider.getTransaction(txHash).then((txResponse) => {
        if (txResponse) {
          return calculateTransactionReceiptFee({ txReceipt, txResponse, type: "legacy" });
        }
      });
    }
  });
}

function isTxMined(tx: TypeSafeTransactionResponse | null): boolean {
  return tx !== null && tx.blockNumber !== null;
}

function isTxCanceled(tx: TypeSafeTransactionResponse | null): boolean {
  return tx === null;
}

function hasTxBeenReverted(txReceipt: TypeSafeTransactionReceipt): boolean {
  return txReceipt.status === TxStatus.REVERTED;
}

export {
  ethereumAccountsParser,
  getBatchNumberOfL2Block,
  silentlyGetConnectedAccounts,
  getConnectedAccounts,
  getPermit,
  approve,
  isContractAllowedToSpendToken,
  permit,
  getErc20TokenMetadata,
  getErc20TokenEncodedMetadata,
  isTxMined,
  getTxFeePaid,
  isTxCanceled,
  hasTxBeenReverted,
};
