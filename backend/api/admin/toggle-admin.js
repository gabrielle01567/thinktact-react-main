import { findUserByEmail, updateUser } from '../supabase-service.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  try {
    const { userId, isAdmin } = req.body;
    if (!userId || typeof isAdmin !== 'boolean') {
      return res.status(400).json({ error: 'User ID and isAdmin are required.' });
    }
    
    // Update the user's admin status
    const updatedUser = await updateUser(userId, { is_admin: isAdmin });
    
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
    if (error.message === 'Database not configured') {
      res.status(503).json({ error: 'Database not configured' });
    } else {
      res.status(500).json({ error: 'Failed to update admin status' });
    }
  }
} 