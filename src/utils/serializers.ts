import { BigNumber, utils as ethersUtils } from "ethers";
import { z } from "zod";

import { tokenParser } from "src/adapters/tokens";
import { Chain, ChainKey, Env, Token } from "src/domain";
import { StrictSchema } from "src/utils/type-safety";

type SerializedBridgeId = string;

interface BridgeId {
  depositCount: number;
  networkId: number;
}

interface CommonPendingTx {
  amount: BigNumber;
  destinationAddress: string;
  from: Chain;
  timestamp: number;
  to: Chain;
  token: Token;
}

type PendingDepositTxData = {
  depositTxHash: string;
  type: "deposit";
};

type PendingClaimTxData = {
  claimTxHash: string;
  depositTxHash: string;
  type: "claim";
};

type PendingDepositTx = CommonPendingTx & PendingDepositTxData;

type PendingClaimTx = CommonPendingTx & PendingClaimTxData;

export type PendingTx = PendingDepositTx | PendingClaimTx;

interface CommonSerializedPendingTx {
  amount: string;
  destinationAddress: string;
  from: ChainKey;
  timestamp: number;
  to: ChainKey;
  token: Token;
}

type SerializedPendingDepositTx = CommonSerializedPendingTx & PendingDepositTxData;

type SerializedPendingClaimTx = CommonSerializedPendingTx & PendingClaimTxData;

export type SerializedPendingTx = SerializedPendingDepositTx | SerializedPendingClaimTx;

const bridgeIdParser = StrictSchema<SerializedBridgeId, BridgeId>()(
  z.string().transform((bridgeId): BridgeId => {
    const [networkIdString, depositCountString] = bridgeId.split("-");
    const networkId = z.coerce.number().parse(networkIdString);
    const depositCount = z.coerce.number().parse(depositCountString);

    return {
      depositCount,
      networkId,
    };
  })
);

const chainKeyParser = z.union([z.literal("ethereum"), z.literal("polygon-zkevm")]);

const pendingTxDepositParser = (env: Env) =>
  StrictSchema<SerializedPendingDepositTx, PendingDepositTx>()(
    z
      .object({
        amount: z.string(),
        depositTxHash: z.string(),
        destinationAddress: z.string(),
        from: chainKeyParser,
        timestamp: z.number(),
        to: chainKeyParser,
        token: tokenParser,
        type: z.literal("deposit"),
      })
      .transform(
        ({ amount, depositTxHash, destinationAddress, from, timestamp, to, token, type }, ctx) => {
          const fromChain = env.chains.find((chain) => chain.key === from);
          const toChain = env.chains.find((chain) => chain.key === to);
          if (!fromChain) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "We couldn't find the 'from' chain when parsing the PendingDepositTx",
              path: ["from"],
            });
            return z.NEVER;
          }
          if (!toChain) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "We couldn't find the 'to' chain when parsing the PendingDepositTx",
              path: ["to"],
            });
            return z.NEVER;
          }
          return {
            amount: ethersUtils.parseUnits(amount, token.decimals),
            depositTxHash,
            destinationAddress,
            from: fromChain,
            timestamp,
            to: toChain,
            token,
            type,
          };
        }
      )
  );

const pendingTxClaimParser = (env: Env) =>
  StrictSchema<SerializedPendingClaimTx, PendingClaimTx>()(
    z
      .object({
        amount: z.string(),
        claimTxHash: z.string(),
        depositTxHash: z.string(),
        destinationAddress: z.string(),
        from: chainKeyParser,
        timestamp: z.number(),
        to: chainKeyParser,
        token: tokenParser,
        type: z.literal("claim"),
      })
      .transform(
        (
          {
            amount,
            claimTxHash,
            depositTxHash,
            destinationAddress,
            from,
            timestamp,
            to,
            token,
            type,
          },
          ctx
        ) => {
          const fromChain = env.chains.find((chain) => chain.key === from);
          const toChain = env.chains.find((chain) => chain.key === to);
          if (!fromChain) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "We couldn't find the 'from' chain when parsing the PendingClaimTx",
              path: ["from"],
            });
            return z.NEVER;
          }
          if (!toChain) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "We couldn't find the 'to' chain when parsing the PendingClaimTx",
              path: ["to"],
            });
            return z.NEVER;
          }
          return {
            amount: ethersUtils.parseUnits(amount, token.decimals),
            claimTxHash: claimTxHash,
            depositTxHash: depositTxHash,
            destinationAddress,
            from: fromChain,
            timestamp: timestamp,
            to: toChain,
            token: token,
            type: type,
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
  const { depositCount, networkId } = parsedBridgeId;
  return `${networkId}-${depositCount}`;
};

const serializePendingTx = (pendingTx: PendingTx): SerializedPendingTx => {
  const commonSerializedPendingTx: CommonSerializedPendingTx = {
    amount: ethersUtils.formatUnits(pendingTx.amount, pendingTx.token.decimals),
    destinationAddress: pendingTx.destinationAddress,
    from: pendingTx.from.key,
    timestamp: pendingTx.timestamp,
    to: pendingTx.to.key,
    token: pendingTx.token,
  };

  if (pendingTx.type === "deposit") {
    return {
      ...commonSerializedPendingTx,
      depositTxHash: pendingTx.depositTxHash,
      type: pendingTx.type,
    };
  } else {
    return {
      ...commonSerializedPendingTx,
      claimTxHash: pendingTx.claimTxHash,
      depositTxHash: pendingTx.depositTxHash,
      type: pendingTx.type,
    };
  }
};

export { pendingTxParser, deserializeBridgeId, serializeBridgeId, serializePendingTx };
