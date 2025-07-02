import { findUserById, deleteUser } from '../supabase-service.js';

export default async function handler(req, res) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required.' });
    }

    // Delete user from Supabase
    const result = await deleteUser(userId);

    if (result.success) {
      res.status(200).json({
        success: true,
        message: 'User deleted successfully'
      });
    } else {
      res.status(500).json({ error: 'Failed to delete user from database' });
    }
  } catch (error) {
    console.error('Admin delete user error:', error);
    if (error.message === 'Database not configured') {
      res.status(503).json({ error: 'Database not configured' });
    } else {
      res.status(500).json({ error: 'Failed to delete user' });
    }
  }
} 