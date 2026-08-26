#!/bin/bash

# Render Build Script for TwiLearn
# This script runs during the build process on Render.com

set -e

echo "🏗️  Building TwiLearn for Render deployment..."

# Upgrade pip
echo "📦 Upgrading pip..."
python -m pip install --upgrade pip

# Install dependencies
echo "📦 Installing dependencies..."
pip install -r requirements.txt

# Run migrations
echo "🗄️  Running database migrations..."
python manage.py migrate --noinput

# Collect static files
echo "📁 Collecting static files..."
python manage.py collectstatic --noinput --clear

echo "✅ Build completed successfully!"