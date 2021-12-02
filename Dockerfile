FROM node:16-alpine

WORKDIR /timer
COPY . .
RUN npm install
RUN npm run build

FROM nginx:1.21-alpine

COPY --from=0 /timer/dist /usr/share/nginx/html

