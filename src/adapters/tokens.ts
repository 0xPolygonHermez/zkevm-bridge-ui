import { z } from "zod";
import axios from "axios";

import { StrictSchema } from "src/utils/type-safety";
import { Token } from "src/domain";

export const getErc20Tokens = (): Promise<Token[]> => {
  return axios
    .request({
      baseURL: "src/assets/ethereum-erc20-tokens.json",
      method: "GET",
    })
    .then((res) => z.array(tokenParser).parse(res.data));
};

export const tokenParser = StrictSchema<Omit<Token, "balance">>()(
  z.object({
    name: z.string(),
    symbol: z.string(),
    address: z.string(),
    decimals: z.number(),
    chainId: z.number(),
    logoURI: z.string(),
    wrappedToken: z
      .object({
        address: z.string(),
        chainId: z.number(),
      })
      .optional(),
  })
);
