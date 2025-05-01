import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const PatentAudit = () => {
  const [currentSection, setCurrentSection] = useState('Title');
  const [title, setTitle] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [showTips, setShowTips] = useState(true);
  const [showCommonMistakes, setShowCommonMistakes] = useState(true);
  const [showDocumentPreview, setShowDocumentPreview] = useState(false);

  const sections = ['Title', 'Field', 'Background', 'Summary', 'Drawings', 'Detailed Description', 'Critical', 'Alternatives', 'Boilerplate'];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 p-4">
        <div className="mb-8">
          <h2 className="font-bold text-lg mb-4">New Provisional</h2>
          <nav className="space-y-2">
            <a href="#" className="block text-gray-600 hover:text-gray-900">My Documents</a>
            <a href="#" className="block text-gray-600 hover:text-gray-900">Resources</a>
            <a href="#" className="block text-gray-600 hover:text-gray-900">Settings</a>
          </nav>
        </div>
        
        <div>
          <h3 className="font-semibold text-sm mb-2">Recent Documents</h3>
          <div className="space-y-2">
            <a href="#" className="block text-gray-600 hover:text-gray-900 text-sm">AI-Powered Content Gen...</a>
            <a href="#" className="block text-gray-600 hover:text-gray-900 text-sm">Smart Home System...</a>
            <a href="#" className="block text-gray-600 hover:text-gray-900 text-sm">Quantum Computing...</a>
          </div>
        </div>
      </div>

      {/* Main Workspace */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-5xl mx-auto p-8">
          {/* Top Banner */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-center mb-6">Provisional Patent Application</h1>
            
            {/* Reminders Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Keep this application confidential...</span>
                  <button className="text-gray-500">▲</button>
                </div>
              </div>
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Focus on the 'how'...</span>
                  <button className="text-gray-500">▼</button>
                </div>
              </div>
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Do NOT include claims...</span>
                  <button className="text-gray-500">▼</button>
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Detailed Description is the most critical section</span>
                </div>
              </div>
            </div>
          </div>

          {/* Title Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Title of the Invention</h2>
            <p className="text-gray-600 mb-4">Provide a clear, concise title...</p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="System and Method for AI-Powered Content Generation"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Short Description (Optional)</label>
                <textarea
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  rows={3}
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                />
              </div>

              {/* Tips Section */}
              <div className="border-t border-gray-200 pt-4">
                <button
                  className="flex items-center justify-between w-full text-left font-medium text-gray-900"
                  onClick={() => setShowTips(!showTips)}
                >
                  Tips for a Strong Title
                  <span>{showTips ? '▲' : '▼'}</span>
                </button>
                {showTips && (
                  <ul className="mt-2 space-y-2 text-sm text-gray-600">
                    <li>• Be specific about the technology area</li>
                    <li>• Avoid marketing language</li>
                    <li>• Keep it under 500 characters</li>
                    <li>• Use standard technical terminology</li>
                  </ul>
                )}
              </div>
            </div>
          </div>

          {/* Help & Resources Panel */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold mb-4">Current Section: Title</h3>
            
            {/* Section Progress */}
            <div className="flex space-x-2 mb-6">
              {sections.map((section) => (
                <div
                  key={section}
                  className={`px-3 py-1 rounded-full text-sm ${
                    section === currentSection
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {section}
                </div>
              ))}
            </div>

            {/* Common Mistakes */}
            <div className="border-t border-gray-200 pt-4">
              <button
                className="flex items-center justify-between w-full text-left font-medium text-gray-900"
                onClick={() => setShowCommonMistakes(!showCommonMistakes)}
              >
                Common Mistakes
                <span>{showCommonMistakes ? '▲' : '▼'}</span>
              </button>
              {showCommonMistakes && (
                <ul className="mt-2 space-y-2 text-sm text-gray-600">
                  <li>• Including claims (not needed for provisional)</li>
                  <li>• Using vague or overly broad terms</li>
                  <li>• Including marketing language</li>
                  <li>• Making the title too long</li>
                </ul>
              )}
            </div>

            <div className="mt-4">
              <a href="#" className="text-blue-600 hover:text-blue-800 text-sm">
                View example applications
              </a>
            </div>
          </div>

          {/* Document Preview */}
          <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <button
              className="flex items-center justify-between w-full text-left font-medium text-gray-900"
              onClick={() => setShowDocumentPreview(!showDocumentPreview)}
            >
              Document Preview
              <span>{showDocumentPreview ? '▲' : '▼'}</span>
            </button>
            {showDocumentPreview && (
              <div className="mt-4 p-4 bg-gray-50 rounded-md">
                <h4 className="font-medium mb-2">{title || '[Title]'}</h4>
                <p className="text-gray-500 text-sm">Field: Not yet completed</p>
                <p className="text-gray-500 text-sm">Background: Not yet completed</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatentAudit; 