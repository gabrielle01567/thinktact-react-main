import { findUserByVerificationToken, saveUser } from '../shared-storage.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { token } = req.query;

    console.log('🔍 Verification request received');
    console.log('🔍 Token from query:', token);
    console.log('🔍 All query params:', req.query);
    console.log('🔍 Environment check - BLOB_READ_WRITE_TOKEN exists:', !!process.env.BLOB_READ_WRITE_TOKEN);

    if (!token) {
      console.log('❌ No token provided');
      return res.status(400).json({ error: 'Verification token is required' });
    }

    console.log('🔍 Searching for user with verification token:', token);

    // Find user by verification token
    const userToUpdate = await findUserByVerificationToken(token);

    if (!userToUpdate) {
      console.log('❌ No user found with verification token:', token);
      return res.status(400).json({ error: 'Invalid verification token' });
    }

    if (userToUpdate.verified) {
      console.log('⚠️ User already verified:', userToUpdate.email);
      return res.status(400).json({ error: 'User is already verified' });
    }

    console.log('💾 Updating user verification status:', userToUpdate.email);

    // Update user verification status
    const updatedUserData = {
      ...userToUpdate,
      verified: true,
      verificationToken: null, // Clear the token after verification
      lastLogin: new Date().toISOString()
    };

    console.log('💾 Saving verified user:', userToUpdate.email);

    // Save user
    await saveUser(updatedUserData);

    console.log('✅ User verified successfully:', userToUpdate.email);

    res.status(200).json({
      success: true,
      message: 'Email verified successfully! You can now log in to your account.',
      user: {
        id: userToUpdate.id,
        email: userToUpdate.email,
        firstName: userToUpdate.firstName,
        lastName: userToUpdate.lastName,
        verified: true
      }
    });

  } catch (error) {
    console.error('❌ Verification error:', error);
    res.status(500).json({ error: 'Verification failed' });
  }
} 