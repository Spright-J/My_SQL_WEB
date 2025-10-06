# Multi-stage Docker build for React + Node.js application

# Stage 1: Build React application
FROM node:22-alpine AS react-builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies for build)
RUN npm ci

# Copy all source files (excluding what's in .dockerignore)
COPY . .

# Build React application using the same command as local build
RUN npm run build

# Stage 2: Build Node.js server
FROM node:22-alpine AS server-builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production

# Copy server files
COPY server/ ./server/

# Stage 3: Production image
FROM node:22-alpine AS production

# Install sqlite3 dependencies and openssl for SSL
RUN apk add --no-cache python3 make g++ openssl

# Set working directory
WORKDIR /app

# Copy built React application from react-builder stage
COPY --from=react-builder /app/dist ./public

# Copy server dependencies and files from server-builder stage
COPY --from=server-builder /app/node_modules ./node_modules
COPY --from=server-builder /app/server ./server

# Copy package.json for runtime reference
COPY package*.json ./

# Create necessary directories and generate SSL certificates
RUN mkdir -p ./server/database/existing ./ssl && \
    openssl genrsa -out ssl/server.key 2048 && \
    openssl req -new -key ssl/server.key -out ssl/server.csr -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost" && \
    openssl x509 -req -days 365 -in ssl/server.csr -signkey ssl/server.key -out ssl/server.crt && \
    rm ssl/server.csr && \
    chmod 600 ssl/server.key && \
    chmod 644 ssl/server.crt

# Expose HTTPS port
EXPOSE 8443

# Set environment variables
ENV NODE_ENV=production

# Start the server
CMD ["node", "server/server.js"]
