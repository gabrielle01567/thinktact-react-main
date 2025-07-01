import { findUserById, deleteUser } from '../shared-storage.js';

export default async function handler(req, res) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required.' });
    }

    // Find user by ID
    const { user: userToDelete } = await findUserById(userId);
    
    if (!userToDelete) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Delete user from storage using their email
    const success = await deleteUser(userToDelete.email);

    if (success) {
      res.status(200).json({
        success: true,
        message: 'User deleted successfully'
      });
    } else {
      res.status(500).json({ error: 'Failed to delete user from storage' });
    }
  } catch (error) {
    console.error('Admin delete user error:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
} 