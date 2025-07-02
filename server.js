import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { createServer as createViteServer } from 'vite';
// Admin user creation moved to Supabase service

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Admin user creation handled by Supabase service

// Import API routes from backend
import registerHandler from './backend/api/auth/register.js';
import loginHandler from './backend/api/auth/login.js';
import requestResetHandler from './backend/api/auth/request-reset.js';
import resetPasswordHandler from './backend/api/auth/reset-password.js';
import verifyHandler from './backend/api/auth/verify.js';
import changeEmailHandler from './backend/api/auth/change-email.js';
import verifyEmailChangeHandler from './backend/api/auth/verify-email-change.js';
import resendVerificationHandler from './backend/api/auth/resend-verification.js';
import testEmailHandler from './backend/api/test-email.js';
import testUsersHandler from './backend/api/test-users.js';
import migrateUsersHandler from './backend/api/migrate-users.js';
import usersHandler from './backend/api/admin/users.js';
import resetPasswordAdminHandler from './backend/api/admin/reset-password.js';
import toggleStatusHandler from './backend/api/admin/toggle-status.js';
import deleteUserHandler from './backend/api/admin/delete-user.js';
import toggleAdminHandler from './backend/api/admin/toggle-admin.js';
import createUserHandler from './backend/api/admin/create-user.js';
import createSuperUserHandler from './backend/api/admin/create-super-user.js';
import verifyUserHandler from './backend/api/admin/verify-user.js';
import saveAnalysisHandler from './backend/api/save-analysis.js';
import getAnalysisHistoryHandler from './backend/api/get-analysis-history.js';
import deleteAnalysisHandler from './backend/api/delete-analysis.js';

// API Routes
app.post('/api/auth/register', async (req, res) => {
  await registerHandler(req, res);
});

app.post('/api/auth/login', async (req, res) => {
  await loginHandler(req, res);
});

// Blob endpoint removed - using Supabase database

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

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(join(__dirname, 'dist')));
  
  app.get('*', (req, res) => {
    res.sendFile(join(__dirname, 'dist', 'index.html'));
  });
} else {
  // Development: Create Vite server
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa'
  });

  app.use(vite.middlewares);
}

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📱 API available at http://localhost:${PORT}/api`);
}); 