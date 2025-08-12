# TribeNest

The Complete artist platform

# Features

- Website builder
- Sell memberships
- Sell music
- Mobile App (PWA)
- Build Email Lists and Send Emails
- Smartlinks (linktree, toneden)

## What's inside?

This Turborepo includes the following packages and apps:

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

# Start development servers
npm run dev
```

# How to deploy to production

- You need A server. We recommend ubuntu linux [Herztner](https://www.hetzner.com/?country=en) pre-installed with docker or you can install docker manually.

- Before running the next step you will need access to your domain name registrar to update the following:
  - Add a A record for host: @ and value: your server ip
  - Another A record for host: \* and value: your server ip

- Edit the docker-compose.prod.yml in the root of the repo on your machine. you need to update POSTGRES_PASSWORD,REDIS_PASSWORD, ROOT_DOMAIN, API_URL, ADMIN_URL as specified in the file.
- ssh into your server

```bash
ssh root@your-server-ip
```

-Copy the updated docker-compose.prod.yml file to your server

```bash
scp docker-compose.prod.yml root@your-server-ip:/root/
```

- copy the scripts/setup-nginx.sh file to your server

```bash
scp scripts/setup-nginx.sh root@your-server-ip:/root/
```

- Start up the application on the server

```bash
docker compose -f docker-compose.prod.yml up -d
```

- Run the domain setup script on the server you will need to add your domain name and you current email address to the script.

```bash
chmod +x setup-nginx.sh
./setup-nginx.sh domain.com admin@myemail.com
```

- Update your domain name DNS (TXT) as required by the script. This is required for you application to work.

- Congratulations. go to https://admin.yourdomain.com to access the admin dashboard. and create your first account. You website will be live at https://yourdomain.com and you smart links at https://links.yourdomain.com/link-path
