import { Token, Chain } from "src/domain";

const selectTokenAddress = (token: Token, chain: Chain): string => {
  return token.wrappedToken && chain.chainId === token.wrappedToken.chainId
    ? token.wrappedToken.address
    : token.address;
};

export { selectTokenAddress };
