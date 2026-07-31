# Multi-stage Dockerfile for ProCraft Full-Stack Hardware & Paint Studio
# Stage 1: Build React Frontend
FROM node:20-alpine AS build-client
WORKDIR /app/client
COPY client/package*.json ./
RUN npm install
COPY client/ ./
RUN npm run build

# Stage 2: Build Node/Express Backend
FROM node:20-alpine AS build-server
WORKDIR /app/server
COPY server/package*.json ./
RUN npm install
COPY server/ ./
RUN npm run build

# Stage 3: Production Runner
FROM node:20-alpine AS production
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=5000

# Copy root package for scripts if needed
COPY package*.json ./

# Copy built frontend
COPY --from=build-client /app/client/dist ./client/dist

# Copy built server & production dependencies
WORKDIR /app/server
COPY --from=build-server /app/server/package*.json ./
RUN npm install --omit=dev
COPY --from=build-server /app/server/dist ./dist

# Expose API and Frontend port
EXPOSE 5000

CMD ["node", "dist/index.js"]
