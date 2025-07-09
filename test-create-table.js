const BACKEND_URL = 'https://backendv2-2l9l8kevk-gabrielle-shands-projects.vercel.app/api';

async function createAnalysisTable() {
  console.log('🔧 Calling create analysis table endpoint...');
  
  try {
    const response = await fetch(`${BACKEND_URL}/create-analysis-table`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Response status:', response.status);
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Table creation result:', result);
    } else {
      const error = await response.text();
      console.log('❌ Error creating table:', error);
    }
    
  } catch (error) {
    console.error('❌ Error calling endpoint:', error);
  }
}

createAnalysisTable(); 