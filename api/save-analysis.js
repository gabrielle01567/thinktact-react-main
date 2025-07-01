import { saveAnalysis } from './analysis-history.js';
import { getUserFromToken } from './shared-storage.js';

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

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get user from token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.substring(7);
    const user = await getUserFromToken(token);
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const { originalArgument, processedAnalysis } = req.body;

    if (!originalArgument || !processedAnalysis) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    console.log('Saving analysis for user:', user.id);
    console.log('Original argument:', originalArgument.substring(0, 100) + '...');

    const result = await saveAnalysis(user.id, {
      originalArgument,
      processedAnalysis
    });

    console.log('Analysis saved successfully:', result);
    res.status(200).json(result);

  } catch (error) {
    console.error('Error in save-analysis endpoint:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
} 