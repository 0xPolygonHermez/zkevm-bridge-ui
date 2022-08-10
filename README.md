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

If you want to connect to some known environment, we provide three prefilled `.env` files, which you
can also use to create your `.env` file:

- `.env.integration`: Locally deployed zkEVM.
- `.env.internal-testnet`: Official internal testnet, which is used to do the official demos.
- `.env.fetestnet`: Internal testnet used by us, the zkEVM Bridge UI team to speed up the
  development.

Take into account that regardless of the option you choose, you will need to manually add the
`VITE_FIAT_EXCHANGE_RATES_API_KEY` environment variable, which you can obtain
[here](https://exchangeratesapi.io/). If you omit it, you won't be able to see token prices
converted to your local fiat currency.

## Docker image

A [GitHub action](.github/workflows/push-docker-develop.yml) is already configured to automatically
generate and push images to DockerHub on updates to the **develop** branch.

To locally generate a Docker image of the zkEVM Bridge UI, you can just run the following command:

```sh
docker build . --build-arg ENVIRONMENT=integration --build-arg VITE_FIAT_EXCHANGE_RATES_API_KEY=XXXX -t zkevm-bridge-ui:local
```

The `ENVIRONMENT` build-arg is just the name of any of the supported environments:

- `integration`
- `internal-testnet`
- `fetestnet`

And as we've seen before in the [development section](#development), you will also need to provide
the `VITE_FIAT_EXCHANGE_RATES_API_KEY` environment variable as a build-arg.

## Disclaimer

This code has not yet been audited, and should not be used in any production environment.
