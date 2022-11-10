import { z } from "zod";
import { TransactionResponse, TransactionReceipt } from "@ethersproject/abstract-provider";
import { JsonRpcProvider, Web3Provider } from "@ethersproject/providers";
import { BigNumber, constants as ethersConstants } from "ethers";
import { splitSignature, defaultAbiCoder } from "ethers/lib/utils";

import { Erc20__factory } from "src/types/contracts/erc-20";
import { StrictSchema } from "src/utils/type-safety";
import { selectTokenAddress } from "src/utils/tokens";
import { Token, Chain, TxStatus, Permit } from "src/domain";
import {
  DAI_PERMIT_TYPEHASH,
  EIP_2612_PERMIT_TYPEHASH,
  EIP_2612_STANDARD_DOMAIN_TYPEHASH,
  EIP_2612_UNISWAP_DOMAIN_TYPEHASH,
} from "src/constants";

const ethereumAccountsParser = StrictSchema<string[]>()(z.array(z.string()));

const silentlyGetConnectedAccounts = (provider: Web3Provider): Promise<string[]> => {
  if (!provider.provider.request) {
    throw Error("No request method is available from the provider to get the Ethereum accounts");
  }
  return provider.provider
    .request({ method: "eth_accounts" })
    .then((accounts) => ethereumAccountsParser.parse(accounts));
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
  if (token.address === ethersConstants.AddressZero) {
    return Promise.reject(new Error("Native currency does't require permit"));
  }
  const contract = Erc20__factory.connect(token.address, chain.provider);
  return contract.PERMIT_TYPEHASH().then((permitTypehash) => {
    switch (permitTypehash) {
      case DAI_PERMIT_TYPEHASH: {
        return Permit.DAI;
      }
      case EIP_2612_PERMIT_TYPEHASH: {
        return contract
          .DOMAIN_TYPEHASH()
          .catch(() => contract.EIP712DOMAIN_HASH())
          .then((domainTypehash) => {
            switch (domainTypehash) {
              case EIP_2612_STANDARD_DOMAIN_TYPEHASH: {
                return Permit.EIP_2612_STANDARD;
              }
              case EIP_2612_UNISWAP_DOMAIN_TYPEHASH: {
                return Permit.EIP_2612_UNISWAP;
              }
              default: {
                return Promise.reject(new Error(`Unsupported domain typehash: ${domainTypehash}`));
              }
            }
          });
      }
      default: {
        return Promise.reject(new Error(`Unsupported permit typehash: ${permitTypehash}`));
      }
    }
  });
};

interface ApproveParams {
  token: Token;
  amount: BigNumber;
  provider: Web3Provider;
  owner: string;
  spender: string;
}

const approve = async ({
  token,
  amount,
  provider,
  owner,
  spender,
}: ApproveParams): Promise<void> => {
  if (token.address === ethersConstants.AddressZero) {
    throw new Error("Cannot perform an approve on ETH");
  }

  const erc20Contract = Erc20__factory.connect(token.address, provider.getSigner());
  const hasAllowance = await isContractAllowedToSpendToken({
    token,
    amount,
    provider,
    owner,
    spender,
  });

  if (!hasAllowance) {
    const tx = await erc20Contract.approve(spender, ethersConstants.MaxUint256);

    await tx.wait();
  }
};

interface IsContractAllowedToSpendTokenParams {
  token: Token;
  amount: BigNumber;
  provider: JsonRpcProvider;
  owner: string;
  spender: string;
}

const isContractAllowedToSpendToken = async ({
  token,
  amount,
  provider,
  owner,
  spender,
}: IsContractAllowedToSpendTokenParams): Promise<boolean> => {
  if (token.address === ethersConstants.AddressZero) {
    throw new Error("Cannot check the allowance of ETH");
  }

  const erc20Contract = Erc20__factory.connect(token.address, provider);
  const allowance = await erc20Contract.allowance(owner, spender);

  return allowance.gte(amount);
};

interface PermitParams {
  token: Token;
  provider: Web3Provider;
  account: string;
  spender: string;
  value: BigNumber;
  permit: Permit;
}

const permit = async ({
  token,
  provider,
  account,
  spender,
  value,
  permit,
}: PermitParams): Promise<string> => {
  if (token.address === ethersConstants.AddressZero) {
    throw new Error("Cannot perform a permit on ETH");
  }

  const signer = provider.getSigner();
  const erc20Contract = Erc20__factory.connect(token.address, signer);
  const nonce = await erc20Contract.nonces(account);
  const name = await erc20Contract.name();
  const { MaxUint256 } = ethersConstants;
  const chainId = (await provider.getNetwork()).chainId;

  switch (permit) {
    case Permit.DAI: {
      const domain = {
        name,
        version: "1",
        chainId,
        verifyingContract: token.address,
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
        holder: account,
        spender,
        nonce,
        expiry: MaxUint256,
        allowed: true,
      };

      const signature = await signer._signTypedData(domain, types, values);
      const { v, r, s } = splitSignature(signature);

      return erc20Contract.interface.encodeFunctionData("permit", [
        account,
        spender,
        MaxUint256,
        1,
        v,
        r,
        s,
      ]);
    }
    case Permit.EIP_2612_STANDARD:
    case Permit.EIP_2612_UNISWAP: {
      const eip2612StandardDomain = {
        name,
        version: "1",
        chainId,
        verifyingContract: token.address,
      };

      const eip2612UniswapDomain = {
        name,
        chainId,
        verifyingContract: token.address,
      };

      const domain =
        permit === Permit.EIP_2612_STANDARD ? eip2612StandardDomain : eip2612UniswapDomain;

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
        owner: account,
        spender,
        value,
        nonce,
        deadline: MaxUint256,
      };

      const signature = await signer._signTypedData(domain, types, values);
      const { v, r, s } = splitSignature(signature);

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
  token: Token;
  chain: Chain;
}

const getErc20TokenMetadata = async ({
  token,
  chain,
}: GetErc20TokenMetadataParams): Promise<{
  name: string;
  symbol: string;
  decimals: number;
}> => {
  const erc20Contract = Erc20__factory.connect(selectTokenAddress(token, chain), chain.provider);
  const [name, symbol, decimals] = await Promise.all([
    erc20Contract.name(),
    erc20Contract.symbol(),
    erc20Contract.decimals(),
  ]);
  return {
    name,
    symbol,
    decimals,
  };
};

interface GetErc20TokenEncodedMetadataParams {
  token: Token;
  chain: Chain;
}

const getErc20TokenEncodedMetadata = async ({
  token,
  chain,
}: GetErc20TokenEncodedMetadataParams): Promise<string> => {
  const { name, symbol, decimals } = await getErc20TokenMetadata({
    token,
    chain,
  });
  return defaultAbiCoder.encode(["string", "string", "uint8"], [name, symbol, decimals]);
};

function isTxMined(tx: TransactionResponse | null): boolean {
  return tx !== null && tx.blockNumber !== null;
}

function isTxCanceled(tx: TransactionResponse | null): boolean {
  return tx === null;
}

function hasTxBeenReverted(txReceipt: TransactionReceipt): boolean {
  return txReceipt.status === TxStatus.REVERTED;
}

export {
  ethereumAccountsParser,
  silentlyGetConnectedAccounts,
  getConnectedAccounts,
  getPermit,
  approve,
  isContractAllowedToSpendToken,
  permit,
  getErc20TokenMetadata,
  getErc20TokenEncodedMetadata,
  isTxMined,
  isTxCanceled,
  hasTxBeenReverted,
};
