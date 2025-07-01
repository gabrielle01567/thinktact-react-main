import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { put, list, del, head } from '@vercel/blob';

// JWT Secret - in production, this should be a secure environment variable
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';

// Helper function to get blob name for users
const getUserBlobName = (email) => {
  const normalizedEmail = email.toLowerCase().trim();
  const safeEmail = normalizedEmail.replace(/[^a-zA-Z0-9]/g, '_');
  return `users/${safeEmail}.json`;
};

// Helper function to get blob name for analysis history
const getAnalysisBlobName = (userId) => {
  return `analysis/${userId}.json`;
};

// Create admin user function
export const createAdminUser = async () => {
  try {
    const adminEmail = 'admin@thinktact.ai';
    const existingUser = await findUserByEmail(adminEmail);
    
    if (!existingUser) {
      const hashedPassword = bcrypt.hashSync('admin123', 10);
      const adminUser = {
        id: 'admin-1',
        email: adminEmail,
        password: hashedPassword,
        name: 'Admin User',
        isVerified: true,
        isAdmin: true,
        createdAt: new Date().toISOString()
      };
      
      await saveUser(adminUser);
      console.log('Default admin user created:', adminEmail);
    }
    
    return { success: true, message: 'Admin user ready' };
  } catch (error) {
    console.error('Error creating admin user:', error);
    return { success: false, error: error.message };
  }
};

// User management functions
export const createUser = async (userData) => {
  try {
    const { email, password, name } = userData;
    
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return { success: false, error: 'User already exists' };
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    const userId = `user-${Date.now()}`;
    
    const user = {
      id: userId,
      email,
      password: hashedPassword,
      name,
      isVerified: false,
      isAdmin: false,
      createdAt: new Date().toISOString()
    };
    
    await saveUser(user);
    return { success: true, user: { ...user, password: undefined } };
  } catch (error) {
    console.error('Error creating user:', error);
    return { success: false, error: error.message };
  }
};

export const findUserByEmail = async (email) => {
  try {
    const blobName = getUserBlobName(email);
    const result = await head(blobName);
    
    if (result.blob) {
      const response = await fetch(result.blob.url);
      const user = await response.json();
      return user;
    }
    
    return null;
  } catch (error) {
    console.error('Error finding user by email:', error);
    return null;
  }
};

// Missing functions that are being imported
export const findUserByResetToken = async (token) => {
  try {
    const { blobs } = await list({ prefix: 'users/' });
    
    for (const blob of blobs) {
      try {
        const response = await fetch(blob.url);
        const user = await response.json();
        if (user.resetToken === token) {
          return user;
        }
      } catch (error) {
        console.error(`Error reading blob ${blob.pathname}:`, error);
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error finding user by reset token:', error);
    return null;
  }
};

export const findUserByVerificationToken = async (token) => {
  try {
    const { blobs } = await list({ prefix: 'users/' });
    
    for (const blob of blobs) {
      try {
        const response = await fetch(blob.url);
        const user = await response.json();
        if (user.verificationToken === token) {
          return user;
        }
      } catch (error) {
        console.error(`Error reading blob ${blob.pathname}:`, error);
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error finding user by verification token:', error);
    return null;
  }
};

export const getUserFromToken = async (token) => {
  try {
    const decoded = verifyToken(token);
    if (!decoded) {
      return null;
    }
    
    return await findUserById(decoded.userId);
  } catch (error) {
    console.error('Error getting user from token:', error);
    return null;
  }
};

export const findUserById = async (id) => {
  try {
    const { blobs } = await list({ prefix: 'users/' });
    
    for (const blob of blobs) {
      try {
        const response = await fetch(blob.url);
        const user = await response.json();
        if (user.id === id) {
          return user;
        }
      } catch (error) {
        console.error(`Error reading blob ${blob.pathname}:`, error);
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error finding user by ID:', error);
    return null;
  }
};

export const saveUser = async (userData) => {
  try {
    const blobName = getUserBlobName(userData.email);
    const jsonData = JSON.stringify(userData);
    
    await put(blobName, jsonData, {
      access: 'public',
      addRandomSuffix: false,
      allowOverwrite: true
    });
    
    console.log(`User saved: ${userData.email}`);
  } catch (error) {
    console.error('Error saving user:', error);
    throw error;
  }
};

export const verifyPassword = async (user, password) => {
  return bcrypt.compareSync(password, user.password);
};

export const generateToken = (user) => {
  return jwt.sign(
    { 
      userId: user.id, 
      email: user.email, 
      isAdmin: user.isAdmin 
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};

export const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

// Analysis history functions
export const saveAnalysis = async (userId, analysisData) => {
  try {
    const analysisId = `analysis-${Date.now()}`;
    const analysis = {
      id: analysisId,
      userId,
      ...analysisData,
      createdAt: new Date().toISOString()
    };
    
    // Get existing analysis history
    const existingHistory = await getAnalysisHistory(userId);
    existingHistory.push(analysis);
    
    // Save updated history
    const blobName = getAnalysisBlobName(userId);
    const jsonData = JSON.stringify(existingHistory);
    
    await put(blobName, jsonData, {
      access: 'public',
      addRandomSuffix: false,
      allowOverwrite: true
    });
    
    return { success: true, analysisId };
  } catch (error) {
    console.error('Error saving analysis:', error);
    return { success: false, error: error.message };
  }
};

export const getAnalysisHistory = async (userId) => {
  try {
    const blobName = getAnalysisBlobName(userId);
    const result = await head(blobName);
    
    if (result.blob) {
      const response = await fetch(result.blob.url);
      const history = await response.json();
      return Array.isArray(history) ? history : [];
    }
    
    return [];
  } catch (error) {
    console.error('Error getting analysis history:', error);
    return [];
  }
};

export const deleteAnalysis = async (userId, analysisId) => {
  try {
    const history = await getAnalysisHistory(userId);
    const filteredHistory = history.filter(a => a.id !== analysisId);
    
    const blobName = getAnalysisBlobName(userId);
    const jsonData = JSON.stringify(filteredHistory);
    
    await put(blobName, jsonData, {
      access: 'public',
      addRandomSuffix: false,
      allowOverwrite: true
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error deleting analysis:', error);
    return { success: false, error: error.message };
  }
};

// Get all users (for admin)
export const getAllUsers = async () => {
  try {
    const { blobs } = await list({ prefix: 'users/' });
    const users = [];
    
    for (const blob of blobs) {
      try {
        const response = await fetch(blob.url);
        const user = await response.json();
        users.push({
          ...user,
          password: undefined
        });
      } catch (error) {
        console.error(`Error reading user blob ${blob.pathname}:`, error);
      }
    }
    
    return users;
  } catch (error) {
    console.error('Error getting users:', error);
    return [];
  }
};

// Update user (for admin)
export const updateUser = async (email, updates) => {
  try {
    const user = await findUserByEmail(email);
    if (!user) {
      return { success: false, error: 'User not found' };
    }
    
    const updatedUser = { ...user, ...updates };
    await saveUser(updatedUser);
    
    return { success: true, user: { ...updatedUser, password: undefined } };
  } catch (error) {
    console.error('Error updating user:', error);
    return { success: false, error: error.message };
  }
};

// Delete user (for admin)
export const deleteUser = async (email) => {
  try {
    const user = await findUserByEmail(email);
    if (!user) {
      return { success: false, error: 'User not found' };
    }
    
    const blobName = getUserBlobName(email);
    await del(blobName);
    
    return { success: true };
  } catch (error) {
    console.error('Error deleting user:', error);
    return { success: false, error: error.message };
  }
};

// Reset user password function
export const resetUserPassword = async (userId, newPassword) => {
  try {
    const user = await findUserById(userId);
    if (!user) {
      return { success: false, error: 'User not found' };
    }
    
    const hashedPassword = bcrypt.hashSync(newPassword, 10);
    const updatedUser = {
      ...user,
      password: hashedPassword,
      resetToken: null, // Clear reset token after password change
      lastPasswordChange: new Date().toISOString()
    };
    
    await saveUser(updatedUser);
    
    return { success: true, user: { ...updatedUser, password: undefined } };
  } catch (error) {
    console.error('Error resetting user password:', error);
    return { success: false, error: error.message };
  }
}; 