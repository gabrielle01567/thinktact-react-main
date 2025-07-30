import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Helper to get a fresh Supabase client every time
function getSupabaseClient() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set');
  }
  return createClient(supabaseUrl, supabaseServiceKey);
}

// Helper to get JWT secret every time
function getJwtSecret() {
  return process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';
}

// User management functions
export const createUser = async (userData) => {
  try {
    const supabase = getSupabaseClient();
    const jwtSecret = getJwtSecret();

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
    console.log('🔍 Finding user by email:', email);
    const supabase = getSupabaseClient();
    const jwtSecret = getJwtSecret();

    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email.toLowerCase())
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        console.log('🔍 User not found in database');
        return null; // User not found
      }
      console.error('❌ Error finding user by email:', error);
      return null;
    }
    
    console.log('🔍 User found in database:', { id: user.id, email: user.email, isVerified: user.is_verified });
    
    return {
      id: user.id,
      email: user.email,
      password: user.password_hash,
      name: user.name,
      firstName: user.name ? user.name.split(' ')[0] : '',
      lastName: user.name ? user.name.split(' ').slice(1).join(' ') : '',
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
    console.error('❌ Error finding user by email:', error);
    console.error('Error stack:', error.stack);
    return null;
  }
};

export const findUserById = async (id) => {
  try {
    const supabase = getSupabaseClient();
    const jwtSecret = getJwtSecret();

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
    const supabase = getSupabaseClient();
    const jwtSecret = getJwtSecret();

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
    const supabase = getSupabaseClient();
    const jwtSecret = getJwtSecret();

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
    const supabase = getSupabaseClient();
    const jwtSecret = getJwtSecret();

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
  try {
    console.log('🔍 Verifying password for user:', user.email);
    console.log('🔍 Password hash exists:', !!user.password_hash);
    
    if (!user.password_hash) {
      console.error('❌ No password hash found for user');
      return false;
    }
    
    const isValid = bcrypt.compareSync(password, user.password_hash);
    console.log('🔍 Password verification result:', isValid);
    return isValid;
  } catch (error) {
    console.error('❌ Password verification error:', error);
    return false;
  }
};

export const generateToken = (user) => {
  const jwtSecret = getJwtSecret();
  return jwt.sign(
    { 
      userId: user.id, 
      email: user.email, 
      isAdmin: user.is_admin 
    },
    jwtSecret,
    { expiresIn: '7d' }
  );
};

export const verifyToken = (token) => {
  try {
    const jwtSecret = getJwtSecret();
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
    
    const supabase = getSupabaseClient();
    const jwtSecret = getJwtSecret();

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
        isAdmin: user.is_admin
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
    const supabase = getSupabaseClient();
    const jwtSecret = getJwtSecret();

    const { data: analysis, error } = await supabase
      .from('analysis_history')
      .insert({
        user_id: userId,
        argument_text: analysisData.originalArgument,
        analysis_results: analysisData.processedAnalysis,
        timestamp: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error saving analysis:', error);
      throw error;
    }
    
    // Transform the response to match frontend expectations
    return {
      id: analysis.id,
      userId: analysis.user_id,
      timestamp: analysis.timestamp,
      argumentText: analysis.argument_text,
      analysisResults: analysis.analysis_results
    };
  } catch (error) {
    console.error('Error saving analysis:', error);
    throw error;
  }
};

export const getAnalysisHistory = async (userId) => {
  try {
    const supabase = getSupabaseClient();
    const jwtSecret = getJwtSecret();

    const { data: analyses, error } = await supabase
      .from('analysis_history')
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false })
      .limit(10);
    
    if (error) {
      console.error('Error getting analysis history:', error);
      if (error.message.includes('relation "analysis_history" does not exist')) {
        throw new Error('Analysis history table does not exist. Please contact support.');
      }
      throw new Error('Failed to retrieve analysis history');
    }
    
    // Transform the data to match frontend expectations
    return (analyses || []).map(analysis => ({
      id: analysis.id,
      userId: analysis.user_id,
      timestamp: analysis.timestamp,
      argumentText: analysis.argument_text,
      analysisResults: analysis.analysis_results
    }));
  } catch (error) {
    console.error('Error getting analysis history:', error);
    throw error;
  }
};

export const deleteAnalysis = async (userId, analysisId) => {
  try {
    const supabase = getSupabaseClient();
    const jwtSecret = getJwtSecret();

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
    
    const supabase = getSupabaseClient();
    const jwtSecret = getJwtSecret();

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
    const supabase = getSupabaseClient();
    const jwtSecret = getJwtSecret();

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
    const supabase = getSupabaseClient();
    const jwtSecret = getJwtSecret();

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