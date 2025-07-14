#!/bin/bash

# TribeNest Manual Build Script (No Turbo)
# Builds backend, client, and admin sequentially

set -e

# Ensure script is run from project root
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

# Clean previous builds if they exist
[ -d "apps/backend/build" ] && rm -rf apps/backend/build
[ -d "apps/client/.next" ] && rm -rf apps/client/.next
[ -d "apps/admin/dist" ] && rm -rf apps/admin/dist

# Build backend
cd apps/backend
echo "🏗️  Building backend..."
npm run build
cd ../..

# Build client
cd apps/client
echo "🏗️  Building client..."
npm run build
cd ../..

# Build admin
cd apps/admin
echo "🏗️  Building admin..."
npm run build
cd ../..

# Verify builds
if [ ! -d "apps/backend/build" ]; then
    echo "❌ Error: Backend build not found at apps/backend/build"
    exit 1
fi
if [ ! -d "apps/client/.next" ]; then
    echo "❌ Error: Client build not found at apps/client/.next"
    exit 1
fi
if [ ! -d "apps/admin/dist" ]; then
    echo "❌ Error: Admin build not found at apps/admin/dist"
    exit 1
fi

echo "🎉 All apps built successfully!"
echo ""
echo "📁 Build locations:"
echo "   Backend: apps/backend/build"
echo "   Client:  apps/client/.next"
echo "   Admin:   apps/admin/dist"
echo ""
echo "🐳 You can now run: ./scripts/docker-prod.sh or docker build -t tribenest:latest ." 