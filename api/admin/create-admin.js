import { findUserByEmail, saveUser } from '../shared-storage.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Check if admin user already exists
    const existingAdmin = await findUserByEmail('alex.hawke54@gmail.com');
    
    if (existingAdmin) {
      return res.status(409).json({ 
        error: 'Admin user already exists',
        user: {
          email: existingAdmin.email,
          firstName: existingAdmin.firstName,
          lastName: existingAdmin.lastName,
          isAdmin: existingAdmin.isAdmin,
          verified: existingAdmin.verified
        }
      });
    }

    // Create admin user
    const bcrypt = await import('bcryptjs');
    const SALT_ROUNDS = 12;
    const passwordHash = await bcrypt.default.hash('admin123', SALT_ROUNDS);

    const adminUserData = {
      id: `admin_${Date.now()}`,
      firstName: 'Alex',
      lastName: 'Hawke',
      email: 'alex.hawke54@gmail.com',
      passwordHash: passwordHash,
      verified: true,
      isAdmin: true,
      isSuperUser: true,
      blocked: false,
      createdAt: new Date().toISOString(),
      lastLogin: null,
      verificationToken: null,
      resetToken: null,
      resetTokenExpiry: null,
      securityQuestion: 'Admin user',
      securityAnswer: 'admin'
    };

    // Save admin user
    await saveUser(adminUserData);

    res.status(200).json({
      success: true,
      message: 'Admin user created successfully',
      user: {
        email: adminUserData.email,
        firstName: adminUserData.firstName,
        lastName: adminUserData.lastName,
        isAdmin: adminUserData.isAdmin,
        verified: adminUserData.verified
      },
      credentials: {
        email: 'alex.hawke54@gmail.com',
        password: 'admin123'
      }
    });

  } catch (error) {
    console.error('Error creating admin user:', error);
    res.status(500).json({ error: 'Failed to create admin user' });
  }
} 