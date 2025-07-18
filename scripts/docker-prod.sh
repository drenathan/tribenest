#!/bin/bash

# TribeNest Production Docker Management Script

set -e

COMPOSE_FILE="docker-compose.prod.yml"
IMAGE_NAME="tribenest"

case "$1" in
  "build")
    echo "🐳 Building production Docker image..."
    docker build -t $IMAGE_NAME:latest .
    echo "✅ Production image built successfully!"
    ;;
  "up")
    echo "Starting production environment..."
    docker-compose -f $COMPOSE_FILE up -d
    echo "Production environment started!"
    echo "Main Application: http://api.localhost:8000"
    echo "PostgreSQL: localhost:5432"
    echo "Redis: localhost:6379"
    ;;
  "down")
    echo "Stopping production environment..."
    docker-compose -f $COMPOSE_FILE down
    echo "Production environment stopped!"
    ;;
  "restart")
    echo "Restarting production environment..."
    docker-compose -f $COMPOSE_FILE down
    docker-compose -f $COMPOSE_FILE up -d
    echo "Production environment restarted!"
    ;;
  "logs")
    echo "Showing production logs..."
    docker-compose -f $COMPOSE_FILE logs -f
    ;;
  "shell")
    echo "Opening shell in production container..."
    docker exec -it tribenest-app sh
    ;;
  "migrate")
    echo "Running database migrations..."
    docker exec -it tribenest-app npm run migrate
    ;;
  "clean")
    echo "Cleaning up production environment..."
    docker-compose -f $COMPOSE_FILE down -v
    docker rmi $IMAGE_NAME:latest 2>/dev/null || true
    docker system prune -f
    echo "Production environment cleaned!"
    ;;
  "status")
    echo "Production environment status:"
    docker-compose -f $COMPOSE_FILE ps
    ;;
  "deploy")
    if [ -z "$2" ]; then
      echo "Usage: $0 deploy <registry-url> [--skip-build]"
      echo "Example: $0 deploy ghcr.io/your-github-username"
      echo "Example: $0 deploy ghcr.io/your-github-username --skip-build"
      exit 1
    fi
    REGISTRY=ghcr.io/drenathan
    echo "🚀 Deploying TribeNest to registry: $REGISTRY"
    
    # Check if --skip-build flag is provided
    if [ "$3" = "--skip-build" ]; then
      echo "⏭️  Skipping local build step..."
    else
      # Build applications locally first
      echo "🔨 Building applications locally first..."
      ./scripts/build.sh
    fi
    
    # Build Docker image
    echo "🐳 Building production Docker image..."
    docker build -t $IMAGE_NAME:latest .
    
    # Tag for registry
    echo "🏷️  Tagging image for registry..."
    docker tag $IMAGE_NAME:latest $REGISTRY/$IMAGE_NAME:latest
    
    # Push to registry
    echo "📤 Pushing to registry..."
    docker push $REGISTRY/$IMAGE_NAME:latest
    
    echo "✅ Deployment completed successfully!"
    echo ""
    echo "🎯 To deploy to production:"
    echo "   REGISTRY=$REGISTRY docker-compose -f docker-compose.prod.yml up -d"
    ;;
  *)
    echo "Usage: $0 {build|up|down|restart|logs|shell|migrate|clean|status|deploy}"
    echo ""
    echo "Commands:"
    echo "  build [--skip-build]  - Build production image (skip local build with --skip-build)"
    echo "  up                    - Start production environment"
    echo "  down                  - Stop production environment"
    echo "  restart               - Restart production environment"
    echo "  logs                  - Show production logs"
    echo "  shell                 - Open shell in production container"
    echo "  migrate               - Run database migrations"
    echo "  clean                 - Clean up containers and volumes"
    echo "  status                - Show container status"
    echo "  deploy <registry> [--skip-build] - Build and deploy to registry"
    exit 1
    ;;
esac 