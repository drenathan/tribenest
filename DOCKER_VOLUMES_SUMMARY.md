# Docker Volumes and Networks Summary

## Development Environment (`docker-compose.dev.yml`)

### Volumes

- **PostgreSQL**: `tribenest_postgres_dev_data`
- **Redis**: `tribenest_redis_dev_data`

### Network

- **Network**: `tribenest-dev-network`

### Container Names

- **PostgreSQL**: `tribenest-postgres-dev`
- **Redis**: `tribenest-redis-dev`
- **Backend**: `tribenest-backend-dev`
- **Client**: `tribenest-client-dev`
- **Admin**: `tribenest-admin-dev`

---

## Production Environment (`docker-compose.prod.yml`)

### Volumes

- **PostgreSQL**: `tribenest_postgres_prod_data`
- **Redis**: `tribenest_redis_prod_data`

### Network

- **Network**: `tribenest-prod-network`

### Container Names

- **Main App**: `tribenest-app`
- **PostgreSQL**: `tribenest-postgres`
- **Redis**: `tribenest-redis`

---

## Benefits of This Separation

1. **Isolated Data**: Development and production data are completely separate
2. **No Conflicts**: You can run both environments simultaneously
3. **Safe Testing**: Development changes won't affect production data
4. **Easy Cleanup**: You can clean up dev data without affecting prod
5. **Network Isolation**: Services can't accidentally connect to the wrong environment

---

## Management Commands

### Development

```bash
# Start dev environment
./scripts/docker-dev.sh up

# Clean dev environment (removes volumes)
./scripts/docker-dev.sh clean

# View dev volumes
docker volume ls | grep tribenest_postgres_dev
docker volume ls | grep tribenest_redis_dev
```

### Production

```bash
# Start prod environment
docker-compose -f docker-compose.prod.yml up -d

# Clean prod environment
docker-compose -f docker-compose.prod.yml down -v

# View prod volumes
docker volume ls | grep tribenest_postgres_prod
docker volume ls | grep tribenest_redis_prod
```

---

## Volume Locations

### Development Volumes

- `tribenest_postgres_dev_data` - PostgreSQL data for development
- `tribenest_redis_dev_data` - Redis data for development

### Production Volumes

- `tribenest_postgres_prod_data` - PostgreSQL data for production
- `tribenest_redis_prod_data` - Redis data for production

---

## Troubleshooting

### If you need to reset development data:

```bash
./scripts/docker-dev.sh clean
./scripts/docker-dev.sh up
```

### If you need to reset production data:

```bash
docker-compose -f docker-compose.prod.yml down -v
docker-compose -f docker-compose.prod.yml up -d
```

### To view volume contents:

```bash
# Development
docker run --rm -v tribenest_postgres_dev_data:/data alpine ls -la /data

# Production
docker run --rm -v tribenest_postgres_prod_data:/data alpine ls -la /data
```
