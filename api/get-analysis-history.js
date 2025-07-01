const { getAnalysisHistory } = require('./analysis-history');
const { getUserFromToken } = require('./shared-storage');

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
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

    const history = await getAnalysisHistory(user.id);

    res.status(200).json({ history });

  } catch (error) {
    console.error('Error in get-analysis-history endpoint:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}; 