import { getAllUsers, findUserById, deleteUser } from '../shared-storage.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('🔍 Testing delete functionality...');
    
    // Get all users
    const users = await getAllUsers();
    console.log('📋 Total users found:', users.length);
    
    // Log each user's details
    users.forEach((user, index) => {
      console.log(`User ${index + 1}:`);
      console.log(`  ID: ${user.id}`);
      console.log(`  Email: ${user.email}`);
      console.log(`  Name: ${user.firstName} ${user.lastName}`);
      console.log(`  Verified: ${user.verified}`);
      console.log(`  Admin: ${user.isAdmin}`);
      console.log('---');
    });

    // Test findUserById for each user
    for (const user of users) {
      console.log(`🔍 Testing findUserById for user: ${user.email}`);
      const result = await findUserById(user.id);
      console.log(`  Found: ${result.user ? 'YES' : 'NO'}`);
      if (result.user) {
        console.log(`  User email: ${result.user.email}`);
        console.log(`  Key: ${result.key}`);
      }
      console.log('---');
    }

    res.status(200).json({
      success: true,
      message: 'Delete test completed - check server logs',
      userCount: users.length,
      users: users.map(u => ({
        id: u.id,
        email: u.email,
        firstName: u.firstName,
        lastName: u.lastName,
        verified: u.verified,
        isAdmin: u.isAdmin
      }))
    });

  } catch (error) {
    console.error('Test delete error:', error);
    res.status(500).json({ error: 'Test failed', details: error.message });
  }
} 