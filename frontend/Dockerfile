# Base image
FROM node:16-alpine

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package.json yarn.lock ./
RUN yarn install

# Copy the rest of the app files
COPY . .

# Build the production app
RUN yarn build

# Serve the app using a lightweight HTTP server
RUN yarn global add serve

# Expose port 3000 for the app
EXPOSE 3000

# Default command to serve the app
CMD ["serve", "-s", "build"]
