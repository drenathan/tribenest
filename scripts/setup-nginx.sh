#!/bin/bash

# TribeNest Nginx Setup Script
# This script installs nginx and configures it for TribeNest production deployment

set -e

echo "🚀 Setting up Nginx for TribeNest..."

# Function to detect OS and install nginx
install_nginx() {
    if command -v nginx &> /dev/null; then
        echo "✅ Nginx is already installed"
        return
    fi

    echo "📦 Installing nginx..."
    
    # Detect OS
    if [[ -f /etc/os-release ]]; then
        . /etc/os-release
        OS=$NAME
    else
        echo "❌ Could not detect OS"
        exit 1
    fi

    case $OS in
        *"Ubuntu"*|*"Debian"*)
            sudo apt update
            sudo apt install -y nginx
            ;;
        *"CentOS"*|*"Red Hat"*|*"Amazon Linux"*)
            sudo yum install -y nginx
            sudo systemctl enable nginx
            ;;
        *"Alpine"*)
            apk add nginx
            ;;
        *)
            echo "❌ Unsupported OS: $OS"
            echo "Please install nginx manually"
            exit 1
            ;;
    esac
}

# Function to configure nginx
configure_nginx() {
    echo "⚙️  Configuring nginx..."
    
    # Create nginx configuration
    sudo tee /etc/nginx/sites-available/tribenest << EOF
# TribeNest Production Configuration
# This configuration handles any domain and forwards to the Docker container

server {
    listen 80;
    server_name _;  # Handle any domain

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    # Proxy settings
    location / {
        proxy_pass http://127.0.0.1:80;  # Your Docker container
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        
        # WebSocket support
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        
        # Timeout settings
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Health check endpoint
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
EOF

    # Enable the site
    if [[ -d /etc/nginx/sites-enabled ]]; then
        sudo ln -sf /etc/nginx/sites-available/tribenest /etc/nginx/sites-enabled/
        sudo rm -f /etc/nginx/sites-enabled/default 2>/dev/null || true
    else
        # For systems without sites-enabled directory
        sudo cp /etc/nginx/sites-available/tribenest /etc/nginx/conf.d/tribenest.conf
    fi

    # Test nginx configuration
    echo "🧪 Testing nginx configuration..."
    if sudo nginx -t; then
        echo "✅ Nginx configuration is valid"
    else
        echo "❌ Nginx configuration is invalid"
        exit 1
    fi

    # Start/restart nginx
    echo "🔄 Starting nginx..."
    sudo systemctl enable nginx
    sudo systemctl restart nginx
    
    echo "✅ Nginx is running and configured"
}

# Function to setup firewall (optional)
setup_firewall() {
    echo "🔥 Setting up firewall..."
    
    if command -v ufw &> /dev/null; then
        sudo ufw allow 80/tcp
        sudo ufw allow 443/tcp
        echo "✅ UFW firewall configured"
    elif command -v firewall-cmd &> /dev/null; then
        sudo firewall-cmd --permanent --add-service=http
        sudo firewall-cmd --permanent --add-service=https
        sudo firewall-cmd --reload
        echo "✅ Firewalld configured"
    else
        echo "⚠️  No firewall manager detected. Please configure firewall manually."
    fi
}

# Function to install and configure certbot
setup_ssl() {
    local DOMAIN_NAME=$1
    local EMAIL=$2
    
    echo "🔒 Setting up SSL with Certbot..."
    
    # Install certbot
    if ! command -v certbot &> /dev/null; then
        echo "📦 Installing certbot..."
        
        if [[ -f /etc/os-release ]]; then
            . /etc/os-release
            OS=$NAME
        fi
        
        case $OS in
            *"Ubuntu"*|*"Debian"*)
                sudo apt update
                sudo apt install -y certbot python3-certbot-nginx
                ;;
            *"CentOS"*|*"Red Hat"*|*"Amazon Linux"*)
                sudo yum install -y certbot python3-certbot-nginx
                ;;
            *)
                echo "⚠️  Please install certbot manually for your OS"
                return
                ;;
        esac
    fi
    
    if [[ -z "$DOMAIN_NAME" ]]; then
        echo "⚠️  No domain provided. SSL setup skipped."
        return
    fi
    
    # Create SSL-enabled nginx configuration
    echo "⚙️  Creating SSL-enabled nginx configuration..."
    sudo tee /etc/nginx/sites-available/tribenest << EOF
# TribeNest Production Configuration with SSL
# This configuration handles any domain and forwards to the Docker container

# HTTP server - redirect to HTTPS
server {
    listen 80;
    server_name _;
    
    # Redirect all HTTP traffic to HTTPS
    return 301 https://\$host\$request_uri;
}

# HTTPS server
server {
    listen 443 ssl http2;
    server_name _;

    # SSL configuration (will be managed by certbot)
    ssl_certificate /etc/letsencrypt/live/${DOMAIN_NAME}/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/${DOMAIN_NAME}/privkey.pem;
    
    # SSL security settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-AES128-SHA256:ECDHE-RSA-AES256-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Proxy settings
    location / {
        proxy_pass http://127.0.0.1:80;  # Your Docker container
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        
        # WebSocket support
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        
        # Timeout settings
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Health check endpoint
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
EOF

    # Enable the site
    if [[ -d /etc/nginx/sites-enabled ]]; then
        sudo ln -sf /etc/nginx/sites-available/tribenest /etc/nginx/sites-enabled/
        sudo rm -f /etc/nginx/sites-enabled/default 2>/dev/null || true
    else
        # For systems without sites-enabled directory
        sudo cp /etc/nginx/sites-available/tribenest /etc/nginx/conf.d/tribenest.conf
    fi

    # Test nginx configuration
    echo "🧪 Testing nginx configuration..."
    if sudo nginx -t; then
        echo "✅ Nginx configuration is valid"
    else
        echo "❌ Nginx configuration is invalid"
        exit 1
    fi

    # Start nginx
    echo "🔄 Starting nginx..."
    sudo systemctl enable nginx
    sudo systemctl restart nginx
    
    # Generate SSL certificate
    echo "🔐 Generating wildcard SSL certificate for ${DOMAIN_NAME} and *.${DOMAIN_NAME}..."
    echo ""
    echo "⚠️  IMPORTANT: For wildcard certificates, you need to add DNS TXT records."
    echo "⚠️  Make sure your domain ${DOMAIN_NAME} points to this server's IP address"
    echo ""
    echo "The certificate generation will pause and ask you to add DNS records."
    echo "You'll need to add a TXT record for _acme-challenge.${DOMAIN_NAME}"
    echo ""
    echo "Press Enter when you're ready to continue..."
    read
    
    # Run certbot with wildcard certificate
    echo "🚀 Starting certificate generation..."
    echo "📝 Certbot will pause and ask you to add DNS records."
    echo "   Look for the TXT record instructions in the output below:"
    echo ""
    
    if sudo certbot certonly --manual --preferred-challenges=dns -d ${DOMAIN_NAME} -d *.${DOMAIN_NAME} --agree-tos --email ${EMAIL}; then
        echo "✅ Wildcard SSL certificate generated successfully!"
        
        # Test SSL configuration
        echo "🧪 Testing SSL configuration..."
        if sudo nginx -t; then
            sudo systemctl reload nginx
            echo "✅ SSL is active and nginx reloaded"
        else
            echo "❌ SSL configuration error"
            exit 1
        fi
        
        # Setup auto-renewal
        echo "🔄 Setting up automatic certificate renewal..."
        (sudo crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet") | sudo crontab -
        echo "✅ Auto-renewal configured (runs daily at 12 PM)"
        
    else
        echo "❌ Failed to generate SSL certificate"
        echo "Please check:"
        echo "1. Domain DNS is pointing to this server"
        echo "2. Port 80 is accessible from the internet"
        echo "3. Try running: sudo certbot --nginx -d ${DOMAIN_NAME}"
        exit 1
    fi
}

# Function to show usage
show_usage() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -d, --domain DOMAIN     Domain name (e.g., yourdomain.com)"
    echo "  -e, --email EMAIL       Email for Let's Encrypt notifications"
    echo "  -s, --ssl               Enable SSL setup"
    echo "  -a, --add-ssl           Add SSL to existing nginx setup"
    echo "  -h, --help              Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0                                    # Basic setup without SSL"
    echo "  $0 -d yourdomain.com -e admin@yourdomain.com -s  # Full setup with SSL"
    echo "  $0 -d yourdomain.com -e admin@yourdomain.com -a  # Add SSL to existing setup"
    echo "  $0 --domain yourdomain.com --email admin@yourdomain.com --ssl"
}

# Main execution
main() {
    local DOMAIN_NAME=""
    local EMAIL=""
    local ENABLE_SSL=false
    local ADD_SSL=false
    
    # Parse command line arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            -d|--domain)
                DOMAIN_NAME="$2"
                shift 2
                ;;
            -e|--email)
                EMAIL="$2"
                shift 2
                ;;
            -s|--ssl)
                ENABLE_SSL=true
                shift
                ;;
            -a|--add-ssl)
                ADD_SSL=true
                shift
                ;;
            -h|--help)
                show_usage
                exit 0
                ;;
            *)
                echo "❌ Unknown option: $1"
                show_usage
                exit 1
                ;;
        esac
    done
    
    echo "🎯 TribeNest Nginx Setup"
    echo "=========================="
    
    # Check if running as root
    if [[ $EUID -eq 0 ]]; then
        echo "❌ Please don't run this script as root"
        exit 1
    fi
    
    # Check if domain and email are provided for SSL operations
    if [[ "$ENABLE_SSL" == true || "$ADD_SSL" == true ]]; then
        if [[ -z "$DOMAIN_NAME" ]]; then
            echo "❌ Domain name is required for SSL setup. Use -d option."
            exit 1
        fi
        
        if [[ -z "$EMAIL" ]]; then
            echo "❌ Email is required for SSL setup. Use -e option."
            exit 1
        fi
    fi
    
    if [[ "$ADD_SSL" == true ]]; then
        # Add SSL to existing setup
        echo "🔒 Adding SSL to existing nginx setup..."
        
        # Check if nginx is installed
        if ! command -v nginx &> /dev/null; then
            echo "❌ Nginx is not installed. Please run setup first."
            exit 1
        fi
        
        setup_ssl "$DOMAIN_NAME" "$EMAIL"
        
    elif [[ "$ENABLE_SSL" == true ]]; then
        # Full setup with SSL
        install_nginx
        echo "🔒 SSL setup enabled for domain: ${DOMAIN_NAME}"
        setup_ssl "$DOMAIN_NAME" "$EMAIL"
        
    else
        # Basic setup without SSL
        install_nginx
        configure_nginx
        setup_firewall
        
        echo ""
        echo "🎉 Setup complete!"
        echo ""
        echo "Next steps:"
        echo "1. Make sure your Docker container is running on port 80"
        echo "2. Point your domain's DNS to this server"
        echo "3. Test the setup: curl http://localhost/health"
        echo ""
        echo "To check nginx status: sudo systemctl status nginx"
        echo "To view nginx logs: sudo journalctl -u nginx"
        echo ""
        echo "💡 To add SSL later, run: $0 -d yourdomain.com -e admin@yourdomain.com -a"
    fi
}

# Run main function
main "$@" 