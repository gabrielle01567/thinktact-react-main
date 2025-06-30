# Production Setup Guide

This guide will help you deploy your ThinkTact React app to production on Vercel.

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **GitHub Repository**: Your code should be in a GitHub repository
3. **Vercel Blob Storage**: For user data storage
4. **Resend Email Service**: For email verification and password resets

## Step 1: Set Up Vercel Blob Storage

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Create a new project or select your existing project
3. Go to **Storage** → **Blob**
4. Create a new Blob store
5. Copy the **Read/Write Token** (starts with `vercel_blob_rw_`)

## Step 2: Set Up Resend Email Service

1. Go to [resend.com](https://resend.com)
2. Sign up for a free account
3. Go to **API Keys** section
4. Create a new API key (starts with `re_`)
5. Copy the API key

## Step 3: Configure Environment Variables in Vercel

1. In your Vercel dashboard, go to your project
2. Navigate to **Settings** → **Environment Variables**
3. Add the following variables:

### Required Environment Variables

| Variable Name | Value | Description |
|---------------|-------|-------------|
| `BLOB_READ_WRITE_TOKEN` | `vercel_blob_rw_...` | Vercel Blob storage token |
| `RESEND_API_KEY` | `re_...` | Resend email service API key |

### Optional Environment Variables

| Variable Name | Value | Description |
|---------------|-------|-------------|
| `VITE_MISTRAL_API_KEY` | `your_mistral_key` | For AI argument analysis features |

## Step 4: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard

1. Connect your GitHub repository to Vercel
2. Vercel will automatically detect it's a Vite project
3. Configure the build settings:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

### Option B: Deploy via Vercel CLI

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy:
   ```bash
   vercel --prod
   ```

## Step 5: Verify Deployment

After deployment, verify:

1. **Homepage**: Should load without errors
2. **Registration**: Should work and send verification emails
3. **Login**: Should work for existing users
4. **Admin Panel**: Should be accessible at `/admin`
5. **Email Verification**: Should work for new registrations
6. **Password Reset**: Should send emails

## Step 6: Test Production Features

### Test User Registration
1. Go to your production URL
2. Click "Register" or "Sign Up"
3. Fill out the registration form
4. Check for verification email
5. Click the verification link

### Test Admin Access
1. Login with admin credentials: `alex.hawke54@gmail.com` / `admin123`
2. Navigate to `/admin`
3. Verify all admin features work

### Test Email Features
1. Test password reset functionality
2. Test email change requests
3. Test resend verification emails

## Troubleshooting

### Common Issues

1. **API Routes Not Working**
   - Check that `vercel.json` is properly configured
   - Verify environment variables are set
   - Check Vercel function logs

2. **Email Not Sending**
   - Verify `RESEND_API_KEY` is set correctly
   - Check Resend dashboard for delivery status
   - Verify domain is configured in Resend

3. **User Data Not Persisting**
   - Verify `BLOB_READ_WRITE_TOKEN` is set
   - Check Vercel Blob storage logs
   - Verify blob store is created

### Checking Logs

1. In Vercel dashboard, go to **Functions**
2. Click on any API route to see logs
3. Check for errors in the deployment logs

## Security Considerations

1. **Environment Variables**: Never commit sensitive keys to Git
2. **API Keys**: Rotate keys regularly
3. **Admin Access**: Change default admin password after first login
4. **HTTPS**: Vercel provides SSL by default

## Performance Optimization

1. **Caching**: Vercel automatically caches static assets
2. **CDN**: Global CDN is included
3. **Edge Functions**: Consider using edge functions for better performance

## Monitoring

1. **Vercel Analytics**: Enable in dashboard
2. **Error Tracking**: Monitor function logs
3. **Performance**: Use Vercel's built-in analytics

## Support

If you encounter issues:

1. Check Vercel documentation
2. Review function logs in dashboard
3. Test locally with `npm run dev:server`
4. Verify all environment variables are set correctly 