# Backend V2 Setup Guide

## Step 1: Create New Vercel Project

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"New Project"**
3. Import your GitHub repository: `gabrielle01567/thinktact-react-main`
4. **Important Settings:**
   - **Project Name**: `thinktact-backend-v2`
   - **Root Directory**: `/backend`
   - **Framework Preset**: `Node.js`
   - **Build Command**: Leave empty (not needed for backend)
   - **Output Directory**: Leave empty (not needed for backend)
   - **Install Command**: `npm install`

## Step 2: Environment Variables

Add these environment variables in the Vercel project settings:

```
SUPABASE_URL=https://hqjzsdcolaltekoaxddc.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhxanpzZGNvbGFsdGVrb2F4ZGRjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTI1Mzg2MywiZXhwIjoyMDY2ODI5ODYzfQ.j7GoCkkW7Tb1pYvjyDyAf72BXxbQsm-6vNsDP3lUZpA
JWT_SECRET=thinktact-super-secure-jwt-secret-key-2025-production
RESEND_API_KEY=your-resend-api-key-here
NODE_ENV=production
```

## Step 3: Deploy

1. Click **"Deploy"**
2. Wait for deployment to complete
3. Note the deployment URL (e.g., `https://thinktact-backend-v2-xyz.vercel.app`)

## Step 4: Test the New Backend

Once deployed, run this test script:

```bash
node test-new-backend.js
```

## Step 5: Update Frontend

After confirming the new backend works, update the frontend:

1. **Option A: Set Environment Variable**
   Add to your frontend Vercel project:
   ```
   VITE_BACKEND_URL=https://your-new-backend-url.com
   ```

2. **Option B: Update Code**
   Run this script:
   ```bash
   node update-backend-url.js "https://your-new-backend-url.com"
   ```

## Step 6: Test Login

Try logging in with:
- Email: `alex.hawke54@gmail.com`
- Password: `admin123`

## Troubleshooting

### If deployment fails:
- Check that root directory is set to `/backend`
- Verify all environment variables are set
- Check Vercel logs for specific errors

### If backend returns errors:
- Verify Supabase credentials are correct
- Check that JWT_SECRET is set
- Ensure NODE_ENV=production

### If frontend can't connect:
- Verify VITE_BACKEND_URL is set correctly
- Check CORS settings in backend
- Test backend URL directly in browser 