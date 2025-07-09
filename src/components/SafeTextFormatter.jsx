import React from 'react';

const SafeTextFormatter = ({ text, className = "", emphasisColor = "", maxLength = 1000000 }) => {
  console.log('SafeTextFormatter called with:', {
    textLength: text?.length || 0,
    maxLength,
    textPreview: text?.substring(0, 50) + '...'
  });
  // Input validation - ensure text is a string and not too long
  if (typeof text !== 'string') {
    console.warn('SafeTextFormatter: text prop must be a string');
    return <p className={className}>Invalid input</p>;
  }
  
  // Sanitize input - remove any potential HTML tags
  const sanitizedText = text.replace(/<[^>]*>/g, '');
  
  // Limit text length to prevent potential DoS - use maxLength parameter
  if (!sanitizedText || sanitizedText.length > maxLength) {
    console.warn('SafeTextFormatter: text too long, truncating', {
      textLength: sanitizedText?.length || 0,
      maxLength,
      textPreview: sanitizedText?.substring(0, 100) + '...'
    });
    return (
      <div className={className}>
        <p className="text-gray-600 italic mb-2">Text truncated for display (showing first {maxLength} characters):</p>
        <p>{sanitizedText.substring(0, maxLength)}...</p>
      </div>
    );
  }
  
  // Define logical indicators that should be emphasized
  const premiseIndicators = ['because', 'since', 'for', 'as', 'given that'];
  const conclusionIndicators = ['therefore', 'thus', 'so', 'hence', 'consequently', 'as a result'];
  
  // Split text into sentences
  const sentences = sanitizedText.split(/(?<=\.\s|\?\s|!\s)/);
  
  return (
    <>
      {sentences.map((sentence, index) => {
        if (!sentence.trim()) return null;
        
        // Split sentence into words and process each word
        const words = sentence.split(/(\s+)/);
        
        return (
          <p key={index} className={`mb-2 ${className}`}>
            {words.map((word, wordIndex) => {
              const lowerWord = word.toLowerCase().replace(/[^\w]/g, '');
              
              // Check if this word is a logical indicator
              const isPremiseIndicator = premiseIndicators.includes(lowerWord);
              const isConclusionIndicator = conclusionIndicators.includes(lowerWord);
              
              if (isPremiseIndicator || isConclusionIndicator) {
                return (
                  <em 
                    key={wordIndex} 
                    className={emphasisColor || "italic"}
                  >
                    {word}
                  </em>
                );
              }
              
              return <span key={wordIndex}>{word}</span>;
            })}
          </p>
        );
      })}
    </>
  );
};

export default SafeTextFormatter; 