import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getAnalysisHistory } from '../services/analysisService';
import StatCard from '../components/dashboard/StatCard';
import SafeTextFormatter from '../components/SafeTextFormatter';

const AnalysisDetail = () => {
  const { analysisId } = useParams();
  const navigate = useNavigate();
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadAnalysis = async () => {
      try {
        setLoading(true);
        const history = await getAnalysisHistory();
        const foundAnalysis = history.find(item => item.id === analysisId);
        
        if (foundAnalysis) {
          setAnalysis(foundAnalysis);
        } else {
          setError('Analysis not found');
        }
      } catch (err) {
        console.error('Error loading analysis:', err);
        setError('Failed to load analysis');
      } finally {
        setLoading(false);
      }
    };

    if (analysisId) {
      loadAnalysis();
    }
  }, [analysisId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Analysis Not Found</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link
            to="/analyzer"
            className="inline-flex items-center px-4 py-2 bg-pink-950 text-white rounded-md hover:bg-pink-900 transition-colors"
          >
            Back to Analyzer
          </Link>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return null;
  }

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <Link
                to="/analyzer"
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">Analysis Details</h1>
            </div>
            <div className="text-sm text-gray-500">
              {formatDate(analysis.timestamp)}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Original Argument */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Original Argument</h2>
              <div className="bg-gray-50 rounded-md p-4">
                <SafeTextFormatter 
                  text={analysis.argumentText}
                  className="text-gray-800 leading-relaxed"
                />
              </div>
            </div>
          </div>

          {/* Right Column - Analysis Results */}
          <div className="lg:col-span-2">
            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <StatCard
                title="Conclusion Type"
                value={analysis.analysisResults?.conclusionType || "Unknown"}
                icon="📝"
                color="bg-blue-50"
                textColor="text-blue-700"
              />
              <StatCard
                title="Logical Flaw"
                value={analysis.analysisResults?.keyFlaw || "No flaws detected"}
                icon="⚠️"
                color="bg-amber-50"
                textColor="text-amber-700"
              />
              <StatCard
                title="Counter Argument"
                value={analysis.analysisResults?.counterpoint || "No counter argument"}
                icon="🔄"
                color="bg-indigo-50"
                textColor="text-indigo-700"
              />
              <StatCard
                title="Hidden Assumptions"
                value={analysis.analysisResults?.assumptionsCount || 0}
                icon="🔍"
                color="bg-purple-50"
                textColor="text-purple-700"
                assumptions={analysis.analysisResults?.argumentStructure?.unstatedAssumptions}
              />
            </div>

            {/* Hidden Assumptions Section */}
            {analysis.analysisResults?.argumentStructure?.unstatedAssumptions && 
             analysis.analysisResults.argumentStructure.unstatedAssumptions.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                <div className="flex items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">Hidden Assumptions</h3>
                  <span className="ml-2 px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full">
                    {analysis.analysisResults.argumentStructure.unstatedAssumptions.length} found
                  </span>
                </div>
                <div className="space-y-3">
                  {analysis.analysisResults.argumentStructure.unstatedAssumptions.map((assumption, index) => (
                    <div key={index} className="p-3 bg-purple-50 rounded-md border border-purple-200">
                      <div className="flex items-start">
                        <span className="text-purple-600 font-medium mr-2">•</span>
                        <SafeTextFormatter 
                          text={assumption}
                          className="text-purple-900"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Argument Structure */}
            {analysis.analysisResults?.argumentStructure && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Argument Structure</h3>
                
                {/* Premises */}
                {analysis.analysisResults.argumentStructure.premise && 
                 analysis.analysisResults.argumentStructure.premise.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Premises:</h4>
                    <div className="space-y-2">
                      {analysis.analysisResults.argumentStructure.premise.map((premise, index) => (
                        <div key={index} className="p-3 bg-blue-50 rounded-md border border-blue-200">
                          <div className="flex items-start">
                            <span className="text-blue-600 font-medium mr-2">{index + 1}.</span>
                            <SafeTextFormatter 
                              text={premise}
                              className="text-blue-900"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Conclusion */}
                {analysis.analysisResults.argumentStructure.conclusion && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Conclusion:</h4>
                    <div className="p-3 bg-green-50 rounded-md border border-green-200">
                      <SafeTextFormatter 
                        text={analysis.analysisResults.argumentStructure.conclusion}
                        className="text-green-900"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Logic Breakdown */}
            {analysis.analysisResults?.breakdownItems && 
             analysis.analysisResults.breakdownItems.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Logic Breakdown</h3>
                <div className="space-y-3">
                  {analysis.analysisResults.breakdownItems.map((item, index) => (
                    <div key={index} className="p-4 border border-gray-200 rounded-md">
                      <div className="flex items-center justify-between mb-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          item.type === 'Flaw' ? 'bg-red-100 text-red-800' :
                          item.type === 'Assumption' ? 'bg-purple-100 text-purple-800' :
                          item.type === 'Premise' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {item.type}
                        </span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          item.severity === 'High' ? 'bg-red-100 text-red-800' :
                          item.severity === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {item.severity}
                        </span>
                      </div>
                      <SafeTextFormatter 
                        text={item.text}
                        className="text-gray-800"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisDetail; 