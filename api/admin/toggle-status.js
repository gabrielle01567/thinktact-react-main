import { findUserById, saveUser } from '../shared-storage.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId, blocked } = req.body;

    if (userId === undefined || blocked === undefined) {
      return res.status(400).json({ error: 'User ID and blocked status are required.' });
    }

    // Find user by ID
    const { user: userToUpdate, key: userKey } = findUserById(userId);
    
    if (!userToUpdate) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update user data
    const updatedUserData = {
      ...userToUpdate,
      blocked: blocked
    };

    // Store updated user data
    saveUser(userKey, updatedUserData);

    res.status(200).json({
      success: true,
      message: `User ${blocked ? 'blocked' : 'unblocked'} successfully`
    });
  } catch (error) {
    console.error('Admin toggle status error:', error);
    res.status(500).json({ error: 'Failed to update user status' });
  }
} 