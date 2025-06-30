import bcrypt from 'bcryptjs';
import { findUserByEmail, saveUser } from '../shared-storage.js';

const USERS_BLOB_PREFIX = 'users/';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, password } = req.body;
    console.log('Login attempt for email:', email);

    // Validate input
    if (!email || !password) {
      console.log('Missing email or password');
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const normalizedEmail = email.toLowerCase();
    const blobName = `${USERS_BLOB_PREFIX}${btoa(normalizedEmail).replace(/[^a-zA-Z0-9]/g, '')}.json`;

    // Get user from storage (development or production)
    const userData = await findUserByEmail(normalizedEmail);
    if (!userData) {
      console.log('User not found for email:', email);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    console.log('User found, verifying password...');

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, userData.passwordHash);
    console.log('Password valid:', isPasswordValid);
    
    if (!isPasswordValid) {
      console.log('Invalid password for user:', email);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check if user is blocked
    if (userData.blocked) {
      console.log('User is blocked:', email);
      return res.status(403).json({ error: 'Account has been blocked. Please contact support.' });
    }

    // Check if user is verified
    if (!userData.verified) {
      console.log('User not verified:', email);
      return res.status(403).json({ error: 'Please verify your email before logging in.' });
    }

    console.log('Login successful for user:', email);

    // Update last login
    userData.lastLogin = new Date().toISOString();
    
    // Update the storage with new last login time
    await saveUser(blobName, userData);

    // Return user data without password
    const { passwordHash: _, ...userWithoutPassword } = userData;
    
    res.status(200).json({
      success: true,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
} 