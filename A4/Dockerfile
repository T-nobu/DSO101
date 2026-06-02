FROM node:20-alpine

RUN apk add --no-cache python3 make g++

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm test

RUN mkdir -p /app/data && chmod 777 /app/data
ENV DOCKER_ENV=true
ENV PORT=3000

EXPOSE 3000
CMD ["npm", "start"]
