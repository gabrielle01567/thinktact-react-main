import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';

export default function Admin() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  
  // Create user form state
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [createUserForm, setCreateUserForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    securityQuestion: 'What was the name of your first pet?',
    securityAnswer: '',
    isAdmin: false
  });

  // Super user creation form state
  const [showCreateSuperUser, setShowCreateSuperUser] = useState(false);
  const [superUserForm, setSuperUserForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  // Check if current user is admin or super user
  const isAdmin = user?.isAdmin || user?.isSuperUser;
  const isSuperUser = user?.isSuperUser;

  const [migrationResult, setMigrationResult] = useState(null);
  const [testUsersResult, setTestUsersResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [showResetEmailModal, setShowResetEmailModal] = useState(false);
  const [resetEmailTarget, setResetEmailTarget] = useState(null);
  const [isSendingResetEmail, setIsSendingResetEmail] = useState(false);

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
    }
  }, [isAdmin]);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
      } else {
        setMessage('Failed to fetch users');
      }
    } catch (error) {
      setMessage('Error fetching users');
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (userId) => {
    if (!newPassword || newPassword.length < 6) {
      setMessage('Password must be at least 6 characters');
      return;
    }

    try {
      const response = await fetch('/api/admin/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, newPassword })
      });

      const data = await response.json();
      if (data.success) {
        setMessage('Password reset successfully');
        setNewPassword('');
      } else {
        setMessage(data.error || 'Failed to reset password');
      }
    } catch (error) {
      setMessage('Error resetting password');
    }
  };

  const toggleUserStatus = async (userId, blocked) => {
    try {
      const response = await fetch('/api/admin/toggle-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, blocked })
      });

      const data = await response.json();
      if (data.success) {
        setMessage(`User ${blocked ? 'blocked' : 'unblocked'} successfully`);
        fetchUsers(); // Refresh the list
      } else {
        setMessage(data.error || 'Failed to update user status');
      }
    } catch (error) {
      setMessage('Error updating user status');
    }
  };

  const deleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch('/api/admin/delete-user', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });

      const data = await response.json();
      if (data.success) {
        setMessage('User deleted successfully');
        fetchUsers(); // Refresh the list
      } else {
        setMessage(data.error || 'Failed to delete user');
      }
    } catch (error) {
      setMessage('Error deleting user');
    }
  };

  const elevateToAdmin = async (userId, makeAdmin) => {
    try {
      const response = await fetch('/api/admin/toggle-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, isAdmin: makeAdmin })
      });
      const data = await response.json();
      if (data.success) {
        setMessage(`User ${makeAdmin ? 'elevated to' : 'demoted from'} admin successfully`);
        fetchUsers();
      } else {
        setMessage(data.error || 'Failed to update admin status');
      }
    } catch (error) {
      setMessage('Error updating admin status');
    }
  };

  const verifyUser = async (email) => {
    try {
      const response = await fetch('/api/admin/verify-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await response.json();
      if (data.success) {
        setMessage('User verified successfully');
        fetchUsers(); // Refresh the list
      } else {
        setMessage(data.error || 'Failed to verify user');
      }
    } catch (error) {
      setMessage('Error verifying user');
    }
  };

  const sendPasswordReset = async (email) => {
    try {
      const response = await fetch('/api/auth/request-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await response.json();
      if (data.success) {
        setMessage(`Password reset link sent to ${email}`);
      } else {
        setMessage(data.error || 'Failed to send password reset link');
      }
    } catch (error) {
      setMessage('Error sending password reset link');
    }
  };

  const createUser = async () => {
    // Validate form
    if (!createUserForm.firstName || !createUserForm.lastName || !createUserForm.email || !createUserForm.password) {
      setMessage('All fields are required');
      return;
    }

    if (createUserForm.password !== createUserForm.confirmPassword) {
      setMessage('Passwords do not match');
      return;
    }

    if (createUserForm.password.length < 6) {
      setMessage('Password must be at least 6 characters');
      return;
    }

    if (!createUserForm.securityAnswer) {
      setMessage('Security answer is required');
      return;
    }

    try {
      const response = await fetch('/api/admin/create-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createUserForm)
      });

      const data = await response.json();
      if (data.success) {
        setMessage('User created successfully');
        setShowCreateUser(false);
        setCreateUserForm({
          firstName: '',
          lastName: '',
          email: '',
          password: '',
          confirmPassword: '',
          securityQuestion: 'What was the name of your first pet?',
          securityAnswer: '',
          isAdmin: false
        });
        fetchUsers(); // Refresh the list
      } else {
        setMessage(data.error || 'Failed to create user');
      }
    } catch (error) {
      setMessage('Error creating user');
    }
  };

  const createSuperUser = async () => {
    // Validate form
    if (!superUserForm.firstName || !superUserForm.lastName || !superUserForm.email || !superUserForm.password) {
      setMessage('All fields are required');
      return;
    }

    if (superUserForm.password !== superUserForm.confirmPassword) {
      setMessage('Passwords do not match');
      return;
    }

    if (superUserForm.password.length < 6) {
      setMessage('Password must be at least 6 characters');
      return;
    }

    try {
      const response = await fetch('/api/admin/create-super-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...superUserForm,
          currentUserEmail: user.email
        })
      });

      const data = await response.json();
      if (data.message) {
        setMessage(data.message);
        setShowCreateSuperUser(false);
        setSuperUserForm({
          firstName: '',
          lastName: '',
          email: '',
          password: '',
          confirmPassword: ''
        });
        fetchUsers(); // Refresh the list
      } else {
        setMessage(data.error || 'Failed to create super user');
      }
    } catch (error) {
      setMessage('Error creating super user');
    }
  };

  const handleTestUsers = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/test-users');
      const data = await response.json();
      setTestUsersResult(data);
    } catch (error) {
      console.error('Error testing users:', error);
      setTestUsersResult({ error: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleMigrateUsers = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/migrate-users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      setMigrationResult(data);
    } catch (error) {
      console.error('Error migrating users:', error);
      setMigrationResult({ error: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const sendPasswordResetEmail = async (user) => {
    setIsSendingResetEmail(true);
    setMessage('');
    setError('');
    
          try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
        
        const response = await fetch('/api/admin/request-reset-for-user', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: user.email }),
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        const data = await response.json();
        
        if (response.ok) {
          setMessage('Password reset email sent to ' + user.email);
          setShowResetEmailModal(false);
          setResetEmailTarget(null);
        } else {
          setError(data.error || 'Failed to send password reset email.');
        }
      } catch (err) {
        if (err.name === 'AbortError') {
          setError('Request timed out. Please try again.');
        } else {
          setError('Network error. Please try again.');
        }
      } finally {
        setIsSendingResetEmail(false);
      }
  };

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="bg-white p-8 rounded shadow-md max-w-md w-full text-center">
          <h1 className="text-2xl font-bold mb-4 text-red-600">Access Denied</h1>
          <p>You do not have permission to access this page.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl">Loading users...</div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    {isSuperUser ? 'Super User Dashboard' : 'Admin Dashboard'}
                  </h1>
                  {isSuperUser && (
                    <p className="text-sm text-purple-600 mt-1">👑 Super User - Full System Access</p>
                  )}
                </div>
                <div className="flex space-x-2">
                  {isSuperUser && (
                    <button
                      onClick={() => setShowCreateSuperUser(true)}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      Create Super User
                    </button>
                  )}
                  <button
                    onClick={() => setShowCreateUser(true)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Create User
                  </button>
                </div>
              </div>
              
              {message && (
                <div className={`mb-4 p-4 rounded ${message.includes('successfully') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {message}
                </div>
              )}
              
              {error && (
                <div className="mb-4 p-4 rounded bg-red-100 text-red-700">
                  {error}
                </div>
              )}

              {/* User Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-bold">{users.length}</span>
                      </div>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-blue-900">Total Users</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-bold">
                          {users.filter(u => u.verified && !u.blocked).length}
                        </span>
                      </div>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-green-900">Active Users</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-bold">
                          {users.filter(u => u.blocked).length}
                        </span>
                      </div>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-red-900">Blocked Users</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-bold">
                          {users.filter(u => u.isAdmin || u.isSuperUser).length}
                        </span>
                      </div>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-purple-900">Admins</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Search and Filter */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Search by name, email, or ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="sm:w-48">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Users</option>
                    <option value="active">Active Only</option>
                    <option value="blocked">Blocked Only</option>
                    <option value="unverified">Unverified Only</option>
                    <option value="admins">Admins Only</option>
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Login</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users
                      .filter(user => {
                        // Filter by search term
                        const term = searchTerm.toLowerCase();
                        const matches =
                          user.firstName?.toLowerCase().includes(term) ||
                          user.lastName?.toLowerCase().includes(term) ||
                          user.email?.toLowerCase().includes(term) ||
                          user.id?.toLowerCase().includes(term);
                        if (!matches) return false;
                        // Filter by status
                        if (statusFilter === 'active') return user.verified && !user.blocked;
                        if (statusFilter === 'blocked') return user.blocked;
                        if (statusFilter === 'unverified') return !user.verified && !user.blocked;
                        if (statusFilter === 'admins') return user.isAdmin || user.isSuperUser;
                        return true;
                      })
                      .map((user) => (
                        <tr key={user.id} className={user.blocked ? 'bg-red-50' : ''}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                                  user.blocked ? 'bg-red-200' : 'bg-gray-300'
                                }`}>
                                  <span className="text-sm font-medium text-gray-700">
                                    {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                                  </span>
                                </div>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {user.firstName} {user.lastName}
                                  {user.blocked && <span className="ml-2 text-xs text-red-600">🚫 BLOCKED</span>}
                                </div>
                                <div className="text-sm text-gray-500">ID: {user.id}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {user.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              user.blocked ? 'bg-red-100 text-red-800' : 
                              user.verified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {user.blocked ? '🚫 Blocked' : user.verified ? '✅ Verified' : '⏳ Unverified'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => {
                                  setSelectedUser(user);
                                  setShowUserDetails(true);
                                }}
                                className="text-indigo-600 hover:text-indigo-900"
                              >
                                View Details
                              </button>
                              {!user.verified && (
                                <button
                                  onClick={() => verifyUser(user.email)}
                                  className="text-green-600 hover:text-green-900"
                                >
                                  Verify
                                </button>
                              )}
                              <button
                                onClick={() => toggleUserStatus(user.id, !user.blocked)}
                                className={`${user.blocked ? 'text-green-600 hover:text-green-900' : 'text-red-600 hover:text-red-900'}`}
                              >
                                {user.blocked ? '✅ Unblock' : '🚫 Block'}
                              </button>
                              <button
                                onClick={() => deleteUser(user.id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                Delete
                              </button>
                              <button
                                onClick={() => {
                                  setShowResetEmailModal(true);
                                  setResetEmailTarget(user);
                                }}
                                className="text-orange-600 hover:text-orange-900 ml-2"
                              >
                                Reset Password
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Password Reset Modal */}
          {selectedUser && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
              <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                <div className="mt-3">
                  <h3 className="text-lg font-medium text-black mb-4">
                    Reset Password for {selectedUser.firstName} {selectedUser.lastName}
                  </h3>
                  <input
                    type="password"
                    placeholder="New password (min 6 characters)"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded mb-4 text-black"
                  />
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => {
                        setSelectedUser(null);
                        setNewPassword('');
                      }}
                      className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => resetPassword(selectedUser.id)}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Reset Password
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* User Details Modal */}
          {showUserDetails && selectedUser && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
              <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                <div className="mt-3">
                  <h3 className="text-lg font-medium text-black mb-4">User Details</h3>
                  <div className="space-y-2 text-sm text-black">
                    <p><strong>Name:</strong> {selectedUser.firstName} {selectedUser.lastName}</p>
                    <p><strong>Email:</strong> {selectedUser.email}</p>
                    <p><strong>ID:</strong> {selectedUser.id}</p>
                    <p><strong>Created:</strong> {new Date(selectedUser.createdAt).toLocaleString()}</p>
                    <p><strong>Last Login:</strong> {selectedUser.lastLogin ? new Date(selectedUser.lastLogin).toLocaleString() : 'Never'}</p>
                    <p><strong>Verified:</strong> {selectedUser.verified ? 'Yes' : 'No'}</p>
                    <p><strong>Blocked:</strong> {selectedUser.blocked ? 'Yes' : 'No'}</p>
                    <p><strong>Role:</strong> 
                      {selectedUser.isSuperUser ? '👑 Super User' : 
                       selectedUser.isAdmin ? '🔧 Admin' : '👤 User'}
                    </p>
                    <p><strong>Security Question:</strong> {selectedUser.securityQuestion}</p>
                    <p><strong>Security Answer:</strong> {selectedUser.securityAnswer}</p>
                  </div>
                  <div className="flex justify-between mt-4">
                    <button
                      onClick={() => {
                        setShowUserDetails(false);
                        setSelectedUser(null);
                      }}
                      className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                    >
                      Close
                    </button>
                    <div className="flex space-x-2">
                      {selectedUser.isAdmin && (
                        <button
                          onClick={() => sendPasswordReset(selectedUser.email)}
                          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                          Reset Password
                        </button>
                      )}
                      <button
                        onClick={() => elevateToAdmin(selectedUser.id, !selectedUser.isAdmin)}
                        className={`px-4 py-2 rounded ${selectedUser.isAdmin ? 'bg-yellow-600 text-white hover:bg-yellow-700' : 'bg-green-600 text-white hover:bg-green-700'}`}
                      >
                        {selectedUser.isAdmin ? 'Demote from Admin' : 'Elevate to Admin'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Create User Modal */}
          {showCreateUser && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
              <div className="relative top-10 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
                <div className="mt-3">
                  <h3 className="text-lg font-medium text-black mb-4">Create New User</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                      <input
                        type="text"
                        value={createUserForm.firstName}
                        onChange={(e) => setCreateUserForm({...createUserForm, firstName: e.target.value})}
                        className="w-full p-2 border border-gray-300 rounded bg-gray-200 text-black"
                        placeholder="First Name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                      <input
                        type="text"
                        value={createUserForm.lastName}
                        onChange={(e) => setCreateUserForm({...createUserForm, lastName: e.target.value})}
                        className="w-full p-2 border border-gray-300 rounded bg-gray-200 text-black"
                        placeholder="Last Name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input
                        type="email"
                        value={createUserForm.email}
                        onChange={(e) => setCreateUserForm({...createUserForm, email: e.target.value})}
                        className="w-full p-2 border border-gray-300 rounded bg-gray-200 text-black"
                        placeholder="Email"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                      <input
                        type="password"
                        value={createUserForm.password}
                        onChange={(e) => setCreateUserForm({...createUserForm, password: e.target.value})}
                        className="w-full p-2 border border-gray-300 rounded bg-gray-200 text-black"
                        placeholder="Password (min 6 characters)"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                      <input
                        type="password"
                        value={createUserForm.confirmPassword}
                        onChange={(e) => setCreateUserForm({...createUserForm, confirmPassword: e.target.value})}
                        className="w-full p-2 border border-gray-300 rounded bg-gray-200 text-black"
                        placeholder="Confirm Password"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Security Question</label>
                      <select
                        value={createUserForm.securityQuestion}
                        onChange={(e) => setCreateUserForm({...createUserForm, securityQuestion: e.target.value})}
                        className="w-full p-2 border border-gray-300 rounded bg-gray-200 text-black"
                      >
                        <option value="What was the name of your first pet?">What was the name of your first pet?</option>
                        <option value="In what city were you born?">In what city were you born?</option>
                        <option value="What was your mother's maiden name?">What was your mother's maiden name?</option>
                        <option value="What was the name of your first school?">What was the name of your first school?</option>
                        <option value="What is your favorite book?">What is your favorite book?</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Security Answer</label>
                      <input
                        type="text"
                        value={createUserForm.securityAnswer}
                        onChange={(e) => setCreateUserForm({...createUserForm, securityAnswer: e.target.value})}
                        className="w-full p-2 border border-gray-300 rounded bg-gray-200 text-black"
                        placeholder="Security Answer"
                      />
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="isAdmin"
                        checked={createUserForm.isAdmin}
                        onChange={(e) => setCreateUserForm({...createUserForm, isAdmin: e.target.checked})}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="isAdmin" className="ml-2 block text-sm text-gray-900">
                        Make this user an admin
                      </label>
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2 mt-6">
                    <button
                      onClick={() => {
                        setShowCreateUser(false);
                        setCreateUserForm({
                          firstName: '',
                          lastName: '',
                          email: '',
                          password: '',
                          confirmPassword: '',
                          securityQuestion: 'What was the name of your first pet?',
                          securityAnswer: '',
                          isAdmin: false
                        });
                      }}
                      className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={createUser}
                      className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      Create User
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Create Super User Modal */}
          {showCreateSuperUser && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
              <div className="relative top-10 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
                <div className="mt-3">
                  <h3 className="text-lg font-medium text-black mb-4">👑 Create Super User</h3>
                  <p className="text-sm text-purple-600 mb-4">Super users have full system access and can create other super users.</p>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                      <input
                        type="text"
                        value={superUserForm.firstName}
                        onChange={(e) => setSuperUserForm({...superUserForm, firstName: e.target.value})}
                        className="w-full p-2 border border-gray-300 rounded bg-gray-200 text-black"
                        placeholder="First Name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                      <input
                        type="text"
                        value={superUserForm.lastName}
                        onChange={(e) => setSuperUserForm({...superUserForm, lastName: e.target.value})}
                        className="w-full p-2 border border-gray-300 rounded bg-gray-200 text-black"
                        placeholder="Last Name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input
                        type="email"
                        value={superUserForm.email}
                        onChange={(e) => setSuperUserForm({...superUserForm, email: e.target.value})}
                        className="w-full p-2 border border-gray-300 rounded bg-gray-200 text-black"
                        placeholder="Email"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                      <input
                        type="password"
                        value={superUserForm.password}
                        onChange={(e) => setSuperUserForm({...superUserForm, password: e.target.value})}
                        className="w-full p-2 border border-gray-300 rounded bg-gray-200 text-black"
                        placeholder="Password (min 6 characters)"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                      <input
                        type="password"
                        value={superUserForm.confirmPassword}
                        onChange={(e) => setSuperUserForm({...superUserForm, confirmPassword: e.target.value})}
                        className="w-full p-2 border border-gray-300 rounded bg-gray-200 text-black"
                        placeholder="Confirm Password"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2 mt-6">
                    <button
                      onClick={() => {
                        setShowCreateSuperUser(false);
                        setSuperUserForm({
                          firstName: '',
                          lastName: '',
                          email: '',
                          password: '',
                          confirmPassword: ''
                        });
                      }}
                      className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={createSuperUser}
                      className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                    >
                      Create Super User
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Debug Section */}
          <div className="card bg-base-200 shadow-xl mb-6">
            <div className="card-body">
              <h2 className="card-title text-xl mb-4">🔧 Debug Tools</h2>
              
              <div className="flex gap-4 mb-4">
                <button 
                  onClick={handleTestUsers}
                  disabled={isLoading}
                  className="btn btn-info"
                >
                  {isLoading ? 'Loading...' : 'Test Users'}
                </button>
                
                <button 
                  onClick={handleMigrateUsers}
                  disabled={isLoading}
                  className="btn btn-warning"
                >
                  {isLoading ? 'Migrating...' : 'Migrate Users'}
                </button>
              </div>

              {testUsersResult && (
                <div className="bg-base-100 p-4 rounded-lg">
                  <h3 className="font-bold mb-2">Test Users Result:</h3>
                  <pre className="text-xs overflow-auto">
                    {JSON.stringify(testUsersResult, null, 2)}
                  </pre>
                </div>
              )}

              {migrationResult && (
                <div className="bg-base-100 p-4 rounded-lg mt-4">
                  <h3 className="font-bold mb-2">Migration Result:</h3>
                  <pre className="text-xs overflow-auto">
                    {JSON.stringify(migrationResult, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>

          {/* Admin-triggered Password Reset Modal */}
          {showResetEmailModal && resetEmailTarget && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
              <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                <div className="mt-3">
                  <h3 className="text-lg font-medium text-black mb-4">
                    Send Password Reset Email
                  </h3>
                  <p className="mb-4 text-black">Are you sure you want to send a password reset email to <span className="font-semibold text-black">{resetEmailTarget.email}</span>?</p>
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => { setShowResetEmailModal(false); setResetEmailTarget(null); }}
                      className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => sendPasswordResetEmail(resetEmailTarget)}
                      disabled={isSendingResetEmail}
                      className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 disabled:opacity-50"
                    >
                      {isSendingResetEmail ? 'Sending...' : 'Send Reset Email'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
} 