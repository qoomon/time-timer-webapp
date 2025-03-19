# Build stage using Node 16 (FROM in uppercase)
FROM node:16-alpine as build

# Set working directory
WORKDIR /project

# Copy package.json and package-lock.json to optimize caching
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application files
COPY . .

# Build the application (running gulp)
RUN npm run build

# Production stage using Nginx (FROM in uppercase)
FROM nginx:1.21-alpine

# Copy built files from the build stage into Nginx's HTML folder
COPY --from=build /project/dist /usr/share/nginx/html
