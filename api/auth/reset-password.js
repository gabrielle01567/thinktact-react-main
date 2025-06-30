import { getAllUsers, saveUser } from '../shared-storage.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ error: 'Token and new password are required' });
    }

    console.log('Password reset attempt with token:', token);

    // Find user by reset token
    let userToUpdate = null;
    
    try {
      const users = await getAllUsers();
      console.log(`🔍 Checking ${users.length} users for reset token`);
      
      for (const user of users) {
        if (user.resetToken === token) {
          // Check if token is expired
          if (user.resetTokenExpiry && new Date() > new Date(user.resetTokenExpiry)) {
            console.log('❌ Reset token expired for user:', user.email);
            return res.status(400).json({ error: 'Reset token has expired' });
          }
          
          userToUpdate = user;
          console.log(`✅ Found user with valid reset token: ${user.email}`);
          break;
        }
      }
    } catch (error) {
      console.error('❌ Error getting users:', error);
      return res.status(500).json({ error: 'Failed to reset password' });
    }

    if (!userToUpdate) {
      console.log('❌ No user found with reset token:', token);
      return res.status(400).json({ error: 'Invalid reset token' });
    }

    // Hash new password
    const bcrypt = await import('bcryptjs');
    const SALT_ROUNDS = 12;
    const newPasswordHash = await bcrypt.default.hash(newPassword, SALT_ROUNDS);

    console.log('💾 Updating password for user:', userToUpdate.email);

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

    console.log('✅ Password reset successful for user:', userToUpdate.email);

    res.status(200).json({
      success: true,
      message: 'Password reset successfully! You can now log in with your new password.'
    });

  } catch (error) {
    console.error('❌ Password reset error:', error);
    res.status(500).json({ error: 'Password reset failed' });
  }
} 