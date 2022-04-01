#/bin/bash

BASE_PATH="src/types/contracts"

# Clean up
rm -rf BASE_PATH

# Generate Price Oracle contract types
npx typechain --target ethers-v5 --out-dir $BASE_PATH/uniswap-quoter "abis/uniswap-quoter.json"

# Generate Bridge contract types
npx typechain --target ethers-v5 --out-dir $BASE_PATH/bridge/bridge "abis/bridge/bridge.json"
npx typechain --target ethers-v5 --out-dir $BASE_PATH/bridge/global-exit-root-manager "abis/bridge/global-exit-root-manager.json"
