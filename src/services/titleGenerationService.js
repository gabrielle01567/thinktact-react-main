// Title Generation Service for Patent Applications
// Uses AI to generate patent titles based on descriptions

const generatePatentTitles = async (description) => {
  if (!description || description.trim().length < 10) {
    throw new Error('Please provide a description with at least 10 characters');
  }

  try {
    // For now, we'll use a simple prompt-based approach
    // In a real implementation, this would call an AI service like OpenAI
    const prompt = `Generate 3-5 professional patent titles based on this invention description. 
    The titles should be:
    - Specific and technical
    - Under 15 words
    - Avoid marketing language
    - Include key technical features
    - Follow patent naming conventions
    
    Description: ${description}
    
    Return only the titles, one per line, without numbering or bullet points.`;

    // Simulate AI response with some common patent title patterns
    // In production, this would be replaced with actual AI API call
    const mockTitles = generateMockTitles(description);
    
    return {
      success: true,
      titles: mockTitles,
      originalDescription: description
    };
  } catch (error) {
    console.error('Title generation error:', error);
    throw new Error('Failed to generate titles. Please try again.');
  }
};

const generateMockTitles = (description) => {
  const lowerDesc = description.toLowerCase();
  const titles = [];
  
  // Extract key technical terms
  const technicalTerms = extractTechnicalTerms(lowerDesc);
  
  // Generate different title patterns
  if (technicalTerms.length > 0) {
    // Pattern 1: "System and Method for [Technical Feature]"
    if (technicalTerms.length >= 2) {
      titles.push(`System and Method for ${technicalTerms[0]} ${technicalTerms[1]}`);
    }
    
    // Pattern 2: "[Technical Feature] Apparatus"
    titles.push(`${technicalTerms[0]} Apparatus`);
    
    // Pattern 3: "Method of [Action] [Object]"
    const actions = ['processing', 'analyzing', 'generating', 'optimizing', 'managing'];
    const action = actions[Math.floor(Math.random() * actions.length)];
    titles.push(`Method of ${action} ${technicalTerms[0]}`);
    
    // Pattern 4: "[Technology] System"
    titles.push(`${technicalTerms[0]} System`);
    
    // Pattern 5: "Apparatus for [Purpose]"
    const purposes = ['data processing', 'information management', 'system optimization', 'resource allocation'];
    const purpose = purposes[Math.floor(Math.random() * purposes.length)];
    titles.push(`Apparatus for ${purpose}`);
  }
  
  // If no technical terms found, generate generic titles
  if (titles.length === 0) {
    titles.push(
      'System and Method for Data Processing',
      'Information Management Apparatus',
      'Method of System Optimization',
      'Data Processing System',
      'Apparatus for Resource Management'
    );
  }
  
  return titles.slice(0, 5); // Return max 5 titles
};

const extractTechnicalTerms = (description) => {
  const technicalKeywords = [
    'system', 'method', 'apparatus', 'device', 'process', 'algorithm',
    'data', 'information', 'analysis', 'processing', 'generation',
    'optimization', 'management', 'control', 'monitoring', 'detection',
    'identification', 'classification', 'prediction', 'automation',
    'artificial intelligence', 'machine learning', 'neural network',
    'database', 'network', 'communication', 'sensor', 'actuator',
    'interface', 'platform', 'framework', 'architecture', 'protocol'
  ];
  
  const words = description.split(/\s+/);
  const foundTerms = [];
  
  for (const word of words) {
    const cleanWord = word.replace(/[^\w]/g, '').toLowerCase();
    if (technicalKeywords.includes(cleanWord) && !foundTerms.includes(cleanWord)) {
      foundTerms.push(cleanWord.charAt(0).toUpperCase() + cleanWord.slice(1));
    }
  }
  
  return foundTerms;
};

export { generatePatentTitles }; 