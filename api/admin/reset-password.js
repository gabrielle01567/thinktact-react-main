import bcrypt from 'bcryptjs';
import { findUserById, saveUser } from '../shared-storage.js';

const SALT_ROUNDS = 12;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId, newPassword } = req.body;

    if (!userId || !newPassword) {
      return res.status(400).json({ error: 'User ID and new password are required.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Find user by ID
    const { user: userToUpdate, key: userKey } = findUserById(userId);
    
    if (!userToUpdate) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
    
    // Update user data
    const updatedUserData = {
      ...userToUpdate,
      passwordHash: hashedPassword
    };

    // Store updated user data
    saveUser(userKey, updatedUserData);

    res.status(200).json({
      success: true,
      message: 'Password reset successfully'
    });
  } catch (error) {
    console.error('Admin password reset error:', error);
    res.status(500).json({ error: 'Failed to reset password' });
  }
} 