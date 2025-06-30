class AuthService {
  constructor() {
    this.baseUrl = '/api'; // This will be your Vercel API route
  }

  // Register a new user
  async registerUser(email, password, extra = {}) {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          ...extra
        })
      });
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: 'Registration failed' };
    }
  }

  // Login user
  async loginUser(email, password) {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const result = await response.json();
      if (result.user && result.user.verified === false) {
        return { success: false, error: 'Please verify your email before logging in.' };
      }
      return result;
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Login failed' };
    }
  }

  // Get user by email (for password reset, etc.)
  async getUserByEmail(email) {
    try {
      const blobName = `users/${btoa(email).replace(/[^a-zA-Z0-9]/g, '')}.json`;
      const response = await fetch(`/api/blob/${encodeURIComponent(blobName)}`);
      if (!response.ok) return null;
      return await response.json();
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  }

  // Request password reset
  async requestPasswordReset(email, securityAnswer) {
    try {
      const response = await fetch('/api/auth/request-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, securityAnswer })
      });
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Password reset request error:', error);
      return { success: false, error: 'Failed to process password reset request' };
    }
  }

  // Reset password with token
  async resetPassword(token, newPassword) {
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword })
      });
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Password reset error:', error);
      return { success: false, error: 'Failed to reset password' };
    }
  }

  // Demo mode for development (fallback)
  async demoLogin(email, password) {
    if (email && password) {
      const userData = {
        id: Date.now().toString(),
        email: email,
        name: email.split('@')[0],
        firstName: email.split('@')[0],
        lastName: 'Demo',
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        isDemoUser: true
      };
      return { success: true, user: userData };
    } else {
      return { success: false, error: 'Email and password are required' };
    }
  }
}

export const authService = new AuthService(); 