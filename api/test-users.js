import { getAllUsers } from './shared-storage.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('🔍 Testing users endpoint');
    console.log('🔍 Environment check - BLOB_READ_WRITE_TOKEN exists:', !!process.env.BLOB_READ_WRITE_TOKEN);
    
    const users = await getAllUsers();
    
    console.log(`🔍 Found ${users.length} users in storage`);
    
    const userInfo = users.map(user => ({
      email: user.email,
      verified: user.verified,
      hasToken: !!user.verificationToken,
      token: user.verificationToken ? user.verificationToken.substring(0, 10) + '...' : null,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin
    }));
    
    console.log('🔍 User details:', userInfo);
    
    res.status(200).json({
      success: true,
      count: users.length,
      users: userInfo,
      environment: process.env.BLOB_READ_WRITE_TOKEN ? 'production' : 'development'
    });

  } catch (error) {
    console.error('❌ Error testing users:', error);
    res.status(500).json({ error: 'Failed to test users' });
  }
} 