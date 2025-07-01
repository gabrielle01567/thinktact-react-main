import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
// import { createAdminUser } from './api/shared-storage.js';

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

// Create admin user on server start - temporarily disabled for Railway deployment
// createAdminUser().catch(console.error);

// Import API routes
import registerHandler from './api/auth/register.js';
import loginHandler from './api/auth/login.js';
import blobHandler from './api/blob/[filename].js';
import requestResetHandler from './api/auth/request-reset.js';
import resetPasswordHandler from './api/auth/reset-password.js';
import verifyHandler from './api/auth/verify.js';
import changeEmailHandler from './api/auth/change-email.js';
import verifyEmailChangeHandler from './api/auth/verify-email-change.js';
import resendVerificationHandler from './api/auth/resend-verification.js';
import testEmailHandler from './api/test-email.js';
import testUsersHandler from './api/test-users.js';
import migrateUsersHandler from './api/migrate-users.js';
import usersHandler from './api/admin/users.js';
import resetPasswordAdminHandler from './api/admin/reset-password.js';
import toggleStatusHandler from './api/admin/toggle-status.js';
import deleteUserHandler from './api/admin/delete-user.js';
import toggleAdminHandler from './api/admin/toggle-admin.js';
import createUserHandler from './api/admin/create-user.js';
import createSuperUserHandler from './api/admin/create-super-user.js';
import verifyUserHandler from './api/admin/verify-user.js';
import saveAnalysisHandler from './api/save-analysis.js';
import getAnalysisHistoryHandler from './api/get-analysis-history.js';
import deleteAnalysisHandler from './api/delete-analysis.js';

// API Routes
app.post('/api/auth/register', async (req, res) => {
  await registerHandler(req, res);
});

app.post('/api/auth/login', async (req, res) => {
  await loginHandler(req, res);
});

app.get('/api/blob/:filename', async (req, res) => {
  req.query.filename = req.params.filename;
  await blobHandler(req, res);
});

app.post('/api/auth/request-reset', async (req, res) => {
  await requestResetHandler(req, res);
});

app.post('/api/auth/reset-password', async (req, res) => {
  await resetPasswordHandler(req, res);
});

app.get('/api/auth/verify', async (req, res) => {
  await verifyHandler(req, res);
});

app.post('/api/auth/change-email', async (req, res) => {
  await changeEmailHandler(req, res);
});

app.post('/api/auth/verify-email-change', async (req, res) => {
  await verifyEmailChangeHandler(req, res);
});

app.post('/api/auth/resend-verification', async (req, res) => {
  await resendVerificationHandler(req, res);
});

app.get('/api/test-email', async (req, res) => {
  await testEmailHandler(req, res);
});

app.get('/api/test-users', async (req, res) => {
  await testUsersHandler(req, res);
});

app.post('/api/migrate-users', async (req, res) => {
  await migrateUsersHandler(req, res);
});

// Admin API Routes
app.get('/api/admin/users', async (req, res) => {
  await usersHandler(req, res);
});

app.post('/api/admin/reset-password', async (req, res) => {
  await resetPasswordAdminHandler(req, res);
});

app.post('/api/admin/toggle-status', async (req, res) => {
  await toggleStatusHandler(req, res);
});

app.post('/api/admin/toggle-admin', async (req, res) => {
  await toggleAdminHandler(req, res);
});

app.delete('/api/admin/delete-user', async (req, res) => {
  await deleteUserHandler(req, res);
});

app.post('/api/admin/create-user', async (req, res) => {
  await createUserHandler(req, res);
});

app.post('/api/admin/create-super-user', async (req, res) => {
  await createSuperUserHandler(req, res);
});

app.post('/api/admin/verify-user', async (req, res) => {
  await verifyUserHandler(req, res);
});

// Analysis History API Routes
app.post('/api/analysis/save', async (req, res) => {
  await saveAnalysisHandler(req, res);
});

app.get('/api/analysis/history', async (req, res) => {
  await getAnalysisHistoryHandler(req, res);
});

app.delete('/api/analysis/delete', async (req, res) => {
  await deleteAnalysisHandler(req, res);
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'ThinkTact Backend API', 
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth/*',
      admin: '/api/admin/*',
      analysis: '/api/analysis/*',
      health: '/health'
    }
  });
});

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend API is working!' });
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../dist')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
  });
}

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
}); 