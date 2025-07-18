#!/bin/sh

# Start nginx in the background
nginx &
NGINX_PID=$!

# Start the backend on port 8000 first
cd /app/apps/backend && npm run run &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

# Start the Next.js client on port 3000
cd /app/apps/client && PORT=3000 npm start &
CLIENT_PID=$!

# Wait for all processes
wait $NGINX_PID $BACKEND_PID $CLIENT_PID