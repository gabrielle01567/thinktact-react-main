import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const PatentAudit = () => {
  const [currentSection, setCurrentSection] = useState('Title');
  const [title, setTitle] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [showTips, setShowTips] = useState(true);
  const [showCommonMistakes, setShowCommonMistakes] = useState(true);
  const [showDocumentPreview, setShowDocumentPreview] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const sections = ['Title', 'Field', 'Background', 'Summary', 'Drawings', 'Detailed Description', 'Critical', 'Alternatives', 'Boilerplate'];
  const completedSections = 4; // Example: 4 of 9 sections complete

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Sidebar - Navigation */}
      <div className="w-72 bg-gray-50 border-r border-gray-200 p-6">
        {/* Logo & Title */}
        <div className="flex items-center space-x-3 mb-8">
          <svg className="w-8 h-8 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span className="font-bold text-xl text-gray-900">Patent Buddy</span>
        </div>

        {/* Search Bar */}
        <div className="relative mb-6">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Navigation Buttons */}
        <nav className="space-y-1">
          <a href="#" className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md">
            <svg className="mr-3 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            New Provisional
          </a>
          <a href="#" className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md">
            <svg className="mr-3 h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
              <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
              <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
            </svg>
            My Documents
          </a>
          <a href="#" className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md">
            <svg className="mr-3 h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M2 5a2 2 0 012-2h8a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm3 1h6v4H5V6zm6 6H5v2h6v-2z" clipRule="evenodd" />
            </svg>
            Resources
          </a>
          <a href="#" className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md">
            <svg className="mr-3 h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
            </svg>
            Settings
          </a>
        </nav>

        {/* Recent Documents */}
        <div className="mt-8">
          <h3 className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Recent Documents</h3>
          <div className="mt-2 space-y-1">
            <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md">AI-Powered Content Gen...</a>
            <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md">Smart Home Controller</a>
            <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md">Neural Network Architect...</a>
          </div>
        </div>

        {/* Floating Action Button */}
        <button className="fixed left-8 bottom-8 w-12 h-12 bg-blue-600 rounded-full shadow-lg flex items-center justify-center text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto bg-white">
        <div className="max-w-5xl mx-auto p-8">
          {/* Header Strip */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">Provisional Patent Application</h1>
              <span className="px-3 py-1 text-sm font-medium text-white bg-blue-600 rounded-full">Draft</span>
            </div>
            <div className="flex space-x-3">
              <button className="px-4 py-2 text-sm font-medium text-blue-600 bg-white border border-blue-600 rounded-md hover:bg-blue-50">
                Save Draft
              </button>
              <button className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                Complete
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Progress: {completedSections} of {sections.length} sections complete</span>
              <span className="text-sm text-gray-500">{Math.round((completedSections / sections.length) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${(completedSections / sections.length) * 100}%` }}></div>
            </div>
          </div>

          {/* Section Tabs */}
          <div className="flex space-x-2 mb-8 overflow-x-auto">
            {sections.map((section) => (
              <button
                key={section}
                className={`px-4 py-2 text-sm font-medium rounded-md whitespace-nowrap ${
                  section === currentSection
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
                onClick={() => setCurrentSection(section)}
              >
                {section}
                {section === 'Detailed Description' && (
                  <span className="ml-2 px-2 py-0.5 text-xs font-medium text-white bg-orange-500 rounded-full">Critical</span>
                )}
              </button>
            ))}
          </div>

          {/* Warning Box */}
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-8">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <ul className="list-disc pl-5 space-y-1 text-sm text-yellow-700">
                  <li>Keep this application confidential until officially filed</li>
                  <li>Focus on the "how" rather than just stating goals</li>
                  <li>DO NOT include claims in a provisional application</li>
                  <li>Detailed Description is the most critical section</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Title Form */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Title of the Invention</h2>
            <p className="text-gray-600 mb-6">Provide a clear, concise title that accurately describes your invention. Avoid overly broad or vague titles.</p>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder='e.g., "System and Method for AI-Powered Content Generation"'
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Short Description (Optional)</label>
                <textarea
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  rows={3}
                  placeholder="A brief description to help you identify this invention in your documents"
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                />
              </div>

              {/* Tips Box */}
              <div className="bg-blue-50 rounded-lg p-4">
                <button
                  className="flex items-center justify-between w-full text-left font-medium text-blue-900"
                  onClick={() => setShowTips(!showTips)}
                >
                  Tips for a Strong Title
                  <span>{showTips ? '▲' : '▼'}</span>
                </button>
                {showTips && (
                  <ul className="mt-2 space-y-2 text-sm text-blue-800">
                    <li>• Be specific about the technology area</li>
                    <li>• Include key technical features that make your invention unique</li>
                    <li>• Avoid marketing language or superlatives</li>
                    <li>• Keep it under 15 words if possible</li>
                  </ul>
                )}
              </div>
            </div>
          </div>

          {/* Document Preview */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Document Preview</h3>
              <button
                className="text-sm text-blue-600 hover:text-blue-800"
                onClick={() => setShowDocumentPreview(!showDocumentPreview)}
              >
                {showDocumentPreview ? 'Collapse' : 'Expand'}
              </button>
            </div>
            {showDocumentPreview && (
              <div className="bg-gray-50 rounded-md p-6 space-y-4">
                <h4 className="text-xl font-bold text-center">PROVISIONAL PATENT APPLICATION</h4>
                <div className="space-y-2">
                  <h5 className="font-medium">{title || '[TITLE OF THE INVENTION]'}</h5>
                  <p className="text-gray-500">FIELD OF THE INVENTION — Not yet completed</p>
                  <p className="text-gray-500">BACKGROUND OF THE INVENTION — Not yet completed</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Help & Resources Panel */}
      <div className="w-80 bg-blue-50 border-l border-gray-200 p-6">
        <div className="mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Help & Resources</h3>
          <div className="bg-white rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Current Section: Title</h4>
            <p className="text-sm text-gray-600 mb-4">The title should be brief but technically accurate...</p>
            <a href="#" className="text-sm text-blue-600 hover:text-blue-800">Learn more about titles</a>
          </div>
        </div>

        {/* Section Importance Chart */}
        <div className="mb-8">
          <h4 className="text-sm font-medium text-gray-900 mb-4">Section Importance</h4>
          <div className="space-y-3">
            {sections.map((section, index) => (
              <div key={section} className="flex items-center">
                <span className="w-32 text-sm text-gray-600">{section}</span>
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      section === 'Detailed Description'
                        ? 'bg-red-500'
                        : 'bg-green-500'
                    }`}
                    style={{ width: `${100 - index * 10}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Common Mistakes */}
        <div className="bg-red-50 rounded-lg p-4">
          <h4 className="font-medium text-red-900 mb-2">Common Mistakes</h4>
          <ul className="space-y-2 text-sm text-red-800">
            <li>• Including claims (not needed for provisionals)</li>
            <li>• Being too vague</li>
            <li>• Public disclosure before filing</li>
            <li>• Focusing only on the problem</li>
          </ul>
          <a href="#" className="mt-4 text-sm text-blue-600 hover:text-blue-800 block">
            View example applications
          </a>
        </div>
      </div>
    </div>
  );
};

export default PatentAudit; 