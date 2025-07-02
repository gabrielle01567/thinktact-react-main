class AuthService {
  constructor() {
    // Use the deployed backend URL
    this.baseUrl = import.meta.env.VITE_BACKEND_URL || 'https://backendv2-ruddy.vercel.app/api';
    console.log('VITE_BACKEND_URL in production:', import.meta.env.VITE_BACKEND_URL);
    console.log('AuthService baseUrl:', this.baseUrl);
  }

  // Register a new user
  async registerUser(email, password, extra = {}) {
    try {
      const response = await fetch(`${this.baseUrl}/auth/register`, {
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
      const response = await fetch(`${this.baseUrl}/auth/login`, {
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
      // This endpoint should be implemented in the backend if needed
      const response = await fetch(`${this.baseUrl}/auth/user/${encodeURIComponent(email)}`);
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
      const response = await fetch(`${this.baseUrl}/auth/request-reset`, {
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
      console.log('🔍 AuthService: Sending reset request with token:', token ? token.substring(0, 10) + '...' : 'null');
      
      const response = await fetch(`${this.baseUrl}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword })
      });
      
      console.log('🔍 AuthService: Response status:', response.status);
      
      const result = await response.json();
      console.log('🔍 AuthService: Response data:', result);
      
      return result;
    } catch (error) {
      console.error('Password reset error:', error);
      return { success: false, error: 'Failed to reset password' };
    }
  }

  // Change email
  async changeEmail(currentEmail, newEmail) {
    try {
      const response = await fetch(`${this.baseUrl}/auth/change-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentEmail, newEmail })
      });
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Change email error:', error);
      return { success: false, error: 'Failed to change email' };
    }
  }

  // Delete account
  async deleteAccount(email) {
    try {
      const response = await fetch(`${this.baseUrl}/auth/delete-account`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Delete account error:', error);
      return { success: false, error: 'Failed to delete account' };
    }
  }

  // Resend verification email
  async resendVerification(email) {
    try {
      const response = await fetch(`${this.baseUrl}/auth/resend-verification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Resend verification error:', error);
      return { success: false, error: 'Failed to resend verification email' };
    }
  }

  // Verify email change
  async verifyEmailChange(token) {
    try {
      const response = await fetch(`${this.baseUrl}/auth/verify-email-change`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      });
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Verify email change error:', error);
      return { success: false, error: 'Failed to verify email change' };
    }
  }

  // Verify email
  async verifyEmail(token) {
    try {
      const response = await fetch(`${this.baseUrl}/auth/verify?token=${encodeURIComponent(token)}`);
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Verify email error:', error);
      return { success: false, error: 'Failed to verify email' };
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