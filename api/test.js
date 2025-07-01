export default async function handler(req, res) {
  res.status(200).json({
    success: true,
    message: 'API server is working!',
    timestamp: new Date().toISOString(),
    environment: 'production'
  });
} 