import { findUserByEmail, updateUser } from '../supabase-service.js';

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

    if (user.isVerified) {
      return res.status(400).json({ error: 'User is already verified' });
    }

    // Update user to verified using Supabase service
    const updatedUser = await updateUser(user.id, { 
      is_verified: true,
      verification_token: null
    });

    if (updatedUser) {
      res.status(200).json({
        success: true,
        message: 'User verified successfully',
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          firstName: updatedUser.name ? updatedUser.name.split(' ')[0] : '',
          lastName: updatedUser.name ? updatedUser.name.split(' ').slice(1).join(' ') : '',
          verified: updatedUser.is_verified
        }
      });
    } else {
      res.status(500).json({ error: 'Failed to update user' });
    }

  } catch (error) {
    console.error('Error verifying user:', error);
    res.status(500).json({ error: 'Failed to verify user' });
  }
} 