# Production Dockerfile - Copy pre-built applications
FROM node:23-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files for backend only
COPY package.json package-lock.json* ./
COPY apps/backend/package.json ./apps/backend/package.json

# Install only backend production dependencies
RUN npm ci --only=production
RUN cd apps/backend && npm ci --only=production

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

# Create a non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy package files first
COPY package.json package-lock.json* ./

# Copy pre-built applications from local build
COPY apps/backend/build ./backend/build
COPY apps/backend/package.json ./backend/package.json
COPY apps/client/.next ./client/.next
COPY apps/client/public ./client/public
COPY apps/admin/dist ./admin/dist
COPY packages ./packages

# Copy shared dependencies
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/backend/node_modules ./backend/node_modules

# Copy Next.js runtime files from client build to client directory
RUN mkdir -p ./client/node_modules/next/dist
COPY apps/client/.next/standalone/node_modules/next/dist ./client/node_modules/next/dist

# Set the correct permission for prerender cache
RUN mkdir -p .next
RUN chown nextjs:nodejs .next

# Install dependencies in the final image
RUN npm install --production
RUN cd backend && npm install --production

# Switch to non-root user
USER nextjs

EXPOSE 8000

ENV PORT=8000
ENV HOSTNAME="0.0.0.0"

# Set the working directory to backend
WORKDIR /app/backend

# Start the application using the run script
CMD ["npm", "run", "run"]