#!/bin/bash

# Vercel build script
echo "Starting Vercel build process..."

# Install dependencies
echo "Installing dependencies..."
npm install

# Build the React app
echo "Building React app..."
npm run build

echo "Build completed successfully!"
