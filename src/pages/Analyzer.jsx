import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import axios from 'axios'; // Import axios
import CollapsibleSection from '../components/CollapsibleSection'; // Import from the dedicated file
import StatCard from '../components/dashboard/StatCard';
import ArgumentFlow from '../components/dashboard/ArgumentFlow';
import LogicDonutChart from '../components/dashboard/LogicDonutChart';
import LogicBreakdownTable from '../components/dashboard/LogicBreakdownTable';
import SafeTextFormatter from '../components/SafeTextFormatter';
import AnalysisHistory from '../components/AnalysisHistory';
import { saveAnalysis } from '../services/analysisService';

import { track } from '@vercel/analytics';
import { useAuth } from '../contexts/AuthContext';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend);

// Define the structure for analysis results (adjust as needed)
const initialAnalysisState = {
  ifThenStructure: '',
  necessaryAssumption: '',
  sufficientAssumption: '',
  conclusion: { text: '', type: '' },
  unstatedRule: '',
  methodOfReasoning: '',
  logicalFlaws: [], // Expecting an array of flaws
  quantifiers: '',
  premiseSets: { explicit: [], implicit: [] },
  counterpoint: { personA: '', personB: '' },
  // Add fields for chart and flowchart if needed
};

const Analyzer = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();
  const [argumentText, setArgumentText] = useState('');
  const [analysisResults, setAnalysisResults] = useState(initialAnalysisState);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [processedAnalysis, setProcessedAnalysis] = useState(null);
  const [currentAnalysisId, setCurrentAnalysisId] = useState(null);

  // Sample data for the donut chart - this should eventually be dynamic
  const chartData = {
    labels: ['Necessary Assumptions', 'Sufficient Assumptions', 'Flaws'],
    datasets: [
      {
        label: 'Argument Components',
        // TODO: Replace with dynamic data based on analysisResults
        data: [
          analysisResults.necessaryAssumption ? 1 : 0,
          analysisResults.sufficientAssumption ? 1 : 0,
          analysisResults.logicalFlaws.length || 0,
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

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Handle selecting a previous analysis
  const handleSelectAnalysis = (analysis) => {
    setArgumentText(analysis.argumentText);
    setProcessedAnalysis(analysis.analysisResults);
    setCurrentAnalysisId(analysis.id);
    setError(null);
  };

  const handleAnalyze = async () => {
    if (!argumentText.trim()) {
      setError('Please enter an argument to analyze.');
      track('analyzer_empty_input');
      return;
    }

    // Check if user is authenticated before proceeding
    if (!isAuthenticated) {
      // Redirect to login with the current page as the intended destination
      navigate('/login', { 
        state: { 
          from: { pathname: '/analyzer' },
          message: 'Please sign in to view your analysis results'
        } 
      });
      return;
    }

    // Track the analysis attempt with more details
    track('analyze_argument', {
      argumentLength: argumentText.length,
      hasError: false,
      timestamp: new Date().toISOString(),
      wordCount: argumentText.trim().split(/\s+/).length,
      firstFewWords: argumentText.substring(0, 50)
    });

    // Get API Key from environment variable
    const apiKey = import.meta.env.VITE_MISTRAL_API_KEY;

    if (!apiKey) {
      setError('API key is missing. Please contact support.');
      track('analyze_error', {
        errorType: 'missing_api_key',
        argumentLength: argumentText.length,
        timestamp: new Date().toISOString()
      });
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    setAnalysisResults(initialAnalysisState); // Reset previous results
    setProcessedAnalysis(null); // Reset processed analysis

    // --- Define the Prompt for Mistral ---
    const prompt = `Analyze the following argument and break it down into its components:
Argument: "${argumentText}"

Extract these components with clear labels:
1. If-Then Structure: Rephrase the core logic as an If-Then statement if possible
2. Necessary Assumption: What must be true for the conclusion to possibly follow
3. Sufficient Assumption: What assumption if added would guarantee the conclusion
4. Conclusion: Identify the main point the argument is trying to establish
5. Conclusion Type: For example Assertion, Evaluation, Recommendation, Prediction, Causal Claim
6. Implied Rule: Any general principle or rule implied by the argument
7. Method of Reasoning: For example Analogy, Causal, Statistical, Generalization, Principle-based
8. Logical Flaw: Name the most significant logical weakness in the argument like Hasty Generalization, False Dilemma, Correlation vs Causation
9. Quantifiers: Identify key quantifiers like all, some, none, many, few
10. Explicit Premises: List each stated reason or evidence as a separate numbered item, one per line
11. Unspoken Reasons: List unstated but assumed premises
12. Hidden Assumptions: List 2-3 specific assumptions that the argument relies on
13. Counter Argument: A brief specific argument that directly challenges the main point
14. Improved Version: Rewrite the argument with clearer structure and stronger reasoning

Format your response with clean, simple text. Do not use asterisks, quotation marks, or dashes. Use numbers for lists instead of special characters. Keep your language direct and user-friendly.

For example:
Logical Flaw: Correlation mistaken for causation

Explicit Premises: 
1. Crime rates fell after gun laws passed
2. Countries with strict gun laws have less crime

Avoid any special formatting characters, and use simple line breaks and numbers for organization.`;

    // --- Make API Call ---
    // Adjust endpoint and request structure based on Mistral documentation
    const MISTRAL_API_ENDPOINT = 'https://api.mistral.ai/v1/chat/completions'; // Example endpoint

    try {
      const startTime = Date.now();
      const response = await axios.post(
        MISTRAL_API_ENDPOINT,
        {
          model: 'mistral-small-latest', // Or your preferred model
          messages: [{ role: 'user', content: prompt }],
          // Add other parameters like temperature, max_tokens if needed
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
          },
        }
      );

      // Track successful analysis with detailed results
      track('analysis_success', {
        argumentLength: argumentText.length,
        responseTime: Date.now() - startTime,
        timestamp: new Date().toISOString(),
        wordCount: argumentText.trim().split(/\s+/).length,
        hasResults: !!response.data?.choices?.[0]?.message?.content
      });

      // --- Process the Response ---
      // This part is CRUCIAL and highly dependent on Mistral's response format.
      // You'll need to parse the response.data.choices[0].message.content
      // string to extract the labeled components and populate the state.
      // This might involve string splitting, regex, or hoping Mistral provides JSON output.
      const rawResult = response.data.choices[0].message.content;
      console.log("Mistral Raw Response:", rawResult); // Log for debugging

      // TODO: Implement robust parsing logic here to map rawResult to analysisResults state
      // Example (very simplified, likely needs improvement):
      const parsedResults = parseMistralResponse(rawResult);
      
      // Set the analysis results
      setAnalysisResults(parsedResults);
      
      // Process the results for display (similar to Dashboard logic)
      const processed = {
        conclusionType: parsedResults.conclusion?.type || "Unknown",
        keyFlaw: parsedResults.logicalFlaws?.length > 0 ? parsedResults.logicalFlaws[0] : "No major flaws detected",
        counterpoint: parsedResults.possibleCounter || "No counter argument provided",
        assumptionsCount: (parsedResults.premiseSets?.implicit?.length || 0) + (parsedResults.unstatedAssumptions?.length || 0),
        originalArgument: argumentText,
        improvedArgument: parsedResults.improvedVersion || argumentText,
        
        // Argument structure - ensure premises are correctly formatted
        argumentStructure: {
          premise: parsedResults.premiseSets?.explicit && parsedResults.premiseSets.explicit.length > 0 
            ? parsedResults.premiseSets.explicit 
            : ["No explicit premises detected"],
          conclusion: parsedResults.conclusion?.text || "No clear conclusion identified",
          unstatedAssumptions: parsedResults.unstatedAssumptions && parsedResults.unstatedAssumptions.length > 0
            ? parsedResults.unstatedAssumptions
            : []
        },
        
        // For donut chart - we're not using this anymore
        components: {
          necessaryAssumptions: parsedResults.necessaryAssumption ? 25 : 0,
          flaws: parsedResults.logicalFlaws?.length || 0,
          sufficientAssumptions: parsedResults.sufficientAssumption ? 25 : 0,
          quantifiers: parsedResults.quantifiers ? 15 : 0
        },
        
        // For breakdown table
        breakdownItems: [
          ...(parsedResults.logicalFlaws?.map(flaw => ({ 
            type: 'Flaw', 
            text: flaw, 
            category: 'Logical', 
            severity: 'High' 
          })) || []),
          parsedResults.necessaryAssumption && { 
            type: 'Necessary Assumption', 
            text: parsedResults.necessaryAssumption, 
            category: 'Assumption', 
            severity: 'Medium' 
          },
          parsedResults.sufficientAssumption && { 
            type: 'Sufficient Assumption', 
            text: parsedResults.sufficientAssumption, 
            category: 'Assumption', 
            severity: 'Medium' 
          },
          parsedResults.unstatedRule && { 
            type: 'Unstated Rule', 
            text: parsedResults.unstatedRule, 
            category: 'Rule', 
            severity: 'Medium' 
          },
          ...(parsedResults.premiseSets?.implicit?.map(premise => ({ 
            type: 'Implicit Premise', 
            text: premise, 
            category: 'Premise', 
            severity: 'Low' 
          })) || [])
        ].filter(Boolean) // Remove any null/undefined items
      };
      
      setProcessedAnalysis(processed);
      
      // Save analysis to history
      try {
        await saveAnalysis(argumentText, processed);
        console.log('Analysis saved to history');
      } catch (error) {
        console.error('Failed to save analysis to history:', error);
        // Don't show error to user as this is not critical
      }

    } catch (err) {
      console.error('API Call Error:', err);
      setError(`Failed to analyze argument. ${err.response?.data?.message || err.message}`);
      
      // Track analysis error with more details
      track('analysis_error', {
        errorType: err.response?.data?.message || err.message,
        argumentLength: argumentText.length,
        timestamp: new Date().toISOString(),
        wordCount: argumentText.trim().split(/\s+/).length,
        statusCode: err.response?.status
      });
      
      setIsLoading(false);
    }
  };

  // Helper function to parse the response from the Mistral API
  const parseMistralResponse = (rawText) => {
    // Initialize the result object with default empty values
    const result = {
      ifThenStructure: '',
      necessaryAssumption: '',
      sufficientAssumption: '',
      conclusion: { text: '', type: '' },
      unstatedRule: '',
      methodOfReasoning: '',
      logicalFlaws: [],
      quantifiers: '',
      premiseSets: { explicit: [], implicit: [] },
      possibleCounter: '',
      unstatedAssumptions: [],
      improvedVersion: ''
    };
    
    try {
      // Simple regex-based extraction for each component
      // If-Then Structure
      const ifThenMatch = rawText.match(/If-Then Structure:(.+?)(?=\d+\.\s+|\n\n|$)/s);
      if (ifThenMatch) result.ifThenStructure = ifThenMatch[1].trim();
      
      // Necessary Assumption
      const necessaryMatch = rawText.match(/Necessary Assumption:(.+?)(?=\d+\.\s+|\n\n|$)/s);
      if (necessaryMatch) result.necessaryAssumption = necessaryMatch[1].trim();
      
      // Sufficient Assumption
      const sufficientMatch = rawText.match(/Sufficient Assumption:(.+?)(?=\d+\.\s+|\n\n|$)/s);
      if (sufficientMatch) result.sufficientAssumption = sufficientMatch[1].trim();
      
      // Conclusion Text
      const conclusionMatch = rawText.match(/Conclusion:(.+?)(?=\d+\.\s+|\n\n|$)/s);
      if (conclusionMatch) result.conclusion.text = conclusionMatch[1].trim();
      
      // Conclusion Type
      const conclusionTypeMatch = rawText.match(/Conclusion Type:(.+?)(?=\d+\.\s+|\n\n|$)/s);
      if (conclusionTypeMatch) result.conclusion.type = conclusionTypeMatch[1].trim();
      
      // Unstated/Implied Rule
      const ruleMatch = rawText.match(/Implied Rule:(.+?)(?=\d+\.\s+|\n\n|$)/s);
      if (ruleMatch) result.unstatedRule = ruleMatch[1].trim();
      
      // Method of Reasoning
      const methodMatch = rawText.match(/Method of Reasoning:(.+?)(?=\d+\.\s+|\n\n|$)/s);
      if (methodMatch) result.methodOfReasoning = methodMatch[1].trim();
      
      // Logical Flaws - now singular "Logical Flaw"
      const flawsSection = rawText.match(/Logical Flaw:(.+?)(?=\d+\.\s+|\n\n|$)/s);
      if (flawsSection) {
        // Extract just the single flaw, not a list
        result.logicalFlaws = [flawsSection[1].trim()];
      }
      
      // Quantifiers
      const quantifiersMatch = rawText.match(/Quantifiers:(.+?)(?=\d+\.\s+|\n\n|$)/s);
      if (quantifiersMatch) result.quantifiers = quantifiersMatch[1].trim();
      
      // Explicit Premises
      const explicitSection = rawText.match(/Explicit Premises:(.+?)(?=\d+\.\s+|\n\n|$)/s);
      if (explicitSection) {
        // Look for numbered list items (1. item)
        const explicitList = explicitSection[1].match(/\d+\.\s+(.+?)(?=\d+\.\s+|$)/g);
        if (explicitList && explicitList.length > 0) {
          result.premiseSets.explicit = explicitList.map(item => 
            item.replace(/^\d+\.\s+/, '').trim()
          );
          console.log("Extracted explicit premises:", result.premiseSets.explicit);
        } else {
          // If no list format detected, check for line breaks and create a list
          const lines = explicitSection[1].trim().split('\n').filter(line => line.trim());
          if (lines.length > 0) {
            result.premiseSets.explicit = lines.map(line => line.trim());
            console.log("Extracted premises from lines:", result.premiseSets.explicit);
          } else {
            // Last resort: use the whole section as a single premise
            result.premiseSets.explicit = [explicitSection[1].trim()];
            console.log("Using whole section as premise:", result.premiseSets.explicit);
          }
        }
      }
      
      // Ensure we have at least one premise if none were found
      if (!result.premiseSets.explicit || result.premiseSets.explicit.length === 0) {
        // Fallback: try to extract some meaningful text from the argument
        const generalMatch = rawText.match(/Argument:(.+?)(?=\d+\.\s+|\n\n|$)/s);
        if (generalMatch) {
          result.premiseSets.explicit = [generalMatch[1].trim()];
          console.log("Fallback to argument text:", result.premiseSets.explicit);
        } else {
          // Last resort: add a placeholder
          result.premiseSets.explicit = ["No explicit premises detected"];
          console.log("Using placeholder premise");
        }
      }
      
      // Unspoken Reasons (formerly Implicit Premises)
      const implicitSection = rawText.match(/Unspoken Reasons:(.+?)(?=\d+\.\s+|\n\n|$)/s);
      if (implicitSection) {
        // Look for numbered list items (1. item)
        const implicitList = implicitSection[1].match(/\d+\.\s+(.+?)(?=\d+\.\s+|$)/g);
        if (implicitList) {
          result.premiseSets.implicit = implicitList.map(item => 
            item.replace(/^\d+\.\s+/, '').trim()
          );
        } else {
          // If no list format detected, use the whole section
          result.premiseSets.implicit = [implicitSection[1].trim()];
        }
      }
      
      // Hidden Assumptions (formerly Unstated Assumptions)
      const assumptionsSection = rawText.match(/Hidden Assumptions:(.+?)(?=\d+\.\s+|\n\n|$)/s);
      if (assumptionsSection) {
        // Look for numbered list items (1. item)
        const assumptionsList = assumptionsSection[1].match(/\d+\.\s+(.+?)(?=\d+\.\s+|$)/g);
        if (assumptionsList) {
          result.unstatedAssumptions = assumptionsList.map(item => 
            item.replace(/^\d+\.\s+/, '').trim()
          );
        } else {
          // If no list format detected but there is content, use the whole section
          const trimmed = assumptionsSection[1].trim();
          if (trimmed) {
            result.unstatedAssumptions = [trimmed];
          }
        }
      }
      
      // Counter Argument (formerly Possible Counter)
      const counterMatch = rawText.match(/Counter Argument:(.+?)(?=\d+\.\s+|\n\n|$)/s);
      if (counterMatch) {
        result.possibleCounter = counterMatch[1].trim();
      }
      
      // Improved Version (new)
      const improvedMatch = rawText.match(/Improved Version:(.+?)(?=\d+\.\s+|\n\n|$)/s);
      if (improvedMatch) {
        result.improvedVersion = improvedMatch[1].trim();
      }
      
    } catch (error) {
      console.error("Error parsing Mistral response:", error);
      // Return incomplete parsing rather than failing completely
    }
    
    return result;
  };

  // Add tracking for when users view the analyzer page
  useEffect(() => {
    track('page_view', {
      page: 'analyzer',
      timestamp: new Date().toISOString()
    });
  }, []);

  // For non-authenticated users, show the simple layout
  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-6 py-12 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8 text-center">Argument Analyzer</h1>
        
        <div className="mb-8">
          <label htmlFor="argument" className="block text-lg font-medium mb-3">
            Enter your argument below
          </label>
          <textarea
            id="argument"
            className="w-full h-40 p-6 border rounded-xl shadow-sm bg-gray-200 text-black border-gray-300 focus:ring-2 focus:ring-pink-700 focus:border-pink-700 transition-all placeholder-gray-600"
            value={argumentText}
            onChange={(e) => setArgumentText(e.target.value)}
            placeholder="Type or paste your argument here..."
          />
        </div>

        <div className="flex justify-center mb-12">
          <button
            className="px-8 py-3 text-lg font-semibold text-white bg-pink-950 rounded-lg shadow-md hover:bg-pink-900 hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none disabled:hover:shadow-md"
            onClick={handleAnalyze}
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Analyzing...
              </span>
            ) : (
              'Analyze Argument'
            )}
          </button>
        </div>

        {error && (
          <div className="mt-8 p-6 bg-red-50 text-red-700 rounded-xl border border-red-200 shadow-sm">
            <p className="font-medium text-lg mb-2">Error</p>
            <p>{error}</p>
          </div>
        )}

        {/* --- Results Area --- */}
        {(isLoading || error) && (
          <div className="mt-12 p-8 bg-white rounded-xl shadow-sm border border-gray-200">
            {isLoading && (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-pink-900"></div>
              </div>
            )}
            {error && (
              <div className="text-red-500 bg-red-50 p-6 rounded-xl">
                <p className="font-medium text-lg mb-2">Error</p>
                <p>{error}</p>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // For authenticated users, show the full layout with sidebar
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

              <Link to="/analyzer" className="flex items-center px-3 py-2.5 text-sm font-medium rounded-md bg-pink-50 text-pink-900">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
                Argument Analyzer
              </Link>


            </div>
            
            {/* Analysis History Section */}
            <div className="mt-6 border-t border-gray-200 pt-4">
              <AnalysisHistory 
                onSelectAnalysis={handleSelectAnalysis}
                currentAnalysisId={currentAnalysisId}
              />
            </div>
          </nav>
          
          {/* User Info and Logout */}
          <div className="px-4 py-4 border-t border-gray-200">
            <div className="flex items-center mb-3">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-pink-950 flex items-center justify-center">
                  <span className="text-sm font-medium text-white">
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700">{user?.name || 'User'}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-red-600 rounded-md transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sign out
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 md:ml-64 lg:ml-72">
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 pt-10">
            {/* Argument Input Section */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-6 text-gray-800">Argument Analyzer</h1>
              
              <div className="mb-6">
                <label htmlFor="argument" className="block text-lg font-medium mb-3 text-gray-700">
                  Enter your argument below
                </label>
                <textarea
                  id="argument"
                  className="w-full h-40 p-6 border rounded-xl shadow-sm bg-gray-200 text-black border-gray-300 focus:ring-2 focus:ring-pink-700 focus:border-pink-700 transition-all placeholder-gray-600"
                  value={argumentText}
                  onChange={(e) => setArgumentText(e.target.value)}
                  placeholder="Type or paste your argument here..."
                />
              </div>

              <div className="flex justify-center mb-8">
                <button
                  className="px-8 py-3 text-lg font-semibold text-white bg-pink-950 rounded-lg shadow-md hover:bg-pink-900 hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none disabled:hover:shadow-md"
                  onClick={handleAnalyze}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Analyzing...
                    </span>
                  ) : (
                    'Analyze Argument'
                  )}
                </button>
              </div>

              {error && (
                <div className="mt-6 p-6 bg-red-50 text-red-700 rounded-xl border border-red-200 shadow-sm">
                  <p className="font-medium text-lg mb-2">Error</p>
                  <p>{error}</p>
                </div>
              )}
            </div>

            {/* Analysis Results Section */}
            {processedAnalysis && (
              <div className="h-full grid grid-cols-1 gap-5">
                {/* Top Row - Stat Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  <StatCard
                    title="Conclusion Type"
                    value={processedAnalysis.conclusionType}
                    icon="📝"
                    color="bg-blue-50"
                    textColor="text-blue-700"
                  />
                  <StatCard
                    title="Logical Flaw"
                    value={processedAnalysis.keyFlaw}
                    icon="⚠️"
                    color="bg-amber-50"
                    textColor="text-amber-700"
                  />
                  <StatCard
                    title="Counter Argument"
                    value={processedAnalysis.counterpoint}
                    icon="🔄"
                    color="bg-indigo-50"
                    textColor="text-indigo-700"
                  />
                  <StatCard
                    title="Hidden Assumptions"
                    value={processedAnalysis.assumptionsCount}
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
                        <SafeTextFormatter 
                          text={processedAnalysis.originalArgument}
                          className=""
                        />
                      </div>
                      
                      {/* Improved Argument */}
                      <div className="p-4 bg-green-50 rounded-md border border-green-200">
                        <div className="text-sm text-green-700 mb-1 font-medium">Improved Version</div>
                        <SafeTextFormatter 
                          text={processedAnalysis.improvedArgument}
                          className="text-green-900"
                          emphasisColor="italic text-green-800"
                        />
                      </div>
                    </div>
                  </div>
                  <ArgumentFlow structure={processedAnalysis.argumentStructure} />
                </div>

                {/* Bottom Row - Breakdown Table */}
                <div>
                  <LogicBreakdownTable items={processedAnalysis.breakdownItems} />
                </div>
              </div>
            )}

            {/* Loading State */}
            {isLoading && (
              <div className="mt-12 p-8 bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-pink-900"></div>
                </div>
              </div>
            )}
          </main>
                 </div>
       </div>
   );
 };

export default Analyzer; 