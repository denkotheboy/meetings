FROM node:23-alpine3.20

WORKDIR /app

COPY ../package*.json ./

RUN npm i

COPY ../server ./server

WORKDIR /app/server

RUN npm i

CMD [ "npm", "run", "start" ]
