# TribeNest

A modern web application built with Turborepo, featuring a backend API, client-facing Next.js app, and admin dashboard.

## What's inside?

This Turborepo includes the following packages/apps:

### Apps and Packages

- `backend`: Node.js/Express API server with PostgreSQL and Redis
- `client`: [Next.js](https://nextjs.org/) client-facing application
- `admin`: [Vite](https://vitejs.dev/) admin dashboard with React
- `@tribe-nest/frontend-shared`: Shared React components and utilities
- `@repo/eslint-config`: `eslint` configurations (includes `eslint-config-next` and `eslint-config-prettier`)
- `@repo/typescript-config`: `tsconfig.json`s used throughout the monorepo

Each package/app is 100% [TypeScript](https://www.typescriptlang.org/).

### Utilities

This Turborepo has some additional tools already setup for you:

- [TypeScript](https://www.typescriptlang.org/) for static type checking
- [ESLint](https://eslint.org/) for code linting
- [Prettier](https://prettier.io) for code formatting

## Quick Start

### Prerequisites

- Node.js 23+
- Docker and Docker Compose (for containerized development)
- PostgreSQL and Redis (for local development)

### Local Development

```bash
# Install dependencies
npm install

# Build all apps and packages
npm run build

# Start development servers
npm run dev
```

### Docker Development

For a fully containerized development environment:

```bash
# Start development environment
./scripts/docker-dev.sh up

# View logs
./scripts/docker-dev.sh logs

# Stop development environment
./scripts/docker-dev.sh down
```

See [DOCKER_README.md](./DOCKER_README.md) for detailed Docker setup instructions.

### Remote Caching

> [!TIP]
> Vercel Remote Cache is free for all plans. Get started today at [vercel.com](https://vercel.com/signup?/signup?utm_source=remote-cache-sdk&utm_campaign=free_remote_cache).

Turborepo can use a technique known as [Remote Caching](https://turborepo.com/docs/core-concepts/remote-caching) to share cache artifacts across machines, enabling you to share build caches with your team and CI/CD pipelines.

By default, Turborepo will cache locally. To enable Remote Caching you will need an account with Vercel. If you don't have an account you can [create one](https://vercel.com/signup?utm_source=turborepo-examples), then enter the following commands:

```
cd my-turborepo
npx turbo login
```

This will authenticate the Turborepo CLI with your [Vercel account](https://vercel.com/docs/concepts/personal-accounts/overview).

Next, you can link your Turborepo to your Remote Cache by running the following command from the root of your Turborepo:

```
npx turbo link
```

## Useful Links

Learn more about the power of Turborepo:

- [Tasks](https://turborepo.com/docs/crafting-your-repository/running-tasks)
- [Caching](https://turborepo.com/docs/crafting-your-repository/caching)
- [Remote Caching](https://turborepo.com/docs/core-concepts/remote-caching)
- [Filtering](https://turborepo.com/docs/crafting-your-repository/running-tasks#using-filters)
- [Configuration Options](https://turborepo.com/docs/reference/configuration)
- [CLI Usage](https://turborepo.com/docs/reference/command-line-reference)

scp scripts/setup-nginx.sh root@your-server-ip:/root/

# SSH to server

ssh user@your-server
cd /tmp
chmod +x setup-nginx.sh

# Basic setup first

./setup-nginx.sh

# Later, add SSL

./setup-nginx.sh -d tribenest.co -e admin@tribenest.co -a

# Or do everything at once

./setup-nginx.sh -d tribenest.co -e admin@tribenest.co -s
