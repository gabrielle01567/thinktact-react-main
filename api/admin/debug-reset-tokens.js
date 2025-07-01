import { getAllUsers } from '../shared-storage.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const users = await getAllUsers();
    
    // Filter to only show users with reset tokens
    const usersWithResetTokens = users
      .filter(user => user.resetToken)
      .map(user => ({
        email: user.email,
        resetToken: user.resetToken,
        resetTokenLength: user.resetToken ? user.resetToken.length : 0,
        resetTokenExpiry: user.resetTokenExpiry,
        hasExpired: user.resetTokenExpiry ? new Date() > new Date(user.resetTokenExpiry) : false
      }));

    res.status(200).json({
      success: true,
      totalUsers: users.length,
      usersWithResetTokens: usersWithResetTokens.length,
      users: usersWithResetTokens
    });
  } catch (error) {
    console.error('Debug reset tokens error:', error);
    res.status(500).json({ error: 'Failed to debug reset tokens' });
  }
} 