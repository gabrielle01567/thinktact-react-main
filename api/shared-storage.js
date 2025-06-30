import { put, del, list, head } from '@vercel/blob';

// Shared storage that works in both development and production
let devStorage = new Map();

// Helper functions for user management
export const findUserByEmail = async (email) => {
  const USERS_BLOB_PREFIX = 'users/';
  const blobName = `${USERS_BLOB_PREFIX}${btoa(email).replace(/[^a-zA-Z0-9]/g, '')}.json`;
  
  // Check if we're in development mode (no BLOB_READ_WRITE_TOKEN)
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    const user = devStorage.get(blobName);
    console.log(`Looking for user with email: ${email}, blobName: ${blobName}, found:`, !!user);
    return user;
  }
  
  // Production mode - use Vercel Blob
  try {
    const { blob } = await head(blobName);
    if (blob) {
      const response = await fetch(blob.url);
      const user = await response.json();
      console.log(`Looking for user with email: ${email}, blobName: ${blobName}, found: true`);
      return user;
    }
    console.log(`Looking for user with email: ${email}, blobName: ${blobName}, found: false`);
    return null;
  } catch (error) {
    console.log(`Looking for user with email: ${email}, blobName: ${blobName}, found: false (error: ${error.message})`);
    return null;
  }
};

export const findUserById = async (userId) => {
  // Check if we're in development mode
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    for (const [key, user] of devStorage.entries()) {
      if (user.id === userId) {
        return { user, key };
      }
    }
    return { user: null, key: null };
  }
  
  // Production mode - list all users and find by ID
  try {
    const { blobs } = await list({ prefix: 'users/' });
    for (const blob of blobs) {
      const response = await fetch(blob.url);
      const user = await response.json();
      if (user.id === userId) {
        return { user, key: blob.pathname };
      }
    }
    return { user: null, key: null };
  } catch (error) {
    console.error('Error finding user by ID:', error);
    return { user: null, key: null };
  }
};

export const saveUser = async (blobName, userData) => {
  console.log(`Saving user with blobName: ${blobName}`);
  
  // Check if we're in development mode
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    devStorage.set(blobName, userData);
    return;
  }
  
  // Production mode - save to Vercel Blob
  try {
    const jsonData = JSON.stringify(userData);
    await put(blobName, jsonData, {
      access: 'public',
      addRandomSuffix: false
    });
  } catch (error) {
    console.error('Error saving user to blob:', error);
    throw error;
  }
};

export const deleteUser = async (blobName) => {
  // Check if we're in development mode
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    devStorage.delete(blobName);
    return;
  }
  
  // Production mode - delete from Vercel Blob
  try {
    await del(blobName);
  } catch (error) {
    console.error('Error deleting user from blob:', error);
    throw error;
  }
};

// Create admin user if it doesn't exist
export const createAdminUser = async () => {
  const adminEmail = 'alex.hawke54@gmail.com';
  console.log('Creating admin user for:', adminEmail);
  
  const adminUser = await findUserByEmail(adminEmail);
  
  if (!adminUser) {
    console.log('Admin user not found, creating new one...');
    const bcrypt = await import('bcryptjs');
    const SALT_ROUNDS = 12;
    
    // Generate blob name for admin user
    const USERS_BLOB_PREFIX = 'users/';
    const blobName = `${USERS_BLOB_PREFIX}${btoa(adminEmail).replace(/[^a-zA-Z0-9]/g, '')}.json`;
    
    // Hash the default password
    const hashedPassword = await bcrypt.default.hash('admin123', SALT_ROUNDS);
    
    // Create admin user data
    const adminUserData = {
      id: 'admin-user-001',
      firstName: 'Alex',
      lastName: 'Hawke',
      email: adminEmail,
      passwordHash: hashedPassword,
      securityQuestion: 'What is your favorite color?',
      securityAnswer: 'blue',
      verified: true,
      isAdmin: true,
      blocked: false,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString()
    };
    
    // Save admin user
    await saveUser(blobName, adminUserData);
    console.log('✅ Admin user created successfully');
    console.log('📧 Email: alex.hawke54@gmail.com');
    console.log('🔑 Password: admin123');
    console.log('Blob name:', blobName);
    
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      console.log('Total users in storage:', devStorage.size);
    }
  } else {
    console.log('✅ Admin user already exists');
    console.log('📧 Email: alex.hawke54@gmail.com');
    console.log('🔑 Password: admin123');
  }
};

export const toggleAdminStatus = async (userId, isAdmin) => {
  // Check if we're in development mode
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    for (const [key, user] of devStorage.entries()) {
      if (user.id === userId) {
        devStorage.set(key, { ...user, isAdmin });
        return true;
      }
    }
    return false;
  }
  
  // Production mode - find and update user
  try {
    const { user, key } = await findUserById(userId);
    if (user && key) {
      const updatedUser = { ...user, isAdmin };
      await saveUser(key, updatedUser);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error toggling admin status:', error);
    return false;
  }
};

// Get all users (for admin panel)
export const getAllUsers = async () => {
  // Check if we're in development mode
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return Array.from(devStorage.values());
  }
  
  // Production mode - list all users from blob
  try {
    const { blobs } = await list({ prefix: 'users/' });
    const users = [];
    for (const blob of blobs) {
      const response = await fetch(blob.url);
      const user = await response.json();
      users.push(user);
    }
    return users;
  } catch (error) {
    console.error('Error getting all users:', error);
    return [];
  }
}; 