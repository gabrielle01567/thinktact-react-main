import bcrypt from 'bcryptjs';
import { findUserById, updateUser } from '../supabase-service.js';

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

    // Find the user by ID
    const user = await findUserById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Hash the new password
    const passwordHash = bcrypt.hashSync(newPassword, SALT_ROUNDS);

    // Update the user's password
    const updatedUser = await updateUser(userId, {
      password_hash: passwordHash
    });

    res.status(200).json({
      success: true,
      message: 'Password reset successfully'
    });
  } catch (error) {
    console.error('Admin password reset error:', error);
    if (error.message === 'User not found') {
      res.status(404).json({ error: 'User not found' });
    } else {
      res.status(500).json({ error: 'Failed to reset password' });
    }
  }
} 