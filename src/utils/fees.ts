import { TransactionResponse } from "@ethersproject/abstract-provider";
import { BigNumber } from "ethers";
import { Gas } from "src/domain";

export const calculateFee = (gas: Gas): BigNumber => {
  switch (gas.type) {
    case "eip-1559": {
      return gas.data.gasLimit.mul(gas.data.maxFeePerGas);
    }
    case "legacy": {
      return gas.data.gasLimit.mul(gas.data.gasPrice);
    }
  }
};

export const calculateTransactionResponseFee = (
  transactionResponse: TransactionResponse
): BigNumber | undefined => {
  const { gasLimit, gasPrice, maxFeePerGas } = transactionResponse;
  const gas: Gas | undefined = maxFeePerGas
    ? { data: { gasLimit, maxFeePerGas }, type: "eip-1559" }
    : gasPrice
    ? { data: { gasLimit, gasPrice }, type: "legacy" }
    : undefined;

  return gas && calculateFee(gas);
};
