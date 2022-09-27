FROM --platform=amd64 node:lts-alpine3.12 AS build

ADD . /app
WORKDIR /app

RUN npm install

ARG ENVIRONMENT
ARG VITE_FIAT_EXCHANGE_RATES_API_KEY
RUN mv .env.${ENVIRONMENT} .env && \
    npm run build

FROM nginx:1.19 as production

COPY --from=build /app/deployment/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
