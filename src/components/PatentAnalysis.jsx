import React, { useState, useEffect } from 'react';
import { TrendingUp, Users, Calendar, Target, BarChart3, Lightbulb, AlertTriangle, CheckCircle, Clock, Eye, FileText } from 'lucide-react';

const PatentAnalysis = () => {
  const [selectedTechnology, setSelectedTechnology] = useState('');
  const [analysisData, setAnalysisData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const technologyOptions = [
    'Artificial Intelligence',
    'Machine Learning',
    'Blockchain',
    'Internet of Things',
    'Cybersecurity',
    'Biotechnology',
    'Clean Energy',
    'Robotics',
    'Quantum Computing',
    'Augmented Reality'
  ];

  // Mock analysis data - in real implementation, this would come from AI analysis
  const generateAnalysisData = (technology) => {
    return {
      overview: {
        totalPatents: Math.floor(Math.random() * 5000) + 1000,
        activePatents: Math.floor(Math.random() * 3000) + 500,
        pendingApplications: Math.floor(Math.random() * 2000) + 200,
        topInventors: [
          { name: 'Dr. Sarah Chen', patents: 45, company: 'TechCorp Inc.' },
          { name: 'Prof. Michael Rodriguez', patents: 38, company: 'InnovateTech LLC' },
          { name: 'Dr. Emily Watson', patents: 32, company: 'FutureSystems Corp.' }
        ],
        topCompanies: [
          { name: 'Google Inc.', patents: 156, growth: '+12%' },
          { name: 'Microsoft Corporation', patents: 134, growth: '+8%' },
          { name: 'IBM Corp.', patents: 98, growth: '+5%' }
        ]
      },
      trends: {
        yearlyGrowth: [
          { year: 2019, patents: 1200 },
          { year: 2020, patents: 1450 },
          { year: 2021, patents: 1780 },
          { year: 2022, patents: 2100 },
          { year: 2023, patents: 2450 }
        ],
        monthlyTrends: [
          { month: 'Jan', applications: 180, grants: 145 },
          { month: 'Feb', applications: 195, grants: 162 },
          { month: 'Mar', applications: 210, grants: 178 },
          { month: 'Apr', applications: 225, grants: 190 },
          { month: 'May', applications: 240, grants: 205 },
          { month: 'Jun', applications: 255, grants: 220 }
        ]
      },
      opportunities: {
        whiteSpace: [
          'Edge AI for IoT devices',
          'Federated learning in healthcare',
          'AI-powered cybersecurity automation',
          'Quantum machine learning algorithms',
          'Sustainable AI computing'
        ],
        emergingTrends: [
          'Explainable AI (XAI)',
          'AI ethics and governance',
          'Neuromorphic computing',
          'AI for climate change',
          'Human-AI collaboration'
        ],
        marketGaps: [
          'Small business AI solutions',
          'AI for education accessibility',
          'AI-powered mental health tools',
          'Agricultural AI applications',
          'AI for elderly care'
        ]
      },
      competitive: {
        patentClusters: [
          { area: 'Core Algorithms', density: 'High', companies: 15, patents: 234 },
          { area: 'Applications', density: 'Medium', companies: 28, patents: 456 },
          { area: 'Hardware Integration', density: 'Low', companies: 8, patents: 67 },
          { area: 'Data Processing', density: 'High', companies: 22, patents: 312 }
        ],
        keyPlayers: [
          { name: 'Google Inc.', strength: 95, focus: 'Core AI', threat: 'High' },
          { name: 'Microsoft Corp.', strength: 87, focus: 'Enterprise AI', threat: 'High' },
          { name: 'Amazon.com', strength: 82, focus: 'Cloud AI', threat: 'Medium' },
          { name: 'Meta Platforms', strength: 78, focus: 'Social AI', threat: 'Medium' }
        ]
      }
    };
  };

  const handleAnalyze = async () => {
    if (!selectedTechnology) return;
    
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setAnalysisData(generateAnalysisData(selectedTechnology));
      setIsLoading(false);
    }, 2000);
  };

  const renderOverview = () => {
    if (!analysisData) return null;
    const { overview } = analysisData;

    return (
      <div className="space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center">
              <FileText className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Total Patents</p>
                <p className="text-2xl font-bold text-gray-900">{overview.totalPatents.toLocaleString()}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center">
              <CheckCircle className="w-8 h-8 text-green-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Active Patents</p>
                <p className="text-2xl font-bold text-gray-900">{overview.activePatents.toLocaleString()}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center">
              <Clock className="w-8 h-8 text-yellow-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Pending Applications</p>
                <p className="text-2xl font-bold text-gray-900">{overview.pendingApplications.toLocaleString()}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center">
              <TrendingUp className="w-8 h-8 text-purple-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Growth Rate</p>
                <p className="text-2xl font-bold text-gray-900">+15.2%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Top Inventors and Companies */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Users className="w-5 h-5 text-blue-600 mr-2" />
              Top Inventors
            </h3>
            <div className="space-y-3">
              {overview.topInventors.map((inventor, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{inventor.name}</p>
                    <p className="text-sm text-gray-600">{inventor.company}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-blue-600">{inventor.patents} patents</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <TrendingUp className="w-5 h-5 text-green-600 mr-2" />
              Top Companies
            </h3>
            <div className="space-y-3">
              {overview.topCompanies.map((company, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{company.name}</p>
                    <p className="text-sm text-gray-600">{company.patents} patents</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-600">{company.growth}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderTrends = () => {
    if (!analysisData) return null;
    const { trends } = analysisData;

    return (
      <div className="space-y-6">
        {/* Yearly Growth Chart */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Patent Growth Over Time</h3>
          <div className="h-64 flex items-end justify-between space-x-2">
            {trends.yearlyGrowth.map((year, index) => {
              const maxPatents = Math.max(...trends.yearlyGrowth.map(y => y.patents));
              const height = (year.patents / maxPatents) * 100;
              return (
                <div key={year.year} className="flex-1 flex flex-col items-center">
                  <div 
                    className="w-full bg-blue-600 rounded-t transition-all duration-300 hover:bg-blue-700"
                    style={{ height: `${height}%` }}
                  ></div>
                  <p className="text-xs text-gray-600 mt-2">{year.year}</p>
                  <p className="text-xs font-medium text-gray-900">{year.patents}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Monthly Trends */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Application vs Grant Trends</h3>
          <div className="space-y-3">
            {trends.monthlyTrends.map((month, index) => (
              <div key={month.month} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="font-medium text-gray-900">{month.month}</span>
                <div className="flex space-x-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Applications</p>
                    <p className="font-semibold text-blue-600">{month.applications}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Grants</p>
                    <p className="font-semibold text-green-600">{month.grants}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderOpportunities = () => {
    if (!analysisData) return null;
    const { opportunities } = analysisData;

    return (
      <div className="space-y-6">
        {/* White Space Opportunities */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Target className="w-5 h-5 text-blue-600 mr-2" />
            White Space Opportunities
          </h3>
          <p className="text-gray-600 mb-4">Areas with limited patent activity where innovation opportunities exist</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {opportunities.whiteSpace.map((opportunity, index) => (
              <div key={index} className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm font-medium text-blue-900">{opportunity}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Emerging Trends */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 text-green-600 mr-2" />
            Emerging Trends
          </h3>
          <p className="text-gray-600 mb-4">Growing areas of innovation and patent activity</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {opportunities.emergingTrends.map((trend, index) => (
              <div key={index} className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm font-medium text-green-900">{trend}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Market Gaps */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Lightbulb className="w-5 h-5 text-yellow-600 mr-2" />
            Market Gaps
          </h3>
          <p className="text-gray-600 mb-4">Underserved markets with potential for innovation</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {opportunities.marketGaps.map((gap, index) => (
              <div key={index} className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm font-medium text-yellow-900">{gap}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderCompetitive = () => {
    if (!analysisData) return null;
    const { competitive } = analysisData;

    return (
      <div className="space-y-6">
        {/* Patent Clusters */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Patent Clusters by Technology Area</h3>
          <div className="space-y-3">
            {competitive.patentClusters.map((cluster, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{cluster.area}</p>
                  <p className="text-sm text-gray-600">{cluster.companies} companies, {cluster.patents} patents</p>
                </div>
                <div className="text-right">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    cluster.density === 'High' ? 'bg-red-100 text-red-800' :
                    cluster.density === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {cluster.density} Density
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Key Players */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Players Analysis</h3>
          <div className="space-y-4">
            {competitive.keyPlayers.map((player, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-gray-900">{player.name}</h4>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      player.threat === 'High' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {player.threat} Threat
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Strength Score</p>
                    <div className="flex items-center">
                      <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{width: `${player.strength}%`}}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900">{player.strength}/100</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Focus Area</p>
                    <p className="font-medium text-gray-900">{player.focus}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const tabs = [
    { key: 'overview', label: 'Overview', icon: BarChart3 },
    { key: 'trends', label: 'Trends', icon: TrendingUp },
    { key: 'opportunities', label: 'Opportunities', icon: Target },
    { key: 'competitive', label: 'Competitive', icon: Users }
  ];

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Patent Landscape Analysis</h1>
        <p className="text-gray-600">
          Comprehensive AI-powered analysis of patent landscapes to help inventors identify opportunities, 
          understand competitive positioning, and make informed innovation decisions.
        </p>
      </div>

      {/* Technology Selection */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Technology Area</h2>
        <div className="flex gap-4">
          <select
            value={selectedTechnology}
            onChange={(e) => setSelectedTechnology(e.target.value)}
            className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">Choose a technology area...</option>
            {technologyOptions.map(tech => (
              <option key={tech} value={tech}>{tech}</option>
            ))}
          </select>
          <button
            onClick={handleAnalyze}
            disabled={!selectedTechnology || isLoading}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Analyzing...' : 'Analyze Landscape'}
          </button>
        </div>
      </div>

      {analysisData && (
        <>
          {/* Tab Navigation */}
          <div className="bg-white rounded-lg border border-gray-200 p-2 mb-6">
            <div className="flex space-x-1">
              {tabs.map(tab => {
                const IconComponent = tab.icon;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      activeTab === tab.key
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <IconComponent className="w-4 h-4 mr-2" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tab Content */}
          <div>
            {activeTab === 'overview' && renderOverview()}
            {activeTab === 'trends' && renderTrends()}
            {activeTab === 'opportunities' && renderOpportunities()}
            {activeTab === 'competitive' && renderCompetitive()}
          </div>
        </>
      )}

      {!analysisData && !isLoading && (
        <div className="text-center py-12">
          <Eye className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Technology Area</h3>
          <p className="text-gray-600">
            Choose a technology area above to begin your patent landscape analysis.
          </p>
        </div>
      )}
    </div>
  );
};

export default PatentAnalysis; 