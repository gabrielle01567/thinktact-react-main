import { getAllUsers } from './supabase-service.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get all users from Supabase
    const users = await getAllUsers();
    
    res.status(200).json({
      success: true,
      users: users
    });

  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
} 