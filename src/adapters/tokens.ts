import { z } from "zod";

import ethereumErc20Tokens from "src/assets/ethereum-erc20-tokens.json";
import { Token } from "src/domain";
import { StrictSchema } from "src/utils/type-safety";

export const getEthereumErc20Tokens = (): Promise<Token[]> => {
  const decodedEthereumErc20Tokens = z.array(tokenParser).safeParse(ethereumErc20Tokens);
  return decodedEthereumErc20Tokens.success
    ? Promise.resolve(decodedEthereumErc20Tokens.data)
    : Promise.reject(decodedEthereumErc20Tokens.error);
};

export const tokenParser = StrictSchema<Omit<Token, "balance">>()(
  z.object({
    address: z.string(),
    chainId: z.number(),
    decimals: z.number(),
    logoURI: z.string(),
    name: z.string(),
    symbol: z.string(),
    wrappedToken: z
      .object({
        address: z.string(),
        chainId: z.number(),
      })
      .optional(),
  })
);
