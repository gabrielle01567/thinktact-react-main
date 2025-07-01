// Simple in-memory storage for development (shared with auth APIs)
const devStorage = new Map();

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { filename } = req.query;
    
    if (!filename) {
      return res.status(400).json({ error: 'Filename is required' });
    }

    // Get the data from development storage
    const data = devStorage.get(filename);
    
    if (!data) {
      return res.status(404).json({ error: 'Blob not found' });
    }
    
    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching blob:', error);
    res.status(500).json({ error: 'Failed to fetch blob' });
  }
} 