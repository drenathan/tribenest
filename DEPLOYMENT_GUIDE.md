# TribeNest Production Deployment Guide

## Overview

This guide explains how to build, push, and deploy the TribeNest application to production using Docker.

## Prerequisites

1. **GitHub Account**: You need a GitHub account to use GitHub Container Registry
2. **GitHub Token**: Create a Personal Access Token with `write:packages` permission
3. **Docker Login**: Run `docker login ghcr.io` to authenticate with GHCR
4. **Build Script**: Ensure `./scripts/build.sh` exists and is executable

## Quick Deployment

### 1. Build and Push to Registry

```bash
# Replace 'your-github-username' with your actual GitHub username
./scripts/docker-prod.sh deploy ghcr.io/your-github-username
```

This command will:

- Build all applications locally
- Build the production Docker image
- Tag the image for your registry
- Push the image to Docker Hub

### 2. Deploy to Production

```bash
# Set the registry and deploy
REGISTRY=ghcr.io/your-github-username docker-compose -f docker-compose.prod.yml up -d
```

## Detailed Workflow

### Step 1: Build Applications Locally

```bash
# Build all applications (Next.js, Vite, etc.)
./scripts/build.sh
```

### Step 2: Build Docker Image

```bash
# Build the production Docker image
./scripts/docker-prod.sh build
```

### Step 3: Deploy to Registry

```bash
# Deploy to GitHub Container Registry (this includes building and pushing)
./scripts/docker-prod.sh deploy ghcr.io/your-github-username
```

### Step 4: Deploy to Production Server

```bash
# On your production server, pull and run the image
REGISTRY=ghcr.io/your-github-username docker-compose -f docker-compose.prod.yml up -d
```

## Available Commands

### Build Commands

```bash
# Build everything (local apps + Docker image)
./scripts/docker-prod.sh build

# Build Docker image only (skip local builds)
./scripts/docker-prod.sh build --skip-build
```

### Deploy Commands

```bash
# Build and deploy to registry
./scripts/docker-prod.sh deploy ghcr.io/your-github-username

# Deploy to registry (skip local builds)
./scripts/docker-prod.sh deploy ghcr.io/your-github-username --skip-build
```

### Production Management

```bash
# Start production environment
./scripts/docker-prod.sh up

# Stop production environment
./scripts/docker-prod.sh down

# Restart production environment
./scripts/docker-prod.sh restart

# View production logs
./scripts/docker-prod.sh logs

# Run database migrations
./scripts/docker-prod.sh migrate

# Clean up production environment
./scripts/docker-prod.sh clean

# Check production status
./scripts/docker-prod.sh status
```

## Environment Variables

### For Production Deployment

```bash
# Set your registry when deploying
export REGISTRY=ghcr.io/your-github-username

# Deploy with the registry
docker-compose -f docker-compose.prod.yml up -d
```

### Required Environment Variables

Make sure these are set in your production environment:

```bash
# Database
DATABASE_HOST=postgres
DATABASE_PORT=5432
DATABASE_USER=tribe
DATABASE_PASSWORD=tribe
DATABASE_NAME=tribe

# Redis
REDIS_URL=redis://redis:6379

# JWT
JWT_SECRET=your-secret-key
ACCESSTOKENTTL=1h

# AWS SES (for emails)
SES_ACCESS_KEY_ID=your-access-key
SES_SECRET_ACCESS_KEY=your-secret-key

# Cloudflare R2 (for file storage)
R2_SECRET_ACCESS_KEY=your-secret-key
R2_ACCESS_KEY_ID=your-access-key
R2_URL=your-r2-url
R2_BUCKET_NAME=your-bucket-name
R2_BUCKET_URL=your-bucket-url
```

## Troubleshooting

### Image Not Found

If you get an "image not found" error:

1. **Check the registry**: Ensure the image was pushed successfully
2. **Check the tag**: Verify you're using the correct image name
3. **Pull the image**: Run `docker pull ghcr.io/your-github-username/tribenest:latest`

### Build Failures

If the build fails:

1. **Check prerequisites**: Ensure all dependencies are installed
2. **Check build script**: Verify `./scripts/build.sh` exists and works
3. **Check Dockerfile**: Ensure the Dockerfile is correct

### Deployment Issues

If deployment fails:

1. **Check environment variables**: Ensure all required env vars are set
2. **Check network**: Verify containers can communicate
3. **Check logs**: Use `./scripts/docker-prod.sh logs` to debug

## Best Practices

1. **Version Tagging**: Use semantic versioning for releases
2. **Registry Security**: Use private registries for sensitive applications
3. **Environment Separation**: Keep dev and prod environments separate
4. **Backup Strategy**: Regularly backup your production database
5. **Monitoring**: Set up monitoring and alerting for production

## Example Workflow

```bash
# 1. Build and deploy to registry
./scripts/docker-prod.sh deploy ghcr.io/your-github-username

# 2. Deploy to production server
ssh your-server
cd /path/to/tribenest
REGISTRY=ghcr.io/your-github-username docker-compose -f docker-compose.prod.yml up -d

# 3. Run migrations
./scripts/docker-prod.sh migrate

# 4. Check status
./scripts/docker-prod.sh status
```
