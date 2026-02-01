# API Configuration Setup Guide

## Overview
The application now uses a **centralized, global API configuration** instead of hardcoding the API URL in every file. This makes it easy to switch between development, staging, and production environments.

## How It Works

### 1. Central Config File
All API URLs are now imported from **`src/config.js`**:

```javascript
// src/config.js
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';
const API_URL = `${API_BASE_URL}/api`;

export { API_BASE_URL, API_URL };
```

### 2. Environment Variables
API base URL is set in **`.env`** file:

```
REACT_APP_API_BASE_URL=http://localhost:5000
```

### 3. Using in Components
Instead of:
```javascript
const API_URL = 'http://localhost:5000/api';
```

Now use:
```javascript
import { API_URL } from './config';
```

## Files Updated

All JavaScript files that previously hardcoded the API URL have been updated to import from the config:

- ✅ Order.js
- ✅ SellerStorefront.js
- ✅ SellerSignUp.js
- ✅ SellerSignIn.js
- ✅ SellerDashboard.js
- ✅ SellerAuth.js
- ✅ ProductDetail.js
- ✅ Product.js
- ✅ OrderConfirmation.js
- ✅ CustomerMarketplace.js
- ✅ CustomerCart.js
- ✅ AllProducts.js
- ✅ AdminOrders.js

## Deployment Guide

### Local Development
The `.env` file is already configured for local development:
```
REACT_APP_API_BASE_URL=http://localhost:5000
```

### Staging Environment
1. Create a `.env` file in the `frontend/` directory:
```
REACT_APP_API_BASE_URL=https://staging-api.yourdomain.com
```

2. Run the app:
```bash
npm start
```

### Production Environment
1. Create a `.env.production` file:
```
REACT_APP_API_BASE_URL=https://api.yourdomain.com
```

2. Build for production:
```bash
npm run build
```

## Testing Different Environments

To verify the configuration is working:

```javascript
// In browser console or DevTools
console.log(process.env.REACT_APP_API_BASE_URL);
```

Should output your API base URL.

## Benefits

✅ **Single Source of Truth** - Change API URL in one place  
✅ **Environment-Specific** - Different URLs for dev/staging/prod  
✅ **Secure** - Credentials can be stored in `.env` files (not in code)  
✅ **Clean Code** - No hardcoded URLs scattered throughout components  
✅ **Easy Maintenance** - Update API endpoint without touching component files  

## Notes

- The `.env` file is included in `.gitignore` (recommended)
- Use `.env.example` as a template for other developers
- Environment variables must start with `REACT_APP_` to be accessible in React apps
- Changes to `.env` require restarting the development server
