# Backend Deployment Guide

This guide will help you deploy the ThinkTact backend to various platforms.

## Prerequisites

1. **Azure Blob Storage Account**
   - Create an Azure account at https://azure.microsoft.com
   - Create a Storage Account
   - Get the connection string from Access Keys

2. **Resend Email Account**
   - Sign up at https://resend.com
   - Get your API key from the dashboard

3. **GitHub Repository**
   - Make sure your code is pushed to GitHub

## Deployment Options

### Option 1: Railway (Recommended - Free Tier Available)

1. **Sign up for Railway**
   - Go to https://railway.app
   - Sign up with your GitHub account

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository

3. **Configure Project**
   - Set the root directory to `backend`
   - Railway will automatically detect it's a Node.js project

4. **Add Environment Variables**
   - Go to the "Variables" tab
   - Add the following variables:
     ```
     AZURE_STORAGE_CONNECTION_STRING=your_azure_connection_string
     RESEND_API_KEY=your_resend_api_key
     JWT_SECRET=your_secure_random_string
     NODE_ENV=production
     ```

5. **Deploy**
   - Railway will automatically deploy when you push to GitHub
   - Your backend will be available at `https://your-project-name.railway.app`

### Option 2: Render (Free Tier Available)

1. **Sign up for Render**
   - Go to https://render.com
   - Sign up with your GitHub account

2. **Create New Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository

3. **Configure Service**
   - **Name**: `thinktact-backend`
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

4. **Add Environment Variables**
   - Go to "Environment" tab
   - Add the same variables as above

5. **Deploy**
   - Click "Create Web Service"
   - Your backend will be available at `https://your-service-name.onrender.com`

### Option 3: DigitalOcean App Platform

1. **Sign up for DigitalOcean**
   - Go to https://digitalocean.com
   - Create an account

2. **Create New App**
   - Go to "Apps" → "Create App"
   - Connect your GitHub repository

3. **Configure App**
   - **Source Directory**: `backend`
   - **Build Command**: `npm install`
   - **Run Command**: `npm start`

4. **Add Environment Variables**
   - Add the same variables as above

5. **Deploy**
   - Click "Create Resources"
   - Your backend will be available at `https://your-app-name.ondigitalocean.app`

## Update Frontend Configuration

After deploying your backend, update your frontend to use the new backend URL:

1. **Add Environment Variable to Vercel**
   - Go to your Vercel project dashboard
   - Go to "Settings" → "Environment Variables"
   - Add: `VITE_BACKEND_URL=https://your-backend-url.com/api`

2. **Redeploy Frontend**
   - Push any change to GitHub
   - Vercel will automatically redeploy with the new environment variable

## Testing Your Deployment

1. **Health Check**
   - Visit `https://your-backend-url.com/health`
   - Should return: `{"status":"OK","message":"ThinkTact Backend API is running"}`

2. **API Info**
   - Visit `https://your-backend-url.com/`
   - Should return API information

3. **Test Analysis History**
   - Try submitting an argument in your frontend
   - Check if the analysis history updates

## Troubleshooting

### Common Issues

1. **Environment Variables Not Set**
   - Make sure all required environment variables are set
   - Check for typos in variable names

2. **CORS Issues**
   - The backend is configured to accept requests from any origin
   - If you have issues, you can set `CORS_ORIGIN` to your frontend URL

3. **Azure Connection Issues**
   - Verify your Azure connection string is correct
   - Make sure your Azure account has the necessary permissions

4. **Email Not Working**
   - Verify your Resend API key is correct
   - Check if your Resend account is verified

### Logs

- **Railway**: Go to your project → "Deployments" → Click on deployment → "Logs"
- **Render**: Go to your service → "Logs" tab
- **DigitalOcean**: Go to your app → "Runtime Logs"

## Security Notes

1. **JWT Secret**: Generate a secure random string (at least 32 characters)
2. **Environment Variables**: Never commit `.env` files to Git
3. **CORS**: In production, consider restricting CORS to your frontend domain only

## Cost Considerations

- **Railway**: Free tier includes 500 hours/month
- **Render**: Free tier includes 750 hours/month
- **DigitalOcean**: Starts at $5/month

For production use, consider upgrading to paid plans for better performance and reliability. 