const getPartiallyHiddenEthereumAddress = (ethereumAddress: string): string => {
  const firstAddressSlice = ethereumAddress.slice(0, 6);
  const secondAddressSlice = ethereumAddress.slice(ethereumAddress.length - 4);

  return `${firstAddressSlice} ･･･ ${secondAddressSlice}`;
};

const getShortEthereumAddress = (ethereumAddress: string): string => {
  const firstAddressSlice = ethereumAddress.slice(0, 7);
  const secondAddressSlice = ethereumAddress.slice(ethereumAddress.length - 5);

  return `${firstAddressSlice}...${secondAddressSlice}`;
};

export { getPartiallyHiddenEthereumAddress, getShortEthereumAddress };
