import { findUserByResetToken, saveUser } from '../shared-storage.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ error: 'Token and new password are required' });
    }

    // Find user by reset token
    const userToUpdate = await findUserByResetToken(token);

    if (!userToUpdate) {
      return res.status(400).json({ error: 'Invalid reset token' });
    }

    // Check if token is expired
    if (userToUpdate.resetTokenExpiry && new Date() > new Date(userToUpdate.resetTokenExpiry)) {
      return res.status(400).json({ error: 'Reset token has expired' });
    }

    // Hash new password
    const bcrypt = await import('bcryptjs');
    const SALT_ROUNDS = 12;
    const newPasswordHash = await bcrypt.default.hash(newPassword, SALT_ROUNDS);

    // Update user password and clear reset token
    const updatedUserData = {
      ...userToUpdate,
      passwordHash: newPasswordHash,
      resetToken: null,
      resetTokenExpiry: null,
      lastLogin: new Date().toISOString()
    };

    // Save updated user
    await saveUser(updatedUserData);

    res.status(200).json({
      success: true,
      message: 'Password reset successfully! You can now log in with your new password.'
    });

  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ error: 'Password reset failed' });
  }
} 