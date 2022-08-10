import { z } from "zod";

import { StrictSchema } from "src/utils/type-safety";
import { Token } from "src/domain";
import ethereumErc20Tokens from "src/assets/ethereum-erc20-tokens.json";

export const getEthereumErc20Tokens = (): Promise<Token[]> => {
  const decodedEthereumErc20Tokens = z.array(tokenParser).safeParse(ethereumErc20Tokens);
  return decodedEthereumErc20Tokens.success
    ? Promise.resolve(decodedEthereumErc20Tokens.data)
    : Promise.reject(decodedEthereumErc20Tokens.error);
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
