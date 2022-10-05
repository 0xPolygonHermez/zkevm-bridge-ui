import { z } from "zod";

import { StrictSchema } from "src/utils/type-safety";
import { Chain, ChainKey, Env, Token } from "src/domain";
import { BigNumber, utils as ethersUtils } from "ethers";
import { tokenParser } from "src/adapters/tokens";

type SerializedBridgeId = string;

interface BridgeId {
  networkId: number;
  depositCount: number;
}

interface CommonPendingTx {
  from: Chain;
  to: Chain;
  timestamp: number;
  token: Token;
  amount: BigNumber;
}

type PendingDepositTxData = {
  type: "deposit";
  depositTxHash: string;
};

type PendingClaimTxData = {
  type: "claim";
  depositTxHash: string;
  claimTxHash: string;
};

type PendingDepositTx = CommonPendingTx & PendingDepositTxData;

type PendingClaimTx = CommonPendingTx & PendingClaimTxData;

export type PendingTx = PendingDepositTx | PendingClaimTx;

interface CommonSerializedPendingTx {
  from: ChainKey;
  to: ChainKey;
  timestamp: number;
  token: Token;
  amount: string;
}

type SerializedPendingDepositTx = CommonSerializedPendingTx & PendingDepositTxData;

type SerializedPendingClaimTx = CommonSerializedPendingTx & PendingClaimTxData;

export type SerializedPendingTx = SerializedPendingDepositTx | SerializedPendingClaimTx;

const bridgeIdParser = StrictSchema<SerializedBridgeId, BridgeId>()(
  z.string().transform((bridgeId): BridgeId => {
    const [networkIdString, depositCountString] = bridgeId.split("-");
    const networkId = z.number().parse(Number(networkIdString));
    const depositCount = z.number().parse(Number(depositCountString));

    return {
      networkId,
      depositCount,
    };
  })
);

const chainKeyParser = z.union([z.literal("ethereum"), z.literal("polygon-zkevm")]);

const serializedPendingTxDepositParser = StrictSchema<SerializedPendingDepositTx>()(
  z.object({
    type: z.literal("deposit"),
    depositTxHash: z.string(),
    from: chainKeyParser,
    to: chainKeyParser,
    timestamp: z.number(),
    token: tokenParser,
    amount: z.string(),
  })
);

const serializedPendingTxClaimParser = StrictSchema<SerializedPendingClaimTx>()(
  z.object({
    type: z.literal("claim"),
    depositTxHash: z.string(),
    claimTxHash: z.string(),
    from: chainKeyParser,
    to: chainKeyParser,
    timestamp: z.number(),
    token: tokenParser,
    amount: z.string(),
  })
);

const serializedPendingTxParser = StrictSchema<SerializedPendingTx>()(
  z.union([serializedPendingTxDepositParser, serializedPendingTxClaimParser])
);

const deserializeBridgeId = (
  value: unknown
): z.SafeParseReturnType<SerializedBridgeId, BridgeId> => {
  return bridgeIdParser.safeParse(value);
};

const serializeBridgeId = (parsedBridgeId: BridgeId): SerializedBridgeId => {
  const { networkId, depositCount } = parsedBridgeId;
  return `${networkId}-${depositCount}`;
};

const serializePendingTx = (pendingTx: PendingTx): SerializedPendingTx => {
  const commonSerializedPendingTx: CommonSerializedPendingTx = {
    from: pendingTx.from.key,
    to: pendingTx.to.key,
    timestamp: pendingTx.timestamp,
    token: pendingTx.token,
    amount: ethersUtils.formatUnits(pendingTx.amount, pendingTx.token.decimals),
  };

  if (pendingTx.type === "deposit") {
    return {
      ...commonSerializedPendingTx,
      type: pendingTx.type,
      depositTxHash: pendingTx.depositTxHash,
    };
  } else {
    return {
      ...commonSerializedPendingTx,
      type: pendingTx.type,
      depositTxHash: pendingTx.depositTxHash,
      claimTxHash: pendingTx.claimTxHash,
    };
  }
};

const deserializePendingTx = (
  serializedPendingTx: SerializedPendingTx,
  env: Env
): z.SafeParseReturnType<SerializedPendingTx, PendingTx> => {
  const from = env.chains.find((chain) => chain.key === serializedPendingTx.from);
  const to = env.chains.find((chain) => chain.key === serializedPendingTx.to);

  if (!from) {
    return {
      success: false,
      error: new z.ZodError([
        {
          code: z.ZodIssueCode.custom,
          path: ["from"],
          message: "We couldn't find to chain when deserialized the pending tx",
        },
      ]),
    };
  }

  if (!to) {
    return {
      success: false,
      error: new z.ZodError([
        {
          code: z.ZodIssueCode.custom,
          path: ["to"],
          message: "We couldn't find to chain when deserialized the pending tx",
        },
      ]),
    };
  }

  const commonPendingTx: CommonPendingTx = {
    from,
    to,
    timestamp: serializedPendingTx.timestamp,
    token: serializedPendingTx.token,
    amount: ethersUtils.parseUnits(serializedPendingTx.amount, serializedPendingTx.token.decimals),
  };

  if (serializedPendingTx.type === "deposit") {
    return {
      success: true,
      data: {
        ...commonPendingTx,
        type: serializedPendingTx.type,
        depositTxHash: serializedPendingTx.depositTxHash,
      },
    };
  } else {
    return {
      success: true,
      data: {
        ...commonPendingTx,
        type: serializedPendingTx.type,
        depositTxHash: serializedPendingTx.depositTxHash,
        claimTxHash: serializedPendingTx.claimTxHash,
      },
    };
  }
};

export {
  serializedPendingTxParser,
  deserializeBridgeId,
  serializeBridgeId,
  serializePendingTx,
  deserializePendingTx,
};
