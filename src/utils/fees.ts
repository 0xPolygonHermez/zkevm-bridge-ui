import { FeeData, TransactionResponse } from "@ethersproject/abstract-provider";
import { BigNumber } from "ethers";

export const calculateFee = (gasLimit: BigNumber, feeData: FeeData): BigNumber | undefined => {
  if (feeData.maxFeePerGas !== null) {
    return gasLimit.mul(feeData.maxFeePerGas);
  } else if (feeData.gasPrice !== null) {
    return gasLimit.mul(feeData.gasPrice);
  } else {
    return undefined;
  }
};

export const calculateTransactionResponseFee = (
  transactionResponse: TransactionResponse
): BigNumber | undefined => {
  const { gasLimit, maxFeePerGas, maxPriorityFeePerGas, gasPrice } = transactionResponse;
  return calculateFee(gasLimit, {
    maxFeePerGas: maxFeePerGas || null,
    maxPriorityFeePerGas: maxPriorityFeePerGas || null,
    gasPrice: gasPrice || null,
  });
};
