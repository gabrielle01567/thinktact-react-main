import React from 'react';
import { Link } from 'react-router-dom';

// Sample saved analyses data
const savedAnalyses = [
  {
    id: '1',
    title: 'Gun Control Argument',
    date: 'April 2, 2023',
    snippet: 'Violent crime rates dropped significantly after stricter gun laws were implemented...',
    logicScore: 68,
    keyFlaw: 'Post hoc ergo propter hoc'
  },
  {
    id: '2',
    title: 'Climate Change Policy',
    date: 'March 15, 2023',
    snippet: "If we don't act now on climate change, future generations will suffer irreversible consequences...",
    logicScore: 82,
    keyFlaw: 'Appeal to emotion'
  },
  {
    id: '3',
    title: 'Economic Stimulus Argument',
    date: 'February 27, 2023',
    snippet: 'When the government increased spending during the last recession, unemployment decreased...',
    logicScore: 75,
    keyFlaw: 'Oversimplification'
  },
  {
    id: '4',
    title: 'Education Reform Proposal',
    date: 'January 12, 2023',
    snippet: 'Since charter schools have shown improved test scores in District A, all districts should...',
    logicScore: 61,
    keyFlaw: 'Hasty generalization'
  }
];

const SavedAnalyses = () => {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <h1 className="text-3xl font-bold tracking-tight text-pink-950 text-center mb-10 sm:mb-12">Saved Analyses</h1>
      
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Your Analyses</h2>
            <p className="text-sm text-gray-500 mt-1">View and manage your saved argument analyses</p>
          </div>
          <div className="space-x-2">
            <select className="p-2 border border-gray-300 rounded-md shadow-sm text-sm focus:border-pink-700 focus:ring-pink-700">
              <option>All analyses</option>
              <option>Recent</option>
              <option>High score</option>
              <option>Low score</option>
            </select>
            <button className="p-2 bg-pink-950 text-white rounded-md shadow-sm text-sm hover:bg-pink-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500">
              New Analysis
            </button>
          </div>
        </div>
        
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <div className="min-w-full">
            {savedAnalyses.map((analysis, index) => (
              <div key={analysis.id} className={`p-6 ${index < savedAnalyses.length - 1 ? 'border-b border-gray-200' : ''}`}>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{analysis.title}</h3>
                    <p className="text-sm text-gray-500 mt-1">{analysis.date}</p>
                    <p className="text-sm text-gray-700 mt-2 line-clamp-2">{analysis.snippet}</p>
                  </div>
                  <div className="flex flex-col items-end ml-4">
                    <div className="flex items-center mb-2">
                      <div className={`w-2 h-2 rounded-full mr-2 ${analysis.logicScore > 70 ? 'bg-green-500' : analysis.logicScore > 60 ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
                      <span className="text-sm font-semibold">{analysis.logicScore}/100</span>
                    </div>
                    {analysis.keyFlaw && (
                      <span className="px-2 py-1 bg-amber-50 text-amber-800 text-xs rounded-full">
                        {analysis.keyFlaw}
                      </span>
                    )}
                  </div>
                </div>
                <div className="mt-4 flex justify-end space-x-2">
                  <button className="px-3 py-1.5 text-xs text-gray-700 bg-white hover:bg-gray-50 border border-gray-300 rounded-md">
                    Share
                  </button>
                  <button className="px-3 py-1.5 text-xs text-pink-700 bg-pink-50 hover:bg-pink-100 border border-pink-100 rounded-md">
                    View Analysis
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="mt-6 flex justify-center">
          <nav className="inline-flex rounded-md shadow">
            <a href="#" className="px-3 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
              Previous
            </a>
            <a href="#" className="px-3 py-2 border-t border-b border-gray-300 bg-white text-sm font-medium text-pink-950">
              1
            </a>
            <a href="#" className="px-3 py-2 border-t border-b border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
              2
            </a>
            <a href="#" className="px-3 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
              Next
            </a>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default SavedAnalyses; 