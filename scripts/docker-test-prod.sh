#!/bin/bash

# TribeNest Test Production Docker Management Script

set -e

COMPOSE_FILE="docker-compose.test-prod.yml"
IMAGE_NAME="tribenest"

case "$1" in
  "build")
    # Check if --skip-build flag is provided
    if [ "$2" = "--skip-build" ]; then
      echo "⏭️  Skipping local build step..."
    else
      echo "🔨 Building applications locally first..."
      ./scripts/build.sh
    fi
    echo "🐳 Building test production Docker image..."
    docker-compose -f $COMPOSE_FILE build
    echo "✅ Test production image built successfully!"
    ;;
  "up")
    echo "Starting test production environment..."
    docker-compose -f $COMPOSE_FILE up -d
    echo "Test production environment started!"
    echo "Main Application: http://localhost:8000"
    echo "PostgreSQL: localhost:5433"
    echo "Redis: localhost:6380"
    ;;
  "down")
    echo "Stopping test production environment..."
    docker-compose -f $COMPOSE_FILE down
    echo "Test production environment stopped!"
    ;;
  "restart")
    echo "Restarting test production environment..."
    docker-compose -f $COMPOSE_FILE down
    docker-compose -f $COMPOSE_FILE up -d
    echo "Test production environment restarted!"
    ;;
  "logs")
    echo "Showing test production logs..."
    docker-compose -f $COMPOSE_FILE logs -f
    ;;
  "shell")
    echo "Opening shell in test production container..."
    docker exec -it tribenest-app-test-prod sh
    ;;
  "migrate")
    echo "Running database migrations..."
    docker exec -it tribenest-app-test-prod npm run migrate
    ;;
  "clean")
    echo "Cleaning up test production environment..."
    docker-compose -f $COMPOSE_FILE down -v
    docker rmi tribenest-app-test-prod 2>/dev/null || true
    # Only remove unused images, not all containers
    docker image prune -f
    echo "Test production environment cleaned!"
    ;;
  "status")
    echo "Test production environment status:"
    docker-compose -f $COMPOSE_FILE ps
    ;;
  "rebuild")
    echo "Rebuilding test production environment..."
    docker-compose -f $COMPOSE_FILE down
    docker-compose -f $COMPOSE_FILE build --no-cache
    docker-compose -f $COMPOSE_FILE up -d
    echo "Test production environment rebuilt and started!"
    ;;
  *)
    echo "Usage: $0 {build|up|down|restart|logs|shell|migrate|clean|status|rebuild}"
    echo ""
    echo "Commands:"
    echo "  build [--skip-build]  - Build test production image (skip local build with --skip-build)"
    echo "  up                    - Start test production environment"
    echo "  down                  - Stop test production environment"
    echo "  restart               - Restart test production environment"
    echo "  logs                  - Show test production logs"
    echo "  shell                 - Open shell in test production container"
    echo "  migrate               - Run database migrations"
    echo "  clean                 - Clean up containers and volumes"
    echo "  status                - Show container status"
    echo "  rebuild               - Rebuild image and restart environment"
    exit 1
    ;;
esac 