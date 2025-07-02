import fetch from 'node-fetch';

const BACKEND_URL = 'https://backendv2-96cvorwea-gabrielle-shands-projects.vercel.app';

async function runMigrationViaBackend() {
  console.log('🔧 Running Security Fields Migration via Backend');
  console.log('===============================================');
  
  try {
    // First, let's check if the columns already exist by testing the users endpoint
    console.log('📊 Checking current users endpoint...');
    const usersResponse = await fetch(`${BACKEND_URL}/api/admin/users`);
    
    if (usersResponse.ok) {
      const usersData = await usersResponse.json();
      console.log('✅ Users endpoint working');
      console.log(`📥 Found ${usersData.users ? usersData.users.length : 0} users`);
      
      if (usersData.users && usersData.users.length > 0) {
        const firstUser = usersData.users[0];
        console.log('🔍 Checking if security fields exist...');
        console.log('User fields:', Object.keys(firstUser));
        
        if (firstUser.securityQuestion !== undefined) {
          console.log('✅ Security fields already exist!');
          return;
        } else {
          console.log('❌ Security fields missing - need to run migration');
        }
      }
    }
    
    // Since we can't directly run SQL via the backend API, let's create a migration endpoint
    console.log('🚀 Creating migration endpoint...');
    
    // For now, let's just test if the backend can connect to Supabase
    const testResponse = await fetch(`${BACKEND_URL}/api/test`);
    
    if (testResponse.ok) {
      console.log('✅ Backend is working and can connect to Supabase');
      console.log('📝 You need to add a migration endpoint to your backend');
      console.log('   or run the migration directly in your Supabase dashboard');
    } else {
      console.log('❌ Backend test failed');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

runMigrationViaBackend(); 