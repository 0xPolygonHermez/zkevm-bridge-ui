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

interface Claim {
  index: string;
  token_addr: string;
  amount: string;
  dest_net: number;
  dest_addr: string;
  block_num: string;
}

interface GetBridgesParams {
  env: domain.Env;
  ethereumAddress: string;
}

interface GetClaimsParams {
  env: domain.Env;
  ethereumAddress: string;
}

interface GetBridgesResponse {
  deposits?: Bridge[];
}

interface GetClaimsResponse {
  claims?: Claim[];
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

const claimParser = StrictSchema<Claim>()(
  z.object({
    index: z.string(),
    token_addr: z.string(),
    amount: z.string(),
    dest_net: z.number(),
    dest_addr: z.string(),
    block_num: z.string(),
  })
);

const getClaimsResponseParser = StrictSchema<GetClaimsResponse>()(
  z.object({
    claims: z.optional(z.array(claimParser)),
  })
);

const apiBridgeToDomain = ({
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

const apiClaimToDomain = ({
  index,
  token_addr,
  amount,
  dest_net,
  dest_addr,
  block_num,
}: Claim): domain.Claim => ({
  index,
  tokenAddress: token_addr,
  amount,
  destinationNetwork: dest_net,
  destinationAddress: dest_addr,
  blockNumber: block_num,
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
          ? parsedData.data.deposits.map(apiBridgeToDomain)
          : [];
      } else {
        throw parsedData.error;
      }
    });
};

const getClaims = ({ env, ethereumAddress }: GetClaimsParams): Promise<domain.Claim[]> => {
  return axios
    .request({
      baseURL: env.REACT_APP_BRIDGE_API_URL,
      url: `/claims/${ethereumAddress}`,
      method: "GET",
    })
    .then((res) => {
      const parsedData = getClaimsResponseParser.safeParse(res.data);

      if (parsedData.success) {
        return parsedData.data.claims !== undefined
          ? parsedData.data.claims.map(apiClaimToDomain)
          : [];
      } else {
        throw parsedData.error;
      }
    });
};

export { getBridges, getClaims };
