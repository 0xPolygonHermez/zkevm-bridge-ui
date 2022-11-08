# zkEVM Bridge UI

The zkEVM Bridge UI provides a simple user interface to bridge ETH and your favorite ERC-20 tokens
from Ethereum to the Polygon zkEVM and back.

## Development

Clone the repo:

```sh
git clone git@github.com:0xPolygonHermez/zkevm-bridge-ui.git
```

Move into the project directory:

```sh
cd zkevm-bridge-ui
```

Install project dependencies:

```sh
npm install
```

Finally, to be able to run the project, you need to create a `.env` file which should contain all
the required environment variables.

If you want to create it from scratch, you can copy the `.env.example` and then override each
environment variable by your own:

```sh
cp .env.example .env
```

If you omit it, you won't be able to see token prices converted to your local fiat currency.

If you want to see token prices converted to your local fiat currency in the UI you'll need to
register [here](https://exchangeratesapi.io) to obtain an API Key. Once you get it, you need to set
the `VITE_USE_FIAT_EXCHANGE_RATES` env var to `true` and fill this required env vars as well:

- `VITE_FIAT_EXCHANGE_RATES_API_URL`
- `VITE_FIAT_EXCHANGE_RATES_API_KEY`
- `VITE_FIAT_EXCHANGE_RATES_ETHEREUM_USDC_ADDRESS`

If you just want to omit fiat conversion you can just disable this feature by setting the
`VITE_USE_FIAT_EXCHANGE_RATES` env var to `false`.

Finally, to run the UI in development mode, you just need to run:

```sh
npm run dev
```

## Docker image

A [GitHub action](.github/workflows/push-docker-develop.yml) is already configured to automatically
generate and push images to DockerHub on updates to the **develop** and **master** branches.

To locally generate a Docker image of the zkEVM Bridge UI, you can just run the following command:

```sh
docker build . -t zkevm-bridge-ui:local
```

The Docker image won't build the UI until you run it, in order to be able to use dynamic environment
variables and facilitate the deployment process. The environment variables you need to pass are the
same as those in the `.env.example` file but without the `VITE` prefix.

## Disclaimer

This code has not yet been audited, and should not be used in any production environment.
