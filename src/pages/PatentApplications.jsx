import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getPatentApplications, deletePatentApplication, getApplicationCount } from '../services/patentService.js';
import { useAuth } from '../contexts/AuthContext.jsx';

const PatentApplications = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [applicationCount, setApplicationCount] = useState(0);
  const [applicationLimit] = useState(5);

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    if (!user) {
      setError('Please log in to view your applications');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const [applicationsData, countData] = await Promise.all([
        getPatentApplications(),
        getApplicationCount()
      ]);
      setApplications(applicationsData);
      setApplicationCount(countData.count);
    } catch (error) {
      console.error('Error loading applications:', error);
      setError('Failed to load applications');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (applicationId) => {
    if (!window.confirm('Are you sure you want to delete this application? This action cannot be undone.')) {
      return;
    }

    try {
      await deletePatentApplication(applicationId);
      setApplications(applications.filter(app => app.id !== applicationId));
      // Refresh the count after deletion
      const countData = await getApplicationCount();
      setApplicationCount(countData.count);
    } catch (error) {
      console.error('Error deleting application:', error);
      alert('Failed to delete application');
    }
  };

  const getCompletionPercentage = (completedSections) => {
    if (!completedSections) return 0;
    const completedCount = Object.values(completedSections).filter(Boolean).length;
    return Math.round((completedCount / 9) * 100);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Patent Applications</h1>
              <p className="mt-2 text-sm text-gray-600">
                Manage your provisional patent applications
              </p>
            </div>
            <div className="flex items-center space-x-4">
              {/* Application Count Display */}
              <div className="text-sm text-gray-600">
                <span className="font-medium">{applicationCount}</span> of <span className="font-medium">{applicationLimit}</span> applications
              </div>
              {/* Create New Application Button */}
              {applicationCount < applicationLimit ? (
                <Link
                  to="/patent-buddy/wizard"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Create New Application
                </Link>
              ) : (
                <div className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-500 bg-gray-100 cursor-not-allowed">
                  Limit Reached
                </div>
              )}
            </div>
          </div>
          
          {/* Progress Bar for Application Limit */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
              <span>Application Storage</span>
              <span>{applicationCount}/{applicationLimit}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${
                  applicationCount >= applicationLimit 
                    ? 'bg-red-500' 
                    : applicationCount >= applicationLimit * 0.8 
                    ? 'bg-yellow-500' 
                    : 'bg-green-500'
                }`}
                style={{ width: `${(applicationCount / applicationLimit) * 100}%` }}
              ></div>
            </div>
            {applicationCount >= applicationLimit && (
              <p className="mt-2 text-sm text-red-600">
                You've reached the maximum limit. Delete an application to create a new one.
              </p>
            )}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Applications List */}
        {applications.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No applications</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by creating your first patent application.</p>
            <div className="mt-6">
              <Link
                to="/patent-buddy/wizard"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Create Application
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {applications.map((application) => (
              <div key={application.id} className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900 truncate">
                      {application.title || 'Untitled Application'}
                    </h3>
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        application.status === 'complete' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {application.status === 'complete' ? 'Complete' : 'Draft'}
                      </span>
                    </div>
                  </div>

                  {application.shortDescription && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {application.shortDescription}
                    </p>
                  )}

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                      <span>Progress</span>
                      <span>{getCompletionPercentage(application.completedSections)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${getCompletionPercentage(application.completedSections)}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="text-sm text-gray-500 mb-4">
                    Last updated: {formatDate(application.updatedAt)}
                  </div>

                  <div className="flex items-center justify-between">
                    <Link
                      to={`/patent-buddy/wizard/${application.id}`}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Continue Editing
                    </Link>
                    <button
                      onClick={() => handleDelete(application.id)}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PatentApplications; 