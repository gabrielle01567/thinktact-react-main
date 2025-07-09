import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, BarChart3, FileText, Target, Users, TrendingUp, Lightbulb, Shield, Clock, CheckCircle, Network, Settings } from 'lucide-react';

export default function PatentBuddyHome() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  const tools = [
    {
      id: 'search',
      title: 'AI Patent Search',
      description: 'Find prior art and analyze patentability with AI-powered search',
      icon: Search,
      color: 'blue',
      features: ['Keyword, inventor, and patent number search', 'AI-powered relevance scoring', 'Detailed patent analysis', 'Prior art identification'],
      action: () => navigate('/patent-buddy/search')
    },
    {
      id: 'analysis',
      title: 'Patent Landscape Analysis',
      description: 'Comprehensive analysis of patent landscapes and competitive intelligence',
      icon: BarChart3,
      color: 'green',
      features: ['Technology trend analysis', 'Competitive landscape mapping', 'White space opportunity identification', 'Market gap analysis'],
      action: () => navigate('/patent-buddy/analysis')
    },
    {
      id: 'citations',
      title: 'Citation Analysis',
      description: 'Analyze patent citations to understand influence and impact',
      icon: Network,
      color: 'orange',
      features: ['Forward and backward citation tracking', 'Impact metrics and H-index', 'Technology cluster analysis', 'Competitive relationship mapping'],
      action: () => navigate('/patent-buddy/citations')
    },
    {
      id: 'wizard',
      title: 'Patent Application Wizard',
      description: 'Step-by-step guidance for creating provisional patent applications',
      icon: FileText,
      color: 'purple',
      features: ['Interactive form wizard', 'Real-time validation', 'Document preview', 'Save and resume functionality'],
      action: () => navigate('/patent-buddy/wizard')
    }
  ];

  const benefits = [
    {
      icon: Target,
      title: 'Identify Opportunities',
      description: 'Find white space in patent landscapes and emerging innovation areas'
    },
    {
      icon: Shield,
      title: 'Protect Your Invention',
      description: 'Understand prior art and strengthen your patent application'
    },
    {
      icon: TrendingUp,
      title: 'Competitive Intelligence',
      description: 'Track competitors and understand market positioning'
    },
    {
      icon: Clock,
      title: 'Save Time',
      description: 'AI-powered tools reduce research time from weeks to hours'
    }
  ];

  const getColorClasses = (color) => {
    const colors = {
      blue: 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100',
      green: 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100',
      orange: 'bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100',
      purple: 'bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100'
    };
    return colors[color] || colors.blue;
  };

  const getIconColor = (color) => {
    const colors = {
      blue: 'text-blue-600',
      green: 'text-green-600',
      orange: 'text-orange-600',
      purple: 'text-purple-600'
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-600 to-purple-700 text-white">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Patent Buddy
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              AI-Powered Patent Tools for Inventors
            </p>
            <p className="text-lg text-blue-200 max-w-3xl mx-auto mb-8">
              Comprehensive patent search, analysis, and application tools designed specifically for inventors. 
              Find prior art, analyze patentability, and create strong patent applications with AI assistance.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/patent-buddy/search')}
                className="px-8 py-3 bg-white text-blue-600 rounded-lg font-semibold text-lg shadow-lg hover:bg-gray-100 transition-colors"
              >
                Start Patent Search
              </button>
              <button
                onClick={() => navigate('/patent-buddy/wizard')}
                className="px-8 py-3 bg-transparent border-2 border-white text-white rounded-lg font-semibold text-lg hover:bg-white hover:text-blue-600 transition-colors"
              >
                Create Application
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tools Section */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Comprehensive Patent Tools</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Everything inventors need to research, analyze, and protect their innovations
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          {tools.map((tool) => {
            const IconComponent = tool.icon;
            return (
              <div key={tool.id} className="bg-white rounded-lg border border-gray-200 p-8 hover:shadow-lg transition-shadow">
                <div className="flex items-center mb-4">
                  <div className={`p-3 rounded-lg ${getColorClasses(tool.color)}`}>
                    <IconComponent className={`w-8 h-8 ${getIconColor(tool.color)}`} />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 ml-4">{tool.title}</h3>
                </div>
                <p className="text-gray-600 mb-6">{tool.description}</p>
                <ul className="space-y-2 mb-6">
                  {tool.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-sm text-gray-700">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={tool.action}
                  className={`w-full py-3 px-6 rounded-lg font-semibold text-white transition-colors ${
                    tool.color === 'blue' ? 'bg-blue-600 hover:bg-blue-700' :
                    tool.color === 'green' ? 'bg-green-600 hover:bg-green-700' :
                    tool.color === 'orange' ? 'bg-orange-600 hover:bg-orange-700' :
                    'bg-purple-600 hover:bg-purple-700'
                  }`}
                >
                  Get Started
                </button>
              </div>
            );
          })}
        </div>

        {/* Benefits Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-8 mb-16">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Why Choose Patent Buddy?</h2>
            <p className="text-gray-600">
              Built specifically for inventors with AI-powered insights and comprehensive tools
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => {
              const IconComponent = benefit.icon;
              return (
                <div key={index} className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-4">
                    <IconComponent className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{benefit.title}</h3>
                  <p className="text-sm text-gray-600">{benefit.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="text-center mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Ready to Get Started?</h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/patent-buddy/search')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Search Patents
            </button>
            <button
              onClick={() => navigate('/patent-buddy/analysis')}
              className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
            >
              Analyze Landscape
            </button>
            <button
              onClick={() => navigate('/patent-buddy/citations')}
              className="px-6 py-3 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 transition-colors"
            >
              Citation Analysis
            </button>
            <button
              onClick={() => navigate('/patent-buddy/wizard')}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors"
            >
              Create Application
            </button>
          </div>
        </div>

        {/* Settings Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Configuration & Settings</h2>
            <p className="text-gray-600">
              Configure API keys and customize your patent search experience
            </p>
          </div>
          <div className="flex justify-center">
            <button
              onClick={() => navigate('/patent-buddy/api-config')}
              className="flex items-center px-6 py-3 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 transition-colors"
            >
              <Settings className="w-5 h-5 mr-2" />
              Configure USPTO API Key
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 