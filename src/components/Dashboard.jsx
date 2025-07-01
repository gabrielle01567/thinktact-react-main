import React from 'react';
import CollapsibleSection from './CollapsibleSection'; // Import from dedicated file
import { Doughnut } from 'react-chartjs-2';

const Dashboard = ({ analysisResults, isLoading, error }) => {
  // Define chartData locally since it's not being passed as a prop
  const chartData = {
    labels: ['Necessary Assumptions', 'Sufficient Assumptions', 'Flaws'],
    datasets: [
      {
        label: 'Argument Components',
        data: [
          analysisResults?.necessaryAssumption ? 1 : 0,
          analysisResults?.sufficientAssumption ? 1 : 0,
          analysisResults?.logicalFlaws?.length || 0,
        ],
        backgroundColor: [
          'rgba(157, 23, 77, 0.8)', // pink-900
          'rgba(131, 24, 67, 0.8)', // pink-950
          'rgba(209, 213, 219, 0.8)', // gray-300
        ],
        borderColor: [
          'rgba(157, 23, 77, 1)',
          'rgba(131, 24, 67, 1)',
          'rgba(209, 213, 219, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="space-y-10 mt-12">
      {/* --- Structure/Chart Section --- */}
      {(isLoading || analysisResults?.necessaryAssumption || analysisResults?.sufficientAssumption || analysisResults?.logicalFlaws?.length > 0) && (
        <div className="bg-white border border-gray-200 shadow-sm rounded-lg overflow-hidden">
          <div className="px-5 py-5 sm:px-6 sm:py-6">
            <h3 className="text-lg font-semibold leading-6 text-gray-900 mb-5">Logical Structure Overview</h3>
            {isLoading ? (
              <p className="text-sm text-gray-500">Loading structure...</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Visual Logic Flowchart - TODO: Make dynamic */}
                <div className="bg-gray-50 p-5 rounded-md border border-gray-200">
                  <h4 className="font-medium text-gray-900 mb-4 text-center">Argument Flow (Placeholder)</h4>
                  <div className="flex flex-col items-center text-sm text-center space-y-2">
                    <div className="bg-gray-200 rounded px-3 py-1 w-full">Premise: ...</div>
                    <div className="text-gray-400">↓</div>
                    <div className="bg-pink-100 rounded px-3 py-1 w-full">If: ...</div>
                    <div className="text-gray-400">↓</div>
                    <div className="bg-pink-200 rounded px-3 py-1 w-full">Then: ...</div>
                    <div className="text-gray-400">↓</div>
                    <div className="bg-pink-300 rounded px-3 py-1 w-full">Conclusion: {analysisResults?.conclusion?.text || '...'}</div>
                  </div>
                </div>

                {/* Donut Chart */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-4 text-center">Key Components</h4>
                  <div className="h-64 flex items-center justify-center">
                    {/* Assuming chartData is passed as a prop or defined here */}
                    <Doughnut
                      data={chartData}
                      options={{ responsive: true, maintainAspectRatio: false }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- Detailed Analysis Section --- */}
      {(isLoading || Object.values(analysisResults || {}).some(val => val && (typeof val !== 'object' || Array.isArray(val) ? val?.length > 0 : true))) && (
        <div>
          <h3 className="text-lg font-semibold leading-6 text-gray-900 mb-5">Detailed Analysis</h3>
          <div className="space-y-4">
            <CollapsibleSection title="If–Then Structure" isLoading={isLoading}>{analysisResults.ifThenStructure}</CollapsibleSection>
            <CollapsibleSection title="Necessary Assumption" isLoading={isLoading}>{analysisResults.necessaryAssumption}</CollapsibleSection>
            <CollapsibleSection title="Sufficient Assumption" isLoading={isLoading}>{analysisResults.sufficientAssumption}</CollapsibleSection>
            <CollapsibleSection title="Conclusion" isLoading={isLoading}>{analysisResults.conclusion}</CollapsibleSection>
            <CollapsibleSection title="Unstated Rule" isLoading={isLoading}>{analysisResults.unstatedRule}</CollapsibleSection>
            <CollapsibleSection title="Method of Reasoning" isLoading={isLoading}>{analysisResults.methodOfReasoning}</CollapsibleSection>
            <CollapsibleSection title="Logical Flaws" isLoading={isLoading}>{analysisResults.logicalFlaws}</CollapsibleSection>
            <CollapsibleSection title="Quantifiers" isLoading={isLoading}>{analysisResults.quantifiers}</CollapsibleSection>
            <CollapsibleSection title="Premise Sets" isLoading={isLoading}>{analysisResults.premiseSets}</CollapsibleSection>
            <CollapsibleSection title="Counterpoint" isLoading={isLoading}>{analysisResults.counterpoint}</CollapsibleSection>
          </div>
        </div>
      )}

      {/* Display Error Messages */}
      {error && (
        <p className="mt-4 text-sm text-red-600 bg-red-50 p-3 rounded-md">{error}</p>
      )}
    </div>
  );
};

export default Dashboard; 