import { findUserByEmail, saveUser, getAllUsers } from '../shared-storage.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { token } = req.query;

    console.log('🔍 Verification request received');
    console.log('🔍 Token from query:', token);
    console.log('🔍 All query params:', req.query);

    if (!token) {
      console.log('❌ No token provided');
      return res.status(400).json({ error: 'Verification token is required' });
    }

    console.log('🔍 Searching for user with verification token:', token);

    // Find user by verification token
    let userToUpdate = null;
    
    try {
      const users = await getAllUsers();
      console.log(`📊 Searching through ${users.length} users for verification token`);
      
      for (const user of users) {
        console.log(`🔍 Checking user ${user.email}, verification token: ${user.verificationToken}`);
        if (user.verificationToken === token) {
          userToUpdate = user;
          console.log('✅ Found user with matching verification token:', user.email);
          break;
        }
      }
    } catch (error) {
      console.error('Error searching users:', error);
      return res.status(500).json({ error: 'Failed to search for user' });
    }
    
    if (!userToUpdate) {
      console.log('❌ No user found with verification token:', token);
      return res.status(404).json({ error: 'Invalid verification token' });
    }

    // Update user data to mark as verified
    const updatedUserData = {
      ...userToUpdate,
      verified: true,
      verificationToken: null, // Remove the verification token
      updatedAt: new Date().toISOString()
    };

    console.log('💾 Saving verified user:', userToUpdate.email);

    // Generate blob name for user
    const USERS_BLOB_PREFIX = 'users/';
    const blobName = `${USERS_BLOB_PREFIX}${btoa(userToUpdate.email.toLowerCase()).replace(/[^a-zA-Z0-9]/g, '')}.json`;

    // Save user with normalized email
    await saveUser(blobName, updatedUserData);

    console.log('✅ Email verification successful for:', userToUpdate.email);

    res.status(200).json({
      success: true,
      message: 'Email verified successfully'
    });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({ error: 'Failed to verify email' });
  }
} 