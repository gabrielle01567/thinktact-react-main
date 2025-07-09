import React, { useState, useEffect } from 'react';
import { Search, Filter, TrendingUp, Users, FileText, AlertTriangle, CheckCircle, Clock, Eye, Database, Wifi, WifiOff } from 'lucide-react';
import patentSearchService from '../services/patentSearchService.js';

const PatentSearch = () => {
  const [searchMode, setSearchMode] = useState('keyword');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPatent, setSelectedPatent] = useState(null);
  const [filters, setFilters] = useState({
    dateRange: 'all',
    patentType: 'all',
    status: 'all'
  });
    const [dataSource, setDataSource] = useState('USPTO');
  const [apiStatus, setApiStatus] = useState('connected');
  const [errorMessage, setErrorMessage] = useState('');

  const searchModes = [
    { key: 'keyword', label: 'Keyword Search', icon: Search, description: 'Search by invention description, technology, or concept' },
    { key: 'inventor', label: 'Inventor Search', icon: Users, description: 'Find patents by inventor name' },
    { key: 'patent', label: 'Patent Number', icon: FileText, description: 'Search by specific patent number' },
    { key: 'assignee', label: 'Assignee Search', icon: TrendingUp, description: 'Find patents by company or organization' }
  ];

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsLoading(true);
    setApiStatus('connecting');
    setErrorMessage('');
    
    try {
      let searchResponse;
      
      switch (searchMode) {
        case 'keyword':
          searchResponse = await patentSearchService.searchByKeywords(searchQuery, filters);
          break;
        case 'inventor':
          searchResponse = await patentSearchService.searchByInventor(searchQuery, filters);
          break;
        case 'patent':
          searchResponse = await patentSearchService.searchByPatentNumber(searchQuery);
          break;
        case 'assignee':
          searchResponse = await patentSearchService.searchByAssignee(searchQuery, filters);
          break;
        default:
          searchResponse = await patentSearchService.searchByKeywords(searchQuery, filters);
      }
      
      setSearchResults(searchResponse.results);
      setDataSource(searchResponse.source);
      setApiStatus('connected');
      
      // Show fallback notification if USPTO failed and we're using Google Patents
      if (searchResponse.fallbackUsed) {
        setErrorMessage('USPTO API is currently unavailable. Using Google Patents data instead. Results may vary.');
      } else if (searchResponse.results.length === 0) {
        setErrorMessage('No patents found matching your search criteria. Try different keywords or search terms.');
      }
      
    } catch (error) {
      console.error('Search error:', error);
      setApiStatus('error');
      setSearchResults([]);
      setErrorMessage(`Search failed: ${error.message}. Please try again or check your internet connection.`);
    } finally {
      setIsLoading(false);
    }
  };

  const analyzePatentability = (patent) => {
    // Mock patentability analysis
    const analysis = {
      novelty: Math.random() > 0.3 ? 'High' : 'Low',
      nonObviousness: Math.random() > 0.4 ? 'High' : 'Medium',
      utility: 'High',
      writtenDescription: Math.random() > 0.2 ? 'Adequate' : 'Insufficient',
      enablement: Math.random() > 0.25 ? 'Adequate' : 'Insufficient',
      overallScore: Math.floor(Math.random() * 40) + 60
    };
    return analysis;
  };

  const renderSearchMode = () => {
    const currentMode = searchModes.find(mode => mode.key === searchMode);
    const IconComponent = currentMode.icon;

    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <div className="flex items-center mb-4">
          <IconComponent className="w-5 h-5 text-blue-600 mr-2" />
          <h2 className="text-lg font-semibold text-gray-900">{currentMode.label}</h2>
        </div>
        <p className="text-gray-600 mb-4">{currentMode.description}</p>
        
        <div className="flex gap-2 mb-4">
          {searchModes.map(mode => {
            const ModeIcon = mode.icon;
            return (
              <button
                key={mode.key}
                onClick={() => setSearchMode(mode.key)}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  searchMode === mode.key
                    ? 'bg-blue-100 text-blue-700 border border-blue-300'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <ModeIcon className="w-4 h-4 mr-1" />
                {mode.label}
              </button>
            );
          })}
        </div>

        <div className="flex gap-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={getSearchPlaceholder()}
            className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button
            onClick={handleSearch}
            disabled={isLoading}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </div>
    );
  };

  const getSearchPlaceholder = () => {
    switch (searchMode) {
      case 'keyword':
        return 'e.g., "artificial intelligence", "machine learning", "blockchain"';
      case 'inventor':
        return 'e.g., "John Smith", "Jane Doe"';
      case 'patent':
        return 'e.g., "US10123456", "US20230012345A1"';
      case 'assignee':
        return 'e.g., "Google Inc.", "Microsoft Corporation"';
      default:
        return 'Enter your search terms...';
    }
  };

  const renderFilters = () => (
    <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
      <div className="flex items-center mb-3">
        <Filter className="w-4 h-4 text-gray-600 mr-2" />
        <h3 className="text-sm font-medium text-gray-900">Filters</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Date Range</label>
          <select
            value={filters.dateRange}
            onChange={(e) => setFilters({...filters, dateRange: e.target.value})}
            className="w-full text-sm rounded-md border-gray-300"
          >
            <option value="all">All Time</option>
            <option value="1year">Last Year</option>
            <option value="5years">Last 5 Years</option>
            <option value="10years">Last 10 Years</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Patent Type</label>
          <select
            value={filters.patentType}
            onChange={(e) => setFilters({...filters, patentType: e.target.value})}
            className="w-full text-sm rounded-md border-gray-300"
          >
            <option value="all">All Types</option>
            <option value="utility">Utility</option>
            <option value="design">Design</option>
            <option value="plant">Plant</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
          <select
            value={filters.status}
            onChange={(e) => setFilters({...filters, status: e.target.value})}
            className="w-full text-sm rounded-md border-gray-300"
          >
            <option value="all">All Status</option>
            <option value="published">Published</option>
            <option value="granted">Granted</option>
            <option value="pending">Pending</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderSearchResults = () => {
    if (searchResults.length === 0 && !errorMessage && !isLoading) return null;
    
    // Check if this is a fallback notification (not a real error)
    const isFallbackNotification = errorMessage && errorMessage.includes('USPTO API is currently unavailable');
    
    if (errorMessage && !isFallbackNotification) {
      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
            <h3 className="text-lg font-semibold text-red-900">Search Error</h3>
          </div>
          <p className="text-red-700 mt-2">{errorMessage}</p>
          <div className="mt-4">
            <button
              onClick={() => {
                setErrorMessage('');
                setSearchResults([]);
              }}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }
    
    if (searchResults.length === 0 && isLoading) {
      return (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <div className="flex items-center">
            <Clock className="w-5 h-5 text-blue-500 mr-2 animate-spin" />
            <h3 className="text-lg font-semibold text-blue-900">Searching...</h3>
          </div>
          <p className="text-blue-700 mt-2">Searching patent databases for your query...</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {/* Show fallback notification if present */}
        {isFallbackNotification && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <div className="flex items-center">
              <AlertTriangle className="w-5 h-5 text-yellow-500 mr-2" />
              <h3 className="text-sm font-medium text-yellow-900">Data Source Notice</h3>
            </div>
            <p className="text-yellow-700 mt-1 text-sm">{errorMessage}</p>
            <button
              onClick={() => setErrorMessage('')}
              className="mt-2 text-sm text-yellow-600 hover:text-yellow-800 underline"
            >
              Dismiss
            </button>
          </div>
        )}
        
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            Search Results ({searchResults.length})
          </h3>
          <div className="flex items-center space-x-4">
            <div className="flex items-center text-sm text-gray-600">
              {apiStatus === 'connected' ? (
                <Wifi className="w-4 h-4 text-green-500 mr-1" />
              ) : apiStatus === 'connecting' ? (
                <Clock className="w-4 h-4 text-yellow-500 mr-1" />
              ) : (
                <WifiOff className="w-4 h-4 text-red-500 mr-1" />
              )}
              {dataSource}
            </div>
            <div className="text-sm text-gray-600">
              Sorted by relevance
            </div>
          </div>
        </div>
        
        {searchResults.map((patent) => (
          <div
            key={patent.id}
            className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => setSelectedPatent(patent)}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h4 className="text-lg font-semibold text-gray-900 mb-1">
                  {patent.title}
                </h4>
                <p className="text-sm text-gray-600 mb-2">
                  Patent: {patent.id} • Filed: {new Date(patent.filingDate).toLocaleDateString()}
                </p>
                <p className="text-gray-700 text-sm line-clamp-2">
                  {patent.abstract}
                </p>
              </div>
              <div className="ml-4 text-right">
                <div className="flex items-center text-sm text-gray-600 mb-1">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  {patent.similarity * 100}% match
                </div>
                <div className="text-xs text-gray-500">
                  {patent.claims} claims • {patent.citations} citations
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center text-gray-600">
                <Users className="w-4 h-4 mr-1" />
                {patent.inventors.join(', ')}
              </div>
              <div className="flex items-center text-gray-600">
                <FileText className="w-4 h-4 mr-1" />
                {patent.assignee}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderPatentDetail = () => {
    if (!selectedPatent) return null;

    const analysis = analyzePatentability(selectedPatent);

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Patent Analysis</h2>
                <div className="flex items-center text-sm text-gray-600 mt-1">
                  {apiStatus === 'connected' ? (
                    <Wifi className="w-4 h-4 text-green-500 mr-1" />
                  ) : apiStatus === 'connecting' ? (
                    <Clock className="w-4 h-4 text-yellow-500 mr-1" />
                  ) : (
                    <WifiOff className="w-4 h-4 text-red-500 mr-1" />
                  )}
                  {dataSource}
                </div>
              </div>
              <button
                onClick={() => setSelectedPatent(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Patent Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Patent Information</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Title</label>
                    <p className="text-gray-900">{selectedPatent.title}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Patent Number</label>
                    <p className="text-gray-900">{selectedPatent.id}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Inventors</label>
                    <p className="text-gray-900">{selectedPatent.inventors.join(', ')}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Assignee</label>
                    <p className="text-gray-900">{selectedPatent.assignee}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Abstract</label>
                    <p className="text-gray-900 text-sm">{selectedPatent.abstract}</p>
                  </div>
                </div>
              </div>

              {/* Patentability Analysis */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Patentability Analysis</h3>
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Overall Score</span>
                    <span className="text-lg font-bold text-blue-600">{analysis.overallScore}/100</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{width: `${analysis.overallScore}%`}}
                    ></div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  {Object.entries(analysis).filter(([key]) => key !== 'overallScore').map(([criterion, score]) => (
                    <div key={criterion} className="flex items-center justify-between">
                      <span className="text-sm text-gray-700 capitalize">
                        {criterion.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                      <div className="flex items-center">
                        {score === 'High' && <CheckCircle className="w-4 h-4 text-green-500 mr-1" />}
                        {score === 'Medium' && <Clock className="w-4 h-4 text-yellow-500 mr-1" />}
                        {score === 'Low' && <AlertTriangle className="w-4 h-4 text-red-500 mr-1" />}
                        <span className={`text-sm font-medium ${
                          score === 'High' ? 'text-green-600' : 
                          score === 'Medium' ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {score}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recommendations */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">Recommendations for Inventors</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Review the claims carefully to understand the scope of protection</li>
                <li>• Consider how your invention differs from this prior art</li>
                <li>• Consult with a patent attorney for detailed analysis</li>
                <li>• This analysis is for informational purposes only</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Patent Search</h1>
        <p className="text-gray-600">
          Comprehensive patent search and analysis tool designed specifically for inventors. 
          Find prior art, analyze patentability, and understand the competitive landscape.
        </p>
      </div>

      {renderSearchMode()}
      {renderFilters()}
      {renderSearchResults()}
      {renderPatentDetail()}

      {searchResults.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <Eye className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Start Your Search</h3>
          <p className="text-gray-600">
            Use the search tools above to find relevant patents and analyze your invention's patentability.
          </p>
        </div>
      )}
    </div>
  );
};

export default PatentSearch; 