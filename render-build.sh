#!/bin/bash

# Render Build Script for TwiLearn
# This script runs during the build process on Render.com

set -e

echo "🏗️  Building TwiLearn for Render deployment..."

# Install dependencies
echo "📦 Installing dependencies..."
pip install -r requirements.txt

# Run migrations
echo "🗄️  Running database migrations..."
python manage.py migrate --noinput

# Collect static files
echo "📁 Collecting static files..."
python manage.py collectstatic --noinput

echo "✅ Build completed successfully!"