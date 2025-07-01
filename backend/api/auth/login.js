import { findUserByEmail, saveUser } from '../shared-storage.js';

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
    if (!user.verified && !user.isAdmin && !user.isSuperUser) {
      return res.status(403).json({ error: 'Please verify your email before logging in.' });
    }

    // Verify password
    const bcrypt = await import('bcryptjs');
    const isValidPassword = await bcrypt.default.compare(password, user.passwordHash);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Update last login
    const updatedUser = {
      ...user,
      lastLogin: new Date().toISOString()
    };

    await saveUser(updatedUser);

    // Return user data (without password hash)
    const { passwordHash, ...userData } = updatedUser;
    res.status(200).json({
      success: true,
      user: userData
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
} 