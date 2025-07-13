# Docker Setup Summary

## What's Been Created

### 1. Production Docker Setup

- **Dockerfile**: Multi-stage build that creates a single optimized image containing all three applications
- **docker-compose.prod.yml**: Production environment with PostgreSQL and Redis
- **scripts/docker-prod.sh**: Convenience script for production management

### 2. Development Docker Setup

- **Dockerfile.dev**: Multi-stage build with separate targets for each application
- **docker-compose.dev.yml**: Development environment with hot reloading
- **scripts/docker-dev.sh**: Convenience script for development management

### 3. Configuration Files

- **.dockerignore**: Optimized build context
- **DOCKER_README.md**: Comprehensive documentation
- **Updated README.md**: Added Docker information

### 4. Application Configuration

- **Updated apps/client/next.config.js**: Added standalone output for production

## Quick Start Commands

### Development Environment

```bash
# Start development environment
./scripts/docker-dev.sh up

# View logs
./scripts/docker-dev.sh logs

# Access backend shell
./scripts/docker-dev.sh shell backend

# Stop development environment
./scripts/docker-dev.sh down
```

### Production Environment

```bash
# Build production image
./scripts/docker-prod.sh build

# Start production environment
./scripts/docker-prod.sh up

# View logs
./scripts/docker-prod.sh logs

# Stop production environment
./scripts/docker-prod.sh down
```

## Environment Variables Required

Create a `.env` file in the root directory with:

```bash
# Required for both environments
JWT_SECRET=your-super-secret-jwt-key-here
ACCESSTOKENTTL=1h

# AWS SES (optional for development)
SES_ACCESS_KEY_ID=your-ses-access-key-id
SES_SECRET_ACCESS_KEY=your-ses-secret-access-key

# Cloudflare R2 (optional for development)
R2_SECRET_ACCESS_KEY=your-r2-secret-access-key
R2_ACCESS_KEY_ID=your-r2-access-key-id

# Queue configuration (optional for development)
QUEUE_URI=your-queue-uri
SCHEDULER_URI=your-scheduler-uri

# OpenAI (optional for development)
OPEN_AI_API_KEY=your-openai-api-key
```

## Service Ports

### Development

- Backend API: http://api.localhost:8000
- Client (Next.js): http://localhost:3001
- Admin (Vite): http://localhost:5173
- PostgreSQL: localhost:5432
- Redis: localhost:6379

### Production

- Main Application: http://api.localhost:8000 (Backend API + Client + Admin)
- PostgreSQL: localhost:5432
- Redis: localhost:6379

## Architecture Overview

### Development Architecture

- Separate containers for each application
- Hot reloading enabled
- Shared volumes for code changes
- Individual PostgreSQL and Redis instances

### Production Architecture

- Single container with all applications
- Optimized multi-stage build
- Backend serves as entry point
- Shared PostgreSQL and Redis instances

## Key Features

1. **Hot Reloading**: Development environment automatically reflects code changes
2. **Environment Variable Support**: Easy configuration through .env files
3. **Database Integration**: PostgreSQL and Redis included
4. **Convenience Scripts**: Easy management commands
5. **Production Ready**: Optimized builds for deployment
6. **Multi-stage Builds**: Efficient Docker images

## Next Steps

1. Set up host mapping: `sudo ./scripts/setup-hosts.sh`
2. Create a `.env` file with your environment variables
3. Test the development environment: `./scripts/docker-dev.sh up`
4. Test the production build: `./scripts/docker-prod.sh build`
5. Customize environment variables as needed
6. Deploy to your preferred platform

## Node.js Version

All Docker containers now use **Node.js 23** for the latest features and performance improvements.

## Troubleshooting

- **Port conflicts**: Ensure ports 3001, 3002, 5000, 5432, and 6379 are available
- **Build failures**: Check that all dependencies are properly installed
- **Permission issues**: Make sure scripts are executable (`chmod +x scripts/*.sh`)
- **Database connection**: Ensure PostgreSQL and Redis containers are running

For detailed information, see [DOCKER_README.md](./DOCKER_README.md).
