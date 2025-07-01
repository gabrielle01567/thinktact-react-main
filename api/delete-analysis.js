const { deleteAnalysis } = require('./analysis-history');
const { getUserFromToken } = require('./shared-storage');

module.exports = async (req, res) => {
  if (req.method !== 'DELETE') {
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

    const { analysisId } = req.body;

    if (!analysisId) {
      return res.status(400).json({ error: 'Analysis ID is required' });
    }

    const result = await deleteAnalysis(user.id, analysisId);

    res.status(200).json(result);

  } catch (error) {
    console.error('Error in delete-analysis endpoint:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}; 