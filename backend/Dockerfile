FROM node:slim

ADD . /backend
WORKDIR /backend

# COPY package.json /app

RUN npm install --silent

# RUN npm run build --silent

EXPOSE 3001

CMD ["npm", "start"]
