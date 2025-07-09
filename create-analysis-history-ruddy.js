async function createAnalysisHistoryTable() {
  const backendUrl = 'https://backendv2-ruddy.vercel.app/api';
  
  console.log('🔍 Creating analysis_history table via ruddy backend...');
  console.log('Backend URL:', backendUrl);
  
  try {
    // Test the create table endpoint
    const response = await fetch(`${backendUrl}/create-analysis-table`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Response status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Table creation successful:', data);
    } else {
      const errorText = await response.text();
      console.log('❌ Table creation error:', errorText);
    }
    
  } catch (error) {
    console.error('❌ Error creating table:', error.message);
  }
}

createAnalysisHistoryTable();