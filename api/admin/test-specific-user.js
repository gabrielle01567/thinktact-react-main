import { findUserByEmail, getAllUsers } from '../shared-storage.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const testEmail = 'ajhawke.consulting@gmail.com';
    const normalizedEmail = testEmail.toLowerCase().trim();
    
    console.log(`🔍 Testing specific user: ${testEmail}`);
    console.log(`Normalized email: ${normalizedEmail}`);
    
    // Test blob name generation
    const safeEmail = normalizedEmail.replace(/[^a-zA-Z0-9]/g, '_');
    const newBlobName = `users/${safeEmail}.json`;
    const encodedEmail = Buffer.from(normalizedEmail).toString('base64');
    const oldBlobName = `users/${encodedEmail.replace(/[^a-zA-Z0-9]/g, '')}.json`;
    
    console.log(`New blob name: ${newBlobName}`);
    console.log(`Old blob name: ${oldBlobName}`);
    
    // Test findUserByEmail
    console.log(`Testing findUserByEmail...`);
    const userByEmail = await findUserByEmail(testEmail);
    console.log(`findUserByEmail result:`, userByEmail ? 'FOUND' : 'NOT FOUND');
    
    if (userByEmail) {
      console.log('User details:', {
        id: userByEmail.id,
        email: userByEmail.email,
        firstName: userByEmail.firstName,
        lastName: userByEmail.lastName,
        verified: userByEmail.verified,
        hasPasswordHash: !!userByEmail.passwordHash
      });
    }
    
    // Test getAllUsers
    console.log(`Testing getAllUsers...`);
    const allUsers = await getAllUsers();
    const userInAllUsers = allUsers.find(u => u.email === normalizedEmail);
    console.log(`User in getAllUsers:`, userInAllUsers ? 'FOUND' : 'NOT FOUND');
    
    if (userInAllUsers) {
      console.log('User details from getAllUsers:', {
        id: userInAllUsers.id,
        email: userInAllUsers.email,
        firstName: userInAllUsers.firstName,
        lastName: userInAllUsers.lastName,
        verified: userInAllUsers.verified,
        hasPasswordHash: !!userInAllUsers.passwordHash
      });
    }
    
    // Test blob existence
    console.log(`Testing blob existence...`);
    const { head, list } = await import('@vercel/blob');
    
    // Check new blob name
    try {
      const newResult = await head(newBlobName);
      console.log(`New blob exists:`, !!newResult.blob);
    } catch (error) {
      console.log(`New blob not found: ${newBlobName}`);
    }
    
    // Check old blob name
    try {
      const oldResult = await head(oldBlobName);
      console.log(`Old blob exists:`, !!oldResult.blob);
    } catch (error) {
      console.log(`Old blob not found: ${oldBlobName}`);
    }
    
    // List all blobs and find the actual one
    console.log(`Listing all blobs...`);
    const { blobs } = await list({ prefix: 'users/' });
    const matchingBlobs = blobs.filter(blob => {
      try {
        return blob.pathname.includes('ajhawke') || blob.pathname.includes('YWpoYXdrZS5jb25zdWx0aW5n');
      } catch (error) {
        return false;
      }
    });
    
    console.log(`Found ${matchingBlobs.length} matching blobs:`);
    matchingBlobs.forEach(blob => {
      console.log(`  - ${blob.pathname}`);
    });
    
    res.status(200).json({
      success: true,
      email: testEmail,
      normalizedEmail: normalizedEmail,
      newBlobName: newBlobName,
      oldBlobName: oldBlobName,
      findUserByEmail: {
        found: !!userByEmail,
        user: userByEmail ? {
          id: userByEmail.id,
          email: userByEmail.email,
          firstName: userByEmail.firstName,
          lastName: userByEmail.lastName,
          verified: userByEmail.verified,
          hasPasswordHash: !!userByEmail.passwordHash
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
          hasPasswordHash: !!userInAllUsers.passwordHash
        } : null
      },
      matchingBlobs: matchingBlobs.map(blob => blob.pathname)
    });

  } catch (error) {
    console.error('Test specific user error:', error);
    res.status(500).json({
      error: 'Test failed',
      details: error.message
    });
  }
} 