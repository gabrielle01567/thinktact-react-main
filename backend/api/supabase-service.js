import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Initialize Supabase client with error handling
let supabase = null;
let supabaseInitialized = false;
let initializationPromise = null;

// Initialize Supabase client
const initializeSupabase = async () => {
  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
    const jwtSecret = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';

    console.log('🔧 Supabase Configuration (Detailed):');
    console.log('SUPABASE_URL:', supabaseUrl ? `Set (${supabaseUrl.substring(0, 20)}...)` : 'Not set');
    console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? `Set (${process.env.SUPABASE_SERVICE_ROLE_KEY.substring(0, 10)}...)` : 'Not set');
    console.log('SUPABASE_SERVICE_KEY:', process.env.SUPABASE_SERVICE_KEY ? `Set (${process.env.SUPABASE_SERVICE_KEY.substring(0, 10)}...)` : 'Not set');
    console.log('JWT_SECRET:', jwtSecret ? 'Set' : 'Not set');
    console.log('NODE_ENV:', process.env.NODE_ENV || 'development');

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('❌ Missing Supabase environment variables');
      console.error('SUPABASE_URL:', !!supabaseUrl);
      console.error('SUPABASE_SERVICE_ROLE_KEY:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);
      console.error('SUPABASE_SERVICE_KEY:', !!process.env.SUPABASE_SERVICE_KEY);
      console.warn('⚠️ Supabase not initialized - some features will not work');
      return false;
    }

    console.log('🔧 Attempting to create Supabase client...');
    supabase = createClient(supabaseUrl, supabaseServiceKey);
    console.log('🔧 Supabase client created, testing connection...');
    
    // Test the connection by making a simple query
    const { data, error } = await supabase.from('users').select('count').limit(1);
    if (error) {
      console.error('❌ Supabase connection test failed:', error);
      console.error('❌ Error details:', error.message);
      console.error('❌ Error code:', error.code);
      console.warn('⚠️ Supabase not initialized - connection failed');
      return false;
    } else {
      supabaseInitialized = true;
      console.log('✅ Supabase client initialized successfully');
      console.log('✅ Connection test data:', data);
      return true;
    }
  } catch (error) {
    console.error('❌ Error initializing Supabase:', error);
    console.error('❌ Error details:', error.message);
    console.error('❌ Error stack:', error.stack);
    console.warn('⚠️ Supabase not initialized - some features will not work');
    return false;
  }
};

// Initialize immediately and store the promise
initializationPromise = initializeSupabase().then(result => {
  console.log('✅ Initialization promise resolved with:', result);
  return result;
}).catch(error => {
  console.error('❌ Failed to initialize Supabase:', error);
  return false;
});

// Wait for initialization to complete
const waitForInitialization = async () => {
  if (initializationPromise) {
    const result = await initializationPromise;
    console.log('🔍 waitForInitialization result:', result, 'supabaseInitialized:', supabaseInitialized);
    return result && supabaseInitialized;
  }
  return supabaseInitialized;
};

// User management functions
export const createUser = async (userData) => {
  try {
    // Wait for initialization to complete
    const isInitialized = await waitForInitialization();
    if (!isInitialized) {
      console.error('❌ Supabase not initialized in createUser');
      return { success: false, error: 'Database not configured' };
    }

    const { email, password, name, isVerified = false, isAdmin = false, securityQuestion, securityAnswer } = userData;
    
    // Check if user already exists
    const { data: existingUser, error: findError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email.toLowerCase())
      .single();
    
    if (findError && findError.code !== 'PGRST116') {
      console.error('Error checking existing user:', findError);
      return { success: false, error: 'Database error' };
    }
    
    if (existingUser) {
      return { success: false, error: 'User already exists' };
    }

    // Hash password
    const passwordHash = bcrypt.hashSync(password, 10);
    
    // Generate verification token if needed
    const verificationToken = isVerified ? null : Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    
    // Create user
    const { data: user, error: insertError } = await supabase
      .from('users')
      .insert({
        email: email.toLowerCase(),
        password_hash: passwordHash,
        name: name || email.split('@')[0],
        is_verified: isVerified,
        is_admin: isAdmin,
        verification_token: verificationToken,
        security_question: securityQuestion,
        security_answer: securityAnswer
      })
      .select()
      .single();
    
    if (insertError) {
      console.error('Error creating user:', insertError);
      return { success: false, error: insertError.message || JSON.stringify(insertError) };
    }
    
    console.log(`User created successfully: ${email}`);
    return { 
      success: true, 
      user: { 
        id: user.id,
        email: user.email,
        name: user.name,
        isVerified: user.is_verified,
        isAdmin: user.is_admin,
        createdAt: user.created_at
      },
      verificationToken
    };
  } catch (error) {
    console.error('Error creating user:', error);
    return { success: false, error: error.message };
  }
};

export const findUserByEmail = async (email) => {
  try {
    // Wait for initialization to complete
    const isInitialized = await waitForInitialization();
    if (!isInitialized) {
      console.error('❌ Supabase not initialized in findUserByEmail');
      return null;
    }

    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email.toLowerCase())
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return null; // User not found
      }
      console.error('Error finding user by email:', error);
      return null;
    }
    
    return {
      id: user.id,
      email: user.email,
      password: user.password_hash,
      name: user.name,
      isVerified: user.is_verified,
      isAdmin: user.is_admin,
      verificationToken: user.verification_token,
      resetToken: user.reset_token,
      resetTokenExpires: user.reset_token_expires,
      securityQuestion: user.security_question,
      securityAnswer: user.security_answer,
      createdAt: user.created_at,
      updatedAt: user.updated_at
    };
  } catch (error) {
    console.error('Error finding user by email:', error);
    return null;
  }
};

export const findUserById = async (id) => {
  try {
    // Wait for initialization to complete
    const isInitialized = await waitForInitialization();
    if (!isInitialized) {
      console.error('❌ Supabase not initialized in findUserById');
      return null;
    }

    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return null; // User not found
      }
      console.error('Error finding user by ID:', error);
      return null;
    }
    
    return {
      id: user.id,
      email: user.email,
      password: user.password_hash,
      name: user.name,
      isVerified: user.is_verified,
      isAdmin: user.is_admin,
      verificationToken: user.verification_token,
      resetToken: user.reset_token,
      resetTokenExpires: user.reset_token_expires,
      securityQuestion: user.security_question,
      securityAnswer: user.security_answer,
      createdAt: user.created_at,
      updatedAt: user.updated_at
    };
  } catch (error) {
    console.error('Error finding user by ID:', error);
    return null;
  }
};

export const findUserByVerificationToken = async (token) => {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('verification_token', token)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return null; // User not found
      }
      console.error('Error finding user by verification token:', error);
      return null;
    }
    
    return {
      id: user.id,
      email: user.email,
      password: user.password_hash,
      name: user.name,
      isVerified: user.is_verified,
      isAdmin: user.is_admin,
      verificationToken: user.verification_token,
      createdAt: user.created_at
    };
  } catch (error) {
    console.error('Error finding user by verification token:', error);
    return null;
  }
};

export const findUserByResetToken = async (token) => {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('reset_token', token)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return null; // User not found
      }
      console.error('Error finding user by reset token:', error);
      return null;
    }
    
    // Check if token is expired
    if (user.reset_token_expires && new Date() > new Date(user.reset_token_expires)) {
      return null; // Token expired
    }
    
    return {
      id: user.id,
      email: user.email,
      password: user.password_hash,
      name: user.name,
      isVerified: user.is_verified,
      isAdmin: user.is_admin,
      resetToken: user.reset_token,
      resetTokenExpires: user.reset_token_expires,
      createdAt: user.created_at
    };
  } catch (error) {
    console.error('Error finding user by reset token:', error);
    return null;
  }
};

export const saveUser = async (userData) => {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .update({
        email: userData.email,
        password_hash: userData.password,
        name: userData.name,
        is_verified: userData.isVerified,
        is_admin: userData.isAdmin,
        verification_token: userData.verificationToken,
        reset_token: userData.resetToken,
        reset_token_expires: userData.resetTokenExpires
      })
      .eq('id', userData.id)
      .select()
      .single();
    
    if (error) {
      console.error('Error saving user:', error);
      throw error;
    }
    
    console.log(`User saved: ${userData.email}`);
    return user;
  } catch (error) {
    console.error('Error saving user:', error);
    throw error;
  }
};

export const verifyPassword = async (user, password) => {
  return bcrypt.compareSync(password, user.password);
};

export const generateToken = (user) => {
  const jwtSecret = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';
  return jwt.sign(
    { 
      userId: user.id, 
      email: user.email, 
      isAdmin: user.isAdmin 
    },
    jwtSecret,
    { expiresIn: '7d' }
  );
};

export const verifyToken = (token) => {
  try {
    const jwtSecret = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';
    return jwt.verify(token, jwtSecret);
  } catch (error) {
    return null;
  }
};

// Add a simple demo user for testing when Supabase is not available
export const getDemoUser = () => {
  return {
    id: 'demo-user-1',
    email: 'demo@example.com',
    password: bcrypt.hashSync('demo123', 10),
    name: 'Demo User',
    isVerified: true,
    isAdmin: false,
    createdAt: new Date().toISOString()
  };
};

export const verifyUserByToken = async (verificationToken) => {
  try {
    const user = await findUserByVerificationToken(verificationToken);
    
    if (!user) {
      return { success: false, error: 'Invalid verification token' };
    }
    
    if (user.isVerified) {
      return { success: false, error: 'User is already verified' };
    }
    
    // Update user to verified
    const { error } = await supabase
      .from('users')
      .update({ 
        is_verified: true, 
        verification_token: null 
      })
      .eq('id', user.id);
    
    if (error) {
      console.error('Error verifying user:', error);
      return { success: false, error: 'Failed to verify user' };
    }
    
    return { 
      success: true, 
      user: { 
        id: user.id,
        email: user.email,
        name: user.name,
        isVerified: true,
        isAdmin: user.isAdmin
      }
    };
  } catch (error) {
    console.error('Error verifying user by token:', error);
    return { success: false, error: error.message };
  }
};

// Analysis history functions
export const saveAnalysis = async (userId, analysisData) => {
  try {
    const { data: analysis, error } = await supabase
      .from('analysis_history')
      .insert({
        user_id: userId,
        title: analysisData.title || 'Analysis',
        content: analysisData.content,
        analysis_data: analysisData.analysisData || analysisData
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error saving analysis:', error);
      throw error;
    }
    
    return analysis;
  } catch (error) {
    console.error('Error saving analysis:', error);
    throw error;
  }
};

export const getAnalysisHistory = async (userId) => {
  try {
    const { data: analyses, error } = await supabase
      .from('analysis_history')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error getting analysis history:', error);
      return [];
    }
    
    return analyses || [];
  } catch (error) {
    console.error('Error getting analysis history:', error);
    return [];
  }
};

export const deleteAnalysis = async (userId, analysisId) => {
  try {
    const { error } = await supabase
      .from('analysis_history')
      .delete()
      .eq('id', analysisId)
      .eq('user_id', userId);
    
    if (error) {
      console.error('Error deleting analysis:', error);
      throw error;
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error deleting analysis:', error);
    throw error;
  }
};

// Admin functions
export const getAllUsers = async () => {
  try {
    console.log('🔍 getAllUsers called');
    
    // Wait for initialization to complete
    const isInitialized = await waitForInitialization();
    console.log('🔍 isInitialized:', isInitialized);
    
    if (!isInitialized) {
      console.error('❌ Supabase not initialized in getAllUsers');
      return [];
    }

    console.log('🔍 Supabase client:', !!supabase);
    console.log('🔍 Attempting to query users...');

    // Select all columns including security fields
    let { data: users, error } = await supabase
      .from('users')
      .select('id, email, name, is_verified, is_admin, blocked, last_login, security_question, security_answer, created_at')
      .order('created_at', { ascending: false });
    
    console.log('🔍 Query result:', { users: users?.length || 0, error: error?.message });
    
    if (error) {
      console.error('Error getting all users:', error);
      return [];
    }
    
    console.log('🔍 Final users before transform:', users?.length || 0);
    
    // Transform the data to match frontend expectations
    const transformedUsers = (users || []).map(user => ({
      id: user.id,
      email: user.email,
      name: user.name,
      firstName: user.name ? user.name.split(' ')[0] : '',
      lastName: user.name ? user.name.split(' ').slice(1).join(' ') : '',
      verified: user.is_verified,
      isAdmin: user.is_admin,
      blocked: user.blocked || false,
      createdAt: user.created_at,
      created_at: user.created_at, // Keep original for backward compatibility
      lastLogin: user.last_login,
      isSuperUser: false, // Not currently tracked in database
      securityQuestion: user.security_question,
      securityAnswer: user.security_answer
    }));
    
    console.log('🔍 Transformed users:', transformedUsers.length);
    return transformedUsers;
  } catch (error) {
    console.error('Error getting all users:', error);
    return [];
  }
};

export const updateUser = async (userId, updates) => {
  try {
    // Wait for initialization to complete
    const isInitialized = await waitForInitialization();
    if (!isInitialized) {
      console.error('❌ Supabase not initialized in updateUser');
      throw new Error('Database not configured');
    }

    // If trying to update blocked field, check if column exists first
    if (updates.hasOwnProperty('blocked')) {
      try {
        // Test if blocked column exists by trying to select it
        const { error: testError } = await supabase
          .from('users')
          .select('blocked')
          .limit(1);
        
        if (testError && testError.message.includes('column "blocked" does not exist')) {
          console.log('⚠️ Blocked column not found, removing blocked field from update');
          delete updates.blocked;
        }
      } catch (error) {
        console.log('⚠️ Could not test blocked column, proceeding with update');
      }
    }

    const { data: user, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating user:', error);
      throw error;
    }
    
    // Transform the user data to match frontend expectations (same format as getAllUsers)
    const transformedUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      firstName: user.name ? user.name.split(' ')[0] : '',
      lastName: user.name ? user.name.split(' ').slice(1).join(' ') : '',
      verified: user.is_verified,
      isAdmin: user.is_admin,
      blocked: user.blocked || false,
      createdAt: user.created_at,
      created_at: user.created_at, // Keep original for backward compatibility
      lastLogin: user.last_login,
      isSuperUser: false, // Not currently tracked in database
      securityQuestion: user.security_question,
      securityAnswer: user.security_answer
    };
    
    return transformedUser;
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
};

export const deleteUser = async (userId) => {
  try {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', userId);
    
    if (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
}; 