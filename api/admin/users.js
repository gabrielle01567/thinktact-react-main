import { getAllUsers } from '../shared-storage.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get all users from storage (development or production)
    const users = await getAllUsers();
    
    // Remove sensitive data from response
    const safeUsers = users.map(user => ({
      ...user,
      passwordHash: undefined, // Don't send password hashes
      securityAnswer: undefined // Don't send security answers
    }));

    res.status(200).json({ 
      success: true, 
      users: safeUsers
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
} 