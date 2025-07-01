# Vercel Blob Storage Setup

This backend now uses Vercel Blob Storage as the database instead of in-memory storage.

## Setup Steps

### 1. Install Vercel CLI (if not already installed)
```bash
npm install -g vercel
```

### 2. Login to Vercel
```bash
vercel login
```

### 3. Link your project to Vercel
```bash
cd backend
vercel link
```

### 4. Add Blob Storage
```bash
vercel blob create
```

This will create a new Blob store and add the necessary environment variables.

### 5. Environment Variables

The following environment variables will be automatically added to your `.env` file:

```
BLOB_READ_WRITE_TOKEN=your_token_here
```

### 6. Deploy to Railway

When deploying to Railway, make sure to add the `BLOB_READ_WRITE_TOKEN` environment variable:

1. Go to your Railway project dashboard
2. Navigate to the "Variables" tab
3. Add the environment variable:
   - Key: `BLOB_READ_WRITE_TOKEN`
   - Value: (copy from your local `.env` file)

### 7. Test the Setup

After deployment, test that the blob storage is working:

```bash
curl https://your-railway-url.railway.app/api/test
```

## How It Works

- **Users**: Stored as individual JSON files in the `users/` prefix
- **Analysis History**: Stored as JSON files in the `analysis/` prefix
- **File Naming**: Uses safe email addresses for user files, user IDs for analysis files
- **Data Structure**: Each file contains a single user or an array of analysis records

## Benefits

- ✅ Persistent storage (no data loss on server restart)
- ✅ Scalable and reliable
- ✅ Cost-effective (generous free tier)
- ✅ Easy backup and migration
- ✅ No database setup required

## Data Structure

### User Files (`users/email.json`)
```json
{
  "id": "user-123",
  "email": "user@example.com",
  "password": "hashed_password",
  "name": "User Name",
  "isVerified": true,
  "isAdmin": false,
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

### Analysis Files (`analysis/userId.json`)
```json
[
  {
    "id": "analysis-123",
    "userId": "user-123",
    "argument": "Original argument text",
    "analysis": { /* analysis results */ },
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
]
``` 