import { BlobServiceClient } from '@azure/storage-blob';

export function getBlobClient() {
  const connStr = process.env.AZURE_STORAGE_CONNECTION_STRING;
  if (!connStr) throw new Error('AZURE_STORAGE_CONNECTION_STRING not set');
  return BlobServiceClient.fromConnectionString(connStr);
}

// Development storage (in-memory Map)
let devStorage = new Map();

// Normalized blob name generation - single source of truth
const getBlobName = (email) => {
  const normalizedEmail = email.toLowerCase().trim();
  // Consistent encoding: replace special chars with underscores
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
    
    // Use consistent blob name format
    const blobName = getBlobName(normalizedEmail);
    
    console.log(`🔍 Looking for user with blob name: "${blobName}"`);
    const result = await head(blobName);
    
    if (result.blob) {
      const response = await fetch(result.blob.url);
      const user = await response.json();
      console.log(`🔍 Found user with normalized blob name`);
      return user;
    }
    
    // As a last resort, search through all users (for migration purposes)
    console.log(`🔍 User not found with normalized blob name, searching all users...`);
    const { blobs } = await list({ prefix: 'users/' });
    for (const blob of blobs) {
      try {
        const response = await fetch(blob.url);
        const user = await response.json();
        if (user.email === normalizedEmail) {
          console.log(`🔍 Found user in all users search, will migrate to normalized format`);
          // Return the user but don't migrate here (let saveUser handle migration)
          return user;
        }
      } catch (error) {
        console.error(`Error reading blob ${blob.pathname}:`, error);
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
  
  // Production mode - optimized to use email-based lookup when possible
  try {
    // First, try to find the user by checking if we have a cached mapping
    // or if we can derive the email from the userId pattern
    const { list } = await import('@vercel/blob');
    const { blobs } = await list({ prefix: 'users/' });
    
    // Try to find user by ID with parallel requests for better performance
    const userPromises = blobs.map(async (blob) => {
      try {
        const response = await fetch(blob.url);
        const user = await response.json();
        if (user.id === userId) {
          return { user, key: blob.pathname };
        }
        return null;
      } catch (error) {
        console.error(`Error fetching blob ${blob.pathname}:`, error);
        return null;
      }
    });
    
    const results = await Promise.all(userPromises);
    const found = results.find(result => result !== null);
    
    if (found) {
      return found;
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
    console.log('🖥️ Saving user in dev mode:', normalizedEmail);
    console.log('🖥️ Reset token being saved:', normalizedUserData.resetToken);
    devStorage.set(normalizedEmail, normalizedUserData);
    console.log('🖥️ User saved successfully in dev mode');
    return;
  }
  
  // Production mode - save to Vercel Blob
  try {
    const { put, head, del, list } = await import('@vercel/blob');
    
    // Get the normalized blob name
    const normalizedBlobName = getBlobName(normalizedEmail);
    
    // Check if user exists in any format and migrate if needed
    const { blobs } = await list({ prefix: 'users/' });
    let foundOldBlob = null;
    
    for (const blob of blobs) {
      try {
        const response = await fetch(blob.url);
        const user = await response.json();
        if (user.email === normalizedEmail && blob.pathname !== normalizedBlobName) {
          foundOldBlob = blob;
          console.log(`🔄 Found user in old blob format: ${blob.pathname}, will migrate to: ${normalizedBlobName}`);
          break;
        }
      } catch (error) {
        console.error(`Error reading blob ${blob.pathname}:`, error);
      }
    }
    
    // Delete old blob if found
    if (foundOldBlob) {
      try {
        await del(foundOldBlob.pathname);
        console.log(`🗑️ Deleted old blob: ${foundOldBlob.pathname}`);
      } catch (error) {
        console.error(`Error deleting old blob ${foundOldBlob.pathname}:`, error);
      }
    }
    
    // Save with normalized blob name format
    console.log('☁️ Saving user in production mode:', normalizedEmail);
    console.log('☁️ Reset token being saved:', normalizedUserData.resetToken);
    
    const jsonData = JSON.stringify(normalizedUserData);
    await put(normalizedBlobName, jsonData, {
      access: 'public',
      addRandomSuffix: false,
      allowOverwrite: true
    });
    
    console.log(`💾 Saved user with normalized blob name: ${normalizedBlobName}`);
    console.log('☁️ User saved successfully in production mode');
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
    const { del, head, list } = await import('@vercel/blob');
    let deleted = false;
    
    // Use normalized blob name format
    const normalizedBlobName = getBlobName(normalizedEmail);
    
    console.log(`🗑️ Trying to delete with normalized blob name: "${normalizedBlobName}"`);
    try {
      const result = await head(normalizedBlobName);
      if (result.blob) {
        await del(normalizedBlobName);
        console.log(`✅ Deleted user with normalized blob name: ${normalizedBlobName}`);
        deleted = true;
      }
    } catch (error) {
      console.log(`❌ Normalized blob name not found: ${normalizedBlobName}`);
    }
    
    // As a last resort, search through all users and delete by email match
    if (!deleted) {
      console.log(`🔍 Searching through all users to find and delete by email match`);
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
  console.log('🔍 Searching for user with reset token:', token ? token.substring(0, 10) + '...' : 'null');
  
  // Development mode
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.log('🖥️ Using development mode storage');
    for (const [key, user] of devStorage.entries()) {
      // Debug token comparison
      console.log(`🔍 Comparing tokens for ${user.email}:`);
      console.log(`  - Stored token: ${user.resetToken ? user.resetToken.substring(0, 10) + '...' : 'null'}`);
      console.log(`  - Search token: ${token ? token.substring(0, 10) + '...' : 'null'}`);
      console.log(`  - Tokens match: ${user.resetToken === token}`);
      
      // Try exact match first
      if (user.resetToken === token) {
        console.log('✅ Found user in dev storage (exact match):', user.email);
        return user;
      }
      
      // Try trimmed comparison in case of whitespace issues
      if (user.resetToken && user.resetToken.trim() === token.trim()) {
        console.log('✅ Found user in dev storage (trimmed match):', user.email);
        return user;
      }
      
      // Try URL decoded comparison
      if (user.resetToken && decodeURIComponent(user.resetToken) === token) {
        console.log('✅ Found user in dev storage (URL decoded match):', user.email);
        return user;
      }
    }
    console.log('❌ No user found in dev storage');
    return null;
  }
  
  // Production mode - optimized with parallel processing
  try {
    console.log('☁️ Using production mode blob storage');
    const { list } = await import('@vercel/blob');
    const { blobs } = await list({ prefix: 'users/' });
    
    console.log(`📁 Searching through ${blobs.length} user blobs`);
    
    // Use parallel requests for better performance
    const userPromises = blobs.map(async (blob) => {
      try {
        const response = await fetch(blob.url);
        const user = await response.json();
        
        // Debug token comparison
        console.log(`🔍 Comparing tokens for ${user.email}:`);
        console.log(`  - Stored token: ${user.resetToken ? user.resetToken.substring(0, 10) + '...' : 'null'}`);
        console.log(`  - Search token: ${token ? token.substring(0, 10) + '...' : 'null'}`);
        console.log(`  - Tokens match: ${user.resetToken === token}`);
        
        // Try exact match first
        if (user.resetToken === token) {
          console.log('✅ Found user in blob storage (exact match):', user.email);
          return user;
        }
        
        // Try trimmed comparison in case of whitespace issues
        if (user.resetToken && user.resetToken.trim() === token.trim()) {
          console.log('✅ Found user in blob storage (trimmed match):', user.email);
          return user;
        }
        
        // Try URL decoded comparison
        if (user.resetToken && decodeURIComponent(user.resetToken) === token) {
          console.log('✅ Found user in blob storage (URL decoded match):', user.email);
          return user;
        }
        return null;
      } catch (error) {
        console.error(`Error fetching blob ${blob.pathname}:`, error);
        return null;
      }
    });
    
    const results = await Promise.all(userPromises);
    const found = results.find(result => result !== null);
    
    if (!found) {
      console.log('❌ No user found in blob storage');
    }
    
    return found || null;
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