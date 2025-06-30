import bcrypt from 'bcryptjs';
import { findUserByEmail, saveUser, devStorage } from '../shared-storage.js';

const SALT_ROUNDS = 12;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ error: 'Token and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Find user by reset token
    let userToUpdate = null;
    let userKey = null;
    
    // Search through all users to find the one with matching reset token
    for (const [key, user] of devStorage.entries()) {
      if (user.resetToken === token) {
        userToUpdate = user;
        userKey = key;
        break;
      }
    }
    
    if (!userToUpdate) {
      return res.status(404).json({ error: 'Invalid or expired reset token' });
    }

    // Check if token is expired
    if (new Date() > new Date(userToUpdate.resetTokenExpiry)) {
      return res.status(400).json({ error: 'Reset token has expired' });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
    
    // Update user data
    const updatedUserData = {
      ...userToUpdate,
      passwordHash: hashedPassword,
      resetToken: undefined,
      resetTokenExpiry: undefined
    };

    // Store updated user data
    saveUser(userKey, updatedUserData);

    res.status(200).json({
      success: true,
      message: 'Password reset successfully'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Failed to reset password' });
  }
} 