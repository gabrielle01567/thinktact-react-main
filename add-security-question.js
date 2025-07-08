// Script to add security question and answer to user alex.hawke54@gmail.com
import { findUserByEmail, updateUser } from './backend/api/supabase-service.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function addSecurityQuestion() {
  console.log('🔧 Adding security question to alex.hawke54@gmail.com');
  
  try {
    // Find the user
    const user = await findUserByEmail('alex.hawke54@gmail.com');
    
    if (!user) {
      console.log('❌ User not found');
      return;
    }
    
    console.log('✅ User found:', user.email);
    console.log('📝 Current security question:', user.securityQuestion || 'None set');
    
    // Define the security question and answer
    const securityQuestion = "What was the name of your first pet?";
    const securityAnswer = "Fluffy"; // You can change this to whatever you want
    
    console.log('🔐 Setting security question:', securityQuestion);
    console.log('🔐 Setting security answer:', securityAnswer);
    
    // Update the user with security question and answer
    const updatedUser = await updateUser(user.id, {
      security_question: securityQuestion,
      security_answer: securityAnswer
    });
    
    if (updatedUser) {
      console.log('✅ Security question and answer added successfully!');
      console.log('📋 Updated user info:');
      console.log('   Email:', updatedUser.email);
      console.log('   Security Question:', updatedUser.security_question);
      console.log('   Security Answer:', updatedUser.security_answer);
    } else {
      console.log('❌ Failed to update user');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Run the script
addSecurityQuestion().catch(console.error); 