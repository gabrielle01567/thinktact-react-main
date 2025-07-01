import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { put, list } from '@vercel/blob';
import { createUser, findUserByEmail, verifyPassword, generateToken, saveUser, verifyUserByToken } from './api/supabase-service.js';
import { sendVerificationEmail, sendPasswordResetEmail } from './api/email-service.js';
import bcrypt from 'bcryptjs';

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

// Test blob store endpoints
app.post('/api/test-blob', async (req, res) => {
  try {
    const testData = req.body;
    const blobName = `test/test-${Date.now()}.json`;
    
    const result = await put(blobName, JSON.stringify(testData), {
      access: 'public',
      addRandomSuffix: false,
      allowOverwrite: true
    });
    
    res.json({
      success: true,
      message: 'Test file saved to blob store',
      blobUrl: result.url,
      blobName: blobName
    });
  } catch (error) {
    console.error('Test blob save error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      message: 'Blob store connection failed'
    });
  }
});

app.get('/api/test-blob', async (req, res) => {
  try {
    const { blobs } = await list({ prefix: 'test/' });
    
    res.json({
      success: true,
      message: 'Test files in blob store',
      count: blobs.length,
      blobs: blobs.map(blob => ({
        name: blob.pathname,
        size: blob.size,
        url: blob.url
      }))
    });
  } catch (error) {
    console.error('Test blob list error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      message: 'Blob store connection failed'
    });
  }
});

app.get('/api/list-blobs', async (req, res) => {
  try {
    const { blobs } = await list({ prefix: '' });
    
    res.json({
      success: true,
      message: 'All blobs in store',
      count: blobs.length,
      blobs: blobs.map(blob => ({
        name: blob.pathname,
        size: blob.size,
        url: blob.url
      }))
    });
  } catch (error) {
    console.error('List blobs error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      message: 'Blob store connection failed'
    });
  }
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
  console.log(`Blob token exists: ${!!process.env.BLOB_READ_WRITE_TOKEN}`);
  console.log(`JWT secret exists: ${!!process.env.JWT_SECRET}`);
}); 