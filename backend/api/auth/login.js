import { findUserByEmail, updateUser, verifyPassword, generateToken } from '../supabase-service.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user by email
    const user = await findUserByEmail(email);

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check if user is blocked
    if (user.blocked) {
      return res.status(403).json({ error: 'Account is blocked. Please contact support.' });
    }

    // Check if user is verified (unless they're an admin)
    if (!user.isVerified && !user.isAdmin) {
      return res.status(403).json({ error: 'Please verify your email before logging in.' });
    }

    // Verify password
    const isValidPassword = await verifyPassword(user, password);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Update last login
    const updatedUser = await updateUser(user.id, { last_login: new Date().toISOString() });
    console.log('🔄 last_login update result:', updatedUser);

    // Generate JWT token
    const token = generateToken(user);

    // Return user data (without password) and token
    const { password: _, ...userData } = user;
    res.status(200).json({
      success: true,
      token,
      user: userData
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
} 