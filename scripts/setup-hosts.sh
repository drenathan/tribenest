#!/bin/bash

# TribeNest Host Setup Script
# This script adds api.localhost to your system's hosts file

set -e

HOSTS_FILE="/etc/hosts"
HOST_ENTRY="127.0.0.1 api.localhost"

echo "Setting up api.localhost host mapping..."

# Check if running as root (needed for /etc/hosts modification)
if [ "$EUID" -ne 0 ]; then
    echo "This script needs to be run as root to modify /etc/hosts"
    echo "Please run: sudo $0"
    exit 1
fi

# Check if the entry already exists
if grep -q "api.localhost" "$HOSTS_FILE"; then
    echo "Host entry for api.localhost already exists in $HOSTS_FILE"
    echo "Current entry:"
    grep "api.localhost" "$HOSTS_FILE"
else
    echo "Adding $HOST_ENTRY to $HOSTS_FILE..."
    echo "$HOST_ENTRY" >> "$HOSTS_FILE"
    echo "Host entry added successfully!"
fi

echo ""
echo "Host setup complete!"
echo "You can now access your API at: http://api.localhost:8000"
echo ""
echo "To test the connection, run:"
echo "  curl http://api.localhost:8000"
echo ""
echo "Note: You may need to restart your browser or clear DNS cache"
echo "      for the changes to take effect." 