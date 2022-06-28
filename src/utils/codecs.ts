import { z } from "zod";

import { StrictSchema } from "src/utils/type-safety";

type SerializedBridgeId = string;

interface ParsedBridgeId {
  networkId: number;
  depositCount: number;
}

const serializedBridgeIdParser = StrictSchema<SerializedBridgeId, ParsedBridgeId>()(
  z.string().transform((bridgeId): ParsedBridgeId => {
    const [networkIdString, depositCountString] = bridgeId.split("-");
    const networkId = z.number().parse(Number(networkIdString));
    const depositCount = z.number().parse(Number(depositCountString));
    return {
      networkId,
      depositCount,
    };
  })
);

const parseBridgeId = (
  value: unknown
): z.SafeParseReturnType<SerializedBridgeId, ParsedBridgeId> => {
  return serializedBridgeIdParser.safeParse(value);
};

const serializeBridgeId = (parsedBridgeId: ParsedBridgeId): SerializedBridgeId => {
  const { networkId, depositCount } = parsedBridgeId;
  return `${networkId}-${depositCount}`;
};

export { parseBridgeId, serializeBridgeId };
