FROM --platform=amd64 node:lts-alpine3.12 AS build

ADD . /app
WORKDIR /app

RUN npm install

ARG ENVIRONMENT
ARG REACT_APP_FIAT_EXCHANGE_RATES_API_KEY
RUN mv .env.${ENVIRONMENT} .env && \
    npm run build


FROM nginx:1.19 as production

COPY --from=build /app/build /usr/share/nginx/html

SHELL ["/bin/bash", "-c"]
RUN echo $'\n\
server { \n\
    listen 80 default; \n\
    server_name localhost _; \n\
\n\
    location / { \n\
        root   /usr/share/nginx/html; \n\
        index  index.html; \n\
        # Redirect all requests to index.html \n\
        try_files $uri /index.html =404; \n\
    } \n\
\n\
    error_page   500 502 503 504  /50x.html; \n\
    location = /50x.html { \n\
        root   /usr/share/nginx/html; \n\
    } \n\
} \n\
' > /etc/nginx/conf.d/default.conf
