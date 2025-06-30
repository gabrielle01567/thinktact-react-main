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
    const { head, list } = await import('@vercel/blob');
    
    // Try new blob name format first
    const safeEmail = normalizedEmail.replace(/[^a-zA-Z0-9]/g, '_');
    const newBlobName = `users/${safeEmail}.json`;
    
    console.log(`🔍 Trying new blob name: "${newBlobName}"`);
    let { blob } = await head(newBlobName);
    
    if (blob) {
      const response = await fetch(blob.url);
      const user = await response.json();
      console.log(`🔍 Found user with new blob name`);
      return user;
    }
    
    // Try old blob name format as fallback
    const encodedEmail = Buffer.from(normalizedEmail).toString('base64');
    const oldBlobName = `users/${encodedEmail.replace(/[^a-zA-Z0-9]/g, '')}.json`;
    
    console.log(`🔍 Trying old blob name: "${oldBlobName}"`);
    const oldResult = await head(oldBlobName);
    
    if (oldResult.blob) {
      const response = await fetch(oldResult.blob.url);
      const user = await response.json();
      console.log(`🔍 Found user with old blob name`);
      return user;
    }
    
    // As a last resort, search through all users
    console.log(`🔍 Searching through all users as fallback`);
    const { blobs } = await list({ prefix: 'users/' });
    for (const blob of blobs) {
      const response = await fetch(blob.url);
      const user = await response.json();
      if (user.email === normalizedEmail) {
        console.log(`🔍 Found user in all users search`);
        return user;
      }
    }
    
    console.log(`🔍 User not found with any method`);
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
    const { put, head, del } = await import('@vercel/blob');
    
    // First, try to find existing blob with old format
    const encodedEmail = Buffer.from(normalizedEmail).toString('base64');
    const oldBlobName = `users/${encodedEmail.replace(/[^a-zA-Z0-9]/g, '')}.json`;
    
    // Check if old blob exists
    try {
      const oldResult = await head(oldBlobName);
      if (oldResult.blob) {
        // Delete old blob and save with new format
        await del(oldBlobName);
        console.log(`🔄 Migrated user from old blob format: ${oldBlobName}`);
      }
    } catch (error) {
      // Old blob doesn't exist, continue with new format
    }
    
    // Save with new blob name format
    const safeEmail = normalizedEmail.replace(/[^a-zA-Z0-9]/g, '_');
    const newBlobName = `users/${safeEmail}.json`;
    
    const jsonData = JSON.stringify(normalizedUserData);
    await put(newBlobName, jsonData, {
      access: 'public',
      addRandomSuffix: false,
      allowOverwrite: true
    });
    
    console.log(`💾 Saved user with blob name: ${newBlobName}`);
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
    const { del, head } = await import('@vercel/blob');
    let deleted = false;
    
    // Try new blob name format first
    const safeEmail = normalizedEmail.replace(/[^a-zA-Z0-9]/g, '_');
    const newBlobName = `users/${safeEmail}.json`;
    
    console.log(`🗑️ Trying to delete with new blob name: "${newBlobName}"`);
    try {
      const result = await head(newBlobName);
      if (result.blob) {
        await del(newBlobName);
        console.log(`✅ Deleted user with new blob name: ${newBlobName}`);
        deleted = true;
      }
    } catch (error) {
      console.log(`❌ New blob name not found: ${newBlobName}`);
    }
    
    // Try old blob name format as fallback
    const encodedEmail = Buffer.from(normalizedEmail).toString('base64');
    const oldBlobName = `users/${encodedEmail.replace(/[^a-zA-Z0-9]/g, '')}.json`;
    
    console.log(`🗑️ Trying to delete with old blob name: "${oldBlobName}"`);
    try {
      const result = await head(oldBlobName);
      if (result.blob) {
        await del(oldBlobName);
        console.log(`✅ Deleted user with old blob name: ${oldBlobName}`);
        deleted = true;
      }
    } catch (error) {
      console.log(`❌ Old blob name not found: ${oldBlobName}`);
    }
    
    // As a last resort, search through all users and delete by email match
    if (!deleted) {
      console.log(`🔍 Searching through all users to find and delete by email match`);
      const { list } = await import('@vercel/blob');
      const { blobs } = await list({ prefix: 'users/' });
      
      for (const blob of blobs) {
        try {
          const response = await fetch(blob.url);
          const user = await response.json();
          if (user.email === normalizedEmail) {
            await del(blob.pathname);
            console.log(`✅ Deleted user found in all users search: ${blob.pathname}`);
            deleted = true;
            break;
          }
        } catch (error) {
          console.error(`Error checking blob ${blob.pathname}:`, error);
        }
      }
    }
    
    if (deleted) {
      console.log(`✅ User deletion completed successfully for: ${normalizedEmail}`);
      return true;
    } else {
      console.log(`❌ User not found for deletion: ${normalizedEmail}`);
      return false;
    }
    
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