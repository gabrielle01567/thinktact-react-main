import { toggleUserStatus } from '../shared-storage.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId, blocked } = req.body;

    if (userId === undefined || blocked === undefined) {
      return res.status(400).json({ error: 'User ID and blocked status are required.' });
    }

    // Use the toggleUserStatus function from shared-storage
    const updatedUser = await toggleUserStatus(userId, blocked);

    res.status(200).json({
      success: true,
      message: `User ${blocked ? 'blocked' : 'unblocked'} successfully`,
      user: updatedUser
    });
  } catch (error) {
    console.error('Admin toggle status error:', error);
    if (error.message === 'User not found') {
      res.status(404).json({ error: 'User not found' });
    } else {
      res.status(500).json({ error: 'Failed to update user status' });
    }
  }
} 