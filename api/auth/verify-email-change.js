import { devStorage, findUserByEmail, saveUser } from '../shared-storage.js';

const USERS_BLOB_PREFIX = 'users/';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Token is required' });
    }

    // Find the email change request
    const emailChangeBlobName = `email-changes/${btoa(token).replace(/[^a-zA-Z0-9]/g, '')}.json`;
    const emailChangeRequest = devStorage.get(emailChangeBlobName);

    if (!emailChangeRequest) {
      return res.status(404).json({ error: 'Invalid or expired verification token' });
    }

    // Check if token has expired
    if (new Date() > new Date(emailChangeRequest.expiresAt)) {
      devStorage.delete(emailChangeBlobName);
      return res.status(400).json({ error: 'Verification token has expired' });
    }

    // Find the current user
    const currentUser = findUserByEmail(emailChangeRequest.currentEmail);
    if (!currentUser) {
      devStorage.delete(emailChangeBlobName);
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if new email is still available
    const existingUser = findUserByEmail(emailChangeRequest.newEmail);
    if (existingUser) {
      devStorage.delete(emailChangeBlobName);
      return res.status(409).json({ error: 'Email address is already in use' });
    }

    // Update user's email
    const oldBlobName = `${USERS_BLOB_PREFIX}${btoa(emailChangeRequest.currentEmail).replace(/[^a-zA-Z0-9]/g, '')}.json`;
    const newBlobName = `${USERS_BLOB_PREFIX}${btoa(emailChangeRequest.newEmail).replace(/[^a-zA-Z0-9]/g, '')}.json`;

    // Create updated user data
    const updatedUser = {
      ...currentUser,
      email: emailChangeRequest.newEmail,
      emailChangedAt: new Date().toISOString()
    };

    // Save user with new email
    saveUser(newBlobName, updatedUser);

    // Remove old user data
    devStorage.delete(oldBlobName);

    // Remove email change request
    devStorage.delete(emailChangeBlobName);

    res.status(200).json({
      success: true,
      message: 'Email address updated successfully! You can now sign in with your new email address.',
      user: {
        id: updatedUser.id,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        email: updatedUser.email,
        verified: updatedUser.verified,
        isAdmin: updatedUser.isAdmin
      }
    });
  } catch (error) {
    console.error('Email change verification error:', error);
    res.status(500).json({ error: 'Email change verification failed' });
  }
} 