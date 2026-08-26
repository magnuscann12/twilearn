#!/bin/bash

# TwiLearn Build Script
# This script handles common development and deployment tasks

set -e  # Exit on error

echo "🇬🇭 TwiLearn - Build Script"
echo "============================"

# Function to display usage
usage() {
    echo "Usage: ./build.sh [command]"
    echo ""
    echo "Commands:"
    echo "  setup     - Set up virtual environment and install dependencies"
    echo "  migrate   - Run database migrations"
    echo "  collect   - Collect static files"
    echo "  seed      - Seed database with sample data"
    echo "  dev       - Run development server"
    echo "  prod      - Production build (migrate + collect static)"
    echo "  clean     - Clean up temporary files"
    echo "  help      - Show this help message"
}

# Function to set up the environment
setup() {
    echo "📦 Setting up virtual environment..."
    
    if [ ! -d ".venv" ]; then
        python3 -m venv .venv
        echo "✅ Virtual environment created"
    else
        echo "✅ Virtual environment already exists"
    fi
    
    echo "📥 Installing dependencies..."
    source .venv/bin/activate
    pip install --upgrade pip
    pip install -r requirements.txt
    echo "✅ Dependencies installed"
}

# Function to run migrations
migrate() {
    echo "🗄️  Running database migrations..."
    source .venv/bin/activate
    python manage.py makemigrations
    python manage.py migrate
    echo "✅ Migrations completed"
}

# Function to collect static files
collect() {
    echo "📁 Collecting static files..."
    source .venv/bin/activate
    python manage.py collectstatic --noinput
    echo "✅ Static files collected"
}

# Function to seed database
seed() {
    echo "🌱 Seeding database with sample data..."
    source .venv/bin/activate
    python manage.py seed_data
    echo "✅ Database seeded"
}

# Function to run development server
dev() {
    echo "🚀 Starting development server..."
    source .venv/bin/activate
    python manage.py runserver
}

# Function to production build
prod() {
    echo "🏗️  Production build..."
    if [ -d ".venv" ]; then
        source .venv/bin/activate
    fi
    python manage.py migrate --noinput
    python manage.py collectstatic --noinput
    echo "✅ Production build completed"
}

# Function to clean up
clean() {
    echo "🧹 Cleaning up..."
    rm -rf __pycache__
    rm -rf */__pycache__
    rm -rf */*/__pycache__
    rm -rf .venv
    rm -rf staticfiles
    find . -type d -name "*.pyc" -delete
    find . -type f -name "*.pyc" -delete
    echo "✅ Cleanup completed"
}

# Main script logic
case "${1:-help}" in
    setup)
        setup
        ;;
    migrate)
        migrate
        ;;
    collect)
        collect
        ;;
    seed)
        seed
        ;;
    dev)
        dev
        ;;
    prod)
        prod
        ;;
    clean)
        clean
        ;;
    help)
        usage
        ;;
    *)
        echo "❌ Unknown command: $1"
        usage
        exit 1
        ;;
esac

echo ""
echo "