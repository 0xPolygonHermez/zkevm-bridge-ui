#/bin/bash

BASE_PATH="src/types/contracts"

# Clean up
rm -rf $BASE_PATH

# Generate Price Oracle contract types
npx typechain --target ethers-v5 --out-dir $BASE_PATH/uniswap-quoter "abis/uniswap-quoter.json"

# Generate Bridge contract types
npx typechain --target ethers-v5 --out-dir $BASE_PATH/bridge "abis/bridge.json"

# Generate ERC-20 contract types
npx typechain --target ethers-v5 --out-dir $BASE_PATH/erc-20 "abis/erc-20.json"
