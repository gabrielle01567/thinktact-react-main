class AuthService {
  constructor() {
    // Use the deployed backend URL
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'https://backendv2-ruddy.vercel.app';
    
    // Handle cases where VITE_BACKEND_URL already includes /api
    if (backendUrl.includes('/api')) {
      this.baseUrl = backendUrl;
    } else {
      this.baseUrl = backendUrl.endsWith('/') ? backendUrl + 'api' : backendUrl + '/api';
    }
    
    console.log('VITE_BACKEND_URL in production:', import.meta.env.VITE_BACKEND_URL);
    console.log('AuthService baseUrl:', this.baseUrl);
    
    // Test the backend URL on initialization
    this.testBackendConnection();
  }

  async testBackendConnection() {
    try {
      const response = await fetch(`${this.baseUrl}/health`);
      console.log('🔍 Backend health check status:', response.status);
      if (!response.ok) {
        console.error('🔍 Backend health check failed:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('🔍 Backend health check error:', error);
    }
  }

  // Register a new user
  async registerUser(email, password, extra = {}) {
    try {
      console.log('🔍 AuthService: Registering user with email:', email);
      console.log('🔍 AuthService: Backend URL:', this.baseUrl);
      
      const requestBody = {
        email,
        password,
        ...extra
      };
      
      console.log('🔍 AuthService: Request body:', { ...requestBody, password: '[HIDDEN]' });
      
      const response = await fetch(`${this.baseUrl}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });
      
      console.log('🔍 AuthService: Response status:', response.status);
      console.log('🔍 AuthService: Response ok:', response.ok);
      
      if (!response.ok) {
        console.error('🔍 AuthService: HTTP error:', response.status, response.statusText);
        const errorText = await response.text();
        console.error('🔍 AuthService: Error response:', errorText);
        return { success: false, error: `HTTP ${response.status}: ${response.statusText}` };
      }
      
      const result = await response.json();
      console.log('🔍 AuthService: Response result:', result);
      return result;
    } catch (error) {
      console.error('🔍 AuthService: Registration error:', error);
      return { success: false, error: 'Registration failed: ' + error.message };
    }
  }

  // Login user
  async loginUser(email, password) {
    try {
      console.log('🔍 AuthService: Starting login for email:', email);
      console.log('🔍 AuthService: Backend URL:', this.baseUrl);
      console.log('🔍 AuthService: Full login URL:', `${this.baseUrl}/auth/login`);
      
      // First, test if the backend is accessible
      try {
        const healthResponse = await fetch(`${this.baseUrl}/health`);
        console.log('🔍 AuthService: Health check status:', healthResponse.status);
        if (!healthResponse.ok) {
          console.error('🔍 AuthService: Health check failed:', healthResponse.status, healthResponse.statusText);
          return { success: false, error: 'Backend is not accessible. Please try again later.' };
        }
      } catch (healthError) {
        console.error('🔍 AuthService: Health check error:', healthError);
        return { success: false, error: 'Cannot connect to backend. Please check your internet connection.' };
      }
      
      const response = await fetch(`${this.baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      console.log('🔍 AuthService: Response status:', response.status);
      console.log('🔍 AuthService: Response ok:', response.ok);
      console.log('🔍 AuthService: Response status text:', response.statusText);
      
      if (!response.ok) {
        console.error('🔍 AuthService: HTTP error:', response.status, response.statusText);
        const errorText = await response.text();
        console.error('🔍 AuthService: Error response body:', errorText);
        
        // Check if it's actually a 404
        if (response.status === 404) {
          return { success: false, error: 'Login endpoint not found. Please check backend configuration.' };
        }
        
        try {
          const errorJson = JSON.parse(errorText);
          return { success: false, error: errorJson.error || `HTTP ${response.status}: ${response.statusText}` };
        } catch (parseError) {
          return { success: false, error: `HTTP ${response.status}: ${response.statusText}` };
        }
      }
      
      const result = await response.json();
      console.log('🔍 AuthService: Login result:', result);
      
      if (result.user && result.user.isVerified === false) {
        return { success: false, error: 'Please verify your email before logging in.' };
      }
      return result;
    } catch (error) {
      console.error('🔍 AuthService: Login error:', error);
      return { success: false, error: 'Login failed: ' + error.message };
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