# Use an official Node.js runtime as the base image
FROM node:lts-alpine


# Install Git
RUN apk update && apk add --no-cache git

# Set the working directory in the container
WORKDIR /backend

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install project dependencies
RUN npm install --omit=dev 

# Copy the entire project to the working directory
COPY . .

# Expose the port that the app will run on
EXPOSE 3001

# Define the command to run the app
CMD ["node", "src/main.js"]
