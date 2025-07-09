import React, { useState, useEffect } from 'react';
import { Key, Eye, EyeOff, CheckCircle, AlertTriangle, Save } from 'lucide-react';
import patentSearchService from '../services/patentSearchService.js';

const ApiKeyConfig = () => {
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [testResult, setTestResult] = useState('');

  useEffect(() => {
    // Load saved API key from localStorage
    const savedKey = localStorage.getItem('uspto_api_key');
    if (savedKey) {
      setApiKey(savedKey);
      patentSearchService.setUSPTOApiKey(savedKey);
    }
  }, []);

  const handleSave = () => {
    if (!apiKey.trim()) {
      setError('Please enter a valid API key');
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      // Save to localStorage
      localStorage.setItem('uspto_api_key', apiKey);
      
      // Set in service
      patentSearchService.setUSPTOApiKey(apiKey);
      
      setIsSaved(true);
      setTestResult('');
      
      // Clear success message after 3 seconds
      setTimeout(() => setIsSaved(false), 3000);
      
    } catch (err) {
      setError('Failed to save API key: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTest = async () => {
    if (!apiKey.trim()) {
      setError('Please enter a valid API key first');
      return;
    }

    setIsLoading(true);
    setError('');
    setTestResult('');

    try {
      // Test the API key with a simple search
      const results = await patentSearchService.searchByKeywords('test', {});
      setTestResult('✅ API key is valid and working!');
    } catch (err) {
      setTestResult('❌ API key test failed: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setApiKey('');
    localStorage.removeItem('uspto_api_key');
    patentSearchService.setUSPTOApiKey(null);
    setIsSaved(false);
    setTestResult('');
    setError('');
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center mb-6">
          <Key className="w-6 h-6 text-blue-600 mr-3" />
          <h2 className="text-xl font-semibold text-gray-900">USPTO API Key Configuration</h2>
        </div>

        <div className="mb-6">
          <p className="text-gray-600 mb-4">
            Enter your USPTO API key to enable enhanced patent search functionality. 
            The API key will be stored locally in your browser for future use.
          </p>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <h3 className="font-semibold text-blue-900 mb-2">How to get a USPTO API key:</h3>
            <ol className="text-sm text-blue-800 space-y-1">
              <li>1. Visit <a href="https://developer.uspto.gov/" target="_blank" rel="noopener noreferrer" className="underline">developer.uspto.gov</a></li>
              <li>2. Create an account and register your application</li>
              <li>3. Generate an API key for patent data access</li>
              <li>4. Copy the key and paste it below</li>
            </ol>
          </div>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <h3 className="font-semibold text-green-900 mb-2">Environment Variable Setup (Recommended):</h3>
            <p className="text-sm text-green-800 mb-2">
              For better security, you can set your USPTO API key as an environment variable:
            </p>
            <ol className="text-sm text-green-800 space-y-1">
              <li>1. Create a <code className="bg-green-100 px-1 rounded">.env</code> file in the project root</li>
              <li>2. Add: <code className="bg-green-100 px-1 rounded">VITE_USPTO_API_KEY=your_api_key_here</code></li>
              <li>3. Restart your development server</li>
              <li>4. The API key will be automatically loaded</li>
            </ol>
            <p className="text-xs text-green-700 mt-2">
              Note: Environment variables take precedence over locally stored keys
            </p>
          </div>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <h3 className="font-semibold text-yellow-900 mb-2">⚠️ Important Note About USPTO API:</h3>
            <p className="text-sm text-yellow-800 mb-2">
              The USPTO API may have CORS restrictions that prevent direct browser requests. 
              If you encounter "Failed to fetch" errors, the app will automatically fall back to Google Patents.
            </p>
            <p className="text-xs text-yellow-700">
              This is normal behavior - Google Patents provides excellent patent data and is more reliable for web applications.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              USPTO API Key
            </label>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your USPTO API key..."
                className="w-full pr-12 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showKey ? (
                  <EyeOff className="h-5 w-5 text-gray-400" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleSave}
              disabled={isLoading || !apiKey.trim()}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Save className="w-4 h-4 mr-2" />
              {isLoading ? 'Saving...' : 'Save Key'}
            </button>
            
            <button
              onClick={handleTest}
              disabled={isLoading || !apiKey.trim()}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              {isLoading ? 'Testing...' : 'Test Key'}
            </button>
            
            <button
              onClick={handleClear}
              disabled={isLoading}
              className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Clear
            </button>
          </div>

          {/* Success Message */}
          {isSaved && (
            <div className="flex items-center p-3 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
              <span className="text-green-700">API key saved successfully!</span>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="flex items-center p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
              <span className="text-red-700">{error}</span>
            </div>
          )}

          {/* Test Result */}
          {testResult && (
            <div className={`flex items-center p-3 rounded-lg ${
              testResult.includes('✅') 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-red-50 border border-red-200'
            }`}>
              <span className={testResult.includes('✅') ? 'text-green-700' : 'text-red-700'}>
                {testResult}
              </span>
            </div>
          )}
        </div>

        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-2">Current Status:</h3>
          <div className="space-y-2">
            <div className="flex items-center">
              {patentSearchService.getUSPTOApiKey() ? (
                <>
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                  <span className="text-green-700">USPTO API key is configured and ready to use</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-5 h-5 text-yellow-500 mr-2" />
                  <span className="text-yellow-700">No USPTO API key configured - using Google Patents as fallback</span>
                </>
              )}
            </div>
            
            {/* Show source of API key */}
            {patentSearchService.getUSPTOApiKey() && (
              <div className="text-sm text-gray-600">
                {import.meta.env && import.meta.env.VITE_USPTO_API_KEY ? (
                  <span>✅ Using environment variable (VITE_USPTO_API_KEY)</span>
                ) : (
                  <span>✅ Using locally stored API key</span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiKeyConfig; 