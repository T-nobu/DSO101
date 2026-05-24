# Build stage
FROM node:18-alpine AS builder

# Install build dependencies for better-sqlite3
RUN apk add --no-cache build-base python3

WORKDIR /app

# Copy only package files first
COPY package*.json ./

# Install all dependencies - this runs in Linux environment
RUN npm ci --verbose

# Copy the rest of the application code (node_modules excluded via .dockerignore)
COPY . .

# Production stage
FROM node:18-alpine

WORKDIR /app

# Copy installed node_modules and source from builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/server.js ./

# Create directory for SQLite database
RUN mkdir -p /app/data && chmod 777 /app/data

# Expose port
EXPOSE 5000

# Start the application
CMD ["node", "server.js"]
