import { findUserByEmail, getAllUsers } from './shared-storage.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get all users to show current state
    const users = await getAllUsers();
    
    // Check if we're in development mode
    const isDevelopment = false; // Using Supabase in production
    const hasEmailService = !!process.env.RESEND_API_KEY;
    
    res.status(200).json({
      success: true,
      message: 'Registration system status',
      environment: {
        isDevelopment,
        hasEmailService,
        totalUsers: users.length
      },
      users: users.map(user => ({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        verified: user.verified,
        isAdmin: user.isAdmin,
        isSuperUser: user.isSuperUser,
        createdAt: user.createdAt
      }))
    });
  } catch (error) {
    console.error('Test registration error:', error);
    res.status(500).json({ error: 'Failed to test registration system' });
  }
} 