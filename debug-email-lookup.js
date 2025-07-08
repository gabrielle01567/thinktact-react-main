// Debug script to test email lookup for alex.hawke54@gmail.com
import { findUserByEmail, getAllUsers } from './backend/api/supabase-service.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function debugEmailLookup() {
  console.log('🔍 Debugging email lookup for alex.hawke54@gmail.com');
  
  try {
    // Test different email formats
    const testEmails = [
      'alex.hawke54@gmail.com',
      'ALEX.HAWKE54@GMAIL.COM',
      'Alex.Hawke54@gmail.com',
      ' alex.hawke54@gmail.com ', // with spaces
      'alex.hawke54@gmail.com  ', // trailing spaces
      '  alex.hawke54@gmail.com'  // leading spaces
    ];
    
    console.log('\n📧 Testing different email formats:');
    
    for (const email of testEmails) {
      console.log(`\n🔍 Testing: "${email}"`);
      const user = await findUserByEmail(email);
      console.log(`   Result: ${user ? 'FOUND' : 'NOT FOUND'}`);
      if (user) {
        console.log(`   User ID: ${user.id}`);
        console.log(`   Stored email: "${user.email}"`);
        console.log(`   Name: "${user.name}"`);
      }
    }
    
    // Get all users to see what's actually in the database
    console.log('\n📋 All users in database:');
    const allUsers = await getAllUsers();
    console.log(`Total users: ${allUsers.length}`);
    
    allUsers.forEach((user, index) => {
      console.log(`${index + 1}. ID: ${user.id}, Email: "${user.email}", Name: "${user.name}"`);
    });
    
    // Look for any variations of the email
    console.log('\n🔍 Searching for any email containing "alex.hawke54":');
    const matchingUsers = allUsers.filter(user => 
      user.email.toLowerCase().includes('alex.hawke54')
    );
    
    if (matchingUsers.length > 0) {
      matchingUsers.forEach(user => {
        console.log(`   Found: "${user.email}" (ID: ${user.id})`);
      });
    } else {
      console.log('   No matching users found');
    }
    
  } catch (error) {
    console.error('❌ Error during debug:', error);
  }
}

// Run the debug
debugEmailLookup().catch(console.error); 