# Quick Email Setup Guide

## To fix the "Error sending verification email" issue:

### Option 1: Set up Resend (Recommended)

1. **Get a free Resend account:**
   - Go to [resend.com](https://resend.com)
   - Sign up for free (3,000 emails/month)
   - Verify your email

2. **Get your API key:**
   - In Resend dashboard → API Keys
   - Click "Create API Key"
   - Copy the key (starts with `re_`)

3. **Add to your environment:**
   - Create a `.env` file in your project root
   - Add: `RESEND_API_KEY=re_your_actual_key_here`
   - Restart your dev server: `npm run dev:server`

### Option 2: Skip email verification (Development only)

For development/testing, you can manually verify users:

1. **Find the user in your storage:**
   - Check the server console logs for user details
   - Look for the verification token

2. **Manually verify:**
   - Visit: `http://localhost:3000/verify?token=YOUR_TOKEN`
   - Replace `YOUR_TOKEN` with the actual token from logs

### Option 3: Use admin to verify users

1. **Login as admin:**
   - Email: `alex.hawke54@gmail.com`
   - Password: `admin123`

2. **Go to admin page:**
   - Visit `/admin`
   - Find the unverified user
   - View details and manually verify

## Current Status

- ✅ User registration works
- ✅ Verification system is in place
- ❌ Email service needs API key
- ✅ Resend integration is ready

## Testing

Once you set up the API key:

1. Register a new user
2. Check your email for verification link
3. Click the link to verify
4. Try logging in - should work now!

## Need Help?

- Check the server console for detailed error messages
- Verify your API key is correct
- Make sure you're using `npm run dev:server` (not just `npm run dev`) 