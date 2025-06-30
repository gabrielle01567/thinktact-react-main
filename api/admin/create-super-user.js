import { createSuperUser, findUserByEmail } from '../shared-storage.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, password, firstName, lastName, currentUserEmail } = req.body;

    // Validate required fields
    if (!email || !password || !currentUserEmail) {
      return res.status(400).json({ 
        error: 'Email, password, and current user email are required' 
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Validate password strength
    if (password.length < 6) {
      return res.status(400).json({ 
        error: 'Password must be at least 6 characters long' 
      });
    }

    // Check if current user is a super user
    const currentUser = await findUserByEmail(currentUserEmail);
    if (!currentUser || !currentUser.isSuperUser) {
      return res.status(403).json({ 
        error: 'Only super users can create other super users' 
      });
    }

    // Check if user already exists
    const existingUser = await findUserByEmail(email);
    if (existingUser && existingUser.isSuperUser) {
      return res.status(400).json({ 
        error: 'User is already a super user' 
      });
    }

    // Create or upgrade to super user
    const success = await createSuperUser(email, password, firstName, lastName);

    if (success) {
      return res.status(200).json({ 
        message: 'Super user created/upgraded successfully',
        email: email,
        role: 'Super User'
      });
    } else {
      return res.status(500).json({ 
        error: 'Failed to create super user' 
      });
    }

  } catch (error) {
    console.error('Error creating super user:', error);
    return res.status(500).json({ 
      error: 'Internal server error' 
    });
  }
} 