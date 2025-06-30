import { findUserByEmail, saveUser, deleteUser } from '../shared-storage.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const adminEmail = 'alex.hawke54@gmail.com';
    
    // Delete existing admin user if it exists
    const existingAdmin = await findUserByEmail(adminEmail);
    if (existingAdmin) {
      await deleteUser(adminEmail);
      console.log('Deleted existing admin user');
    }

    // Create fresh admin user
    const bcrypt = await import('bcryptjs');
    const SALT_ROUNDS = 12;
    const passwordHash = await bcrypt.hash('admin123', SALT_ROUNDS);

    const adminUserData = {
      id: `admin-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      email: adminEmail,
      firstName: 'Alex',
      lastName: 'Hawke',
      passwordHash: passwordHash,
      verified: true,
      isAdmin: true,
      isSuperUser: true,
      blocked: false,
      createdAt: new Date().toISOString(),
      lastLogin: null,
      securityQuestion: 'What is your favorite color?',
      securityAnswer: 'blue'
    };

    // Save admin user
    await saveUser(adminUserData);
    
    console.log('✅ Admin user reset successfully');
    console.log('📧 Email:', adminEmail);
    console.log('🔑 Password: admin123');
    console.log('🔑 Password Hash:', passwordHash.substring(0, 20) + '...');

    res.status(200).json({
      success: true,
      message: 'Admin user reset successfully',
      user: {
        email: adminUserData.email,
        firstName: adminUserData.firstName,
        lastName: adminUserData.lastName,
        isAdmin: adminUserData.isAdmin,
        verified: adminUserData.verified
      },
      credentials: {
        email: adminEmail,
        password: 'admin123'
      }
    });

  } catch (error) {
    console.error('Error resetting admin user:', error);
    res.status(500).json({ error: 'Failed to reset admin user' });
  }
} 