#/bin/bash

# Generate Price Oracle contract types
npx typechain --target ethers-v5 --out-dir src/types/contracts/price-oracle "abis/price-oracle.json"

# Generate Bridge contract types
npx typechain --target ethers-v5 --out-dir src/types/contracts/bridge "abis/bridge.json"
