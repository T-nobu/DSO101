# Use Node.js LTS
FROM node:20-alpine

# Native build tools for better-sqlite3
RUN apk add --no-cache python3 make g++

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all files
COPY . .

# Run tests (optional)
RUN npm test

# SQLite data directory for containers
RUN mkdir -p /app/data && chmod 777 /app/data
ENV DOCKER_ENV=true
ENV PORT=3000

# Expose the app port
EXPOSE 3000

# Start the app
CMD ["npm", "start"]
