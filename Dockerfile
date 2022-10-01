FROM nginx:alpine

RUN apk add --update nodejs npm

WORKDIR /app

COPY . .

RUN npm install

ENTRYPOINT ["/bin/sh", "/app/scripts/deploy.sh"]
