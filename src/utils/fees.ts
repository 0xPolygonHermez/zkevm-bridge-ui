import {
  TypeSafeTransactionReceipt,
  TypeSafeTransactionResponse,
} from "@ethersproject/abstract-provider";
import { BigNumber } from "ethers";
import { EIP1559GasType, Gas, LegacyGasType } from "src/domain";

type CalculateTransactionReceiptFeeParams =
  | {
      txReceipt: TypeSafeTransactionReceipt;
      type: EIP1559GasType;
    }
  | {
      txReceipt: TypeSafeTransactionReceipt;
      txResponse: TypeSafeTransactionResponse;
      type: LegacyGasType;
    };

export const calculateMaxTxFee = (gas: Gas): BigNumber => {
  switch (gas.type) {
    case "eip-1559": {
      return gas.data.gasLimit.mul(gas.data.maxFeePerGas);
    }
    case "legacy": {
      return gas.data.gasLimit.mul(gas.data.gasPrice);
    }
  }
};

export const calculateTransactionReceiptFee = (
  params: CalculateTransactionReceiptFeeParams
): BigNumber | undefined => {
  if (params.type === "eip-1559") {
    const { effectiveGasPrice, gasUsed } = params.txReceipt;

    if (!effectiveGasPrice || !gasUsed) {
      return undefined;
    }

    return gasUsed.mul(effectiveGasPrice);
  } else {
    const { gasUsed } = params.txReceipt;
    const { gasPrice } = params.txResponse;

    if (!gasUsed || !gasPrice) {
      return undefined;
    }

    return gasUsed.mul(gasPrice);
  }
};
