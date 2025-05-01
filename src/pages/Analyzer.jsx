import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import axios from 'axios'; // Import axios
import CollapsibleSection from '../components/CollapsibleSection'; // Import from the dedicated file
import { track } from '@vercel/analytics';

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
  const [argumentText, setArgumentText] = useState('');
  const [analysisResults, setAnalysisResults] = useState(initialAnalysisState);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [apiKeyStatus, setApiKeyStatus] = useState('');

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

  const handleAnalyze = async () => {
    if (!argumentText.trim()) {
      setError('Please enter an argument to analyze.');
      return;
    }

    // Track the analysis attempt
    track('analyze_argument', {
      argumentLength: argumentText.length,
      hasError: false
    });

    // Get API Key from environment variable
    const apiKey = import.meta.env.VITE_MISTRAL_API_KEY;

    if (!apiKey) {
      setError('API key is missing. Make sure it is set in your .env file and the server was restarted.');
      track('analyze_error', {
        errorType: 'missing_api_key',
        argumentLength: argumentText.length
      });
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    setAnalysisResults(initialAnalysisState); // Reset previous results

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

      // Track successful analysis
      track('analysis_success', {
        argumentLength: argumentText.length,
        responseTime: Date.now() - startTime
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
      
      // Instead of just setting state, navigate to the dashboard with the results
      setAnalysisResults(parsedResults);
      
      // Navigate to dashboard with the analysis results
      navigate('/dashboard', { 
        state: { 
          analysisResults: parsedResults,
          originalArgument: argumentText 
        }
      });

    } catch (err) {
      console.error('API Call Error:', err);
      setError(`Failed to analyze argument. ${err.response?.data?.message || err.message}`);
      
      // Track analysis error
      track('analysis_error', {
        errorType: err.response?.data?.message || err.message,
        argumentLength: argumentText.length
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

  // Add test function
  const testApiKey = async () => {
    const apiKey = import.meta.env.VITE_MISTRAL_API_KEY;
    if (!apiKey) {
      setApiKeyStatus('❌ API key not found in environment variables');
      return;
    }

    try {
      const response = await axios.post(
        'https://api.mistral.ai/v1/chat/completions',
        {
          model: 'mistral-small-latest',
          messages: [{ role: 'user', content: 'Hello, this is a test message.' }],
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
          },
        }
      );

      if (response.data) {
        setApiKeyStatus('✅ API key is working correctly');
      }
    } catch (err) {
      console.error('API Test Error:', err);
      setApiKeyStatus(`❌ API key test failed: ${err.response?.data?.message || err.message}`);
    }
  };

  // Call test function when component mounts
  useEffect(() => {
    testApiKey();
  }, []);

  return (
    <div className="bg-white min-h-screen">
      <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
        <div className="mx-auto max-w-2xl">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            Argument Analyzer
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Paste your argument below and I'll break down its logical structure.
          </p>
          
          {/* Add API key status display */}
          <div className="mt-4 p-4 bg-gray-50 rounded-md">
            <p className="text-sm font-medium text-gray-700">API Key Status: {apiKeyStatus}</p>
          </div>

          <div className="mt-8">
            <div className="mb-8">
              <label htmlFor="argument" className="block text-sm font-medium text-gray-700 mb-2">
                Enter an argument to analyze
              </label>
              <textarea
                id="argument"
                rows="6"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-700 focus:ring-pink-700 sm:text-sm p-4 text-gray-900 dark:text-white bg-white dark:bg-gray-800 placeholder-gray-400 dark:placeholder-gray-500"
                placeholder="Paste your argument here..."
                value={argumentText}
                onChange={(e) => setArgumentText(e.target.value)}
                disabled={isLoading} // Disable textarea while loading
              ></textarea>
              <div className="mt-4 flex justify-end">
                <button
                  onClick={handleAnalyze}
                  className="rounded-md bg-pink-950 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-pink-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink-950 disabled:opacity-50"
                  disabled={isLoading} // Disable button while loading
                >
                  {isLoading ? 'Analyzing...' : 'Analyze'}
                </button>
              </div>
               {/* Display Error Messages */}
               {error && (
                    <p className="mt-4 text-sm text-red-600 bg-red-50 p-3 rounded-md">{error}</p>
               )}
            </div>
            
            {/* --- Results Area --- */}
            {/* Only show results container if loading or if there are results/errors */}
            {(isLoading || error) && (
              <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
                {isLoading && (
                  <div className="flex justify-center items-center py-10">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-900"></div>
                  </div>
                )}
                {error && (
                  <div className="text-red-500 bg-red-50 p-4 rounded-lg">
                    <p className="font-medium">Error</p>
                    <p>{error}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analyzer; 