// Title Generation Service for Patent Applications
// Uses Mistral AI to generate patent titles based on descriptions

const generatePatentTitles = async (description) => {
  if (!description || description.trim().length < 10) {
    throw new Error('Please provide a description with at least 10 characters');
  }

  try {
    // Get API Key from environment variable
    const apiKey = import.meta.env.VITE_MISTRAL_API_KEY;

    if (!apiKey) {
      throw new Error('Mistral API key is missing. Please contact support.');
    }

    // Create prompt for Mistral AI
    const prompt = `Generate exactly 4 patent titles based on this invention description: "${description}"

Requirements for each title:
- Be specific about the technology area
- Include key technical features that make the invention unique
- Avoid marketing language or superlatives
- Keep under 15 words if possible
- Use proper patent title format (e.g., "System and Method for...", "Apparatus for...", "Method of...")
- Be technically accurate and descriptive
- Each title should be different in approach or focus

Format your response as exactly 4 titles, one per line, with no numbering or special formatting. Just the titles, separated by line breaks.

Example format:
System and Method for AI-Powered Content Generation
Apparatus for Real-Time Data Processing
Method of Automated Quality Control
Intelligent Network Management System`;

    // Make API call to Mistral AI
    const MISTRAL_API_ENDPOINT = 'https://api.mistral.ai/v1/chat/completions';

    const response = await fetch(MISTRAL_API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'mistral-small-latest',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 300,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`Mistral API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Invalid response from Mistral AI');
    }

    const generatedText = data.choices[0].message.content;
    
    // Parse the generated titles
    const titles = parseGeneratedTitles(generatedText);
    
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

const parseGeneratedTitles = (generatedText) => {
  // Split by line breaks and clean up each title
  const lines = generatedText.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  
  // Extract titles (remove any numbering or formatting)
  const titles = lines
    .map(line => {
      // Remove common prefixes like "1.", "2.", "-", "•", etc.
      return line.replace(/^[\d\.\-\•\s]+/, '').trim();
    })
    .filter(title => title.length > 0 && title.length < 100) // Filter out empty or too long titles
    .slice(0, 4); // Take only the first 4 titles
  
  // If we don't have enough titles, generate some fallback ones
  if (titles.length < 4) {
    const fallbackTitles = generateFallbackTitles();
    titles.push(...fallbackTitles.slice(0, 4 - titles.length));
  }
  
  return titles.slice(0, 4); // Ensure exactly 4 titles
};

const generateFallbackTitles = () => {
  return [
    'System and Method for Data Processing',
    'Apparatus for Information Management',
    'Method of System Optimization',
    'Intelligent Processing System'
  ];
};

export { generatePatentTitles }; 