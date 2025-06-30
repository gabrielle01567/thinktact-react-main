import { put, del, list, head } from '@vercel/blob';

// Shared storage that works in both development and production
let devStorage = new Map();

// Helper functions for user management
export const findUserByEmail = async (email) => {
  const USERS_BLOB_PREFIX = 'users/';
  const normalizedEmail = email.toLowerCase().trim();
  const blobName = `${USERS_BLOB_PREFIX}${btoa(normalizedEmail).replace(/[^a-zA-Z0-9]/g, '')}.json`;
  
  console.log(`🔍 Looking for user with email: "${email}" -> normalized: "${normalizedEmail}", blobName: ${blobName}`);
  
  // Check if we're in development mode (no BLOB_READ_WRITE_TOKEN)
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    const user = devStorage.get(blobName);
    console.log(`🔍 Development mode - found: ${!!user}`);
    return user;
  }
  
  // Production mode - use Vercel Blob
  try {
    const { blob } = await head(blobName);
    if (blob) {
      const response = await fetch(blob.url);
      const user = await response.json();
      console.log(`🔍 Production mode - found: true`);
      return user;
    }
    console.log(`🔍 Production mode - found: false`);
    return null;
  } catch (error) {
    console.log(`🔍 Production mode - found: false (error: ${error.message})`);
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

export const saveUser = async (userData) => {
  // Always normalize email for consistent storage
  const normalizedEmail = userData.email.toLowerCase().trim();
  const USERS_BLOB_PREFIX = 'users/';
  const blobName = `${USERS_BLOB_PREFIX}${btoa(normalizedEmail).replace(/[^a-zA-Z0-9]/g, '')}.json`;
  
  // Ensure email is normalized in user data
  const normalizedUserData = {
    ...userData,
    email: normalizedEmail
  };
  
  console.log(`💾 Saving user: "${normalizedEmail}" with blobName: ${blobName}`);
  
  // Check if we're in development mode
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    devStorage.set(blobName, normalizedUserData);
    console.log(`💾 Development mode - saved successfully`);
    return;
  }
  
  // Production mode - save to Vercel Blob
  try {
    const jsonData = JSON.stringify(normalizedUserData);
    await put(blobName, jsonData, {
      access: 'public',
      addRandomSuffix: false,
      allowOverwrite: true
    });
    console.log(`💾 Production mode - saved successfully`);
  } catch (error) {
    console.error('Error saving user to blob:', error);
    throw error;
  }
};

export const deleteUser = async (email) => {
  const normalizedEmail = email.toLowerCase().trim();
  const USERS_BLOB_PREFIX = 'users/';
  const blobName = `${USERS_BLOB_PREFIX}${btoa(normalizedEmail).replace(/[^a-zA-Z0-9]/g, '')}.json`;
  
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
      isSuperUser: true, // Super user has admin privileges plus more
      blocked: false,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString()
    };
    
    // Save admin user
    await saveUser(adminUserData);
    console.log('✅ Super User created successfully');
    console.log('📧 Email: alex.hawke54@gmail.com');
    console.log('🔑 Password: admin123');
    console.log('👑 Role: Super User (above Admin)');
    
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      console.log('Total users in storage:', devStorage.size);
    }
  } else {
    console.log('✅ Super User already exists');
    console.log('📧 Email: alex.hawke54@gmail.com');
    console.log('🔑 Password: admin123');
    console.log('👑 Role: Super User (above Admin)');
  }
};

// Create super user function
export const createSuperUser = async (email, password, firstName, lastName) => {
  console.log('Creating super user for:', email);
  
  const existingUser = await findUserByEmail(email);
  
  if (existingUser) {
    console.log('User already exists, updating to super user...');
    const bcrypt = await import('bcryptjs');
    const SALT_ROUNDS = 12;
    
    // Hash the password
    const hashedPassword = await bcrypt.default.hash(password, SALT_ROUNDS);
    
    // Update user to super user
    const superUserData = {
      ...existingUser,
      passwordHash: hashedPassword,
      firstName: firstName || existingUser.firstName,
      lastName: lastName || existingUser.lastName,
      isAdmin: true,
      isSuperUser: true,
      verified: true,
      lastLogin: new Date().toISOString()
    };
    
    // Save super user
    await saveUser(superUserData);
    console.log('✅ User upgraded to Super User successfully');
    console.log('📧 Email:', email);
    console.log('👑 Role: Super User (above Admin)');
    return true;
  } else {
    console.log('Creating new super user...');
    const bcrypt = await import('bcryptjs');
    const SALT_ROUNDS = 12;
    
    // Hash the password
    const hashedPassword = await bcrypt.default.hash(password, SALT_ROUNDS);
    
    // Create super user data
    const superUserData = {
      id: `super-user-${Date.now()}`,
      firstName: firstName || 'Super',
      lastName: lastName || 'User',
      email: email,
      passwordHash: hashedPassword,
      securityQuestion: 'What is your favorite color?',
      securityAnswer: 'blue',
      verified: true,
      isAdmin: true,
      isSuperUser: true,
      blocked: false,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString()
    };
    
    // Save super user
    await saveUser(superUserData);
    console.log('✅ Super User created successfully');
    console.log('📧 Email:', email);
    console.log('👑 Role: Super User (above Admin)');
    return true;
  }
};

export const toggleAdminStatus = async (userId, isAdmin) => {
  // Check if we're in development mode
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    for (const [key, user] of devStorage.entries()) {
      if (user.id === userId) {
        const updatedUser = { ...user, isAdmin };
        devStorage.set(key, updatedUser);
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
      await saveUser(updatedUser);
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
  
  // Production mode - get all users from Vercel Blob
  try {
    const { blobs } = await list({ prefix: 'users/' });
    const users = [];
    
    for (const blob of blobs) {
      try {
        const response = await fetch(blob.url);
        const user = await response.json();
        users.push(user);
      } catch (error) {
        console.error(`Error fetching user from ${blob.pathname}:`, error);
      }
    }
    
    return users;
  } catch (error) {
    console.error('Error getting all users:', error);
    return [];
  }
};

// Export devStorage for development debugging
export { devStorage }; 