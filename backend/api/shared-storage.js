import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Simple in-memory storage (for development - in production you'd use a database)
const users = new Map();
const analysisHistory = new Map();

// JWT Secret - in production, this should be a secure environment variable
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';

// Initialize with a default admin user
const initializeDefaultAdmin = () => {
  const adminEmail = 'admin@thinktact.ai';
  if (!users.has(adminEmail)) {
    const hashedPassword = bcrypt.hashSync('admin123', 10);
    users.set(adminEmail, {
      id: 'admin-1',
      email: adminEmail,
      password: hashedPassword,
      name: 'Admin User',
      isVerified: true,
      isAdmin: true,
      createdAt: new Date().toISOString()
    });
    console.log('Default admin user created:', adminEmail);
  }
};

// Create admin user function (simplified)
export const createAdminUser = async () => {
  try {
    initializeDefaultAdmin();
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
    
    if (users.has(email)) {
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
    
    users.set(email, user);
    return { success: true, user: { ...user, password: undefined } };
  } catch (error) {
    console.error('Error creating user:', error);
    return { success: false, error: error.message };
  }
};

export const findUserByEmail = async (email) => {
  return users.get(email) || null;
};

export const findUserById = async (id) => {
  for (const user of users.values()) {
    if (user.id === id) {
      return user;
    }
  }
  return null;
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
    
    if (!analysisHistory.has(userId)) {
      analysisHistory.set(userId, []);
    }
    
    analysisHistory.get(userId).push(analysis);
    return { success: true, analysisId };
  } catch (error) {
    console.error('Error saving analysis:', error);
    return { success: false, error: error.message };
  }
};

export const getAnalysisHistory = async (userId) => {
  try {
    return analysisHistory.get(userId) || [];
  } catch (error) {
    console.error('Error getting analysis history:', error);
    return [];
  }
};

export const deleteAnalysis = async (userId, analysisId) => {
  try {
    const userAnalyses = analysisHistory.get(userId) || [];
    const filteredAnalyses = userAnalyses.filter(a => a.id !== analysisId);
    analysisHistory.set(userId, filteredAnalyses);
    return { success: true };
  } catch (error) {
    console.error('Error deleting analysis:', error);
    return { success: false, error: error.message };
  }
};

// Get all users (for admin)
export const getAllUsers = async () => {
  try {
    return Array.from(users.values()).map(user => ({
      ...user,
      password: undefined
    }));
  } catch (error) {
    console.error('Error getting users:', error);
    return [];
  }
};

// Update user (for admin)
export const updateUser = async (email, updates) => {
  try {
    const user = users.get(email);
    if (!user) {
      return { success: false, error: 'User not found' };
    }
    
    Object.assign(user, updates);
    users.set(email, user);
    return { success: true, user: { ...user, password: undefined } };
  } catch (error) {
    console.error('Error updating user:', error);
    return { success: false, error: error.message };
  }
};

// Delete user (for admin)
export const deleteUser = async (email) => {
  try {
    if (!users.has(email)) {
      return { success: false, error: 'User not found' };
    }
    
    users.delete(email);
    return { success: true };
  } catch (error) {
    console.error('Error deleting user:', error);
    return { success: false, error: error.message };
  }
}; 