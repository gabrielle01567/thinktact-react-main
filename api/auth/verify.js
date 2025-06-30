import { findUserByEmail, saveUser, devStorage, getAllUsers } from '../shared-storage.js';

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
    
    // Check if we're in development mode
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      // Development mode - search through devStorage
      for (const [key, user] of devStorage.entries()) {
        if (user.verificationToken === token) {
          userToUpdate = user;
          userKey = key;
          break;
        }
      }
    } else {
      // Production mode - search through all users in blob storage
      try {
        const users = await getAllUsers();
        for (const user of users) {
          if (user.verificationToken === token) {
            userToUpdate = user;
            // Find the blob name for this user
            const USERS_BLOB_PREFIX = 'users/';
            userKey = `${USERS_BLOB_PREFIX}${btoa(user.email).replace(/[^a-zA-Z0-9]/g, '')}.json`;
            break;
          }
        }
      } catch (error) {
        console.error('Error searching users in production:', error);
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
    await saveUser(userKey, updatedUserData);

    res.status(200).json({
      success: true,
      message: 'Email verified successfully'
    });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({ error: 'Failed to verify email' });
  }
} 