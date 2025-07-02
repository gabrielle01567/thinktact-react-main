import bcrypt from 'bcryptjs';
import { createUser } from './api/supabase-service.js';

async function createAlexAccount() {
  try {
    const userData = {
      email: 'alex.hawke54@gmail.com',
      password: 'your-new-password',
      name: 'Alex Hawke',
      isVerified: true,
      isAdmin: true
    };
    
    const result = await createUser(userData);
    if (result.success) {
      console.log('✅ Alex account created successfully!');
      console.log('Email: alex.hawke54@gmail.com');
      console.log('Password: your-new-password');
      console.log('Admin: true');
    } else {
      console.error('❌ Error creating account:', result.error);
    }
    
  } catch (error) {
    console.error('❌ Error creating account:', error);
  }
}

createAlexAccount(); 