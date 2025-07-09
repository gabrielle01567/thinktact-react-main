import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function PatentBuddyHome() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-8">
      <div className="max-w-lg w-full bg-white rounded-lg shadow-md p-8 text-center">
        <h1 className="text-2xl font-bold mb-4 text-blue-700">Welcome to Patent Buddy</h1>
        <p className="text-gray-700 mb-6">
          Get started on your provisional patent application with step-by-step guidance.<br/>
          When you’re ready, click below to begin a new application.<br/>
          <span className="text-sm text-gray-500">(More patent tools coming soon!)</span>
        </p>
        <button
          className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold text-lg shadow hover:bg-blue-700 transition"
          onClick={() => navigate('/patent-buddy/wizard')}
        >
          Start New Application
        </button>
      </div>
    </div>
  );
} 