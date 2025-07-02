import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { authService } from '../services/authService';

export default function VerifyEmail() {
  const [email, setEmail] = useState('');
  const [isResending, setIsResending] = useState(false);
  const [message, setMessage] = useState('');
  const location = useLocation();

  // Get email and message from location state if available (from registration or login)
  useEffect(() => {
    if (location.state?.email) {
      setEmail(location.state.email);
    }
    if (location.state?.message) {
      setMessage(location.state.message);
    }
  }, [location.state]);

  const handleResendVerification = async () => {
    if (!email) {
      setMessage('Please enter your email address');
      return;
    }

    setIsResending(true);
    setMessage('');

    try {
      const response = await authService.resendVerification(email);

      if (response.success) {
        setMessage('Verification email sent successfully! Please check your inbox.');
      } else {
        setMessage(response.error || 'Failed to send verification email');
      }
    } catch (error) {
      setMessage('Error sending verification email. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="bg-white p-8 rounded shadow-md max-w-md w-full text-center">
        <h1 className="text-2xl font-bold mb-4 text-gray-900">Verify Your Email</h1>
        <p className="mb-4 text-gray-700">
          Thank you for registering! To activate your account, please check your email and click the verification link we sent you.
        </p>
        <p className="text-gray-500 mb-6">If you don't see the email, check your spam or junk folder.</p>
        
        {message && (
          <div className={`mb-6 p-3 rounded ${
            message.includes('successfully') || message.includes('successful')
              ? 'bg-green-100 text-green-700' 
              : 'bg-blue-100 text-blue-700'
          }`}>
            {message}
          </div>
        )}
        
        <div className="border-t pt-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-900">Didn't receive the email?</h2>
          <div className="space-y-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              className="w-full p-3 border border-gray-300 rounded bg-gray-200 text-black"
            />
            <button
              onClick={handleResendVerification}
              disabled={isResending}
              className="w-full px-4 py-2 bg-pink-950 text-white rounded hover:bg-pink-900 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isResending ? 'Sending...' : 'Resend Verification Email'}
            </button>
          </div>
        </div>
        
        <div className="border-t pt-6 mt-6">
          <Link
            to="/login"
            className="inline-block w-full px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 text-center"
          >
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
} 