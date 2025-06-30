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

    console.log('Login attempt for email:', email);

    // Find user by email (normalized)
    const user = await findUserByEmail(email);

    if (!user) {
      console.log('User not found for email:', email);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    console.log('User found, verifying password...');

    // Verify password
    const bcrypt = await import('bcryptjs');
    const passwordValid = await bcrypt.default.compare(password, user.passwordHash);

    console.log('Password valid:', passwordValid);

    if (!passwordValid) {
      console.log('Invalid password for user:', user.email);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check if user is blocked
    if (user.blocked) {
      console.log('Blocked user attempted login:', user.email);
      return res.status(403).json({ error: 'Account is blocked' });
    }

    // Check if user is verified (unless they're an admin/super user)
    if (!user.verified && !user.isAdmin && !user.isSuperUser) {
      console.log('User not verified:', user.email);
      return res.status(403).json({ 
        error: 'Please verify your email address before logging in',
        needsVerification: true 
      });
    }

    console.log('Login successful for user:', user.email);

    // Update last login time
    const updatedUser = {
      ...user,
      lastLogin: new Date().toISOString()
    };

    await saveUser(updatedUser);

    // Return user data (without sensitive information)
    const { passwordHash, verificationToken, securityAnswer, ...userResponse } = updatedUser;

    res.status(200).json({
      success: true,
      message: 'Login successful',
      user: userResponse
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
} 