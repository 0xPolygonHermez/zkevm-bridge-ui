# Polygon Hermez Bridge UI

Polygon Hermez Bridge provides a simple UI to get started with the Polygon Hermez Network. It supports depositing and withdrawing ETH and ERC-20 tokens in Polygon Hermez.

## Installation

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

Create the required `.env` file from the example provided in the repo:

```sh
cp .env.example .env
```


## License

`zkevm-bridge-ui` is part of the Polygon Hermez project copyright 2022 HermezDAO and published with AGPL-3 license. Please check the LICENSE file for more details.


## Docker image

A [GitHub actionk](.github/workflows/push-docker-develop.yml) is already configured to automatically generate and push images
to DockerHub on updates to **develop** branch.


To manually/locally generate a Docker image and having an env file named *.env.local*, you can run from repo root folder:

```sh
docker build . --build-arg ENVIRONMENT=local -t zkevm-bridge-ui:local
```

## Disclaimer

This code has not yet been audited, and should not be used in any production systems.
