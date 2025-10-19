# Vercel.json Configuration Guide

## Overview

The `vercel.json` file is the configuration file that tells Vercel how to build and deploy your application. Here's a breakdown of our current configuration:

## Current Configuration Explained

```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "build"
      }
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/build/$1"
    }
  ],
  "functions": {
    "api/**/*.js": {
      "runtime": "nodejs18.x"
    }
  },
  "env": {
    "NODE_ENV": "production"
  }
}
```

## Configuration Breakdown

### 1. `"version": 2`
- Specifies the Vercel configuration format version
- Version 2 is the current standard

### 2. `"builds"` Array
```json
"builds": [
  {
    "src": "package.json",
    "use": "@vercel/static-build",
    "config": {
      "distDir": "build"
    }
  }
]
```

**Purpose**: Tells Vercel how to build your React app
- `"src": "package.json"` - Uses package.json to detect the build process
- `"use": "@vercel/static-build"` - Uses Vercel's static build system for React apps
- `"distDir": "build"` - Specifies that the built files are in the `build` directory (standard for Create React App)

### 3. `"routes"` Array
```json
"routes": [
  {
    "src": "/(.*)",
    "dest": "/build/$1"
  }
]
```

**Purpose**: Defines URL routing rules
- `"src": "/(.*)"` - Matches all incoming requests
- `"dest": "/build/$1"` - Serves files from the build directory
- This ensures your React app's client-side routing works properly

### 4. `"functions"` Object
```json
"functions": {
  "api/**/*.js": {
    "runtime": "nodejs18.x"
  }
}
```

**Purpose**: Configures serverless functions
- `"api/**/*.js"` - Applies to all JavaScript files in the `api` directory
- `"runtime": "nodejs18.x"` - Uses Node.js 18.x runtime for better performance

### 5. `"env"` Object
```json
"env": {
  "NODE_ENV": "production"
}
```

**Purpose**: Sets environment variables
- `"NODE_ENV": "production"` - Ensures the app runs in production mode

## Alternative Configurations

### For a Simple React App (No API)
```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "build"
      }
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/build/$1"
    }
  ]
}
```

### For a Full-Stack App with Express Server
```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "build"
      }
    },
    {
      "src": "server/index.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/server/index.js"
    },
    {
      "src": "/(.*)",
      "dest": "/build/$1"
    }
  ]
}
```

### For Custom Build Commands
```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist",
        "buildCommand": "npm run build:production"
      }
    }
  ]
}
```

## Common Configuration Options

### Headers
```json
{
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Access-Control-Allow-Origin",
          "value": "*"
        }
      ]
    }
  ]
}
```

### Redirects
```json
{
  "redirects": [
    {
      "source": "/old-page",
      "destination": "/new-page",
      "permanent": true
    }
  ]
}
```

### Rewrites
```json
{
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "/api/:path*"
    }
  ]
}
```

## Environment Variables

You can also set environment variables in `vercel.json`:

```json
{
  "env": {
    "NODE_ENV": "production",
    "CUSTOM_VAR": "value"
  }
}
```

**Note**: For sensitive data like API keys, use the Vercel dashboard instead of `vercel.json`.

## Best Practices

1. **Keep it simple**: Only include necessary configurations
2. **Use environment variables**: For sensitive data, use Vercel dashboard
3. **Test locally**: Use `vercel dev` to test your configuration
4. **Version control**: Always commit `vercel.json` to your repository
5. **Documentation**: Comment complex configurations

## Testing Your Configuration

```bash
# Install Vercel CLI
npm i -g vercel

# Test locally
vercel dev

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

## Troubleshooting

### Common Issues

1. **Build fails**: Check your `package.json` scripts
2. **404 errors**: Verify your routes configuration
3. **API not working**: Ensure serverless functions are in `/api` directory
4. **Environment variables**: Check they're set in Vercel dashboard

### Debug Commands

```bash
# Check Vercel configuration
vercel inspect

# View build logs
vercel logs

# Test API endpoints
curl https://your-app.vercel.app/api/health
```

## Our Project's Specific Setup

For the Rehearsal Room project, our configuration:

1. **Builds the React app** using Create React App's build process
2. **Serves static files** from the `build` directory
3. **Handles API routes** through serverless functions in `/api`
4. **Uses Node.js 18.x** for optimal performance
5. **Sets production environment** for optimal React performance

This setup ensures:
- ✅ React app loads correctly
- ✅ Client-side routing works
- ✅ API endpoints are accessible
- ✅ Serverless functions run efficiently
- ✅ No 404 errors on deployment
