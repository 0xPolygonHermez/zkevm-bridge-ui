import { z } from "zod";
import { TransactionResponse, TransactionReceipt } from "@ethersproject/abstract-provider";
import { JsonRpcProvider, Web3Provider } from "@ethersproject/providers";
import { BigNumber, constants as ethersConstants } from "ethers";
import { splitSignature, defaultAbiCoder } from "ethers/lib/utils";

import { Erc20__factory } from "src/types/contracts/erc-20";
import { Erc20Permit__factory } from "src/types/contracts/erc-20-permit";
import { StrictSchema } from "src/utils/type-safety";
import { selectTokenAddress } from "src/utils/tokens";
import { Token, Chain, TxStatus } from "src/domain";

const ethereumAccountsParser = StrictSchema<string[]>()(z.array(z.string()));

const getConnectedAccounts = (provider: Web3Provider): Promise<string[]> => {
  return provider
    .send("eth_requestAccounts", [])
    .then((accounts) => ethereumAccountsParser.parse(accounts));
};

interface IsPermitSupportedParams {
  account: string;
  chain: Chain;
  token: Token;
}

const isPermitSupported = async ({
  account,
  chain,
  token,
}: IsPermitSupportedParams): Promise<boolean> => {
  if (token.address === ethersConstants.AddressZero) {
    return false;
  }
  const tokenContractWithPermit = Erc20Permit__factory.connect(token.address, chain.provider);
  try {
    return !!(await tokenContractWithPermit.nonces(account));
  } catch (err) {
    return false;
  }
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
  owner: string;
  spender: string;
  value: BigNumber;
}

const permit = async ({
  token,
  provider,
  owner,
  spender,
  value,
}: PermitParams): Promise<string> => {
  if (token.address === ethersConstants.AddressZero) {
    throw new Error("Cannot perform a permit on ETH");
  }

  const erc20PermitContract = Erc20Permit__factory.connect(token.address, provider.getSigner());
  const nonce = await erc20PermitContract.nonces(owner);
  const name = await erc20PermitContract.name();
  const deadline = ethersConstants.MaxUint256;
  const chainId = (await provider.getNetwork()).chainId;
  const domain = {
    name,
    version: "1",
    chainId: chainId,
    verifyingContract: token.address,
  };
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
    owner,
    spender,
    value,
    nonce,
    deadline,
  };

  const signature = await provider.getSigner()._signTypedData(domain, types, values);
  const { v, r, s } = splitSignature(signature);

  return erc20PermitContract.interface.encodeFunctionData("permit", [
    owner,
    spender,
    value,
    deadline,
    v,
    r,
    s,
  ]);
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
  getConnectedAccounts,
  isPermitSupported,
  approve,
  isContractAllowedToSpendToken,
  permit,
  getErc20TokenMetadata,
  getErc20TokenEncodedMetadata,
  isTxMined,
  isTxCanceled,
  hasTxBeenReverted,
};
