# Stage 1: Build the React application
FROM node:18-alpine AS build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Copy and use the .env.production file during build
COPY .env.production .env.production

# Set build-time environment variable for React
ENV REACT_APP_API_URL=https://app-backend-8l9n.onrender.com

# Build the application with the API URL
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:stable-alpine

# Copy built files from build stage
COPY --from=build /app/build /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
