import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv';
import { Resend } from 'resend';

// Load environment variables from .env file
dotenv.config();

// Debug environment variables (mask sensitive data)
console.log('🔍 Environment Variables Check:');
console.log('  SUPABASE_URL:', process.env.SUPABASE_URL ? 'SET' : 'NOT SET');
console.log('  SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'NOT SET');
console.log('  SUPABASE_SERVICE_KEY:', process.env.SUPABASE_SERVICE_KEY ? 'SET' : 'NOT SET');
console.log('  JWT_SECRET:', process.env.JWT_SECRET ? 'SET' : 'NOT SET');
console.log('  RESEND_API_KEY:', process.env.RESEND_API_KEY ? 'SET' : 'NOT SET');
console.log('  NODE_ENV:', process.env.NODE_ENV || 'development');

import { createUser, findUserByEmail, verifyPassword, generateToken, saveUser, verifyUserByToken, getAllUsers, updateUser, deleteUser, verifyToken, findUserById, saveAnalysis, getAnalysisHistory, deleteAnalysis } from './api/supabase-service.js';
import { savePatentApplication, updatePatentApplication, getPatentApplications, getPatentApplication, deletePatentApplication, getUserApplicationCount } from './api/patent-applications.js';
import { sendVerificationEmail, sendPasswordResetEmail, generateVerificationToken } from './api/email-service.js';
import bcrypt from 'bcryptjs';

// Force redeploy to apply environment variables - 2025-07-01 - Database Reconfiguration
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? [
        'https://thinktact.ai',
        'https://www.thinktact.ai',
        'https://thinktact-react-main.vercel.app',
        'https://thinktact-react-main-hwyfvscjs-gabrielle-shands-projects.vercel.app',
        'http://localhost:5174',
        'http://localhost:5173'
      ]
    : ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Robust startup and error logging for Supabase env vars and connection
console.log('=== Backend Startup ===');
console.log('SUPABASE_URL:', process.env.SUPABASE_URL || '[MISSING]');
console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '[LOADED]' : '[MISSING]');

try {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌ Missing Supabase credentials in environment variables');
    throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set');
  }
} catch (err) {
  console.error('❌ Backend startup error:', err);
  process.exit(1);
}

// Health check endpoint for backend-Supabase connectivity
app.get('/api/health', async (req, res) => {
  try {
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
    const { error } = await supabase.from('patent_applications').select('*').limit(1);
    if (error) {
      console.error('❌ Supabase health check error:', error);
      return res.status(500).json({ healthy: false, error: error.message });
    }
    res.json({ healthy: true });
  } catch (err) {
    console.error('❌ Health check exception:', err);
    res.status(500).json({ healthy: false, error: err.message });
  }
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'ThinkTact Backend API', 
    version: '1.0.0',
    status: 'running',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'Backend API is working!',
    timestamp: new Date().toISOString()
  });
});

// Supabase connection test endpoint
app.get('/test-supabase', async (req, res) => {
  try {
    console.log('Testing Supabase connection...');
    
    // Test if Supabase client can be created
    const { createClient } = await import('@supabase/supabase-js');
    
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return res.status(500).json({
        success: false,
        error: 'Missing Supabase environment variables',
        supabaseUrl: !!process.env.SUPABASE_URL,
        supabaseKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY
      });
    }
    
    console.log('Creating Supabase client...');
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
    
    console.log('Testing connection with simple query...');
    const { data, error } = await supabase.from('users').select('count').limit(1);
    
    if (error) {
      console.error('Supabase connection error:', error);
      return res.status(500).json({
        success: false,
        error: 'Supabase connection failed',
        details: error.message,
        code: error.code
      });
    }
    
    console.log('Supabase connection successful!');
    res.json({
      success: true,
      message: 'Supabase connection successful',
      data: data
    });
    
  } catch (error) {
    console.error('Test endpoint error:', error);
    res.status(500).json({
      success: false,
      error: 'Test failed',
      details: error.message
    });
  }
});

// Test Supabase service endpoint
app.get('/test-supabase-service', async (req, res) => {
  try {
    console.log('🧪 Testing Supabase service directly...');
    
    // Import and test the createUser function
    const { createUser } = await import('./api/supabase-service.js');
    
    const testEmail = `test-${Date.now()}@example.com`;
    console.log(`Test email: ${testEmail}`);
    
    const result = await createUser({
      email: testEmail,
      password: 'testpassword123',
      name: 'Test Service User',
      isVerified: true,
      isAdmin: false
    });
    
    console.log('Service test result:', result);
    
    if (result.success) {
      res.json({
        success: true,
        message: 'Supabase service test successful',
        user: result.user
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Supabase service test failed',
        details: result.error
      });
    }
    
  } catch (error) {
    console.error('Service test error:', error);
    res.status(500).json({
      success: false,
      error: 'Service test error',
      details: error.message
    });
  }
});

// Debug Supabase configuration endpoint
app.get('/api/debug-supabase-config', async (req, res) => {
  try {
    console.log('🔍 Debugging Supabase configuration...');
    
    // Check environment variables (mask sensitive data)
    const supabaseUrl = process.env.SUPABASE_URL || 'NOT_SET';
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || 'NOT_SET';
    const supabaseKeyMasked = supabaseKey !== 'NOT_SET' ? 
      supabaseKey.substring(0, 10) + '...' + supabaseKey.substring(supabaseKey.length - 10) : 
      'NOT_SET';

    console.log('Environment variables:');
    console.log('  SUPABASE_URL:', supabaseUrl);
    console.log('  SUPABASE_KEY:', supabaseKeyMasked);

    // Test Supabase connection using the service
    const { getAllUsers } = await import('./api/supabase-service.js');
    
    console.log('Testing getAllUsers function...');
    const users = await getAllUsers();
    
    console.log('getAllUsers result:', users);

    // Test a simple select * query to see what columns exist
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
    
    console.log('Testing simple select * query...');
    const { data: allColumns, error: allColumnsError } = await supabase
      .from('users')
      .select('*')
      .limit(1);
    
    console.log('Select * result:', allColumns);
    console.log('Select * error:', allColumnsError);

    // Test the exact query that getAllUsers should be using
    console.log('Testing exact getAllUsers query...');
    const { data: exactQuery, error: exactError } = await supabase
      .from('users')
      .select('id, email, name, is_verified, is_admin, blocked, last_login, created_at')
      .order('created_at', { ascending: false });
    
    console.log('Exact query result:', exactQuery);
    console.log('Exact query error:', exactError);

    res.status(200).json({
      success: true,
      config: {
        supabaseUrl: supabaseUrl,
        supabaseKey: supabaseKeyMasked,
        hasError: false,
        error: null,
        usersCount: users ? users.length : 0,
        users: users,
        allColumnsTest: {
          success: !allColumnsError,
          data: allColumns,
          error: allColumnsError
        },
        exactQueryTest: {
          success: !exactError,
          data: exactQuery,
          error: exactError
        }
      }
    });
    
  } catch (error) {
    console.error('❌ Debug endpoint error:', error);
    res.status(500).json({
      success: false,
      error: 'Debug failed',
      details: error.message,
      config: {
        supabaseUrl: process.env.SUPABASE_URL ? 'SET' : 'NOT_SET',
        supabaseKey: (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY) ? 'SET' : 'NOT_SET',
        hasError: true,
        error: error.message
      }
    });
  }
});

// Test Resend API endpoint
app.get('/test-resend', async (req, res) => {
  try {
    console.log('🧪 Testing Resend API directly...');
    
    if (!process.env.RESEND_API_KEY) {
      return res.status(500).json({
        success: false,
        error: 'RESEND_API_KEY not set'
      });
    }
    
    console.log('RESEND_API_KEY:', process.env.RESEND_API_KEY ? `Set (${process.env.RESEND_API_KEY.substring(0, 10)}...)` : 'Not set');
    
    // Import and test the email service
    const { sendVerificationEmail } = await import('./api/email-service.js');
    
    // Use a real email address for testing (you can change this to your email)
    const testEmail = 'alex.hawke54@gmail.com'; // Use a real email address
    const testToken = 'test-token-123';
    const testName = 'Test User';
    
    console.log('Testing email service with:', { testEmail, testToken, testName });
    
    const result = await sendVerificationEmail(testEmail, testToken, testName);
    
    console.log('Email service test result:', result);
    
    if (result.success) {
      res.json({
        success: true,
        message: 'Resend API test successful - check your email!',
        data: result.data
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Resend API test failed',
        details: result.error
      });
    }
    
  } catch (error) {
    console.error('Resend test error:', error);
    res.status(500).json({
      success: false,
      error: 'Resend test error',
      details: error.message
    });
  }
});

// Test registration email flow endpoint
app.get('/test-registration-email', async (req, res) => {
  try {
    console.log('🧪 Testing registration email flow...');
    
    if (!process.env.RESEND_API_KEY) {
      return res.status(500).json({
        success: false,
        error: 'RESEND_API_KEY not set'
      });
    }
    
    console.log('RESEND_API_KEY:', process.env.RESEND_API_KEY ? `Set (${process.env.RESEND_API_KEY.substring(0, 10)}...)` : 'Not set');
    
    // Import the email service
    const { sendVerificationEmail } = await import('./api/email-service.js');
    
    // Simulate the exact same call as registration flow
    const testEmail = 'test-registration@example.com';
    const testToken = 'test-token-registration-123';
    const testName = 'Test Registration User';
    
    console.log('Testing email service with registration flow parameters:');
    console.log('Email:', testEmail);
    console.log('Token:', testToken);
    console.log('Name:', testName);
    
    const result = await sendVerificationEmail(testEmail, testToken, testName);
    
    console.log('Registration email flow test result:', result);
    
    if (result.success) {
      res.json({
        success: true,
        message: 'Registration email flow test successful - check your email!',
        data: result.data
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Registration email flow test failed',
        details: result.error
      });
    }
    
  } catch (error) {
    console.error('Registration email flow test error:', error);
    res.status(500).json({
      success: false,
      error: 'Registration email flow test error',
      details: error.message
    });
  }
});

// Real auth endpoints
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName, securityQuestion, securityAnswer, name, isVerified = false, isAdmin = false } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        error: 'Email and password are required' 
      });
    }

    // Construct the full name from firstName and lastName if provided
    const fullName = firstName && lastName ? `${firstName} ${lastName}` : (name || email.split('@')[0]);

    const result = await createUser({ 
      email, 
      password, 
      name: fullName, 
      isVerified, 
      isAdmin,
      securityQuestion,
      securityAnswer
    });
    
    if (result.success) {
      // Only send verification email if user is not already verified
      if (!isVerified && process.env.RESEND_API_KEY) {
        console.log('📧 Sending verification email...');
        console.log('Email:', email);
        console.log('Token:', result.verificationToken ? result.verificationToken.substring(0, 10) + '...' : 'null');
        console.log('Name:', result.user.name);
        console.log('RESEND_API_KEY:', process.env.RESEND_API_KEY ? 'Set' : 'Not set');
        
        try {
          const emailResult = await sendVerificationEmail(email, result.verificationToken, result.user.name);
          console.log('Email result:', emailResult);
          
          if (emailResult.success) {
            console.log('✅ Email sent successfully!');
            res.json({
              success: true,
              message: 'User registered successfully. Please check your email to verify your account.',
              user: result.user
            });
          } else {
            // User created but email failed
            console.log('❌ Email sending failed:', emailResult.error);
            res.json({
              success: true,
              message: 'User registered successfully, but verification email could not be sent. Please contact support.',
              user: result.user,
              emailError: emailResult.error
            });
          }
        } catch (emailError) {
          console.log('❌ Email service exception:', emailError.message);
          res.json({
            success: true,
            message: 'User registered successfully, but verification email could not be sent. Please contact support.',
            user: result.user,
            emailError: emailError.message
          });
        }
      } else if (isVerified) {
        // User is already verified (admin user)
        res.json({
          success: true,
          message: 'Admin user created successfully and is ready to use.',
          user: result.user
        });
      } else {
        // No email service configured
        console.log('⚠️ No email service configured - RESEND_API_KEY not set');
        res.json({
          success: true,
          message: 'User registered successfully. Email verification is not configured.',
          user: result.user
        });
      }
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    console.log('🔍 Login attempt received');
    const { email, password } = req.body;
    
    console.log('🔍 Login data:', { email, password: password ? '[HIDDEN]' : '[MISSING]' });
    
    if (!email || !password) {
      console.log('❌ Login failed: Missing email or password');
      return res.status(400).json({ 
        success: false, 
        error: 'Email and password are required' 
      });
    }

    console.log('🔍 Looking up user by email:', email);
    const user = await findUserByEmail(email);
    
    if (!user) {
      console.log('❌ Login failed: User not found');
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid email or password' 
      });
    }

    console.log('🔍 User found:', { id: user.id, email: user.email, isVerified: user.isVerified });
    console.log('🔍 Verifying password...');
    
    const isValidPassword = await verifyPassword(user, password);
    
    if (!isValidPassword) {
      console.log('❌ Login failed: Invalid password');
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid email or password' 
      });
    }

    console.log('✅ Password verified successfully');

    // Check if user is verified
    if (!user.isVerified) {
      console.log('❌ Login failed: User not verified');
      return res.status(401).json({ 
        success: false, 
        error: 'Please verify your email before logging in' 
      });
    }

    console.log('🔍 Generating JWT token...');
    const token = generateToken(user);
    
    console.log('✅ Login successful, sending response');
    res.json({
      success: true,
      message: 'Login successful',
      user: { 
        id: user.id,
        email: user.email,
        name: user.name,
        isVerified: user.isVerified,
        isAdmin: user.isAdmin,
        createdAt: user.createdAt
      },
      token
    });
  } catch (error) {
    console.error('❌ Login error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Password reset endpoint
app.post('/api/auth/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    
    console.log('🔍 Password reset attempt with token:', token ? token.substring(0, 10) + '...' : 'null');
    
    if (!token || !newPassword) {
      return res.status(400).json({ 
        success: false, 
        error: 'Reset token and new password are required' 
      });
    }

    // Find user by reset token
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
    
    console.log('🔍 Searching for user with reset token...');
    
    // First, let's check if any user has this token (without expiration check)
    const { data: allUsers, error: allError } = await supabase
      .from('users')
      .select('id, email, reset_token, reset_token_expires')
      .eq('reset_token', token);
    
    console.log('🔍 All users with this token:', allUsers);
    console.log('🔍 Error from all users query:', allError);
    
    // Now check with expiration
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .eq('reset_token', token)
      .gt('reset_token_expires', new Date().toISOString())
      .limit(1);

    console.log('🔍 Users with valid token:', users);
    console.log('🔍 Error from valid token query:', error);
    console.log('🔍 Current time:', new Date().toISOString());

    if (error || !users || users.length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid or expired reset token' 
      });
    }

    const user = users[0];
    
    // Update user password and clear reset token
    const hashedPassword = bcrypt.hashSync(newPassword, 10);
    const updatedUser = await updateUser(user.id, { 
      password_hash: hashedPassword,
      reset_token: null,
      reset_token_expires: null
    });
    
    if (updatedUser) {
      res.json({
        success: true,
        message: 'Password reset successfully'
      });
    } else {
      res.status(500).json({ 
        success: false, 
        error: 'Failed to update password' 
      });
    }
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Email verification endpoint
app.get('/api/auth/verify', async (req, res) => {
  try {
    const { token } = req.query;
    
    if (!token) {
      return res.status(400).json({ 
        success: false, 
        error: 'Verification token is required' 
      });
    }

    const result = await verifyUserByToken(token);
    
    if (result.success) {
      res.json({
        success: true,
        message: 'Email verified successfully! You can now log in.',
        user: result.user
      });
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Resend verification email endpoint
app.post('/api/auth/resend-verification', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ 
        success: false, 
        error: 'Email is required' 
      });
    }

    console.log('📧 Resending verification email to:', email);

    // Find user by email
    const user = await findUserByEmail(email);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        error: 'User not found' 
      });
    }

    if (user.isVerified) {
      return res.status(400).json({ 
        success: false, 
        error: 'User is already verified' 
      });
    }

    // Generate a new verification token
    const verificationToken = generateVerificationToken();
    
    // Update user with new verification token
    const updatedUser = await updateUser(user.id, { 
      verification_token: verificationToken
    });

    if (!updatedUser) {
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to update user with verification token' 
      });
    }

    // Send verification email
    const emailResult = await sendVerificationEmail(email, verificationToken, user.name || user.firstName);

    if (emailResult.success) {
      console.log('✅ Verification email resent successfully to:', email);
      res.json({
        success: true,
        message: 'Verification email sent successfully'
      });
    } else {
      console.error('❌ Failed to send verification email:', emailResult.error);
      res.status(500).json({
        success: false,
        error: 'Failed to send verification email',
        details: emailResult.error
      });
    }

  } catch (error) {
    console.error('Error resending verification email:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Test email service endpoint
app.post('/api/test-email', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ success: false, error: 'Email is required' });
    }

    console.log('🧪 Testing email service with:', email);
    
    // Test verification email
    const testToken = generateVerificationToken();
    const emailResult = await sendVerificationEmail(email, testToken, 'Test User');
    
    if (emailResult.success) {
      res.json({
        success: true,
        message: 'Test email sent successfully',
        details: emailResult
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Failed to send test email',
        details: emailResult.error
      });
    }
  } catch (error) {
    console.error('Test email error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Test endpoints (removed blob dependencies)

app.get('/api/test-blob', async (req, res) => {
  res.json({
    success: true,
    message: 'Blob endpoints removed - using Supabase database',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/list-blobs', async (req, res) => {
  res.json({
    success: true,
    message: 'Blob endpoints removed - using Supabase database',
    timestamp: new Date().toISOString()
  });
});

// Analysis endpoints
app.post('/api/analysis/save', async (req, res) => {
  try {
    // Get user from token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const user = await findUserById(decoded.userId);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    const { originalArgument, processedAnalysis } = req.body;

    if (!originalArgument || !processedAnalysis) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    console.log('Saving analysis for user:', user.id);
    console.log('Original argument:', originalArgument.substring(0, 100) + '...');

    const result = await saveAnalysis(user.id, {
      originalArgument,
      processedAnalysis
    });

    console.log('Analysis saved successfully:', result);
    res.status(200).json({ success: true, analysis: result });

  } catch (error) {
    console.error('Analysis save error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

app.get('/api/analysis/history', async (req, res) => {
  try {
    // Get user from token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const user = await findUserById(decoded.userId);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    const history = await getAnalysisHistory(user.id);
    
    res.json({ 
      success: true, 
      history: history || []
    });
  } catch (error) {
    console.error('Analysis history error:', error);
    
    if (error.message.includes('table does not exist')) {
      res.status(500).json({ 
        error: 'Analysis history table not found. Please contact support.',
        details: error.message
      });
    } else if (error.message.includes('Database not configured')) {
      res.status(500).json({ 
        error: 'Database configuration error',
        details: error.message
      });
    } else {
      res.status(500).json({ 
        error: 'Failed to retrieve analysis history',
        details: error.message
      });
    }
  }
});

// Create analysis_history table endpoint
app.post('/api/create-analysis-table', async (req, res) => {
  try {
    console.log('🔧 Creating analysis_history table in Supabase...');
    
    const { createClient } = await import('@supabase/supabase-js');
    
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('❌ Missing Supabase environment variables');
      return res.status(500).json({ 
        error: 'Database configuration missing',
        supabaseUrl: !!supabaseUrl,
        supabaseKey: !!supabaseKey
      });
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Check if table already exists
    console.log('🔍 Checking if analysis_history table exists...');
    const { data: existingTable, error: checkError } = await supabase
      .from('analysis_history')
      .select('*')
      .limit(1);
    
    if (checkError && checkError.message.includes('relation "analysis_history" does not exist')) {
      console.log('📋 Table does not exist, creating it...');
      
      // Create the table using SQL
      const createTableSQL = `
        CREATE TABLE analysis_history (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id UUID NOT NULL,
          argument_text TEXT NOT NULL,
          analysis_results JSONB NOT NULL,
          timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `;
      
      const { error: createError } = await supabase.rpc('exec_sql', {
        sql_query: createTableSQL
      });
      
      if (createError) {
        console.error('❌ Error creating table:', createError);
        return res.status(500).json({ 
          error: 'Failed to create table',
          details: createError.message
        });
      }
      
      console.log('✅ Table created successfully!');
      
      // Test inserting a sample record
      console.log('🧪 Testing table with sample data...');
      const { data: testInsert, error: insertError } = await supabase
        .from('analysis_history')
        .insert({
          user_id: '00000000-0000-0000-0000-000000000000', // Test user ID
          argument_text: 'Test argument for table creation',
          analysis_results: { test: true }
        })
        .select()
        .single();
      
      if (insertError) {
        console.error('❌ Error testing insert:', insertError);
        return res.status(500).json({ 
          error: 'Table created but test insert failed',
          details: insertError.message
        });
      }
      
      console.log('✅ Test insert successful:', testInsert);
      
      // Clean up test data
      await supabase
        .from('analysis_history')
        .delete()
        .eq('user_id', '00000000-0000-0000-0000-000000000000');
      
      console.log('🧹 Test data cleaned up');
      
      res.status(200).json({ 
        success: true, 
        message: 'analysis_history table created successfully' 
      });
      
    } else if (checkError) {
      console.error('❌ Error checking table:', checkError);
      return res.status(500).json({ 
        error: 'Error checking table existence',
        details: checkError.message
      });
    } else {
      console.log('✅ Table already exists!');
      res.status(200).json({ 
        success: true, 
        message: 'analysis_history table already exists' 
      });
    }
    
  } catch (error) {
    console.error('❌ Error creating analysis_history table:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message
    });
  }
});

app.delete('/api/analysis/delete', async (req, res) => {
  try {
    // Get user from token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const user = await findUserById(decoded.userId);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    const { analysisId } = req.body;

    if (!analysisId) {
      return res.status(400).json({ error: 'Analysis ID is required' });
    }

    const result = await deleteAnalysis(user.id, analysisId);
    
    res.json({ 
      success: true, 
      message: 'Analysis deleted successfully'
    });
  } catch (error) {
    console.error('Analysis delete error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Patent Application endpoints
app.get('/api/patent-applications/count', async (req, res) => {
  try {
    // Get user from token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const user = await findUserById(decoded.userId);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    const count = await getUserApplicationCount(user.id);
    res.status(200).json({ success: true, count, limit: 5 });

  } catch (error) {
    console.error('Error getting application count:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

app.post('/api/patent-applications/save', async (req, res) => {
  try {
    // Get user from token
    const authHeader = req.headers.authorization;
    console.log('🔍 Backend: Auth header:', authHeader ? authHeader.substring(0, 20) + '...' : 'null');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('🔍 Backend: No token provided');
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.substring(7);
    console.log('🔍 Backend: Token extracted:', token.substring(0, 20) + '...');
    
    const decoded = verifyToken(token);
    console.log('🔍 Backend: Token decoded:', decoded ? 'success' : 'failed');
    
    if (!decoded) {
      console.log('🔍 Backend: Invalid token');
      return res.status(401).json({ error: 'Invalid token' });
    }

    const user = await findUserById(decoded.userId);
    console.log('🔍 Backend: User found:', user ? 'yes' : 'no');
    
    if (!user) {
      console.log('🔍 Backend: User not found');
      return res.status(401).json({ error: 'User not found' });
    }

    const applicationData = req.body;

    console.log('Saving patent application for user:', user.id);
    console.log('Application data:', {
      title: applicationData.title,
      completedSections: applicationData.completedSections
    });

    const result = await savePatentApplication(user.id, applicationData);

    console.log('Patent application saved successfully:', result);
    res.status(200).json({ success: true, application: result });

  } catch (error) {
    console.error('Patent application save error:', error);
    // Check if it's a limit exceeded error
    if (error.message.includes('maximum limit of 5 patent applications')) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Internal server error', details: error.message });
    }
  }
});

app.put('/api/patent-applications/:id', async (req, res) => {
  try {
    // Get user from token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const user = await findUserById(decoded.userId);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    const { id } = req.params;
    const applicationData = req.body;

    console.log('Updating patent application:', id, 'for user:', user.id);

    const result = await updatePatentApplication(user.id, id, applicationData);

    console.log('Patent application updated successfully:', result);
    res.status(200).json({ success: true, application: result });

  } catch (error) {
    console.error('Patent application update error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

app.get('/api/patent-applications', async (req, res) => {
  try {
    // Get user from token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const user = await findUserById(decoded.userId);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    const applications = await getPatentApplications(user.id);
    
    res.json({ 
      success: true, 
      applications: applications || []
    });
  } catch (error) {
    console.error('Patent applications list error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

app.get('/api/patent-applications/:id', async (req, res) => {
  try {
    // Get user from token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const user = await findUserById(decoded.userId);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    const { id } = req.params;

    const application = await getPatentApplication(user.id, id);
    
    res.json({ 
      success: true, 
      application: application
    });
  } catch (error) {
    console.error('Patent application get error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

app.delete('/api/patent-applications/:id', async (req, res) => {
  try {
    // Get user from token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const user = await findUserById(decoded.userId);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    const { id } = req.params;

    const result = await deletePatentApplication(user.id, id);
    
    res.json({ 
      success: true, 
      message: 'Patent application deleted successfully'
    });
  } catch (error) {
    console.error('Patent application delete error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

// Admin endpoints
app.get('/api/admin/users', async (req, res) => {
  try {
    const users = await getAllUsers();
    
    res.json({
      success: true,
      users: users || []
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch users' });
  }
});

app.post('/api/admin/toggle-status', async (req, res) => {
  try {
    const { userId, blocked } = req.body;
    
    if (!userId) {
      return res.status(400).json({ success: false, error: 'User ID is required' });
    }

    const updatedUser = await updateUser(userId, { blocked: blocked });
    
    if (updatedUser) {
      res.json({
        success: true,
        message: `User ${blocked ? 'blocked' : 'unblocked'} successfully`,
        user: updatedUser
      });
    } else {
      res.status(404).json({ success: false, error: 'User not found' });
    }
  } catch (error) {
    console.error('Toggle status error:', error);
    res.status(500).json({ success: false, error: 'Failed to update user status' });
  }
});

app.delete('/api/admin/delete-user', async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ success: false, error: 'User ID is required' });
    }

    const result = await deleteUser(userId);
    
    if (result) {
      res.json({
        success: true,
        message: 'User deleted successfully'
      });
    } else {
      res.status(404).json({ success: false, error: 'User not found' });
    }
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ success: false, error: 'Failed to delete user' });
  }
});

app.post('/api/admin/reset-password', async (req, res) => {
  try {
    const { userId, newPassword } = req.body;
    
    if (!userId || !newPassword) {
      return res.status(400).json({ success: false, error: 'User ID and new password are required' });
    }

    const hashedPassword = bcrypt.hashSync(newPassword, 10);
    const updatedUser = await updateUser(userId, { password_hash: hashedPassword });
    
    if (updatedUser) {
      res.json({
        success: true,
        message: 'Password reset successfully'
      });
    } else {
      res.status(404).json({ success: false, error: 'User not found' });
    }
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ success: false, error: 'Failed to reset password' });
  }
});

app.post('/api/admin/verify-user', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    console.log('Verifying user with email:', email);

    // Find user by email
    const user = await findUserByEmail(email);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ error: 'User is already verified' });
    }

    // Update user to verified using Supabase service
    const updatedUser = await updateUser(user.id, { 
      is_verified: true,
      verification_token: null
    });

    if (updatedUser) {
      res.status(200).json({
        success: true,
        message: 'User verified successfully',
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          firstName: updatedUser.name ? updatedUser.name.split(' ')[0] : '',
          lastName: updatedUser.name ? updatedUser.name.split(' ').slice(1).join(' ') : '',
          verified: updatedUser.is_verified
        }
      });
    } else {
      res.status(500).json({ error: 'Failed to update user' });
    }

  } catch (error) {
    console.error('Error verifying user:', error);
    res.status(500).json({ error: 'Failed to verify user' });
  }
});

app.post('/api/admin/create-user', async (req, res) => {
  try {
    const { firstName, lastName, email, password, securityQuestion, securityAnswer, isAdmin } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !password || !securityQuestion || !securityAnswer) {
      return res.status(400).json({ success: false, error: 'All fields are required' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, error: 'Invalid email format' });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({ success: false, error: 'Password must be at least 6 characters' });
    }

    // Use the Supabase service createUser function
    const result = await createUser({
      email,
      password,
      name: `${firstName} ${lastName}`,
      isVerified: false, // Admin-created users need email verification
      isAdmin: isAdmin || false,
      securityQuestion,
      securityAnswer
    });

    if (result.success) {
      console.log(`✅ Admin created user: ${email}`);
      console.log(`📧 Email: ${email}`);
      console.log(`🔑 Password: ${password}`);
      console.log(`👤 Name: ${firstName} ${lastName}`);
      console.log(`👑 Admin: ${isAdmin ? 'Yes' : 'No'}`);

      res.status(201).json({ 
        success: true, 
        message: 'User created successfully. Verification email will be sent.',
        user: {
          id: result.user.id,
          firstName: firstName,
          lastName: lastName,
          email: result.user.email,
          isAdmin: result.user.isAdmin,
          verified: result.user.isVerified,
          createdAt: result.user.createdAt
        }
      });
    } else {
      if (result.error === 'User already exists') {
        res.status(400).json({ success: false, error: 'User with this email already exists' });
      } else {
        console.error('Error creating user:', result.error);
        res.status(500).json({ success: false, error: 'Failed to create user' });
      }
    }

  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Admin endpoint to request password reset for a user
app.post('/api/admin/request-reset-for-user', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ success: false, error: 'Email is required' });
    }

    console.log('🔧 Admin requesting password reset for:', email);

    // Find user by email
    const user = await findUserByEmail(email);
    
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Generate a reset token
    const resetToken = generateVerificationToken();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now
    
    console.log('🔧 Generated reset token:', resetToken.substring(0, 10) + '...');
    console.log('🔧 Token expires at:', expiresAt.toISOString());
    
    // Update user with reset token
    const updatedUser = await updateUser(user.id, { 
      reset_token: resetToken,
      reset_token_expires: expiresAt
    });
    
    console.log('🔧 Updated user result:', updatedUser ? 'Success' : 'Failed');

    if (!updatedUser) {
      return res.status(500).json({ success: false, error: 'Failed to update user with reset token' });
    }

    // Send password reset email
    const emailResult = await sendPasswordResetEmail(email, resetToken, user.name || user.firstName);

    if (emailResult.success) {
      console.log('✅ Password reset email sent successfully to:', email);
      res.json({
        success: true,
        message: 'Password reset email sent successfully'
      });
    } else {
      console.error('❌ Failed to send password reset email:', emailResult.error);
      res.status(500).json({
        success: false,
        error: 'Failed to send password reset email',
        details: emailResult.error
      });
    }

  } catch (error) {
    console.error('Error requesting password reset:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Admin endpoint to set security question and answer for a user
app.post('/api/admin/set-security-question', async (req, res) => {
  try {
    const { email, securityQuestion, securityAnswer } = req.body;
    
    if (!email || !securityQuestion || !securityAnswer) {
      return res.status(400).json({ 
        success: false, 
        error: 'Email, security question, and security answer are required' 
      });
    }

    console.log('🔧 Admin setting security question for:', email);

    // Find user by email
    const user = await findUserByEmail(email);
    
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Update user with security question and answer
    const updatedUser = await updateUser(user.id, { 
      security_question: securityQuestion,
      security_answer: securityAnswer
    });
    
    if (updatedUser) {
      console.log('✅ Security question and answer set successfully for:', email);
      res.json({
        success: true,
        message: 'Security question and answer set successfully',
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          securityQuestion: updatedUser.securityQuestion,
          securityAnswer: updatedUser.securityAnswer ? '***SET***' : 'NOT SET'
        }
      });
    } else {
      res.status(500).json({ success: false, error: 'Failed to update user' });
    }

  } catch (error) {
    console.error('Error setting security question:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Request password reset endpoint
app.post('/api/auth/request-reset', async (req, res) => {
  try {
    const { email, securityAnswer } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Normalize email (same as registration)
    const normalizedEmail = email.toLowerCase().trim();
    
    console.log('Password reset request for email:', email);
    console.log('Normalized email:', normalizedEmail);

    // Find user by email (normalized)
    const user = await findUserByEmail(normalizedEmail);

    if (!user) {
      console.log('User not found for password reset:', normalizedEmail);
      return res.status(404).json({ error: 'No account found with this email address' });
    }

    console.log('User found for password reset:', user.email);

    // Verify security answer if provided
    if (securityAnswer && user.securityAnswer) {
      if (securityAnswer.toLowerCase().trim() !== user.securityAnswer.toLowerCase().trim()) {
        return res.status(400).json({ error: 'Incorrect security answer' });
      }
    }

    // Generate reset token
    const resetToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const resetTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    console.log('🔑 Generated reset token:', resetToken);
    console.log('🔑 Token length:', resetToken.length);
    console.log('🔑 Token type:', typeof resetToken);

    // Update user with reset token
    const updatedUser = await updateUser(user.id, {
      reset_token: resetToken,
      reset_token_expires: resetTokenExpiry.toISOString()
    });

    if (!updatedUser) {
      return res.status(500).json({ error: 'Failed to update user with reset token' });
    }

    console.log('💾 Successfully saved user with reset token');

    // Send reset email
    if (process.env.RESEND_API_KEY) {
      try {
        const resend = new Resend(process.env.RESEND_API_KEY);
        
        const resetUrl = `${process.env.FRONTEND_URL || 'https://thinktact-react-main.vercel.app'}/reset-password?token=${resetToken}`;
        console.log('🔗 Generated reset URL:', resetUrl);
        console.log('📧 Attempting to send email to:', email);
        console.log('🔑 Resend API Key length:', process.env.RESEND_API_KEY.length);
        
        const emailResult = await resend.emails.send({
          from: 'ThinkTact AI <noreply@thinktact.ai>',
          to: [email],
          subject: 'Reset your ThinkTact AI password',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #333;">Password Reset Request</h2>
              <p>Hi ${user.firstName || user.name || 'there'},</p>
              <p>We received a request to reset your password for your ThinkTact AI account. Click the button below to reset your password:</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${resetUrl}" style="background-color: #dc3545; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
              </div>
              <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #666;"><a href="${resetUrl}" style="color: #0066cc; text-decoration: underline;">ThinkTact AI Password Reset</a></p>
              <p>This link will expire in 24 hours.</p>
              <p>If you didn't request a password reset, you can safely ignore this email.</p>
              <p>Best regards,<br>The ThinkTact AI Team</p>
            </div>
          `
        });
        
        console.log('📧 Email result:', emailResult);
        console.log(`📧 Password reset email sent to: ${email}`);
      } catch (emailError) {
        console.error('❌ Error sending password reset email:', emailError);
        console.error('❌ Error details:', emailError.message);
        console.error('❌ Error code:', emailError.code);
        console.error('❌ Error status:', emailError.status);
        return res.status(500).json({ 
          error: 'Failed to send reset email',
          details: emailError.message,
          code: emailError.code,
          status: emailError.status
        });
      }
    } else {
      console.log('⚠️ RESEND_API_KEY not set - email service not configured');
      return res.status(500).json({ error: 'Email service not configured' });
    }

    res.status(200).json({
      success: true,
      message: 'Password reset email sent successfully'
    });

  } catch (error) {
    console.error('Password reset request error:', error);
    res.status(500).json({ error: 'Failed to process reset request' });
  }
});

// Get user by email endpoint (for password reset flow)
app.get('/api/auth/user/:email', async (req, res) => {
  try {
    const { email } = req.params;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    console.log('Getting user info for email:', email);

    // Find user by email
    const user = await findUserByEmail(email);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Return only necessary user info (no sensitive data)
    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      firstName: user.firstName,
      lastName: user.lastName,
      securityQuestion: user.securityQuestion,
      isVerified: user.isVerified,
      isAdmin: user.isAdmin
    });

  } catch (error) {
    console.error('Error getting user by email:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Migration endpoint to add reset token fields
app.post('/api/migrate-reset-token-fields', async (req, res) => {
  try {
    console.log('🔧 Starting reset token fields migration...');
    
    // Import Supabase client
    const { createClient } = await import('@supabase/supabase-js');
    
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('❌ Missing Supabase environment variables');
      return res.status(500).json({ 
        success: false, 
        error: 'Database configuration missing' 
      });
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // First, let's check if the columns already exist by trying to select them
    console.log('🔍 Checking if reset token columns already exist...');
    const { data: testUsers, error: testError } = await supabase
      .from('users')
      .select('id, email, reset_token, reset_token_expires')
      .limit(1);
    
    if (!testError) {
      console.log('✅ Reset token columns already exist!');
      return res.status(200).json({ 
        success: true, 
        message: 'Reset token columns already exist',
        users: testUsers
      });
    }
    
    console.log('❌ Reset token columns missing, adding them...');
    
    // Add the columns using direct SQL
    const migrationSQL = `
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS reset_token TEXT,
      ADD COLUMN IF NOT EXISTS reset_token_expires TIMESTAMP WITH TIME ZONE;
    `;
    
    const { error: migrationError } = await supabase.rpc('exec_sql', {
      sql_query: migrationSQL
    });
    
    if (migrationError) {
      console.error('❌ Migration failed:', migrationError);
      
      // Try alternative approach - add columns one by one
      console.log('🔄 Trying alternative approach...');
      
      const { error: tokenError } = await supabase.rpc('exec_sql', {
        sql_query: 'ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token TEXT;'
      });
      
      const { error: expiresError } = await supabase.rpc('exec_sql', {
        sql_query: 'ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token_expires TIMESTAMP WITH TIME ZONE;'
      });
      
      if (tokenError || expiresError) {
        console.error('❌ Alternative approach also failed');
        console.error('Token error:', tokenError);
        console.error('Expires error:', expiresError);
        return res.status(500).json({ 
          success: false, 
          error: 'Failed to add reset token columns' 
        });
      }
    }
    
    console.log('✅ Reset token fields migration completed successfully!');
    
    // Verify the migration worked
    const { data: users, error: verifyError } = await supabase
      .from('users')
      .select('id, email, reset_token, reset_token_expires')
      .limit(5);
    
    if (verifyError) {
      console.error('❌ Error verifying migration:', verifyError);
      return res.status(500).json({ 
        success: false, 
        error: 'Migration completed but verification failed' 
      });
    }
    
    console.log('✅ Migration verification successful:', users);
    
    return res.status(200).json({ 
      success: true, 
      message: 'Reset token fields migration completed successfully',
      users: users || []
    });
    
  } catch (error) {
    console.error('❌ Migration error:', error);
    return res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Migration endpoint to add security fields
app.post('/api/migrate-security-fields', async (req, res) => {
  try {
    console.log('🔧 Starting security fields migration...');
    
    // Import Supabase client
    const { createClient } = await import('@supabase/supabase-js');
    
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('❌ Missing Supabase environment variables');
      return res.status(500).json({ 
        success: false, 
        error: 'Database configuration missing' 
      });
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // First, let's check if the columns already exist by trying to select them
    console.log('🔍 Checking if security columns already exist...');
    const { data: testUsers, error: testError } = await supabase
      .from('users')
      .select('id, email, security_question, security_answer')
      .limit(1);
    
    if (!testError) {
      console.log('✅ Security columns already exist!');
      return res.status(200).json({ 
        success: true, 
        message: 'Security columns already exist',
        users: testUsers
      });
    }
    
    console.log('❌ Security columns missing, adding them...');
    
    // Add the columns using direct SQL
    const migrationSQL = `
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS security_question TEXT,
      ADD COLUMN IF NOT EXISTS security_answer TEXT;
    `;
    
    const { error: migrationError } = await supabase.rpc('exec_sql', {
      sql_query: migrationSQL
    });
    
    if (migrationError) {
      console.error('❌ Migration failed:', migrationError);
      
      // Try alternative approach - add columns one by one
      console.log('🔄 Trying alternative approach...');
      
      const { error: questionError } = await supabase.rpc('exec_sql', {
        sql_query: 'ALTER TABLE users ADD COLUMN IF NOT EXISTS security_question TEXT;'
      });
      
      const { error: answerError } = await supabase.rpc('exec_sql', {
        sql_query: 'ALTER TABLE users ADD COLUMN IF NOT EXISTS security_answer TEXT;'
      });
      
      if (questionError || answerError) {
        console.error('❌ Alternative approach also failed');
        console.error('Question error:', questionError);
        console.error('Answer error:', answerError);
        return res.status(500).json({ 
          success: false, 
          error: 'Failed to add security columns' 
        });
      }
    }
    
    console.log('✅ Security fields migration completed successfully!');
    
    // Verify the migration worked
    const { data: users, error: verifyError } = await supabase
      .from('users')
      .select('id, email, security_question, security_answer')
      .limit(5);
    
    if (verifyError) {
      console.error('❌ Error verifying migration:', verifyError);
      return res.status(500).json({ 
        success: false, 
        error: 'Migration completed but verification failed' 
      });
    }
    
    console.log('✅ Migration verification successful:', users);
    
    return res.status(200).json({ 
      success: true, 
      message: 'Security fields migration completed successfully',
      users: users || []
    });
    
  } catch (error) {
    console.error('❌ Migration error:', error);
    return res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Supabase configured: ${!!process.env.SUPABASE_URL && !!process.env.SUPABASE_SERVICE_ROLE_KEY}`);
  console.log(`JWT secret exists: ${!!process.env.JWT_SECRET}`);
}); 