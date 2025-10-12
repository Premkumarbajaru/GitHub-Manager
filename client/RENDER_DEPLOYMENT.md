# Render Deployment Guide for GitHub PR Manager

## 🚀 **Render Deployment Configuration**

### **Method 1: Static Site (Recommended)**

1. **In Render Dashboard:**
   - **Build Command**: `npm run build`
   - **Publish Directory**: `build`
   - **Environment**: `Static Site`

2. **The `_redirects` file will handle routing automatically**

### **Method 2: Web Service (Alternative)**

1. **In Render Dashboard:**
   - **Build Command**: `npm run build`
   - **Start Command**: `npm run server`
   - **Environment**: `Node`

2. **The `server.js` file will handle routing**

## 🔧 **Environment Variables**

Set these in Render Dashboard:

```bash
NODE_ENV=production
PUBLIC_URL=https://github-manager-bqof.onrender.com
REACT_APP_API_URL=https://your-backend-url.onrender.com
REACT_APP_GITHUB_CLIENT_ID=your_github_client_id
```

## 📁 **Files Created for Render:**

- ✅ `_redirects` - Handles SPA routing
- ✅ `_headers` - Security headers
- ✅ `server.js` - Express server for routing
- ✅ `render.yaml` - Render configuration
- ✅ `package.json` - Updated with express dependency

## 🎯 **Why This Fixes the 404 Issue:**

1. **`_redirects` file**: Tells Render to serve `index.html` for all routes
2. **Express server**: Alternative method using Node.js server
3. **Proper build**: All files are included in the build directory

## 🔄 **Deployment Steps:**

1. **Commit and push your changes**
2. **In Render Dashboard:**
   - Go to your service
   - Click "Manual Deploy" → "Deploy latest commit"
3. **Wait for deployment to complete**
4. **Test your routes:**
   - `https://github-manager-bqof.onrender.com/`
   - `https://github-manager-bqof.onrender.com/dashboard`
   - `https://github-manager-bqof.onrender.com/repositories`

## ✅ **Expected Result:**

All routes should now work correctly:
- ✅ Direct URL access
- ✅ Page refreshes
- ✅ OAuth redirects
- ✅ Browser navigation
