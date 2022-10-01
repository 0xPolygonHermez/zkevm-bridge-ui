FROM nginx:alpine

RUN apk add --update nodejs npm

ADD . /app

WORKDIR /app

RUN npm install

ENTRYPOINT ["/bin/sh", "/app/scripts/deploy.sh"]
