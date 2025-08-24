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

- ssh into your server

```bash
ssh root@your-server-ip
```

-Clone the deployment repository and change directory to the deployment folder

```bash
git clone https://github.com/drenathan/tribenest-deployment.git
cd tribenest-deployment
```

- create a new file called .env

```bash
nano .env
```

- update the .env file with the following variables:

```bash
# Database configuration
DATABASE_HOST=tribenest-postgres
DATABASE_PORT=5432
DATABASE_USER=tribe
DATABASE_PASSWORD=change-this
DATABASE_NAME=tribe

# Redis configuration
REDIS_PASSWORD=change-this

# JWT configuration
JWT_SECRET=change-this-to-a-very-long-string
ACCESSTOKENTTL=1y

# Domain configuration
ROOT_DOMAIN=yourdomain.com
API_URL=https://api.yourdomain.com
ADMIN_URL=https://admin.yourdomain.com

# Minio configuration
MINIO_ACCESS_KEY=tribenest
MINIO_SECRET_KEY=change-this-must-be-thesame-with-minio-root-password
MINIO_BUCKET=tribenest
MINIO_URL=https://assets.yourdomain.com
MINIO_REGION=us-east-1
MINIO_BUCKET_URL=https://assets.yourdomain.com/tribenest
MINIO_ROOT_USER=tribenest
MINIO_ROOT_PASSWORD=change-this-must-be-the-same-with-minio-secret-key

```

- Save the file by pressing ctrl + o and then press enter

- Exit the file by pressing ctrl + x

- Make the script setup script executable

```bash
chmod +x tribenest
```

- Start the application

```bash
./tribenest up
```

- Link your domain to the application

```bash
./tribenest setup-domain mydomain.com contact@myemail.com
```

- Update your domain name DNS (TXT) as required by the script. This is required for you application to work.

- Congratulations. go to https://admin.yourdomain.com to access the admin dashboard. and create your first account. You website will be live at https://yourdomain.com and you smart links at https://links.yourdomain.com/link-path

-To upgrade to the latest version, run the following command

- Ssh into your server

```bash
ssh root@your-server-ip
```

- Change directory to the deployment folder

```bash
cd tribenest-deployment
```

- Run the upgrade command

```bash
./tribenest upgrade
```
