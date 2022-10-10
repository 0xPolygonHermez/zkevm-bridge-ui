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

const pendingTxDepositParser = (env: Env) =>
  StrictSchema<SerializedPendingDepositTx, PendingDepositTx>()(
    z
      .object({
        type: z.literal("deposit"),
        depositTxHash: z.string(),
        from: chainKeyParser,
        to: chainKeyParser,
        timestamp: z.number(),
        token: tokenParser,
        amount: z.string(),
      })
      .transform(({ amount, depositTxHash, from, timestamp, to, token, type }, ctx) => {
        const fromChain = env.chains.find((chain) => chain.key === from);
        const toChain = env.chains.find((chain) => chain.key === to);
        if (!fromChain) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["from"],
            message: "We couldn't find the 'from' chain when parsing the PendingDepositTx",
          });
          return z.NEVER;
        }
        if (!toChain) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["to"],
            message: "We couldn't find the 'to' chain when parsing the PendingDepositTx",
          });
          return z.NEVER;
        }
        return {
          from: fromChain,
          to: toChain,
          timestamp,
          token,
          amount: ethersUtils.parseUnits(amount, token.decimals),
          type,
          depositTxHash,
        };
      })
  );

const pendingTxClaimParser = (env: Env) =>
  StrictSchema<SerializedPendingClaimTx, PendingClaimTx>()(
    z
      .object({
        type: z.literal("claim"),
        depositTxHash: z.string(),
        claimTxHash: z.string(),
        from: chainKeyParser,
        to: chainKeyParser,
        timestamp: z.number(),
        token: tokenParser,
        amount: z.string(),
      })
      .transform(
        ({ amount, claimTxHash, depositTxHash, from, timestamp, to, token, type }, ctx) => {
          const fromChain = env.chains.find((chain) => chain.key === from);
          const toChain = env.chains.find((chain) => chain.key === to);
          if (!fromChain) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ["from"],
              message: "We couldn't find the 'from' chain when parsing the PendingClaimTx",
            });
            return z.NEVER;
          }
          if (!toChain) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ["to"],
              message: "We couldn't find the 'to' chain when parsing the PendingClaimTx",
            });
            return z.NEVER;
          }
          return {
            from: fromChain,
            to: toChain,
            timestamp: timestamp,
            token: token,
            amount: ethersUtils.parseUnits(amount, token.decimals),
            type: type,
            depositTxHash: depositTxHash,
            claimTxHash: claimTxHash,
          };
        }
      )
  );

const pendingTxParser = (env: Env) =>
  StrictSchema<SerializedPendingTx, PendingTx>()(
    z.union([pendingTxDepositParser(env), pendingTxClaimParser(env)])
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

export {
  pendingTxParser,
  deserializeBridgeId,
  serializeBridgeId,
  serializePendingTx,
};
