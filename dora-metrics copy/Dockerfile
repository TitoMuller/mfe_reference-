# Multi-stage build for production optimization
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./
RUN npm ci --only=production && npm cache clean --force

# Build the application
FROM base AS builder
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

COPY . .
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 dora-api

# Copy built application
COPY --from=builder /app/dist ./dist
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Create logs directory
RUN mkdir logs && chown dora-api:nodejs logs

USER dora-api

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:${PORT:-3001}/health || exit 1

EXPOSE 3001

ENV NODE_ENV=production

CMD ["node", "dist/index.js"]