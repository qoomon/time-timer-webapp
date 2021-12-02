FROM node:16-alpine as build
WORKDIR /project
COPY . .
RUN npm install
RUN npm run build

FROM nginx:1.21-alpine
COPY --from=build /project/dist /usr/share/nginx/html
