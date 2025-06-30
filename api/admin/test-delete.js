import { getAllUsers, findUserByEmail, deleteUser } from '../shared-storage.js';

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

    // Test findUserByEmail for ajhawke.consulting@gmail.com
    console.log('🔍 Testing findUserByEmail for ajhawke.consulting@gmail.com...');
    const testUser = await findUserByEmail('ajhawke.consulting@gmail.com');
    console.log('Test user found:', testUser ? 'YES' : 'NO');
    
    if (testUser) {
      console.log('Test user details:', {
        id: testUser.id,
        email: testUser.email,
        firstName: testUser.firstName,
        lastName: testUser.lastName
      });
      
      // Test deletion
      console.log('🗑️ Testing deletion of ajhawke.consulting@gmail.com...');
      const deleteResult = await deleteUser('ajhawke.consulting@gmail.com');
      console.log('Delete result:', deleteResult);
      
      // Verify deletion
      console.log('🔍 Verifying deletion...');
      const userAfterDelete = await findUserByEmail('ajhawke.consulting@gmail.com');
      console.log('User found after deletion:', userAfterDelete ? 'YES' : 'NO');
      
      // Get updated user list
      const usersAfterDelete = await getAllUsers();
      console.log('📋 Total users after deletion:', usersAfterDelete.length);
    }

    res.status(200).json({
      success: true,
      message: 'Delete test completed - check server logs for details',
      totalUsers: users.length,
      testUserFound: !!testUser
    });

  } catch (error) {
    console.error('Test delete error:', error);
    res.status(500).json({
      error: 'Test failed',
      details: error.message
    });
  }
} 