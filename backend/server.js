import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { createUser, findUserByEmail, verifyPassword, generateToken, saveUser, verifyUserByToken, getAllUsers, updateUser, deleteUser } from './api/supabase-service.js';
import { sendVerificationEmail, sendPasswordResetEmail } from './api/email-service.js';
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
        const emailResult = await sendVerificationEmail(email, result.verificationToken, result.user.name);
        if (emailResult.success) {
          res.json({
            success: true,
            message: 'User registered successfully. Please check your email to verify your account.',
            user: result.user
          });
        } else {
          // User created but email failed
          res.json({
            success: true,
            message: 'User registered successfully, but verification email could not be sent. Please contact support.',
            user: result.user
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