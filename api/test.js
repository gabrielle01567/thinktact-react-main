export default async function handler(req, res) {
  res.status(200).json({
    success: true,
    message: 'API server is working!',
    timestamp: new Date().toISOString(),
    environment: process.env.BLOB_READ_WRITE_TOKEN ? 'production' : 'development'
  });
} 