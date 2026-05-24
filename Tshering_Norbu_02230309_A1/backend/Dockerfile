FROM node:18-alpine

# Install SQLite (pre-built, no compilation needed)
RUN apk add --no-cache sqlite

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (no compilation needed)
RUN npm ci --only=production

# Copy application code
COPY . .

# Create directory for SQLite database
RUN mkdir -p /app/data && chmod 777 /app/data

# Expose port
EXPOSE 5000

# Start the application
CMD ["node", "server.js"]
