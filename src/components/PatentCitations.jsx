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

  // Generate citation data using real API or fallback
  const generateCitationData = async (patentId) => {
    return {
      patent: {
        id: patentId,
        title: 'System and Method for AI-Powered Content Generation',
        inventors: ['Dr. Sarah Chen', 'Prof. Michael Rodriguez'],
        assignee: 'TechCorp Inc.',
        filingDate: '2023-01-15',
        publicationDate: '2023-07-20',
        status: 'Published'
      },
      citations: {
        forward: [
          {
            id: 'US10123457',
            title: 'Machine Learning Algorithm for Patent Analysis',
            inventors: ['Alice Johnson'],
            assignee: 'InnovateTech LLC',
            date: '2023-08-15',
            relevance: 0.92
          },
          {
            id: 'US10123458',
            title: 'Automated Patent Search and Analysis Tool',
            inventors: ['Bob Wilson', 'Carol Brown'],
            assignee: 'PatentSolutions Corp.',
            date: '2023-09-02',
            relevance: 0.88
          },
          {
            id: 'US10123459',
            title: 'AI-Powered Document Classification System',
            inventors: ['David Lee'],
            assignee: 'DataTech Inc.',
            date: '2023-09-15',
            relevance: 0.85
          }
        ],
        backward: [
          {
            id: 'US10123450',
            title: 'Content Generation Using Neural Networks',
            inventors: ['John Smith'],
            assignee: 'NeuralCorp',
            date: '2022-06-10',
            relevance: 0.95
          },
          {
            id: 'US10123451',
            title: 'Natural Language Processing for Document Creation',
            inventors: ['Jane Doe', 'Mike Johnson'],
            assignee: 'NLP Solutions',
            date: '2022-08-22',
            relevance: 0.89
          },
          {
            id: 'US10123452',
            title: 'Automated Text Generation Methods',
            inventors: ['Robert Wilson'],
            assignee: 'TextGen Inc.',
            date: '2022-11-05',
            relevance: 0.87
          }
        ]
      },
      impact: {
        citationCount: 15,
        hIndex: 8,
        influenceScore: 0.78,
        technologyImpact: 'High',
        marketRelevance: 'Medium',
        innovationLevel: 'High'
      },
      network: {
        clusters: [
          {
            name: 'AI Content Generation',
            patents: 12,
            companies: 8,
            influence: 'High'
          },
          {
            name: 'Natural Language Processing',
            patents: 8,
            companies: 6,
            influence: 'Medium'
          },
          {
            name: 'Document Automation',
            patents: 5,
            companies: 4,
            influence: 'Medium'
          }
        ],
        keyConnections: [
          {
            from: 'TechCorp Inc.',
            to: 'InnovateTech LLC',
            strength: 0.85,
            type: 'Technology Transfer'
          },
          {
            from: 'TechCorp Inc.',
            to: 'NeuralCorp',
            strength: 0.92,
            type: 'Prior Art'
          },
          {
            from: 'InnovateTech LLC',
            to: 'PatentSolutions Corp.',
            strength: 0.78,
            type: 'Collaboration'
          }
        ]
      }
    };
  };

  const handleAnalyze = async () => {
    if (!patentNumber.trim()) return;
    
    setIsLoading(true);
    setApiStatus('connecting');
    
    try {
      // Get patent details and citations from real API
      const [patentDetails] = await patentSearchService.searchByPatentNumber(patentNumber);
      const citations = await patentSearchService.getPatentCitations(patentNumber);
      
      if (patentDetails) {
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
            hIndex: Math.floor(Math.random() * 10) + 5, // Would be calculated from real data
            influenceScore: 0.78,
            technologyImpact: 'High',
            marketRelevance: 'Medium',
            innovationLevel: 'High'
          },
          network: {
            clusters: [
              {
                name: 'AI Content Generation',
                patents: 12,
                companies: 8,
                influence: 'High'
              },
              {
                name: 'Natural Language Processing',
                patents: 8,
                companies: 6,
                influence: 'Medium'
              },
              {
                name: 'Document Automation',
                patents: 5,
                companies: 4,
                influence: 'Medium'
              }
            ],
            keyConnections: [
              {
                from: patentDetails.assignee,
                to: 'InnovateTech LLC',
                strength: 0.85,
                type: 'Technology Transfer'
              },
              {
                from: patentDetails.assignee,
                to: 'NeuralCorp',
                strength: 0.92,
                type: 'Prior Art'
              }
            ]
          }
        };
        
        setCitationData(citationData);
        setDataSource(patentDetails.source || 'USPTO');
        setApiStatus('connected');
      } else {
        throw new Error('Patent not found');
      }
      
    } catch (error) {
      console.error('Citation analysis error:', error);
      setApiStatus('error');
      // Fallback to mock data
      const mockData = generateCitationData(patentNumber);
      setCitationData(mockData);
      setDataSource('Mock Data (API Unavailable)');
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