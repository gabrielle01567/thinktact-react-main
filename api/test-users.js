import { getAllUsers } from './shared-storage.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const users = await getAllUsers();
    
    res.status(200).json({
      success: true,
      totalUsers: users.length,
      environment: process.env.BLOB_READ_WRITE_TOKEN ? 'production' : 'development',
      users: users.map(user => ({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        verified: user.verified,
        isAdmin: user.isAdmin,
        isSuperUser: user.isSuperUser,
        blocked: user.blocked,
        hasPasswordHash: !!user.passwordHash,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin
      }))
    });

  } catch (error) {
    console.error('Error testing users:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
} 