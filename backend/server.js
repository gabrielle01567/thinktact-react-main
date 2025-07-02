import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { createUser, findUserByEmail, verifyPassword, generateToken, saveUser, verifyUserByToken, getAllUsers, updateUser, deleteUser } from './api/supabase-service.js';
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
    ? ['https://thinktact.ai', 'https://www.thinktact.ai', 'http://localhost:5174', 'http://localhost:5173']
    : ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  try {
    res.json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      supabaseUrl: !!process.env.SUPABASE_URL,
      supabaseKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      jwtSecret: !!process.env.JWT_SECRET,
      resendKey: !!process.env.RESEND_API_KEY
    });
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({ 
      status: 'error', 
      error: error.message,
      timestamp: new Date().toISOString()
    });
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
          data: allColumns,
          error: allColumnsError ? allColumnsError.message : null
        },
        exactQueryTest: {
          data: exactQuery,
          error: exactError ? exactError.message : null
        }
      }
    });

  } catch (error) {
    console.error('Error in debug endpoint:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to debug Supabase config',
      message: error.message,
      config: {
        supabaseUrl: process.env.SUPABASE_URL || 'NOT_SET',
        supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || 'NOT_SET',
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
    const { email, password, name, isVerified = false, isAdmin = false } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        error: 'Email and password are required' 
      });
    }

    const result = await createUser({ email, password, name: name || email.split('@')[0], isVerified, isAdmin });
    
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
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        error: 'Email and password are required' 
      });
    }

    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid email or password' 
      });
    }

    const isValidPassword = await verifyPassword(user, password);
    if (!isValidPassword) {
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid email or password' 
      });
    }

    // Check if user is verified
    if (!user.isVerified) {
      return res.status(401).json({ 
        success: false, 
        error: 'Please verify your email before logging in' 
      });
    }

    const token = generateToken(user);
    
    res.json({
      success: true,
      message: 'Login successful',
      user: { 
        ...user, 
        password: undefined
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Password reset endpoint
app.post('/api/auth/reset-password', async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    
    if (!email || !newPassword) {
      return res.status(400).json({ 
        success: false, 
        error: 'Email and new password are required' 
      });
    }

    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        error: 'User not found' 
      });
    }

    // Update user password
    const hashedPassword = bcrypt.hashSync(newPassword, 10);
    const updatedUser = { ...user, password: hashedPassword };
    await saveUser(updatedUser);
    
    res.json({
      success: true,
      message: 'Password reset successfully'
    });
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

// Test endpoints (removed blob dependencies)
app.post('/api/test-blob', async (req, res) => {
  res.json({
    success: true,
    message: 'Blob endpoints removed - using Supabase database',
    timestamp: new Date().toISOString()
  });
});

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

// Analysis endpoints (simplified for now)
app.post('/api/analysis/save', async (req, res) => {
  try {
    res.json({ 
      success: true, 
      message: 'Analysis save endpoint ready',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Analysis save error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/analysis/history', async (req, res) => {
  try {
    res.json({ 
      success: true, 
      history: [],
      message: 'Analysis history endpoint ready',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Analysis history error:', error);
    res.status(500).json({ error: 'Internal server error' });
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
    
    // Update user with reset token
    const updatedUser = await updateUser(user.id, { 
      reset_token: resetToken,
      reset_token_expires: new Date(Date.now() + 60 * 60 * 1000) // 1 hour from now
    });

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