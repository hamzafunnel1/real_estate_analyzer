#!/bin/bash

# Exit on error
set -e

echo "Starting Real Estate API..."

echo "Running database migrations..."
python manage.py migrate --noinput

echo "Starting Gunicorn server with extended timeout..."
gunicorn real_estate.wsgi:application --bind 0.0.0.0:$PORT --timeout 120 --keep-alive 60 --workers 2 