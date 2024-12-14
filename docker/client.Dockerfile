FROM node:23-alpine3.20 AS build-stage

WORKDIR /app

COPY ../package*.json ./

RUN npm i

COPY ../client ./client

WORKDIR /app/client

RUN npm i

RUN npm run build

FROM nginx:1.27.3

COPY --from=build-stage /app/client/nginx.conf /etc/nginx/http.d/default.conf
COPY --from=build-stage /app/client/dist/ /usr/share/nginx/html/

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
