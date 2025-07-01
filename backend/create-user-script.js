import bcrypt from 'bcryptjs';
import { saveUser } from './api/shared-storage.js';

async function createAlexAccount() {
  try {
    const hashedPassword = bcrypt.hashSync('your-new-password', 10);
    
    const user = {
      id: 'user-alex-' + Date.now(),
      email: 'alex.hawke54@gmail.com',
      password: hashedPassword,
      name: 'Alex Hawke',
      isVerified: true,
      isAdmin: true,
      createdAt: new Date().toISOString()
    };
    
    await saveUser(user);
    console.log('✅ Alex account created successfully!');
    console.log('Email: alex.hawke54@gmail.com');
    console.log('Password: your-new-password');
    console.log('Admin: true');
    
  } catch (error) {
    console.error('❌ Error creating account:', error);
  }
}

createAlexAccount(); 