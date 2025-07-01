import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://thinktact.ai', 'https://www.thinktact.ai']
    : ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    blobToken: !!process.env.BLOB_READ_WRITE_TOKEN,
    jwtSecret: !!process.env.JWT_SECRET
  });
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

// Basic auth endpoints (simplified for now)
app.post('/api/auth/register', async (req, res) => {
  try {
    res.json({ 
      success: true, 
      message: 'Registration endpoint ready',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    res.json({ 
      success: true, 
      message: 'Login endpoint ready',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
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