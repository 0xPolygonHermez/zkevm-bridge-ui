#/bin/bash

BASE_PATH="src/types/contracts"

# Clean up
rm -rf $BASE_PATH

# Generate Price Oracle contract types
npx typechain --target ethers-v5 --out-dir $BASE_PATH/uniswap-v2-router-02 "abis/uniswap-v2-router-02.json"
npx typechain --target ethers-v5 --out-dir $BASE_PATH/uniswap-v2-pair "abis/uniswap-v2-pair.json"

# Generate zkEVM contract types
npx typechain --target ethers-v5 --out-dir $BASE_PATH/bridge "abis/bridge.json"
npx typechain --target ethers-v5 --out-dir $BASE_PATH/proof-of-efficiency "abis/proof-of-efficiency.json"

# Generate ERC-20 contract types
npx typechain --target ethers-v5 --out-dir $BASE_PATH/erc-20 "abis/erc-20.json"
