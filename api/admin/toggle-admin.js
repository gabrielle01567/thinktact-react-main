import { toggleAdminStatus } from '../shared-storage.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  try {
    const { userId, isAdmin } = req.body;
    if (!userId || typeof isAdmin !== 'boolean') {
      return res.status(400).json({ error: 'User ID and isAdmin are required.' });
    }
    const updatedUser = await toggleAdminStatus(userId, isAdmin);
    if (updatedUser) {
      res.status(200).json({ 
        success: true,
        user: updatedUser
      });
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    console.error('Error toggling admin status:', error);
    res.status(500).json({ error: 'Failed to update admin status' });
  }
} 