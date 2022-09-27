import { z } from "zod";

import { StrictSchema } from "src/utils/type-safety";

type SerializedBridgeId = string;

interface BridgeId {
  networkId: number;
  depositCount: number;
}

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

const deserializeBridgeId = (
  value: unknown
): z.SafeParseReturnType<SerializedBridgeId, BridgeId> => {
  return bridgeIdParser.safeParse(value);
};

const serializeBridgeId = (parsedBridgeId: BridgeId): SerializedBridgeId => {
  const { networkId, depositCount } = parsedBridgeId;
  return `${networkId}-${depositCount}`;
};

export { deserializeBridgeId, serializeBridgeId };
