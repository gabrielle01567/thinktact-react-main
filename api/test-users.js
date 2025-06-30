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
      users: users.map(user => ({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        verified: user.verified,
        isAdmin: user.isAdmin,
        isSuperUser: user.isSuperUser,
        createdAt: user.createdAt,
        // Show the blob name that would be used for this email
        blobName: `users/${btoa(user.email.toLowerCase()).replace(/[^a-zA-Z0-9]/g, '')}.json`
      }))
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ 
      error: 'Failed to fetch users',
      details: error.message 
    });
  }
} 