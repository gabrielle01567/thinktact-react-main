import { findUserByEmail, saveUser } from '../shared-storage.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    console.log('Verifying user with email:', email);

    // Find user by email
    const user = await findUserByEmail(email);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.verified) {
      return res.status(400).json({ error: 'User is already verified' });
    }

    // Generate blob name for user
    const USERS_BLOB_PREFIX = 'users/';
    const blobName = `${USERS_BLOB_PREFIX}${btoa(email).replace(/[^a-zA-Z0-9]/g, '')}.json`;

    // Update user data to mark as verified
    const updatedUserData = {
      ...user,
      verified: true,
      verificationToken: undefined
    };

    // Store updated user data
    await saveUser(updatedUserData);

    res.status(200).json({
      success: true,
      message: 'User verified successfully',
      user: {
        id: updatedUserData.id,
        email: updatedUserData.email,
        firstName: updatedUserData.firstName,
        lastName: updatedUserData.lastName,
        verified: updatedUserData.verified
      }
    });

  } catch (error) {
    console.error('Error verifying user:', error);
    res.status(500).json({ error: 'Failed to verify user' });
  }
} 