import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import StatCard from '../components/dashboard/StatCard';
import ArgumentFlow from '../components/dashboard/ArgumentFlow';
import LogicDonutChart from '../components/dashboard/LogicDonutChart';
import LogicBreakdownTable from '../components/dashboard/LogicBreakdownTable';

// Sample data fallback for when no analysis is available
const sampleAnalysis = {
  conclusionType: "Causal Claim",
  keyFlaw: "Correlation mistaken for causation",
  counterpoint: "Other factors like better policing or economic improvements could explain the drop in crime rates",
  assumptionsCount: 4,
  originalArgument: "Countries that have stricter gun laws have less violent crime. Therefore, implementing stricter gun laws in our country will reduce crime rates.",
  improvedArgument: "Evidence shows that countries with stricter gun control laws tend to have lower rates of gun violence. While many factors contribute to crime rates, implementing similar evidence-based regulations might help reduce gun-related violence in our country.",
  
  // Sample argument structure
  argumentStructure: {
    premise: [
      "Violent crime rates dropped significantly after stricter gun laws were implemented",
      "Countries with stricter gun control have lower violent crime rates",
      "Guns make violent crimes more lethal"
    ],
    conclusion: "Therefore, implementing stricter gun laws will reduce crime nationwide",
    unstatedAssumptions: [
      "Other factors like economic conditions remained the same",
      "What works in other countries will work the same way in our country"
    ]
  },
  
  // For donut chart - we're not using this anymore
  components: {
    necessaryAssumptions: 30,
    flaws: 15,
    sufficientAssumptions: 40,
    quantifiers: 15
  },
  
  // For breakdown table
  breakdownItems: [
    { type: 'Flaw', text: 'Assumes correlation equals causation', category: 'Causal', severity: 'High' },
    { type: 'Necessary Assumption', text: 'Gun laws were the only significant policy change', category: 'Premise', severity: 'Medium' },
    { type: 'Quantifier', text: 'Significantly', category: 'Magnitude', severity: 'Low' },
    { type: 'Sufficient Assumption', text: 'Similar demographics across regions', category: 'Context', severity: 'Medium' },
    { type: 'Unstated Rule', text: 'What works in one region will work in others', category: 'Generalization', severity: 'High' },
    { type: 'Implicit Premise', text: 'Crime is primarily driven by access to guns', category: 'Premise', severity: 'Medium' },
  ]
};

const Dashboard = () => {
  const location = useLocation();
  const [analysis, setAnalysis] = useState(null);
  
  useEffect(() => {
    // Get analysis data from location state (passed from Analyzer)
    if (location.state?.analysisResults) {
      // Process received analysis results
      const rawResults = location.state.analysisResults;
      const originalArgument = location.state.originalArgument || '';
      
      // Transform the raw results into the format expected by our dashboard components
      const processedAnalysis = {
        conclusionType: rawResults.conclusion?.type || "Unknown",
        keyFlaw: rawResults.logicalFlaws?.length > 0 ? rawResults.logicalFlaws[0] : "No major flaws detected",
        counterpoint: rawResults.possibleCounter || "No counter argument provided",
        assumptionsCount: (rawResults.premiseSets?.implicit?.length || 0) + (rawResults.unstatedAssumptions?.length || 0),
        originalArgument: originalArgument,
        improvedArgument: rawResults.improvedVersion || originalArgument,
        
        // Argument structure - ensure premises are correctly formatted
        argumentStructure: {
          premise: rawResults.premiseSets?.explicit && rawResults.premiseSets.explicit.length > 0 
            ? rawResults.premiseSets.explicit 
            : ["No explicit premises detected"],
          conclusion: rawResults.conclusion?.text || "No clear conclusion identified",
          unstatedAssumptions: rawResults.unstatedAssumptions && rawResults.unstatedAssumptions.length > 0
            ? rawResults.unstatedAssumptions
            : []
        },
        
        // For donut chart - we're not using this anymore
        components: {
          necessaryAssumptions: rawResults.necessaryAssumption ? 25 : 0,
          flaws: rawResults.logicalFlaws?.length || 0,
          sufficientAssumptions: rawResults.sufficientAssumption ? 25 : 0,
          quantifiers: rawResults.quantifiers ? 15 : 0
        },
        
        // For breakdown table
        breakdownItems: [
          ...(rawResults.logicalFlaws?.map(flaw => ({ 
            type: 'Flaw', 
            text: flaw, 
            category: 'Logical', 
            severity: 'High' 
          })) || []),
          rawResults.necessaryAssumption && { 
            type: 'Necessary Assumption', 
            text: rawResults.necessaryAssumption, 
            category: 'Assumption', 
            severity: 'Medium' 
          },
          rawResults.sufficientAssumption && { 
            type: 'Sufficient Assumption', 
            text: rawResults.sufficientAssumption, 
            category: 'Assumption', 
            severity: 'Medium' 
          },
          rawResults.unstatedRule && { 
            type: 'Unstated Rule', 
            text: rawResults.unstatedRule, 
            category: 'Rule', 
            severity: 'Medium' 
          },
          ...(rawResults.premiseSets?.implicit?.map(premise => ({ 
            type: 'Implicit Premise', 
            text: premise, 
            category: 'Premise', 
            severity: 'Low' 
          })) || [])
        ].filter(Boolean) // Remove any null/undefined items
      };
      
      setAnalysis(processedAnalysis);
    } else {
      // If no analysis results provided, use sample data with originalArgument for demonstration
      const sampleWithOriginal = {
        ...sampleAnalysis,
        originalArgument: "Countries that have stricter gun laws have less violent crime. Therefore, implementing stricter gun laws in our country will reduce crime rates."
      };
      setAnalysis(sampleWithOriginal);
    }
  }, [location]);

  // Wait until analysis is ready
  if (!analysis) {
    return <div className="flex justify-center items-center h-screen">Loading dashboard...</div>;
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar Navigation - Fixed Left */}
      <div className="hidden md:flex md:w-64 lg:w-72 bg-white shadow-md flex-col fixed h-full z-10">
        <div className="px-6 py-5 border-b border-gray-200 flex items-center">
          <svg 
            className="h-8 w-8 text-pink-950 mr-2" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="1.5" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            {/* Brain circuit design */}
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
            <path d="M12 6v12" />
            <path d="M6 12h12" />
            <path d="M8.5 8.5l7 7" />
            <path d="M15.5 8.5l-7 7" />
            {/* AI circuit nodes */}
            <circle cx="12" cy="12" r="2" fill="currentColor" />
            <circle cx="8.5" cy="8.5" r="1" fill="currentColor" />
            <circle cx="15.5" cy="8.5" r="1" fill="currentColor" />
            <circle cx="8.5" cy="15.5" r="1" fill="currentColor" />
            <circle cx="15.5" cy="15.5" r="1" fill="currentColor" />
          </svg>
          <h2 className="text-xl font-bold text-pink-950">ThinkTactAI</h2>
        </div>
        <nav className="mt-5 flex-1 px-4">
          <div className="space-y-1">
            <Link to="/dashboard" className="flex items-center px-3 py-2.5 text-sm font-medium rounded-md bg-pink-50 text-pink-900">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM14 11a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1h-1a1 1 0 110-2h1v-1a1 1 0 011-1z" />
              </svg>
              Analysis Hub
            </Link>
            <Link to="/analyzer" className="flex items-center px-3 py-2.5 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50 hover:text-pink-800">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              Argument Analyzer
            </Link>
            <Link to="/about" className="flex items-center px-3 py-2.5 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50 hover:text-pink-800">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              About ThinkTactAI
            </Link>
            <Link to="/blog" className="flex items-center px-3 py-2.5 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50 hover:text-pink-800">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M2 5a2 2 0 012-2h8a2 2 0 012 2v10a2 2 0 002 2H4a2 2 0 01-2-2V5zm3 1h6v4H5V6zm6 6H5v2h6v-2z" clipRule="evenodd" />
                <path d="M15 7h1a2 2 0 012 2v5.5a1.5 1.5 0 01-3 0V7z" />
              </svg>
              Blog
            </Link>
            <Link to="/settings" className="flex items-center px-3 py-2.5 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50 hover:text-pink-800">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
              </svg>
              Settings
            </Link>
          </div>
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 md:ml-64 lg:ml-72">
        {/* Removing the top navigation bar */}
        
        {/* Dashboard Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 pt-10">
          <div className="h-full grid grid-cols-1 gap-5">
            {/* Top Row - Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <StatCard
                title="Conclusion Type"
                value={analysis.conclusionType}
                icon="📝"
                color="bg-blue-50"
                textColor="text-blue-700"
              />
              <StatCard
                title="Logical Flaw"
                value={analysis.keyFlaw}
                icon="⚠️"
                color="bg-amber-50"
                textColor="text-amber-700"
              />
              <StatCard
                title="Counter Argument"
                value={analysis.counterpoint}
                icon="🔄"
                color="bg-indigo-50"
                textColor="text-indigo-700"
              />
              <StatCard
                title="Hidden Assumptions"
                value={analysis.assumptionsCount}
                icon="🔍"
                color="bg-purple-50"
                textColor="text-purple-700"
              />
            </div>

            {/* Middle Row - Your Argument and Argument Flow */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">Your Argument</h3>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  {/* Original Argument */}
                  <div className="p-4 bg-gray-50 rounded-md">
                    <div className="text-sm text-gray-500 mb-1 font-medium">Original</div>
                    {analysis.originalArgument.split(/(?<=\.\s|\?\s|\!\s)/).map((sentence, index) => {
                      // Identify premise and conclusion indicators
                      const premiseIndicators = ['because', 'since', 'for', 'as', 'given that'];
                      const conclusionIndicators = ['therefore', 'thus', 'so', 'hence', 'consequently', 'as a result'];
                      
                      let formattedSentence = sentence;
                      
                      // Italicize premise indicators
                      premiseIndicators.forEach(indicator => {
                        const regex = new RegExp(`\\b${indicator}\\b`, 'gi');
                        formattedSentence = formattedSentence.replace(regex, `<em>${indicator}</em>`);
                      });
                      
                      // Italicize conclusion indicators
                      conclusionIndicators.forEach(indicator => {
                        const regex = new RegExp(`\\b${indicator}\\b`, 'gi');
                        formattedSentence = formattedSentence.replace(regex, `<em>${indicator}</em>`);
                      });
                      
                      return (
                        <p key={index} className="mb-2" dangerouslySetInnerHTML={{ __html: formattedSentence }}></p>
                      );
                    })}
                  </div>
                  
                  {/* Improved Argument */}
                  <div className="p-4 bg-green-50 rounded-md border border-green-200">
                    <div className="text-sm text-green-700 mb-1 font-medium">Improved Version</div>
                    {analysis.improvedArgument.split(/(?<=\.\s|\?\s|\!\s)/).map((sentence, index) => {
                      // Similar formatting as the original
                      const premiseIndicators = ['because', 'since', 'for', 'as', 'given that'];
                      const conclusionIndicators = ['therefore', 'thus', 'so', 'hence', 'consequently', 'as a result'];
                      
                      let formattedSentence = sentence;
                      
                      // Italicize premise indicators
                      premiseIndicators.forEach(indicator => {
                        const regex = new RegExp(`\\b${indicator}\\b`, 'gi');
                        formattedSentence = formattedSentence.replace(regex, `<em class="text-green-800">${indicator}</em>`);
                      });
                      
                      // Italicize conclusion indicators
                      conclusionIndicators.forEach(indicator => {
                        const regex = new RegExp(`\\b${indicator}\\b`, 'gi');
                        formattedSentence = formattedSentence.replace(regex, `<em class="text-green-800">${indicator}</em>`);
                      });
                      
                      return (
                        <p key={index} className="mb-2 text-green-900" dangerouslySetInnerHTML={{ __html: formattedSentence }}></p>
                      );
                    })}
                  </div>
                </div>
              </div>
              <ArgumentFlow structure={analysis.argumentStructure} />
            </div>

            {/* Bottom Row - Breakdown Table */}
            <div>
              <LogicBreakdownTable items={analysis.breakdownItems} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard; 