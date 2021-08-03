FROM node:lts-alpine

RUN cd /app \
    && npm install

WORKDIR /app

ENTRYPOINT ["npm", "run"]
