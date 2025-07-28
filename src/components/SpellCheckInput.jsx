import React, { useState, useEffect } from 'react';

// Patent and technical terminology dictionary
const TECHNICAL_TERMS = [
  // Patent terms
  'patent', 'invention', 'claim', 'prior art', 'novelty', 'nonobviousness', 'utility',
  'specification', 'drawings', 'abstract', 'background', 'summary', 'embodiment',
  'infringement', 'licensing', 'prosecution', 'examination', 'allowance', 'rejection',
  'office action', 'response', 'amendment', 'continuation', 'divisional', 'provisional',
  'nonprovisional', 'pct', 'international', 'national phase', 'priority date',
  
  // Technical terms
  'algorithm', 'api', 'database', 'framework', 'protocol', 'interface', 'architecture',
  'encryption', 'authentication', 'authorization', 'blockchain', 'machine learning',
  'artificial intelligence', 'neural network', 'deep learning', 'natural language',
  'processing', 'optimization', 'scalability', 'reliability', 'performance',
  'efficiency', 'throughput', 'latency', 'bandwidth', 'protocol', 'standard',
  
  // Common words that might be flagged
  'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
  'by', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had',
  'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can'
];

const SpellCheckInput = ({
  value,
  onChange,
  placeholder,
  className = '',
  rows = 4,
  type = 'textarea',
  disabled = false,
  ...props
}) => {
  const [misspelledWords, setMisspelledWords] = useState([]);
  const [isChecking, setIsChecking] = useState(false);

  // Simple spell check function
  const checkSpelling = (text) => {
    if (!text) return [];
    
    const words = text.split(/\s+/).filter(word => word.length > 0);
    const misspelled = [];
    
    for (const word of words) {
      const cleanWord = word.replace(/[^\w]/g, '').toLowerCase();
      if (cleanWord.length > 2 && 
          !TECHNICAL_TERMS.includes(cleanWord) &&
          !/^\d+$/.test(cleanWord) && // Numbers
          !/^[A-Z0-9]+$/.test(word)) { // Acronyms
        // Simple heuristic: if word is not in our dictionary, flag it
        if (!TECHNICAL_TERMS.some(term => term.includes(cleanWord) || cleanWord.includes(term))) {
          misspelled.push({
            word: cleanWord,
            original: word,
            position: text.indexOf(word)
          });
        }
      }
    }
    
    return misspelled;
  };

  useEffect(() => {
    if (!value) {
      setMisspelledWords([]);
      return;
    }

    setIsChecking(true);
    const timeoutId = setTimeout(() => {
      const errors = checkSpelling(value);
      setMisspelledWords(errors);
      setIsChecking(false);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [value]);

  const handleWordReplace = (originalWord, replacement) => {
    const newValue = value.replace(originalWord, replacement);
    onChange({ target: { value: newValue } });
  };

  const renderInput = () => {
    const baseClasses = `w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${className}`;
    
    if (type === 'input') {
      return (
        <input
          type="text"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={baseClasses}
          disabled={disabled}
          {...props}
        />
      );
    }

    return (
      <textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        className={baseClasses}
        disabled={disabled}
        {...props}
      />
    );
  };

  const renderSpellCheckIndicator = () => {
    if (isChecking) {
      return (
        <div className="absolute top-2 right-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
        </div>
      );
    }

    if (misspelledWords.length > 0) {
      return (
        <div className="absolute top-2 right-2">
          <div className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
            {misspelledWords.length} {misspelledWords.length === 1 ? 'error' : 'errors'}
          </div>
        </div>
      );
    }

    return (
      <div className="absolute top-2 right-2">
        <div className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
          ✓ No errors
        </div>
      </div>
    );
  };

  const renderSuggestions = () => {
    if (misspelledWords.length === 0) return null;

    return (
      <div className="mt-2 space-y-2">
        <div className="text-sm text-gray-600 font-medium">Potential spelling issues:</div>
        {misspelledWords.map(({ word, original }, index) => (
          <div key={index} className="flex items-center space-x-2 text-sm">
            <span className="text-red-600 font-medium">{word}</span>
            <span className="text-gray-400">→</span>
            <div className="flex space-x-1">
              {TECHNICAL_TERMS.filter(term => 
                term.includes(word.substring(0, 3)) || 
                word.includes(term.substring(0, 3))
              ).slice(0, 3).map((suggestion, suggestionIndex) => (
                <button
                  key={suggestionIndex}
                  onClick={() => handleWordReplace(original, suggestion)}
                  className="px-2 py-1 bg-blue-100 text-blue-800 rounded hover:bg-blue-200 text-xs"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="relative">
      {renderInput()}
      {renderSpellCheckIndicator()}
      {renderSuggestions()}
    </div>
  );
};

export default SpellCheckInput; 