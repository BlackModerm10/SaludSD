# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Production
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --only=production
COPY --from=builder /app/dist ./dist
# If we need the schema sql
COPY --from=builder /app/src/models/schema.sql ./dist/models/schema.sql

# Create logs directory and set ownership to node user
RUN mkdir -p logs && chown -R node:node /app
USER node

EXPOSE 5000
CMD ["node", "dist/index.js"]
