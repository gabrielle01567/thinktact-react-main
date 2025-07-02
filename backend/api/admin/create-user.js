import bcrypt from 'bcryptjs';
import { findUserByEmail, saveUser } from '../shared-storage.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { firstName, lastName, email, password, securityQuestion, securityAnswer, isAdmin } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !password || !securityQuestion || !securityAnswer) {
      return res.status(400).json({ success: false, error: 'All fields are required' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, error: 'Invalid email format' });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({ success: false, error: 'Password must be at least 6 characters' });
    }

    // Check if user already exists
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ success: false, error: 'User with this email already exists' });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user object
    const newUser = {
      id: Date.now().toString(),
      firstName,
      lastName,
      email,
      password: hashedPassword,
      securityQuestion,
      securityAnswer,
      isAdmin: isAdmin || false,
      verified: true, // Admin-created users are automatically verified
      blocked: false,
      createdAt: new Date().toISOString(),
      lastLogin: null
    };

    // Store user
    await saveUser(newUser);

    console.log(`✅ Admin created user: ${email}`);
    console.log(`📧 Email: ${email}`);
    console.log(`🔑 Password: ${password}`);
    console.log(`👤 Name: ${firstName} ${lastName}`);
    console.log(`👑 Admin: ${isAdmin ? 'Yes' : 'No'}`);

    res.status(201).json({ 
      success: true, 
      message: 'User created successfully',
      user: {
        id: newUser.id,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        isAdmin: newUser.isAdmin,
        verified: newUser.verified,
        createdAt: newUser.createdAt
      }
    });

  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
} 