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
  const [selectedImage, setSelectedImage] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);

  useEffect(() => {
    loadApplications();
  }, []);

  // Handle ESC key to close image modal
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && showImageModal) {
        setShowImageModal(false);
        setSelectedImage(null);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [showImageModal]);

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

  const openImageModal = (image) => {
    setSelectedImage(image);
    setShowImageModal(true);
  };

  const renderImagePreview = (images) => {
    if (!images || images.length === 0) {
      return (
        <div className="flex items-center justify-center h-20 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <div className="text-center">
            <svg className="mx-auto h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="mt-1 text-xs text-gray-500">No images</p>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-gray-700">Uploaded Images ({images.length})</h4>
          {images.length > 3 && (
            <span className="text-xs text-gray-500">+{images.length - 3} more</span>
          )}
        </div>
        <div className="flex space-x-2">
          {images.slice(0, 3).map((image, index) => (
            <div key={index} className="relative group">
              <img
                src={image.url}
                alt={image.name || `Image ${index + 1}`}
                className="w-16 h-16 object-cover rounded-lg border cursor-pointer hover:opacity-75 transition-opacity"
                onClick={() => openImageModal(image)}
                title="Click to enlarge"
              />
              {/* Click indicator */}
              <div className="absolute top-1 right-1 bg-black bg-opacity-50 text-white p-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                </svg>
              </div>
            </div>
          ))}
        </div>
        {images.length > 3 && (
          <button
            onClick={() => openImageModal(images[0])}
            className="text-xs text-blue-600 hover:text-blue-800 font-medium"
          >
            View all {images.length} images
          </button>
        )}
      </div>
    );
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
              {applicationCount < applicationLimit ? (
                <Link
                  to="/patent-buddy/wizard"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Create Application
                </Link>
              ) : (
                <div className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-500 bg-gray-100 cursor-not-allowed">
                  Limit Reached
                </div>
              )}
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

                  {/* Image Preview Section */}
                  <div className="mb-4">
                    {renderImagePreview(application.images)}
                  </div>

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

        {/* Image Modal */}
        {showImageModal && selectedImage && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50"
            onClick={() => setShowImageModal(false)}
          >
            <div className="max-w-6xl max-h-full p-4 relative">
              <div className="relative">
                {/* Close button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowImageModal(false);
                  }}
                  className="absolute top-4 right-4 bg-black bg-opacity-70 text-white p-3 rounded-full hover:bg-opacity-100 transition-all duration-200 z-10"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                {/* Zoom indicator */}
                <div className="absolute top-4 left-4 bg-black bg-opacity-70 text-white px-3 py-1 rounded-full text-sm z-10">
                  Click outside to close • ESC to close
                </div>

                {/* Main image */}
                <img
                  src={selectedImage.url}
                  alt={selectedImage.name || 'Selected image'}
                  className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
                  onClick={(e) => e.stopPropagation()}
                />

                {/* Image info */}
                <div className="absolute bottom-4 left-4 bg-black bg-opacity-70 text-white px-3 py-2 rounded-lg text-sm z-10">
                  <p className="font-medium">{selectedImage.name || 'Untitled'}</p>
                  {selectedImage.size && (
                    <p className="text-xs opacity-75">
                      {(selectedImage.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatentApplications; 