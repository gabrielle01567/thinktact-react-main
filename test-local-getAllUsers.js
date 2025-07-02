import { getAllUsers } from './backend/api/supabase-service.js';

async function testLocalGetAllUsers() {
  console.log('🔍 Testing Local getAllUsers Function');
  console.log('====================================');
  
  try {
    console.log('📡 Calling getAllUsers...');
    const users = await getAllUsers();
    console.log('📊 Result:', JSON.stringify(users, null, 2));
    console.log(`📊 User count: ${users.length}`);
    
    if (users.length > 0) {
      console.log('✅ Local getAllUsers is working correctly');
    } else {
      console.log('⚠️ Local getAllUsers returned empty array (no users in local DB)');
    }
    
  } catch (error) {
    console.error('❌ Error testing local getAllUsers:', error);
  }
}

testLocalGetAllUsers(); 