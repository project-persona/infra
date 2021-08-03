FROM node:lts-alpine

ADD ./ /app

RUN cd /app \
    && npm install

WORKDIR /app

ENTRYPOINT ["npm", "run"]
