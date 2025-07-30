import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/authService';

const SECURITY_QUESTIONS = [
  'What was your childhood nickname?',
  'What is the name of your favorite childhood friend?',
  'What was the name of your first pet?',
  "What is your mother's maiden name?",
  'What was the make and model of your first car?'
];

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [securityQuestion, setSecurityQuestion] = useState(SECURITY_QUESTIONS[0]);
  const [securityAnswer, setSecurityAnswer] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [showResetLink, setShowResetLink] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Get the intended destination from location state, or default to dashboard
  const from = location.state?.from?.pathname || '/dashboard';
  const message = location.state?.message;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setShowResetLink(false);
    setResetSent(false);

    // Registration validation
    if (isRegisterMode) {
      if (!firstName.trim() || !lastName.trim() || !securityAnswer.trim()) {
        setError('All fields are required.');
        setIsLoading(false);
        return;
      }
      
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        setIsLoading(false);
        return;
      }
    }

    try {
      let result;
      if (isRegisterMode) {
        console.log('🔍 Starting registration process...');
        result = await register(email, password, {
          firstName,
          lastName,
          securityQuestion,
          securityAnswer
        });
        
        console.log('🔍 Registration result:', result);
        
        if (result.success) {
          // Redirect to verification page after successful registration
          navigate('/verify-email', { 
            state: { 
              email: email,
              message: 'Registration successful! Please check your email to verify your account.'
            }
          });
          return;
        } else {
          setError(result.error || 'Registration failed');
          if (result.canReset) setShowResetLink(true);
        }
      } else {
        console.log('🔍 Starting login process...');
        result = await login(email, password);
        
        console.log('🔍 Login result:', result);
        
        if (result.success) {
          // Navigate to the home page
          navigate('/', { replace: true });
        } else {
          // Check if user needs to verify their email
          if (result.needsVerification) {
            // Redirect to verification page with email
            navigate('/verify-email', { 
              state: { 
                email: result.email,
                message: 'Please verify your email address before logging in.'
              }
            });
            return;
          }
          setError(result.error || 'Login failed');
        }
      }
    } catch (error) {
      console.error('🔍 Authentication error:', error);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendReset = async () => {
    setIsLoading(true);
    setError('');
    try {
      const result = await authService.requestPasswordReset(email);
      if (result.success) {
        setResetSent(true);
        setShowResetLink(false);
      } else {
        setError(result.error || 'Failed to send reset link');
      }
    } catch (err) {
      setError('Failed to send reset link');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsRegisterMode(!isRegisterMode);
    setError('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setFirstName('');
    setLastName('');
    setSecurityQuestion(SECURITY_QUESTIONS[0]);
    setSecurityAnswer('');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="flex items-center">
            <svg 
              className="h-12 w-12 text-pink-950" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="1.5" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              {/* Brain circuit design */}
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
              <path d="M12 6v12" />
              <path d="M6 12h12" />
              <path d="M8.5 8.5l7 7" />
              <path d="M15.5 8.5l-7 7" />
              {/* AI circuit nodes */}
              <circle cx="12" cy="12" r="2" fill="currentColor" />
              <circle cx="8.5" cy="8.5" r="1" fill="currentColor" />
              <circle cx="15.5" cy="8.5" r="1" fill="currentColor" />
              <circle cx="8.5" cy="15.5" r="1" fill="currentColor" />
              <circle cx="15.5" cy="15.5" r="1" fill="currentColor" />
            </svg>
            <h2 className="ml-3 text-3xl font-bold text-pink-950">ThinkTactAI</h2>
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
          {isRegisterMode ? 'Create your account' : 'Sign in to your account'}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {isRegisterMode ? 'Start analyzing arguments with AI' : 'Access your argument analysis results'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {message && (
            <div className="mb-6 rounded-md bg-blue-50 p-4">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">Authentication Required</h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <p>{message}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            {isRegisterMode && (
              <>
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium leading-6 text-gray-900">
                    First Name
                  </label>
                  <div className="mt-2">
                    <input
                      id="firstName"
                      name="firstName"
                      type="text"
                      autoComplete="given-name"
                      required={isRegisterMode}
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="block w-full rounded-md border-0 py-1.5 text-black bg-white shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-pink-950 sm:text-sm sm:leading-6"
                      placeholder="Enter your first name"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium leading-6 text-gray-900">
                    Last Name
                  </label>
                  <div className="mt-2">
                    <input
                      id="lastName"
                      name="lastName"
                      type="text"
                      autoComplete="family-name"
                      required={isRegisterMode}
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="block w-full rounded-md border-0 py-1.5 text-black bg-white shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-pink-950 sm:text-sm sm:leading-6"
                      placeholder="Enter your last name"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="securityQuestion" className="block text-sm font-medium leading-6 text-gray-900">
                    Security Question
                  </label>
                  <div className="mt-2">
                    <select
                      id="securityQuestion"
                      name="securityQuestion"
                      required={isRegisterMode}
                      value={securityQuestion}
                      onChange={(e) => setSecurityQuestion(e.target.value)}
                      className="block w-full rounded-md border-0 py-1.5 text-black bg-white shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-pink-950 sm:text-sm sm:leading-6"
                    >
                      {SECURITY_QUESTIONS.map((q, idx) => (
                        <option key={idx} value={q}>{q}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label htmlFor="securityAnswer" className="block text-sm font-medium leading-6 text-gray-900">
                    Security Answer
                  </label>
                  <div className="mt-2">
                    <input
                      id="securityAnswer"
                      name="securityAnswer"
                      type="text"
                      required={isRegisterMode}
                      value={securityAnswer}
                      onChange={(e) => setSecurityAnswer(e.target.value)}
                      className="block w-full rounded-md border-0 py-1.5 text-black bg-white shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-pink-950 sm:text-sm sm:leading-6"
                      placeholder="Enter your answer"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900">
                Email address
              </label>
              <div className="mt-2">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full rounded-md border-0 py-1.5 text-black bg-white shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-pink-950 sm:text-sm sm:leading-6"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium leading-6 text-gray-900">
                Password
              </label>
              <div className="mt-2">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete={isRegisterMode ? "new-password" : "current-password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-md border-0 py-1.5 text-black bg-white shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-pink-950 sm:text-sm sm:leading-6"
                  placeholder={isRegisterMode ? "Create a password (min 6 characters)" : "Enter your password"}
                />
              </div>
              {isRegisterMode && (
                <p className="mt-1 text-xs text-gray-500">
                  Password must be at least 6 characters long
                </p>
              )}
              {!isRegisterMode && (
                <div className="flex items-center justify-end mt-2">
                  <Link
                    to="/forgot-password"
                    className="text-sm text-pink-950 hover:text-pink-900"
                  >
                    Forgot your password?
                  </Link>
                </div>
              )}
            </div>

            {isRegisterMode && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium leading-6 text-gray-900">
                  Confirm Password
                </label>
                <div className="mt-2">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="block w-full rounded-md border-0 py-1.5 text-black bg-white shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-pink-950 sm:text-sm sm:leading-6"
                    placeholder="Enter your password again"
                  />
                </div>
              </div>
            )}

            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="flex">
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      {isRegisterMode ? 'Registration Error' : 'Login Error'}
                    </h3>
                    <div className="mt-2 text-sm text-red-700">
                      <p>{error}</p>
                      {isRegisterMode && showResetLink && !resetSent && (
                        <button
                          type="button"
                          onClick={handleSendReset}
                          className="mt-2 text-blue-700 underline hover:text-blue-900"
                          disabled={isLoading}
                        >
                          Send password reset link to this email
                        </button>
                      )}
                      {isRegisterMode && resetSent && (
                        <p className="mt-2 text-green-700">Password reset link sent! Please check your email.</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="flex w-full justify-center rounded-md bg-pink-950 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-pink-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink-950 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {isRegisterMode ? 'Creating account...' : 'Signing in...'}
                  </div>
                ) : (
                  isRegisterMode ? 'Create Account' : 'Sign in'
                )}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-2 text-gray-500">
                  {isRegisterMode ? 'Already have an account?' : "Don't have an account?"}
                </span>
              </div>
            </div>

            <div className="mt-6">
              <button
                type="button"
                onClick={toggleMode}
                className="flex w-full justify-center rounded-md border border-pink-950 px-3 py-2 text-sm font-semibold text-pink-950 shadow-sm hover:bg-pink-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink-950"
              >
                {isRegisterMode ? 'Sign in instead' : 'Create new account'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login; 