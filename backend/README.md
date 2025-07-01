# ThinkTact Backend API

This is the backend API server for ThinkTact AI, providing authentication, user management, and analysis history storage.

## Features

- User authentication and registration
- Password reset functionality
- Admin user management
- Analysis history storage and retrieval
- Email notifications via Resend
- Azure Blob Storage integration

## Quick Start

### Local Development

1. Install dependencies:
```bash
npm install
```

2. Copy environment variables:
```bash
cp .env.example .env
```

3. Update `.env` with your actual values:
- `AZURE_STORAGE_CONNECTION_STRING`: Your Azure Blob Storage connection string
- `RESEND_API_KEY`: Your Resend API key for email functionality
- `JWT_SECRET`: A secure random string for JWT token signing

4. Start the development server:
```bash
npm run dev
```

The server will run on `http://localhost:3000`

### Production Deployment

#### Railway (Recommended)

1. Create a Railway account at https://railway.app
2. Connect your GitHub repository
3. Set the root directory to `backend`
4. Add environment variables in Railway dashboard
5. Deploy

#### Render

1. Create a Render account at https://render.com
2. Create a new Web Service
3. Connect your GitHub repository
4. Set the root directory to `backend`
5. Set build command: `npm install`
6. Set start command: `npm start`
7. Add environment variables
8. Deploy

#### DigitalOcean App Platform

1. Create a DigitalOcean account
2. Create a new App
3. Connect your GitHub repository
4. Set the source directory to `backend`
5. Add environment variables
6. Deploy

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/request-reset` - Request password reset
- `POST /api/auth/reset-password` - Reset password
- `GET /api/auth/verify` - Verify email

### Analysis
- `POST /api/analysis/save` - Save analysis to history
- `GET /api/analysis/history` - Get user's analysis history
- `DELETE /api/analysis/delete` - Delete analysis

### Admin
- `GET /api/admin/users` - Get all users (admin only)
- `POST /api/admin/create-user` - Create new user (admin only)
- `POST /api/admin/toggle-admin` - Toggle admin status (admin only)

### Health Check
- `GET /health` - Server health check
- `GET /` - API information

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `AZURE_STORAGE_CONNECTION_STRING` | Azure Blob Storage connection string | Yes |
| `RESEND_API_KEY` | Resend API key for email functionality | Yes |
| `JWT_SECRET` | Secret key for JWT token signing | Yes |
| `PORT` | Server port (default: 3000) | No |
| `NODE_ENV` | Environment (production/development) | No |
| `CORS_ORIGIN` | CORS origin (default: *) | No |

## Frontend Integration

After deploying the backend, update your frontend's API base URL to point to your new backend URL:

```javascript
// In src/services/analysisService.js
const API_BASE_URL = 'https://your-backend-url.com/api';
```

## Support

For issues or questions, please check the main repository or create an issue. 