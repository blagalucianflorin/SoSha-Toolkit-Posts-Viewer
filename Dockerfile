# Build stage
FROM node:20-alpine as builder

WORKDIR /app

# Set environment variable to use node adapter
ENV DOCKER_BUILD=true

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy all other source code files
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:20-alpine as production

WORKDIR /app

# Copy necessary files
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/build ./build

# Install production dependencies
RUN npm ci --production

# Set production environment
ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0

EXPOSE 3000

# Start the application using the correct path
CMD ["node", "build/index.js"]