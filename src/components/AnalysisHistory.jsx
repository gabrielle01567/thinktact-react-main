import React, { useState, useEffect } from 'react';
import { getAnalysisHistory, deleteAnalysis } from '../services/analysisService';

const AnalysisHistory = ({ onSelectAnalysis, currentAnalysisId, refreshKey }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load analysis history
  const loadHistory = async () => {
    try {
      console.log('AnalysisHistory: Loading history...');
      setLoading(true);
      const data = await getAnalysisHistory();
      console.log('AnalysisHistory: Received history data:', data);
      setHistory(data);
      setError(null);
    } catch (err) {
      console.error('Error loading analysis history:', err);
      setError('Failed to load analysis history');
    } finally {
      setLoading(false);
    }
  };

  // Delete an analysis
  const handleDelete = async (analysisId, e) => {
    e.stopPropagation(); // Prevent triggering the click event
    
    if (!window.confirm('Are you sure you want to delete this analysis?')) {
      return;
    }

    try {
      await deleteAnalysis(analysisId);
      // Remove from local state
      setHistory(prev => prev.filter(item => item.id !== analysisId));
    } catch (err) {
      console.error('Error deleting analysis:', err);
      alert('Failed to delete analysis');
    }
  };

  // Format date for display
  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      const hours = Math.floor(diffInHours);
      return `${hours}h ago`;
    } else {
      const days = Math.floor(diffInHours / 24);
      return `${days}d ago`;
    }
  };

  // Truncate argument text for display
  const truncateText = (text, maxLength = 60) => {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  useEffect(() => {
    console.log('AnalysisHistory: refreshKey changed to:', refreshKey);
    loadHistory();
  }, [refreshKey]);

  // Also load history on component mount
  useEffect(() => {
    console.log('AnalysisHistory: Component mounted, loading history...');
    loadHistory();
  }, []);

  if (loading) {
    return (
      <div className="px-4 py-3">
        <div className="flex items-center justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-pink-900"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4 py-3">
        <div className="text-red-500 text-sm">{error}</div>
        <button 
          onClick={loadHistory}
          className="mt-2 text-xs text-pink-900 hover:text-pink-700 underline"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!history || history.length === 0) {
    return (
      <div className="px-4 py-3">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Recent Analyses</h3>
        <div className="text-gray-500 text-sm text-center py-4">
          No previous analyses yet
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-3">
      <h3 className="text-sm font-medium text-gray-700 mb-3">Recent Analyses</h3>
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {history.map((analysis) => (
          <div
            key={analysis.id}
            onClick={() => onSelectAnalysis(analysis)}
            className={`p-3 rounded-lg border cursor-pointer transition-all hover:shadow-sm ${
              currentAnalysisId === analysis.id
                ? 'border-pink-300 bg-pink-50'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <div className="flex justify-between items-start mb-2">
              <div className="text-xs text-gray-500">
                {formatDate(analysis.timestamp)}
              </div>
              <button
                onClick={(e) => handleDelete(analysis.id, e)}
                className="text-gray-400 hover:text-red-500 transition-colors"
                title="Delete analysis"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="text-sm text-gray-800 leading-relaxed">
              {truncateText(analysis.argumentText)}
            </div>
            {analysis.analysisResults && (
              <div className="mt-2 flex flex-wrap gap-1">
                {analysis.analysisResults.conclusionType && (
                  <span className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                    {analysis.analysisResults.conclusionType}
                  </span>
                )}
                {analysis.analysisResults.keyFlaw && (
                  <span className="inline-block px-2 py-1 text-xs bg-amber-100 text-amber-800 rounded">
                    Flaw
                  </span>
                )}
                {analysis.analysisResults?.assumptionsCount > 0 && (
                  <span className="inline-block px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded">
                    {analysis?.analysisResults?.assumptionsCount || 0} assumptions
                  </span>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AnalysisHistory; 