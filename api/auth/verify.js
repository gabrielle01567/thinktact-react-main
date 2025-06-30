import { findUserByEmail, saveUser, devStorage } from '../shared-storage.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ error: 'Verification token is required' });
    }

    // Find user by verification token
    let userToUpdate = null;
    let userKey = null;
    
    // Search through all users to find the one with matching verification token
    for (const [key, user] of devStorage.entries()) {
      if (user.verificationToken === token) {
        userToUpdate = user;
        userKey = key;
        break;
      }
    }
    
    if (!userToUpdate) {
      return res.status(404).json({ error: 'Invalid verification token' });
    }

    // Update user data to mark as verified
    const updatedUserData = {
      ...userToUpdate,
      verified: true,
      verificationToken: undefined
    };

    // Store updated user data
    saveUser(userKey, updatedUserData);

    res.status(200).json({
      success: true,
      message: 'Email verified successfully'
    });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({ error: 'Failed to verify email' });
  }
} 