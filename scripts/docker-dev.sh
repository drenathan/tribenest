#!/bin/bash

# TribeNest Development Docker Management Script

set -e

COMPOSE_FILE="docker-compose.dev.yml"

# Function to show service URLs
show_urls() {
    echo "Development environment started!"
    echo "Backend API: http://api.localhost:8000"
    echo "Client: http://localhost:3001"
    echo "Admin: http://localhost:5173"
    echo "PostgreSQL: localhost:5432"
    echo "Redis: localhost:6379"
}

# Function to validate app name
validate_app() {
    local app=$1
    case "$app" in
        "postgres"|"redis"|"")
            return 0
            ;;
        *)
            echo "Invalid app: $app"
            echo "Available apps: postgres, redis"
            exit 1
            ;;
    esac
}

case "$1" in
  "up")
    validate_app "$2"
    if [ -z "$2" ]; then
      echo "Starting all development services..."
      docker-compose -f $COMPOSE_FILE up -d
      show_urls
    else
      echo "Starting $2 service..."
      docker-compose -f $COMPOSE_FILE up -d "$2"
      if [ "$2" = "backend" ] || [ "$2" = "client" ] || [ "$2" = "admin" ]; then
        show_urls
      fi
    fi
    ;;
  "down")
    validate_app "$2"
    if [ -z "$2" ]; then
      echo "Stopping all development services..."
      docker-compose -f $COMPOSE_FILE down
    else
      echo "Stopping $2 service..."
      docker-compose -f $COMPOSE_FILE stop "$2"
    fi
    echo "Services stopped!"
    ;;
  "restart")
    validate_app "$2"
    if [ -z "$2" ]; then
      echo "Restarting all development services..."
      docker-compose -f $COMPOSE_FILE down
      docker-compose -f $COMPOSE_FILE up -d
      show_urls
    else
      echo "Restarting $2 service..."
      docker-compose -f $COMPOSE_FILE restart "$2"
      if [ "$2" = "backend" ] || [ "$2" = "client" ] || [ "$2" = "admin" ]; then
        show_urls
      fi
    fi
    ;;
  "logs")
    if [ -z "$2" ]; then
      echo "Showing logs for all services..."
      docker-compose -f $COMPOSE_FILE logs -f
    else
      validate_app "$2"
      echo "Showing logs for $2..."
      docker-compose -f $COMPOSE_FILE logs -f "$2"
    fi
    ;;
  "shell")
    if [ -z "$2" ]; then
      echo "Usage: $0 shell [backend|client|admin|postgres]"
      exit 1
    fi
    validate_app "$2"
    case "$2" in
      "postgres")
        docker exec -it tribenest-postgres-dev psql -U tribe -d tribe
        ;;
      "redis")
        docker exec -it tribenest-redis-dev redis-cli
        ;;
      *)
        echo "Invalid service: $2"
        echo "Available services: backend, client, admin, postgres, redis"
        exit 1
        ;;
    esac
    ;;
  "clean")
    echo "Cleaning up development environment..."
    docker-compose -f $COMPOSE_FILE down -v
    docker system prune -f
    echo "Development environment cleaned!"
    ;;
  "status")
    echo "Development environment status:"
    docker-compose -f $COMPOSE_FILE ps
    ;;
  *)
    echo "Usage: $0 {up|down|restart|logs|shell|migrate|clean|status} [app]"
    echo ""
    echo "Commands:"
    echo "  up [app]       - Start development environment (all or specific app)"
    echo "  down [app]     - Stop development environment (all or specific app)"
    echo "  restart [app]  - Restart development environment (all or specific app)"
    echo "  logs [app]     - Show logs (all or specific app)"
    echo "  shell [app]    - Open shell in container (specify app: backend|client|admin|postgres|redis)"
    echo "  migrate        - Run database migrations"
    echo "  clean          - Clean up containers and volumes"
    echo "  status         - Show container status"
    echo ""
    echo "Available apps: backend, client, admin, postgres, redis"
    echo "If no app is specified, the action applies to all services."
    exit 1
    ;;
esac 