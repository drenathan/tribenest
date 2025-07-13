# TribeNest Docker Setup

This repository includes Docker configurations for both development and production environments.

## Prerequisites

- Docker
- Docker Compose
- Node.js 23+ (for local development)
- Host setup for api.localhost (see Host Setup section)

## Environment Variables

Before running the containers, you need to set up environment variables. Create a `.env` file in the root directory with the following variables:

```bash
# Node environment
NODE_ENV=production
PORT=5000

# Database configuration
DATABASE_HOST=postgres
DATABASE_PORT=5432
DATABASE_USER=tribe
DATABASE_PASSWORD=tribe
DATABASE_NAME=tribe

# Redis configuration
REDIS_URL=redis://redis:6379

# JWT configuration
JWT_SECRET=your-super-secret-jwt-key-here
ACCESSTOKENTTL=1h

# AWS SES configuration
SES_ACCESS_KEY_ID=your-ses-access-key-id
SES_SECRET_ACCESS_KEY=your-ses-secret-access-key

# Cloudflare R2 configuration
R2_SECRET_ACCESS_KEY=your-r2-secret-access-key
R2_ACCESS_KEY_ID=your-r2-access-key-id

# Queue configuration
QUEUE_URI=your-queue-uri
SCHEDULER_URI=your-scheduler-uri

# Deployment configuration
DEPLOYMENT=Server

# OpenAI configuration
OPEN_AI_API_KEY=your-openai-api-key
```

## Host Setup

Before running the containers, you need to set up the host mapping for `api.localhost`:

```bash
# Run the setup script (requires sudo)
sudo ./scripts/setup-hosts.sh

# Or manually add to /etc/hosts:
# 127.0.0.1 api.localhost
```

This allows you to access your API at `http://api.localhost:8000` instead of `http://localhost:8000`.

## Development Environment

The development environment runs all three applications in parallel with hot reloading enabled.

### Starting Development Environment

```bash
# Start all services
docker-compose -f docker-compose.dev.yml up

# Start in detached mode
docker-compose -f docker-compose.dev.yml up -d

# Start specific services
docker-compose -f docker-compose.dev.yml up backend client
```

### Development Services

- **Backend API**: http://api.localhost:8000
- **Client (Next.js)**: http://localhost:3001
- **Admin (Vite)**: http://localhost:5173
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379

### Hot Reloading

All applications support hot reloading. When you make changes to the source code, the containers will automatically restart and reflect your changes.

### Stopping Development Environment

```bash
# Stop all services
docker-compose -f docker-compose.dev.yml down

# Stop and remove volumes
docker-compose -f docker-compose.dev.yml down -v
```

## Production Environment

The production environment creates a single optimized image containing all three applications.

### Building Production Image

```bash
# Build applications locally first, then build Docker image
./scripts/build.sh
docker build -t tribenest:latest .

# Or use the convenience script
./scripts/docker-prod.sh build
```

### Running Production Environment

```bash
# Start production environment
docker-compose -f docker-compose.prod.yml up

# Start in detached mode
docker-compose -f docker-compose.prod.yml up -d
```

### Production Services

- **Main Application**: http://api.localhost:8000 (Backend API + Client + Admin)
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379

### Stopping Production Environment

```bash
# Stop all services
docker-compose -f docker-compose.prod.yml down

# Stop and remove volumes
docker-compose -f docker-compose.prod.yml down -v
```

## Container Management

### Viewing Logs

```bash
# Development logs
docker-compose -f docker-compose.dev.yml logs -f backend
docker-compose -f docker-compose.dev.yml logs -f client
docker-compose -f docker-compose.dev.yml logs -f admin

# Production logs
docker-compose -f docker-compose.prod.yml logs -f tribenest-app
```

### Accessing Containers

```bash
# Development containers
docker exec -it tribenest-backend-dev sh
docker exec -it tribenest-client-dev sh
docker exec -it tribenest-admin-dev sh

# Production container
docker exec -it tribenest-app sh

# Database
docker exec -it tribenest-postgres-dev psql -U tribe -d tribe
```

### Database Migrations

```bash
# Run migrations in development
docker exec -it tribenest-backend-dev npm run migrate

# Run migrations in production
docker exec -it tribenest-app npm run migrate
```

## Deployment

### Building for Deployment

```bash
# Build production image
docker build -t tribenest:latest .

# Tag for registry
docker tag tribenest:latest your-registry/tribenest:latest

# Push to registry
docker push your-registry/tribenest:latest
```

### Environment Variables for Deployment

Make sure to set all required environment variables in your deployment environment:

- `JWT_SECRET`: Secret key for JWT tokens
- `SES_ACCESS_KEY_ID` & `SES_SECRET_ACCESS_KEY`: AWS SES credentials
- `R2_ACCESS_KEY_ID` & `R2_SECRET_ACCESS_KEY`: Cloudflare R2 credentials
- `OPEN_AI_API_KEY`: OpenAI API key
- `QUEUE_URI` & `SCHEDULER_URI`: Queue configuration

## Troubleshooting

### Common Issues

1. **Port conflicts**: Make sure ports 3001, 3002, 5000, 5432, and 6379 are available
2. **Permission issues**: Run Docker commands with appropriate permissions
3. **Build failures**: Check that all dependencies are properly installed
4. **Database connection**: Ensure PostgreSQL and Redis containers are running

### Resetting Environment

```bash
# Remove all containers and volumes
docker-compose -f docker-compose.dev.yml down -v
docker-compose -f docker-compose.prod.yml down -v

# Remove all images
docker rmi $(docker images -q tribenest*)

# Clean up Docker system
docker system prune -a
```

## Architecture

### Development Architecture

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Client    │    │    Admin    │    │   Backend   │
│  (Next.js)  │    │   (Vite)    │    │   (Node.js) │
│   :3001     │    │   :3002     │    │   :5000     │
└─────────────┘    └─────────────┘    └─────────────┘
       │                   │                   │
       └───────────────────┼───────────────────┘
                           │
              ┌─────────────┼─────────────┐
              │             │             │
         ┌─────────┐  ┌─────────┐  ┌─────────┐
         │PostgreSQL│  │  Redis  │  │  Shared │
         │  :5432  │  │  :6379  │  │ Packages│
         └─────────┘  └─────────┘  └─────────┘
```

### Production Architecture

```
┌─────────────────────────────────────────────┐
│              Main Application               │
│  ┌─────────┐ ┌─────────┐ ┌─────────────┐   │
│  │ Backend │ │ Client  │ │    Admin    │   │
│  │  API    │ │(Next.js)│ │   (Vite)    │   │
│  └─────────┘ └─────────┘ └─────────────┘   │
│                    :5000                   │
└─────────────────────────────────────────────┘
              │
    ┌─────────┼─────────┐
    │         │         │
┌─────────┐ ┌─────────┐ ┌─────────┐
│PostgreSQL│ │  Redis  │ │  Shared │
│  :5432  │ │  :6379  │ │ Packages│
└─────────┘ └─────────┘ └─────────┘
```

## File Structure

```
├── Dockerfile                 # Production multi-stage build
├── Dockerfile.dev            # Development multi-stage build
├── docker-compose.prod.yml   # Production services
├── docker-compose.dev.yml    # Development services
├── .dockerignore             # Docker build exclusions
└── DOCKER_README.md          # This file
```
