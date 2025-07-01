import { findUserByEmail, getAllUsers } from '../shared-storage.js';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, password } = req.body;
    const normalizedEmail = email.toLowerCase().trim();
    
    console.log(`🔍 Testing login for: "${email}" -> normalized: "${normalizedEmail}"`);
    
    // Test findUserByEmail
    const user = await findUserByEmail(email);
    console.log(`🔍 findUserByEmail result:`, user ? 'Found' : 'Not found');
    
    // Test getAllUsers
    const allUsers = await getAllUsers();
    const userInAllUsers = allUsers.find(u => u.email === email);
    console.log(`🔍 getAllUsers result:`, userInAllUsers ? 'Found' : 'Not found');
    
    // Test password verification if user found
    let passwordValid = false;
    if (user && user.passwordHash) {
      passwordValid = await bcrypt.compare(password, user.passwordHash);
      console.log(`🔍 Password verification:`, passwordValid ? 'Valid' : 'Invalid');
    }
    
    // Test password verification with user from getAllUsers
    let passwordValidFromAll = false;
    if (userInAllUsers && userInAllUsers.passwordHash) {
      passwordValidFromAll = await bcrypt.compare(password, userInAllUsers.passwordHash);
      console.log(`🔍 Password verification (from getAllUsers):`, passwordValidFromAll ? 'Valid' : 'Invalid');
    }
    
    res.status(200).json({
      success: true,
      email: email,
      normalizedEmail: normalizedEmail,
      findUserByEmail: {
        found: !!user,
        user: user ? {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          verified: user.verified,
          isAdmin: user.isAdmin,
          hasPasswordHash: !!user.passwordHash,
          passwordHashLength: user.passwordHash ? user.passwordHash.length : 0
        } : null
      },
      getAllUsers: {
        totalUsers: allUsers.length,
        found: !!userInAllUsers,
        user: userInAllUsers ? {
          id: userInAllUsers.id,
          email: userInAllUsers.email,
          firstName: userInAllUsers.firstName,
          lastName: userInAllUsers.lastName,
          verified: userInAllUsers.verified,
          isAdmin: userInAllUsers.isAdmin,
          hasPasswordHash: !!userInAllUsers.passwordHash,
          passwordHashLength: userInAllUsers.passwordHash ? userInAllUsers.passwordHash.length : 0
        } : null
      },
      passwordVerification: {
        fromFindUserByEmail: passwordValid,
        fromGetAllUsers: passwordValidFromAll
      },
      environment: process.env.BLOB_READ_WRITE_TOKEN ? 'production' : 'development'
    });

  } catch (error) {
    console.error('Error testing login:', error);
    res.status(500).json({ error: 'Failed to test login', details: error.message });
  }
} 