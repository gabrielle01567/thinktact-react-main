import { findUserByEmail, updateUser } from '../supabase-service.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId, blocked } = req.body;

    if (userId === undefined || blocked === undefined) {
      return res.status(400).json({ error: 'User ID and blocked status are required.' });
    }

    // Update the user's blocked status
    const updatedUser = await updateUser(userId, { blocked });

    res.status(200).json({
      success: true,
      message: `User ${blocked ? 'blocked' : 'unblocked'} successfully`,
      user: updatedUser
    });
  } catch (error) {
    console.error('Admin toggle status error:', error);
    if (error.message === 'User not found') {
      res.status(404).json({ error: 'User not found' });
    } else if (error.message === 'Database not configured') {
      res.status(503).json({ error: 'Database not configured' });
    } else {
      res.status(500).json({ error: 'Failed to update user status' });
    }
  }
} 