async function testDatabaseTables() {
  const backendUrl = 'https://backendv2-ruddy.vercel.app/api';
  
  console.log('🔍 Testing database tables and contents...');
  console.log('Backend URL:', backendUrl);
  
  try {
    // Test 1: Check what tables exist
    console.log('\n📋 Test 1: Checking database structure...');
    const structureResponse = await fetch(`${backendUrl}/debug-supabase-config`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (structureResponse.ok) {
      const data = await structureResponse.json();
      console.log('✅ Database structure:', data.config.allColumnsTest);
    }
    
    // Test 2: Try to find users with different table names
    console.log('\n📋 Test 2: Testing different user table names...');
    const tableNames = ['users', 'user', 'profiles', 'auth_users'];
    
    for (const tableName of tableNames) {
      try {
        console.log(`\n📋 Testing table: ${tableName}`);
        const response = await fetch(`${backendUrl}/test-users-table?table=${tableName}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log(`✅ ${tableName} table found:`, data);
        } else {
          console.log(`❌ ${tableName} table not found or error`);
        }
      } catch (error) {
        console.log(`❌ Error testing ${tableName}:`, error.message);
      }
    }
    
  } catch (error) {
    console.error('❌ Error testing database tables:', error.message);
  }
}

testDatabaseTables(); 