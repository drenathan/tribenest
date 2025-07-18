# Use Node.js 23 as base image
FROM node:23-alpine AS base

# Install nginx for reverse proxy
RUN apk add --no-cache nginx

# Install dependencies only when needed
FROM base AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./
COPY apps/backend/package.json ./apps/backend/
COPY apps/client/package.json ./apps/client/
COPY apps/admin/package.json ./apps/admin/
COPY packages/frontend-shared/package.json ./packages/frontend-shared/
COPY packages/eslint-config/package.json ./packages/eslint-config/
COPY packages/typescript-config/package.json ./packages/typescript-config/

# Install dependencies
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build applications individually to handle failures better
# Set build environment variables
ENV NODE_ENV=production
ENV SKIP_ENV_VALIDATION=true

# # Build the backend first
# RUN echo "Building backend..." && \
#     cd apps/backend && \
#     npm run build

# # Build the admin SPA
# RUN echo "Building admin SPA..." && \
#     cd apps/admin && \
#     npm run build

# # Build the Next.js client
# RUN echo "Building Next.js client..." && \
#     cd apps/client && \
#     npm run build
RUN npm run build

# Production image, copy all the files and run the app
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8000

# Create a non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built applications
COPY --from=builder --chown=nextjs:nodejs /app/apps/backend/build ./apps/backend/build
COPY --from=builder --chown=nextjs:nodejs /app/apps/backend/package.json ./apps/backend/
COPY --from=builder --chown=nextjs:nodejs /app/apps/admin/dist ./apps/admin/dist
COPY --from=builder --chown=nextjs:nodejs /app/apps/client/.next ./apps/client/.next
COPY --from=builder --chown=nextjs:nodejs /app/apps/client/public ./apps/client/public
COPY --from=builder --chown=nextjs:nodejs /app/apps/client/package.json ./apps/client/
# Copy necessary files for the backend
COPY --from=builder --chown=nextjs:nodejs /app/apps/backend/src/db/_migration ./apps/backend/src/db/_migration
COPY --from=builder --chown=nextjs:nodejs /app/apps/backend/src/configuration ./apps/backend/src/configuration

# Copy shared packages
COPY --from=builder --chown=nextjs:nodejs /app/packages ./packages

# Install only production dependencies
COPY package.json package-lock.json* ./
COPY apps/backend/package.json ./apps/backend/
COPY apps/client/package.json ./apps/client/
COPY apps/admin/package.json ./apps/admin/
COPY packages/frontend-shared/package.json ./packages/frontend-shared/

RUN npm ci --only=production --ignore-scripts

# Copy startup script
COPY scripts/start.sh /app/start.sh
RUN chmod +x /app/start.sh

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Expose only the proxy port
EXPOSE 80

# Start all applications
CMD ["/app/start.sh"]
