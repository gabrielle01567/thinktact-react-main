import { findUserByEmail, getAllUsers } from '../shared-storage.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const adminEmail = 'alex.hawke54@gmail.com';
    
    // Find admin user
    const adminUser = await findUserByEmail(adminEmail);
    
    // Get all users
    const allUsers = await getAllUsers();
    
    // Find admin in all users
    const adminInAllUsers = allUsers.find(user => user.email === adminEmail);
    
    res.status(200).json({
      success: true,
      adminUser: adminUser ? {
        id: adminUser.id,
        email: adminUser.email,
        firstName: adminUser.firstName,
        lastName: adminUser.lastName,
        verified: adminUser.verified,
        isAdmin: adminUser.isAdmin,
        hasPasswordHash: !!adminUser.passwordHash,
        passwordHashLength: adminUser.passwordHash ? adminUser.passwordHash.length : 0,
        passwordHashStart: adminUser.passwordHash ? adminUser.passwordHash.substring(0, 20) + '...' : null
      } : null,
      adminInAllUsers: adminInAllUsers ? {
        id: adminInAllUsers.id,
        email: adminInAllUsers.email,
        firstName: adminInAllUsers.firstName,
        lastName: adminInAllUsers.lastName,
        verified: adminInAllUsers.verified,
        isAdmin: adminInAllUsers.isAdmin,
        hasPasswordHash: !!adminInAllUsers.passwordHash,
        passwordHashLength: adminInAllUsers.passwordHash ? adminInAllUsers.passwordHash.length : 0,
        passwordHashStart: adminInAllUsers.passwordHash ? adminInAllUsers.passwordHash.substring(0, 20) + '...' : null
      } : null,
      totalUsers: allUsers.length,
      allUserEmails: allUsers.map(u => u.email),
      environment: process.env.BLOB_READ_WRITE_TOKEN ? 'production' : 'development'
    });

  } catch (error) {
    console.error('Error debugging admin user:', error);
    res.status(500).json({ error: 'Failed to debug admin user', details: error.message });
  }
} 