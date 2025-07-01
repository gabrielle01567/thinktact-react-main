# ThinkTact Backend Setup

This backend uses Vercel Blob Storage for data persistence.

## Environment Variables

Add these to your Vercel project:

- `BLOB_READ_WRITE_TOKEN`: Your Vercel Blob token
- `JWT_SECRET`: A secure random string for JWT signing
- `RESEND_API_KEY`: Your Resend email API key (optional)

## Deployment

1. Deploy this backend to Vercel
2. Set the environment variables
3. Update your frontend to use this backend URL

## API Endpoints

- `GET /health` - Health check
- `GET /api/test` - Test endpoint
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/analysis/save` - Save analysis
- `GET /api/analysis/history` - Get analysis history 