// Title Generation Service for Patent Applications
// Uses AI to generate patent titles based on descriptions

const generatePatentTitles = async (description) => {
  if (!description || description.trim().length < 10) {
    throw new Error('Please provide a description with at least 10 characters');
  }

  try {
    // Enhanced title generation based on user input analysis
    const titles = generateDynamicTitles(description);
    
    return {
      success: true,
      titles: titles,
      originalDescription: description
    };
  } catch (error) {
    console.error('Title generation error:', error);
    throw new Error('Failed to generate titles. Please try again.');
  }
};

const generateDynamicTitles = (description) => {
  const lowerDesc = description.toLowerCase();
  const titles = [];
  
  // Enhanced keyword extraction
  const extractedData = extractKeywordsAndContext(lowerDesc);
  
  // Generate titles based on the extracted data
  if (extractedData.primaryTechnology && extractedData.primaryTechnology.length > 0) {
    // Pattern 1: "System and Method for [Primary Technology] [Secondary Feature]"
    if (extractedData.secondaryFeatures.length > 0) {
      titles.push(`System and Method for ${extractedData.primaryTechnology[0]} ${extractedData.secondaryFeatures[0]}`);
    } else {
      titles.push(`System and Method for ${extractedData.primaryTechnology[0]}`);
    }
    
    // Pattern 2: "[Primary Technology] Apparatus"
    titles.push(`${extractedData.primaryTechnology[0]} Apparatus`);
    
    // Pattern 3: "Method of [Action] [Technology]"
    if (extractedData.actions.length > 0) {
      titles.push(`Method of ${extractedData.actions[0]} ${extractedData.primaryTechnology[0]}`);
    } else {
      const defaultActions = ['processing', 'analyzing', 'generating', 'optimizing', 'managing'];
      const action = defaultActions[Math.floor(Math.random() * defaultActions.length)];
      titles.push(`Method of ${action} ${extractedData.primaryTechnology[0]}`);
    }
    
    // Pattern 4: "[Technology] System"
    titles.push(`${extractedData.primaryTechnology[0]} System`);
  }
  
  // Generate titles based on problem/solution context
  if (extractedData.problems.length > 0 && extractedData.solutions.length > 0) {
    titles.push(`Apparatus for ${extractedData.solutions[0]} ${extractedData.problems[0]}`);
  } else if (extractedData.solutions.length > 0) {
    titles.push(`Apparatus for ${extractedData.solutions[0]}`);
  }
  
  // Generate titles based on application domain
  if (extractedData.domains.length > 0 && extractedData.primaryTechnology.length > 0) {
    titles.push(`${extractedData.primaryTechnology[0]} for ${extractedData.domains[0]}`);
  }
  
  // Generate titles based on specific features
  if (extractedData.features.length > 0 && extractedData.primaryTechnology.length > 0) {
    titles.push(`${extractedData.primaryTechnology[0]} with ${extractedData.features[0]}`);
  }
  
  // If we don't have enough titles, generate some generic ones based on context
  if (titles.length < 4) {
    const genericTitles = generateGenericTitles(extractedData);
    titles.push(...genericTitles.slice(0, 4 - titles.length));
  }
  
  return titles.slice(0, 4); // Return exactly 4 titles
};

const extractKeywordsAndContext = (description) => {
  const result = {
    primaryTechnology: [],
    secondaryFeatures: [],
    actions: [],
    problems: [],
    solutions: [],
    domains: [],
    features: []
  };
  
  // Technology keywords
  const technologyKeywords = [
    'artificial intelligence', 'ai', 'machine learning', 'ml', 'neural network', 'deep learning',
    'blockchain', 'cryptocurrency', 'smart contract', 'distributed ledger',
    'internet of things', 'iot', 'sensor', 'actuator', 'wireless', 'bluetooth', 'wifi',
    'cloud computing', 'edge computing', 'serverless', 'microservices',
    'virtual reality', 'vr', 'augmented reality', 'ar', 'mixed reality', 'mr',
    'robotics', 'automation', 'autonomous', 'drone', 'uav',
    'biotechnology', 'genetic', 'dna', 'protein', 'enzyme', 'cell',
    'nanotechnology', 'nano', 'quantum', 'photonics', 'laser',
    'renewable energy', 'solar', 'wind', 'battery', 'energy storage',
    'cybersecurity', 'encryption', 'authentication', 'biometric', 'firewall'
  ];
  
  // Action keywords
  const actionKeywords = [
    'process', 'analyze', 'generate', 'optimize', 'manage', 'control', 'monitor',
    'detect', 'identify', 'classify', 'predict', 'forecast', 'recommend',
    'filter', 'sort', 'search', 'index', 'retrieve', 'store', 'transmit',
    'encrypt', 'decrypt', 'compress', 'decompress', 'encode', 'decode',
    'calibrate', 'measure', 'sense', 'actuate', 'move', 'rotate', 'lift'
  ];
  
  // Problem keywords
  const problemKeywords = [
    'problem', 'issue', 'challenge', 'difficulty', 'limitation', 'inefficiency',
    'error', 'failure', 'breakdown', 'malfunction', 'defect', 'fault',
    'delay', 'latency', 'bottleneck', 'congestion', 'overload', 'overflow',
    'security', 'privacy', 'vulnerability', 'threat', 'risk', 'attack'
  ];
  
  // Solution keywords
  const solutionKeywords = [
    'solution', 'improvement', 'enhancement', 'optimization', 'efficiency',
    'automation', 'streamlining', 'simplification', 'integration', 'unification',
    'prevention', 'protection', 'safety', 'reliability', 'robustness',
    'accuracy', 'precision', 'speed', 'performance', 'scalability'
  ];
  
  // Domain keywords
  const domainKeywords = [
    'healthcare', 'medical', 'pharmaceutical', 'diagnostic', 'treatment',
    'finance', 'banking', 'insurance', 'trading', 'investment',
    'education', 'learning', 'training', 'assessment', 'evaluation',
    'transportation', 'logistics', 'supply chain', 'delivery', 'shipping',
    'manufacturing', 'production', 'assembly', 'quality control', 'inspection',
    'agriculture', 'farming', 'crop', 'livestock', 'irrigation',
    'entertainment', 'gaming', 'media', 'streaming', 'content',
    'communication', 'messaging', 'social media', 'collaboration', 'sharing'
  ];
  
  // Feature keywords
  const featureKeywords = [
    'real-time', 'automatic', 'adaptive', 'intelligent', 'smart',
    'portable', 'mobile', 'wireless', 'remote', 'distributed',
    'scalable', 'modular', 'flexible', 'customizable', 'configurable',
    'secure', 'encrypted', 'authenticated', 'verified', 'validated',
    'efficient', 'fast', 'accurate', 'precise', 'reliable'
  ];
  
  // Extract keywords from description
  const words = description.split(/\s+/);
  
  for (const word of words) {
    const cleanWord = word.replace(/[^\w]/g, '').toLowerCase();
    
    // Check technology keywords
    for (const tech of technologyKeywords) {
      if (description.includes(tech) && !result.primaryTechnology.includes(tech)) {
        result.primaryTechnology.push(tech.charAt(0).toUpperCase() + tech.slice(1));
      }
    }
    
    // Check action keywords
    for (const action of actionKeywords) {
      if (description.includes(action) && !result.actions.includes(action)) {
        result.actions.push(action);
      }
    }
    
    // Check problem keywords
    for (const problem of problemKeywords) {
      if (description.includes(problem) && !result.problems.includes(problem)) {
        result.problems.push(problem);
      }
    }
    
    // Check solution keywords
    for (const solution of solutionKeywords) {
      if (description.includes(solution) && !result.solutions.includes(solution)) {
        result.solutions.push(solution);
      }
    }
    
    // Check domain keywords
    for (const domain of domainKeywords) {
      if (description.includes(domain) && !result.domains.includes(domain)) {
        result.domains.push(domain);
      }
    }
    
    // Check feature keywords
    for (const feature of featureKeywords) {
      if (description.includes(feature) && !result.features.includes(feature)) {
        result.features.push(feature);
      }
    }
  }
  
  // Extract secondary features (nouns that aren't primary technology)
  const nouns = extractNouns(description);
  result.secondaryFeatures = nouns.filter(noun => 
    !result.primaryTechnology.some(tech => tech.toLowerCase().includes(noun.toLowerCase()))
  ).slice(0, 3);
  
  return result;
};

const extractNouns = (description) => {
  // Simple noun extraction - in a real implementation, this would use NLP
  const commonNouns = [
    'data', 'information', 'system', 'device', 'apparatus', 'method', 'process',
    'algorithm', 'model', 'network', 'platform', 'interface', 'database',
    'application', 'software', 'hardware', 'component', 'module', 'service',
    'user', 'client', 'server', 'node', 'connection', 'channel', 'signal',
    'image', 'video', 'audio', 'text', 'document', 'file', 'message'
  ];
  
  const foundNouns = [];
  for (const noun of commonNouns) {
    if (description.includes(noun) && !foundNouns.includes(noun)) {
      foundNouns.push(noun);
    }
  }
  
  return foundNouns;
};

const generateGenericTitles = (extractedData) => {
  const titles = [];
  
  if (extractedData.primaryTechnology.length > 0) {
    titles.push(`${extractedData.primaryTechnology[0]} Processing System`);
    titles.push(`Method for ${extractedData.primaryTechnology[0]} Management`);
  }
  
  if (extractedData.domains.length > 0) {
    titles.push(`${extractedData.domains[0]} Management System`);
  }
  
  if (extractedData.actions.length > 0) {
    titles.push(`${extractedData.actions[0].charAt(0).toUpperCase() + extractedData.actions[0].slice(1)} Apparatus`);
  }
  
  // Fallback generic titles
  titles.push('Data Processing System');
  titles.push('Information Management Apparatus');
  titles.push('Method of System Optimization');
  titles.push('Apparatus for Resource Management');
  
  return titles;
};

export { generatePatentTitles }; 