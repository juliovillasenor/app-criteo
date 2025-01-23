FROM node:16.20.2

WORKDIR /app

COPY package.json yarn.lock .env /app

RUN yarn install

COPY public /app/public

COPY src /app/src

COPY routes /app/routes

COPY *.js web.config /app

EXPOSE 8080

CMD [ "npm", "start" ]
