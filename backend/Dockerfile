FROM node:lts-alpine3.20

# Install Git
RUN apk update && apk add --no-cache git 

ADD . /backend
WORKDIR /backend

# COPY package.json /app

# Install dependencies
RUN npm install --silent

# Install production dependencies
# RUN npm run build --silent

EXPOSE 3001
