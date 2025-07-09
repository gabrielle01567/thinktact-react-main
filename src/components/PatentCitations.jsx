import React, { useState, useEffect } from 'react';
import { Link, ArrowUpRight, ArrowDownRight, TrendingUp, Users, FileText, Target, Network, Eye, BarChart3, Database, Wifi, WifiOff } from 'lucide-react';
import patentSearchService from '../services/patentSearchService.js';

const PatentCitations = () => {
  const [patentNumber, setPatentNumber] = useState('');
  const [citationData, setCitationData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeView, setActiveView] = useState('overview');
  const [dataSource, setDataSource] = useState('USPTO');
  const [apiStatus, setApiStatus] = useState('connected');
  const [errorMessage, setErrorMessage] = useState('');

  // Helper function to generate clusters from citations
  const generateClustersFromCitations = (citations) => {
    const allCitations = [...citations.forward, ...citations.backward];
    const assignees = [...new Set(allCitations.map(c => c.assignee))];
    
    return assignees.slice(0, 3).map(assignee => ({
      name: assignee,
      patents: allCitations.filter(c => c.assignee === assignee).length,
      companies: 1,
      influence: allCitations.filter(c => c.assignee === assignee).length > 5 ? 'High' : 'Medium'
    }));
  };

  // Helper function to generate connections from citations
  const generateConnectionsFromCitations = (citations, mainAssignee) => {
    const connections = [];
    const forwardAssignees = [...new Set(citations.forward.map(c => c.assignee))];
    const backwardAssignees = [...new Set(citations.backward.map(c => c.assignee))];
    
    forwardAssignees.slice(0, 2).forEach(assignee => {
      connections.push({
        from: mainAssignee,
        to: assignee,
        strength: 0.8 + Math.random() * 0.2,
        type: 'Technology Transfer'
      });
    });
    
    backwardAssignees.slice(0, 1).forEach(assignee => {
      connections.push({
        from: assignee,
        to: mainAssignee,
        strength: 0.9 + Math.random() * 0.1,
        type: 'Prior Art'
      });
    });
    
    return connections;
  };

  const handleAnalyze = async () => {
    if (!patentNumber.trim()) return;
    
    setIsLoading(true);
    setApiStatus('connecting');
    setErrorMessage('');
    
    try {
      // Get patent details and citations from real API
      const patentResponse = await patentSearchService.searchByPatentNumber(patentNumber);
      const patentDetails = patentResponse.results[0];
      const citations = await patentSearchService.getPatentCitations(patentNumber);
      
      if (!patentDetails) {
        throw new Error('Patent not found. Please check the patent number and try again.');
      }
      
      const citationData = {
        patent: {
          id: patentDetails.id,
          title: patentDetails.title,
          inventors: patentDetails.inventors,
          assignee: patentDetails.assignee,
          filingDate: patentDetails.filingDate,
          publicationDate: patentDetails.publicationDate,
          status: patentDetails.status
        },
        citations: citations,
        impact: {
          citationCount: citations.forward.length + citations.backward.length,
          hIndex: Math.max(1, Math.floor((citations.forward.length + citations.backward.length) / 2)),
          influenceScore: Math.min(1.0, (citations.forward.length + citations.backward.length) / 20),
          technologyImpact: citations.forward.length > 10 ? 'High' : citations.forward.length > 5 ? 'Medium' : 'Low',
          marketRelevance: citations.forward.length > 5 ? 'High' : 'Medium',
          innovationLevel: citations.forward.length > 8 ? 'High' : citations.forward.length > 3 ? 'Medium' : 'Low'
        },
        network: {
          clusters: generateClustersFromCitations(citations),
          keyConnections: generateConnectionsFromCitations(citations, patentDetails.assignee)
        }
      };
        
      setCitationData(citationData);
      setDataSource(patentResponse.source);
      setApiStatus('connected');
      
      // Show fallback notification if USPTO failed and we're using Google Patents
      if (patentResponse.fallbackUsed) {
        setErrorMessage('USPTO API is currently unavailable. Using Google Patents data instead. Results may vary.');
      }
        
    } catch (error) {
      console.error('Citation analysis error:', error);
      setApiStatus('error');
      setCitationData(null);
      setErrorMessage(`Citation analysis failed: ${error.message}. Please check the patent number and try again.`);
    } finally {
      setIsLoading(false);
    }
  };

  const renderOverview = () => {
    if (!citationData) return null;
    const { patent, impact } = citationData;

    return (
      <div className="space-y-6">
        {/* Patent Information */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Patent Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Patent Number</label>
              <p className="text-gray-900 font-mono">{patent.id}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Title</label>
              <p className="text-gray-900">{patent.title}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Inventors</label>
              <p className="text-gray-900">{patent.inventors.join(', ')}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Assignee</label>
              <p className="text-gray-900">{patent.assignee}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Filing Date</label>
              <p className="text-gray-900">{new Date(patent.filingDate).toLocaleDateString()}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Publication Date</label>
              <p className="text-gray-900">{new Date(patent.publicationDate).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        {/* Impact Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center">
              <ArrowUpRight className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Forward Citations</p>
                <p className="text-2xl font-bold text-gray-900">{impact.citationCount}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center">
              <TrendingUp className="w-8 h-8 text-green-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">H-Index</p>
                <p className="text-2xl font-bold text-gray-900">{impact.hIndex}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center">
              <Target className="w-8 h-8 text-purple-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Influence Score</p>
                <p className="text-2xl font-bold text-gray-900">{Math.round(impact.influenceScore * 100)}%</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center">
              <Network className="w-8 h-8 text-orange-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Technology Impact</p>
                <p className="text-lg font-bold text-gray-900">{impact.technologyImpact}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Impact Analysis */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Impact Analysis</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">Technology Impact</h4>
              <p className="text-blue-800 text-sm">{impact.technologyImpact} - This patent has significantly influenced the development of AI content generation technology.</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-semibold text-green-900 mb-2">Market Relevance</h4>
              <p className="text-green-800 text-sm">{impact.marketRelevance} - Moderate market adoption with potential for growth in content creation industries.</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <h4 className="font-semibold text-purple-900 mb-2">Innovation Level</h4>
              <p className="text-purple-800 text-sm">{impact.innovationLevel} - Represents a significant advancement in AI-powered content generation methods.</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderCitations = () => {
    if (!citationData) return null;
    const { citations } = citationData;

    return (
      <div className="space-y-6">
        {/* Forward Citations */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <ArrowUpRight className="w-5 h-5 text-blue-600 mr-2" />
            Forward Citations ({citations.forward.length})
          </h3>
          <p className="text-gray-600 mb-4">Patents that cite this patent as prior art</p>
          <div className="space-y-4">
            {citations.forward.map((citation, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{citation.title}</h4>
                    <p className="text-sm text-gray-600">Patent: {citation.id}</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center text-sm text-gray-600 mb-1">
                      <Target className="w-4 h-4 mr-1" />
                      {Math.round(citation.relevance * 100)}% relevant
                    </div>
                    <p className="text-xs text-gray-500">{new Date(citation.date).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center text-gray-600">
                    <Users className="w-4 h-4 mr-1" />
                    {citation.inventors.join(', ')}
                  </div>
                  <div className="flex items-center text-gray-600">
                    <FileText className="w-4 h-4 mr-1" />
                    {citation.assignee}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Backward Citations */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <ArrowDownRight className="w-5 h-5 text-green-600 mr-2" />
            Backward Citations ({citations.backward.length})
          </h3>
          <p className="text-gray-600 mb-4">Prior art patents that this patent cites</p>
          <div className="space-y-4">
            {citations.backward.map((citation, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{citation.title}</h4>
                    <p className="text-sm text-gray-600">Patent: {citation.id}</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center text-sm text-gray-600 mb-1">
                      <Target className="w-4 h-4 mr-1" />
                      {Math.round(citation.relevance * 100)}% relevant
                    </div>
                    <p className="text-xs text-gray-500">{new Date(citation.date).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center text-gray-600">
                    <Users className="w-4 h-4 mr-1" />
                    {citation.inventors.join(', ')}
                  </div>
                  <div className="flex items-center text-gray-600">
                    <FileText className="w-4 h-4 mr-1" />
                    {citation.assignee}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderNetwork = () => {
    if (!citationData) return null;
    const { network } = citationData;

    return (
      <div className="space-y-6">
        {/* Technology Clusters */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Technology Clusters</h3>
          <p className="text-gray-600 mb-4">Related technology areas and their influence</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {network.clusters.map((cluster, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">{cluster.name}</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Patents:</span>
                    <span className="font-medium">{cluster.patents}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Companies:</span>
                    <span className="font-medium">{cluster.companies}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Influence:</span>
                    <span className={`font-medium ${
                      cluster.influence === 'High' ? 'text-green-600' :
                      cluster.influence === 'Medium' ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {cluster.influence}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Key Connections */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Connections</h3>
          <p className="text-gray-600 mb-4">Important relationships between companies and technologies</p>
          <div className="space-y-4">
            {network.keyConnections.map((connection, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <span className="font-medium text-gray-900">{connection.from}</span>
                    <ArrowUpRight className="w-4 h-4 mx-2 text-gray-400" />
                    <span className="font-medium text-gray-900">{connection.to}</span>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    connection.type === 'Technology Transfer' ? 'bg-blue-100 text-blue-800' :
                    connection.type === 'Prior Art' ? 'bg-green-100 text-green-800' :
                    'bg-purple-100 text-purple-800'
                  }`}>
                    {connection.type}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Connection Strength</span>
                  <div className="flex items-center">
                    <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{width: `${connection.strength * 100}%`}}
                      ></div>
                    </div>
                    <span className="font-medium">{Math.round(connection.strength * 100)}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const views = [
    { key: 'overview', label: 'Overview', icon: Eye },
    { key: 'citations', label: 'Citations', icon: FileText },
    { key: 'network', label: 'Network', icon: Network }
  ];

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Patent Citation Analysis</h1>
        <p className="text-gray-600">
          Analyze patent citations to understand influence, impact, and technology relationships. 
          Track how patents are referenced and build competitive intelligence.
        </p>
      </div>

      {/* Patent Input */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Enter Patent Number</h2>
        <div className="flex gap-4">
          <input
            type="text"
            value={patentNumber}
            onChange={(e) => setPatentNumber(e.target.value)}
            placeholder="e.g., US10123456, US20230012345A1"
            className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            onKeyPress={(e) => e.key === 'Enter' && handleAnalyze()}
          />
          <button
            onClick={handleAnalyze}
            disabled={!patentNumber.trim() || isLoading}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Analyzing...' : 'Analyze Citations'}
          </button>
        </div>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className={`border rounded-lg p-6 mb-6 ${
          errorMessage.includes('USPTO API is currently unavailable') 
            ? 'bg-yellow-50 border-yellow-200' 
            : 'bg-red-50 border-red-200'
        }`}>
          <div className="flex items-center">
            <AlertTriangle className={`w-5 h-5 mr-2 ${
              errorMessage.includes('USPTO API is currently unavailable') 
                ? 'text-yellow-500' 
                : 'text-red-500'
            }`} />
            <h3 className={`text-lg font-semibold ${
              errorMessage.includes('USPTO API is currently unavailable') 
                ? 'text-yellow-900' 
                : 'text-red-900'
            }`}>
              {errorMessage.includes('USPTO API is currently unavailable') 
                ? 'Data Source Notice' 
                : 'Analysis Error'}
            </h3>
          </div>
          <p className={`mt-2 ${
            errorMessage.includes('USPTO API is currently unavailable') 
              ? 'text-yellow-700' 
              : 'text-red-700'
          }`}>
            {errorMessage}
          </p>
          <div className="mt-4">
            <button
              onClick={() => {
                setErrorMessage('');
                if (!errorMessage.includes('USPTO API is currently unavailable')) {
                  setCitationData(null);
                }
              }}
              className={`px-4 py-2 rounded-md transition-colors ${
                errorMessage.includes('USPTO API is currently unavailable')
                  ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                  : 'bg-red-600 text-white hover:bg-red-700'
              }`}
            >
              {errorMessage.includes('USPTO API is currently unavailable') ? 'Dismiss' : 'Try Again'}
            </button>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <div className="flex items-center">
            <Clock className="w-5 h-5 text-blue-500 mr-2 animate-spin" />
            <h3 className="text-lg font-semibold text-blue-900">Analyzing Citations...</h3>
          </div>
          <p className="text-blue-700 mt-2">Fetching patent data and citation information...</p>
        </div>
      )}

      {citationData && (
        <>
          {/* View Navigation */}
          <div className="bg-white rounded-lg border border-gray-200 p-2 mb-6">
            <div className="flex space-x-1">
              {views.map(view => {
                const IconComponent = view.icon;
                return (
                  <button
                    key={view.key}
                    onClick={() => setActiveView(view.key)}
                    className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      activeView === view.key
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <IconComponent className="w-4 h-4 mr-2" />
                    {view.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* View Content */}
          <div>
            {activeView === 'overview' && renderOverview()}
            {activeView === 'citations' && renderCitations()}
            {activeView === 'network' && renderNetwork()}
          </div>
        </>
      )}

      {!citationData && !isLoading && (
        <div className="text-center py-12">
          <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Enter a Patent Number</h3>
          <p className="text-gray-600">
            Enter a patent number above to begin your citation analysis.
          </p>
        </div>
      )}
    </div>
  );
};

export default PatentCitations; 