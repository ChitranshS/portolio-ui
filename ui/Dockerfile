# Build stage
FROM node:18-alpine as builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy project files
COPY . .

# Build the app
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Copy package files and install production dependencies
COPY package*.json ./
RUN npm install --production

# Copy built files and server
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server.js ./server.js

# Expose port 3000
EXPOSE 3000

# Start the server
CMD ["node", "server.js"]

