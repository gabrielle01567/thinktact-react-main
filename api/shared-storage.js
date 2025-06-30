// Development storage (in-memory Map)
let devStorage = new Map();

// Simple blob name generation - just use the email as filename
const getBlobName = (email) => {
  const normalizedEmail = email.toLowerCase().trim();
  // Simple encoding: replace special chars with underscores
  const safeEmail = normalizedEmail.replace(/[^a-zA-Z0-9]/g, '_');
  return `users/${safeEmail}.json`;
};

// Helper functions for user management
export const findUserByEmail = async (email) => {
  const normalizedEmail = email.toLowerCase().trim();
  
  // Development mode - use local Map storage
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    const user = devStorage.get(normalizedEmail);
    return user || null;
  }
  
  // Production mode - use Vercel Blob
  try {
    const { head } = await import('@vercel/blob');
    const blobName = getBlobName(normalizedEmail);
    
    const { blob } = await head(blobName);
    if (blob) {
      const response = await fetch(blob.url);
      const user = await response.json();
      return user;
    }
    return null;
  } catch (error) {
    console.error('Error finding user by email:', error);
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
  
  // Development mode - use local Map storage
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    devStorage.set(normalizedEmail, normalizedUserData);
    return;
  }
  
  // Production mode - save to Vercel Blob
  try {
    const { put } = await import('@vercel/blob');
    const blobName = getBlobName(normalizedEmail);
    
    const jsonData = JSON.stringify(normalizedUserData);
    await put(blobName, jsonData, {
      access: 'public',
      addRandomSuffix: false,
      allowOverwrite: true
    });
  } catch (error) {
    console.error('Error saving user to blob:', error);
    throw error;
  }
};

// Delete user by email
export const deleteUser = async (email) => {
  const normalizedEmail = email.toLowerCase().trim();
  
  // Development mode
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    devStorage.delete(normalizedEmail);
    return true;
  }
  
  // Production mode
  try {
    const { del } = await import('@vercel/blob');
    const blobName = getBlobName(normalizedEmail);
    await del(blobName);
    return true;
  } catch (error) {
    console.error('Error deleting user:', error);
    return false;
  }
};

// Find user by verification token (for email verification)
export const findUserByVerificationToken = async (token) => {
  // Development mode
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    for (const [key, user] of devStorage.entries()) {
      if (user.verificationToken === token) {
        return user;
      }
    }
    return null;
  }
  
  // Production mode
  try {
    const { list } = await import('@vercel/blob');
    const { blobs } = await list({ prefix: 'users/' });
    
    for (const blob of blobs) {
      const response = await fetch(blob.url);
      const user = await response.json();
      if (user.verificationToken === token) {
        return user;
      }
    }
    return null;
  } catch (error) {
    console.error('Error finding user by verification token:', error);
    return null;
  }
};

// Find user by reset token (for password reset)
export const findUserByResetToken = async (token) => {
  // Development mode
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    for (const [key, user] of devStorage.entries()) {
      if (user.resetToken === token) {
        return user;
      }
    }
    return null;
  }
  
  // Production mode
  try {
    const { list } = await import('@vercel/blob');
    const { blobs } = await list({ prefix: 'users/' });
    
    for (const blob of blobs) {
      const response = await fetch(blob.url);
      const user = await response.json();
      if (user.resetToken === token) {
        return user;
      }
    }
    return null;
  } catch (error) {
    console.error('Error finding user by reset token:', error);
    return null;
  }
};

// Create admin user if it doesn't exist
export const createAdminUser = async () => {
  const adminEmail = 'alex.hawke54@gmail.com';
  
  const adminUser = await findUserByEmail(adminEmail);
  
  if (!adminUser) {
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
  }
};

// Get all users (for admin purposes)
export const getAllUsers = async () => {
  // Development mode
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return Array.from(devStorage.values());
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
    
    return users;
  } catch (error) {
    console.error('Error getting all users:', error);
    return [];
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