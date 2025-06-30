# Vercel Blob Storage Setup for User Credentials

This guide explains how to set up Vercel's blob storage to store user credentials securely in your ThinkTactAI application.

## Prerequisites

1. A Vercel account
2. Your project deployed on Vercel
3. Vercel CLI installed (optional, for local development)

## Setup Steps

### 1. Create a Blob Store

1. Go to your Vercel dashboard
2. Navigate to your project
3. Go to the "Storage" tab
4. Click "Create Database" and select "Blob"
5. Choose a name for your blob store (e.g., "thinktact-users")
6. Select a region close to your users
7. Click "Create"

### 2. Get Your Blob Token

1. In your blob store dashboard, go to the "Settings" tab
2. Copy the "Read/Write Token"
3. This token will be used to authenticate your API calls

### 3. Add Environment Variables

In your Vercel project settings:

1. Go to "Settings" → "Environment Variables"
2. Add a new variable:
   - **Name**: `BLOB_READ_WRITE_TOKEN`
   - **Value**: Your blob read/write token from step 2
   - **Environment**: Production, Preview, and Development
3. Click "Save"

### 4. Deploy Your Changes

1. Commit and push your changes to your repository
2. Vercel will automatically deploy the updated code
3. The API routes will now be able to access your blob storage

## How It Works

### User Registration
1. User submits registration form with email, password, and name
2. Password is hashed using bcrypt with 12 salt rounds
3. User data is stored as a JSON file in blob storage
4. File name is generated from the email address (base64 encoded)

### User Login
1. User submits login form with email and password
2. System retrieves user data from blob storage
3. Password is verified against the stored hash
4. If valid, user is logged in and last login time is updated

### Security Features
- Passwords are hashed using bcrypt (industry standard)
- User data is stored in separate files for each user
- API routes validate input and handle errors gracefully
- Demo mode fallback for development/testing

## File Structure

```
api/
├── auth/
│   ├── login.js          # Handle user login
│   └── register.js       # Handle user registration
└── blob/
    └── [filename].js     # Retrieve blob data
```

## Local Development

For local development, the app will fall back to demo mode if blob storage is not available. This allows you to test the application without setting up blob storage locally.

## Production Considerations

1. **Security**: Consider using private blob access for production
2. **Backup**: Implement regular backups of user data
3. **Monitoring**: Set up monitoring for API route performance
4. **Rate Limiting**: Consider implementing rate limiting for auth endpoints
5. **Password Policy**: Enforce strong password requirements

## Troubleshooting

### Common Issues

1. **"Blob not found" errors**: Check that your blob store is created and the token is correct
2. **API route errors**: Ensure your Vercel configuration includes the API routes
3. **CORS issues**: The API routes should handle CORS automatically in Vercel

### Debug Mode

To enable debug logging, add this to your environment variables:
- **Name**: `DEBUG_BLOB`
- **Value**: `true`

This will log additional information about blob operations to help with debugging.

## Migration from Demo Mode

When you're ready to migrate from demo mode to production:

1. Ensure blob storage is properly configured
2. Test registration and login flows
3. Consider migrating existing demo users (if any)
4. Update any hardcoded demo credentials in your code

## Support

If you encounter issues:
1. Check the Vercel blob storage documentation
2. Review the API route logs in your Vercel dashboard
3. Ensure all environment variables are properly set
4. Verify your blob store permissions and configuration 