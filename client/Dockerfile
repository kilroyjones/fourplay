# Use the official Node.js image as the base image
FROM node:latest AS build

# Set the working directory in the container
WORKDIR /app

# Copy the package.json and package-lock.json (if available) files
COPY package*.json ./

# Install the project dependencies
RUN npm install

# Copy the rest of the application's source code
COPY . .

RUN npm run build

FROM nginx:latest

COPY --from=build /app/public /usr/share/nginx/html
COPY default.conf /etc/nginx/conf.d/default.conf


