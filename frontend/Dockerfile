# Use an official Node.js runtime as the base image
FROM node:lts-alpine3.20

ADD . /frontend

# Set the working directory in the container
WORKDIR /frontend

# Copy package.json and package-lock.json to the working directory
# COPY package*.json ./

# Install project dependencies
RUN npm install --silent

# Copy the entire project to the working directory
# COPY . .

# Build the React app
RUN npm run build --silent

# Expose the port that the app will run on
EXPOSE 3000

# Define the command to run the app
CMD PORT=3002 npm start
