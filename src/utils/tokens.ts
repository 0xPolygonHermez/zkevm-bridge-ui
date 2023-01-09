import { constants as ethersConstants } from "ethers";

import { Chain, Token } from "src/domain";

const selectTokenAddress = (token: Token, chain: Chain): string => {
  return token.wrappedToken && chain.chainId === token.wrappedToken.chainId
    ? token.wrappedToken.address
    : token.address;
};

const isTokenEther = (token: Token): boolean => {
  return token.address === ethersConstants.AddressZero;
};

export { isTokenEther, selectTokenAddress };
