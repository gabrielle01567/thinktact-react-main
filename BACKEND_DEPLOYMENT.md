# Backend Deployment Guide

## Option 1: Deploy to Vercel (Recommended)

### Step 1: Create New Vercel Project
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository
4. **Important**: Set the root directory to `/backend`
5. Set the framework to "Node.js"

### Step 2: Configure Environment Variables
Add these environment variables in Vercel:

```
SUPABASE_URL=https://hqjzsdcolaltekoaxddc.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhxanpzZGNvbGFsdGVrb2F4ZGRjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTI1Mzg2MywiZXhwIjoyMDY2ODI5ODYzfQ.j7GoCkkW7Tb1pYvjyDyAf72BXxbQsm-6vNsDP3lUZpA
JWT_SECRET=your-super-secure-jwt-secret-key-here-make-it-long-and-random
RESEND_API_KEY=your-resend-api-key-here
NODE_ENV=production
```

### Step 3: Deploy
1. Click "Deploy"
2. Wait for deployment to complete
3. Note the deployment URL (e.g., `https://thinktact-backend-xyz.vercel.app`)

## Option 2: Deploy to Railway

### Step 1: Create Railway Project
1. Go to [Railway Dashboard](https://railway.app/dashboard)
2. Click "New Project"
3. Choose "Deploy from GitHub repo"
4. Select your repository
5. Set the root directory to `/backend`

### Step 2: Add Environment Variables
Add the same environment variables as above in Railway's environment settings.

### Step 3: Deploy
1. Railway will automatically deploy
2. Get the deployment URL from the project dashboard

## Option 3: Deploy to Render

### Step 1: Create Render Service
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Set root directory to `/backend`
5. Set build command: `npm install`
6. Set start command: `npm start`

### Step 2: Add Environment Variables
Add the same environment variables as above.

### Step 3: Deploy
1. Click "Create Web Service"
2. Wait for deployment
3. Get the deployment URL

## After Deployment

### Step 1: Test the Backend
Use the test script to verify the backend is working:

```bash
# Update the URL in the test script
node test-backend-connectivity.js
```

### Step 2: Update Frontend
Update the frontend to use the new backend URL:

1. **Option A: Set Environment Variable**
   Add to your frontend deployment:
   ```
   VITE_BACKEND_URL=https://your-new-backend-url.com
   ```

2. **Option B: Update Code**
   Update these files:
   - `src/services/authService.js`
   - `src/services/analysisService.js`

### Step 3: Test Login
Try logging in with the admin user:
- Email: `alex.hawke54@gmail.com`
- Password: `admin123`

## Troubleshooting

### Common Issues:
1. **500 Errors**: Check environment variables are set correctly
2. **CORS Errors**: Backend CORS is configured for thinktact.ai domains
3. **Database Connection**: Verify Supabase credentials
4. **Email Issues**: Check Resend API key

### Test Commands:
```bash
# Test backend health
curl https://your-backend-url.com/health

# Test login
curl -X POST https://your-backend-url.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alex.hawke54@gmail.com","password":"admin123"}'
```

## Recommended Backend URL Structure

For better organization, consider these URL patterns:
- `https://api.thinktact.ai` (custom domain)
- `https://backend.thinktact.ai` (custom domain)
- `https://thinktact-backend.vercel.app` (Vercel subdomain)
- `https://thinktact-api.railway.app` (Railway subdomain) 