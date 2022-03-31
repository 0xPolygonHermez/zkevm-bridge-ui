import axios from "axios";
import { z } from "zod";

import { StrictSchema } from "src/utils/type-safety";
import * as domain from "src/domain";

interface Bridge {
  token_addr: string;
  amount: string;
  dest_net: number;
  dest_addr: string;
  deposit_cnt: string;
}

interface GetBridgesParams {
  env: domain.Env;
  ethereumAddress: string;
}

interface GetBridgesResponse {
  deposits?: Bridge[];
}

const bridgeParser = StrictSchema<Bridge>()(
  z.object({
    token_addr: z.string(),
    amount: z.string(),
    dest_net: z.number(),
    dest_addr: z.string(),
    deposit_cnt: z.string(),
  })
);

const getBridgesResponseParser = StrictSchema<GetBridgesResponse>()(
  z.object({
    deposits: z.optional(z.array(bridgeParser)),
  })
);

const transformApiBridgeToDomain = ({
  token_addr,
  amount,
  dest_addr,
  dest_net,
  deposit_cnt,
}: Bridge): domain.Bridge => ({
  tokenAddress: token_addr,
  amount: amount,
  destinationAddress: dest_addr,
  destinationNetwork: dest_net,
  depositCount: deposit_cnt,
});

const getBridges = ({ env, ethereumAddress }: GetBridgesParams): Promise<domain.Bridge[]> => {
  return axios
    .request({
      baseURL: env.REACT_APP_BRIDGE_API_URL,
      url: `/bridges/${ethereumAddress}`,
      method: "GET",
    })
    .then((res) => {
      const parsedData = getBridgesResponseParser.safeParse(res.data);

      if (parsedData.success) {
        return parsedData.data.deposits !== undefined
          ? parsedData.data.deposits.map(transformApiBridgeToDomain)
          : [];
      } else {
        throw parsedData.error;
      }
    });
};

export { getBridges };
