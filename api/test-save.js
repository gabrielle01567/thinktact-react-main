export default async function handler(req, res) {
  // Enable CORS for Vercel
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,DELETE,PATCH,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  console.log('Test save endpoint called with method:', req.method);
  console.log('Request body:', req.body);

  if (req.method === 'POST') {
    res.status(200).json({ 
      success: true, 
      message: 'Test save endpoint working',
      method: req.method,
      body: req.body 
    });
  } else {
    res.status(405).json({ 
      error: 'Method not allowed', 
      allowedMethods: ['POST'],
      receivedMethod: req.method 
    });
  }
} 