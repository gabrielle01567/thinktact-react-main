import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

const Profile = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [showEmailChange, setShowEmailChange] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [isChangingEmail, setIsChangingEmail] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  const handleEmailChange = async (e) => {
    e.preventDefault();
    setIsChangingEmail(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch('/api/auth/change-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentEmail: user.email,
          newEmail: newEmail
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Verification email sent to your new email address. Please check your inbox and click the verification link to complete the change.');
        setShowEmailChange(false);
        setNewEmail('');
      } else {
        setError(data.error || 'Failed to send verification email');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setIsChangingEmail(false);
    }
  };

  const handleDeleteAccount = async (e) => {
    e.preventDefault();
    
    if (deleteConfirmation !== 'DELETE') {
      setError('Please type DELETE in all caps to confirm account deletion.');
      return;
    }

    setIsDeleting(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch('/api/auth/delete-account', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: user.email
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Account deleted successfully. You will receive a confirmation email shortly.');
        logout();
        setTimeout(() => {
          navigate('/');
        }, 3000);
      } else {
        setError(data.error || 'Failed to delete account');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
      setDeleteConfirmation('');
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow rounded-lg">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200">
              <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
              <p className="text-gray-600">Manage your account information</p>
            </div>

            {/* Profile Information */}
            <div className="px-6 py-6">
              {message && (
                <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md">
                  <p className="text-green-800">{message}</p>
                </div>
              )}

              {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-red-800">{error}</p>
                </div>
              )}

              <div className="space-y-6">
                {/* Name Section */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        First Name
                      </label>
                      <div className="p-3 bg-gray-50 border border-gray-300 rounded-md">
                        <span className="text-gray-900">{user?.firstName || 'Not provided'}</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Last Name
                      </label>
                      <div className="p-3 bg-gray-50 border border-gray-300 rounded-md">
                        <span className="text-gray-900">{user?.lastName || 'Not provided'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Email Section */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Email Address</h3>
                  <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-300 rounded-md">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Current Email
                      </label>
                      <span className="text-gray-900">{user?.email}</span>
                      {user?.verified && (
                        <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Verified
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => setShowEmailChange(!showEmailChange)}
                      className="px-4 py-2 text-sm font-medium text-pink-950 bg-white border border-pink-950 rounded-md hover:bg-pink-50 transition-colors duration-150"
                    >
                      Change Email
                    </button>
                  </div>

                  {/* Email Change Form */}
                  {showEmailChange && (
                    <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
                      <form onSubmit={handleEmailChange} className="space-y-4">
                        <div>
                          <label htmlFor="newEmail" className="block text-sm font-medium text-gray-700 mb-1">
                            New Email Address
                          </label>
                          <input
                            type="email"
                            id="newEmail"
                            value={newEmail}
                            onChange={(e) => setNewEmail(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-950 focus:border-pink-950"
                            placeholder="Enter new email address"
                            required
                          />
                        </div>
                        <div className="flex space-x-3">
                          <button
                            type="submit"
                            disabled={isChangingEmail || !newEmail}
                            className="px-4 py-2 text-sm font-medium text-white bg-pink-950 rounded-md hover:bg-pink-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
                          >
                            {isChangingEmail ? 'Sending...' : 'Send Verification Email'}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setShowEmailChange(false);
                              setNewEmail('');
                              setError('');
                            }}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors duration-150"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    </div>
                  )}
                </div>

                {/* Account Information */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Account Information</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-4 bg-gray-50 border border-gray-300 rounded-md">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Account Status
                        </label>
                        <span className="text-gray-900">
                          {user?.blocked ? 'Blocked' : 'Active'}
                        </span>
                      </div>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        user?.blocked 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {user?.blocked ? 'Blocked' : 'Active'}
                      </span>
                    </div>

                    <div className="flex justify-between items-center p-4 bg-gray-50 border border-gray-300 rounded-md">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Member Since
                        </label>
                        <span className="text-gray-900">
                          {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
                        </span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center p-4 bg-gray-50 border border-gray-300 rounded-md">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Last Login
                        </label>
                        <span className="text-gray-900">
                          {user?.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Unknown'}
                        </span>
                      </div>
                    </div>

                    {user?.isAdmin && (
                      <div className="flex justify-between items-center p-4 bg-blue-50 border border-blue-300 rounded-md">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Admin Status
                          </label>
                          <span className="text-gray-900">Administrator</span>
                        </div>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Admin
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Danger Zone */}
                <div>
                  <h3 className="text-lg font-medium text-red-900 mb-4">Danger Zone</h3>
                  <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-red-900">Delete Account</h4>
                        <p className="text-sm text-red-700 mt-1">
                          This action cannot be undone. All your data will be permanently deleted.
                        </p>
                      </div>
                      <button
                        onClick={() => setShowDeleteConfirm(true)}
                        className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors duration-150"
                      >
                        Delete Account
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Account Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-red-900 mb-4">Delete Account</h3>
            <p className="text-sm text-gray-700 mb-4">
              This action will permanently delete your account and all associated data. 
              This cannot be undone.
            </p>
            <form onSubmit={handleDeleteAccount} className="space-y-4">
              <div>
                <label htmlFor="deleteConfirmation" className="block text-sm font-medium text-gray-700 mb-1">
                  Type DELETE to confirm
                </label>
                <input
                  type="text"
                  id="deleteConfirmation"
                  value={deleteConfirmation}
                  onChange={(e) => setDeleteConfirmation(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="DELETE"
                  required
                />
              </div>
              <div className="flex space-x-3">
                <button
                  type="submit"
                  disabled={isDeleting || deleteConfirmation !== 'DELETE'}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
                >
                  {isDeleting ? 'Deleting...' : 'Delete Account'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setDeleteConfirmation('');
                    setError('');
                  }}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors duration-150"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Profile; 