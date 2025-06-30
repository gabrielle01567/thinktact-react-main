// Development storage (in-memory Map)
let devStorage = new Map();

// Helper functions for user management
export const findUserByEmail = async (email) => {
  const normalizedEmail = email.toLowerCase().trim();
  
  console.log(`🔍 Looking for user with email: "${email}" -> normalized: "${normalizedEmail}"`);
  
  // Development mode - use local Map storage
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    // Search through all users in dev storage
    for (const [key, user] of devStorage.entries()) {
      if (user.email === normalizedEmail) {
        console.log(`🔍 Development mode - found: true`);
        return user;
      }
    }
    console.log(`🔍 Development mode - found: false`);
    return null;
  }
  
  // Production mode - use Vercel Blob
  try {
    const { put, del, list, head } = await import('@vercel/blob');
    const USERS_BLOB_PREFIX = 'users/';
    const blobName = `${USERS_BLOB_PREFIX}${btoa(normalizedEmail).replace(/[^a-zA-Z0-9]/g, '')}.json`;
    
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
  // Development mode
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    for (const [key, user] of devStorage.entries()) {
      if (user.id === userId) {
        return { user, key };
      }
    }
    return { user: null, key: null };
  }
  
  // Production mode
  try {
    const { list } = await import('@vercel/blob');
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
  
  // Ensure email is normalized in user data
  const normalizedUserData = {
    ...userData,
    email: normalizedEmail
  };
  
  console.log(`💾 Saving user: "${normalizedEmail}"`);
  
  // Development mode - use local Map storage
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    // Use email as key for easy lookup
    devStorage.set(normalizedEmail, normalizedUserData);
    console.log(`💾 Development mode - saved successfully. Total users: ${devStorage.size}`);
    return;
  }
  
  // Production mode - save to Vercel Blob
  try {
    const { put } = await import('@vercel/blob');
    const USERS_BLOB_PREFIX = 'users/';
    const blobName = `${USERS_BLOB_PREFIX}${btoa(normalizedEmail).replace(/[^a-zA-Z0-9]/g, '')}.json`;
    
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
  
  // Development mode
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    devStorage.delete(normalizedEmail);
    return;
  }
  
  // Production mode
  try {
    const { del } = await import('@vercel/blob');
    const USERS_BLOB_PREFIX = 'users/';
    const blobName = `${USERS_BLOB_PREFIX}${btoa(normalizedEmail).replace(/[^a-zA-Z0-9]/g, '')}.json`;
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
      isSuperUser: true,
      blocked: false,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString()
    };
    
    // Save admin user
    await saveUser(adminUserData);
    console.log('✅ Admin user created successfully');
    console.log('📧 Email: alex.hawke54@gmail.com');
    console.log('🔑 Password: admin123');
    
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      console.log('Total users in dev storage:', devStorage.size);
    }
  } else {
    console.log('✅ Admin user already exists');
    console.log('📧 Email: alex.hawke54@gmail.com');
    console.log('🔑 Password: admin123');
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
    return { success: true, message: 'User upgraded to Super User' };
  } else {
    console.log('User does not exist, creating new super user...');
    const bcrypt = await import('bcryptjs');
    const SALT_ROUNDS = 12;
    
    // Hash the password
    const hashedPassword = await bcrypt.default.hash(password, SALT_ROUNDS);
    
    // Create super user data
    const superUserData = {
      id: `super-user-${Date.now()}`,
      firstName: firstName || 'Super',
      lastName: lastName || 'User',
      email: email.toLowerCase().trim(),
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
    return { success: true, message: 'Super User created successfully' };
  }
};

// Toggle admin status
export const toggleAdminStatus = async (userId, isAdmin) => {
  const { user } = await findUserById(userId);
  
  if (!user) {
    throw new Error('User not found');
  }
  
  const updatedUser = {
    ...user,
    isAdmin: isAdmin,
    lastLogin: new Date().toISOString()
  };
  
  await saveUser(updatedUser);
  return updatedUser;
};

// Get all users
export const getAllUsers = async () => {
  // Development mode
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    const users = Array.from(devStorage.values());
    console.log(`📊 Development mode - returning ${users.length} users`);
    return users;
  }
  
  // Production mode
  try {
    const { list } = await import('@vercel/blob');
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
    
    console.log(`📊 Production mode - returning ${users.length} users`);
    return users;
  } catch (error) {
    console.error('Error getting all users:', error);
    return [];
  }
};

// Toggle user status (blocked/unblocked)
export const toggleUserStatus = async (userId, blocked) => {
  const { user } = await findUserById(userId);
  
  if (!user) {
    throw new Error('User not found');
  }
  
  const updatedUser = {
    ...user,
    blocked: blocked,
    lastLogin: new Date().toISOString()
  };
  
  await saveUser(updatedUser);
  return updatedUser;
};

// Reset user password
export const resetUserPassword = async (userId, newPassword) => {
  const { user } = await findUserById(userId);
  
  if (!user) {
    throw new Error('User not found');
  }
  
  const bcrypt = await import('bcryptjs');
  const SALT_ROUNDS = 12;
  const hashedPassword = await bcrypt.default.hash(newPassword, SALT_ROUNDS);
  
  const updatedUser = {
    ...user,
    passwordHash: hashedPassword,
    lastLogin: new Date().toISOString()
  };
  
  await saveUser(updatedUser);
  return updatedUser;
};

// Export devStorage for development debugging
export { devStorage }; 