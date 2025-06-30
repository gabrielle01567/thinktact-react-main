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

    // HARDCODED ADMIN USER - BYPASSES ALL STORAGE ISSUES
    if (email.toLowerCase().trim() === 'admin@thinktact.ai' && password === 'admin123') {
      console.log('✅ Hardcoded admin login successful');
      const adminUser = {
        id: 'hardcoded-admin-001',
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@thinktact.ai',
        verified: true,
        isAdmin: true,
        isSuperUser: true,
        blocked: false,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString()
      };
      
      return res.status(200).json({
        success: true,
        user: adminUser,
        message: 'Login successful!'
      });
    }

    // Regular user lookup
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
      console.log('Invalid password for user:', email);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check if user is verified
    if (!user.verified) {
      console.log('User not verified:', email);
      return res.status(401).json({ 
        error: 'Please verify your email before logging in',
        needsVerification: true 
      });
    }

    // Check if user is blocked
    if (user.blocked) {
      console.log('User is blocked:', email);
      return res.status(401).json({ error: 'Account is blocked. Please contact support.' });
    }

    // Update last login
    const updatedUser = {
      ...user,
      lastLogin: new Date().toISOString()
    };

    await saveUser(updatedUser);

    console.log('Login successful for user:', email);

    res.status(200).json({
      success: true,
      user: updatedUser,
      message: 'Login successful!'
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
} 