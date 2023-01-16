FROM nginx:alpine

RUN apk add --update nodejs npm

WORKDIR /app

COPY package.json package-lock.json ./
COPY scripts ./scripts
COPY abis ./abis

RUN npm install

COPY . .

WORKDIR /

ENTRYPOINT ["/bin/sh", "/app/scripts/deploy.sh"]
