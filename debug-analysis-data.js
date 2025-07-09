const BACKEND_URL = 'https://backendv2-2l9l8kevk-gabrielle-shands-projects.vercel.app/api';

async function debugAnalysisData() {
  console.log('🔍 Debugging analysis data...');
  
  try {
    // Test the analysis history endpoint
    console.log('\n📋 Testing analysis history endpoint...');
    const response = await fetch(`${BACKEND_URL}/analysis/history`, {
      headers: {
        'Authorization': 'Bearer test-token' // This will fail but let's see the response
      }
    });
    
    console.log('Response status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Analysis history data:', data);
      
      if (data.history && data.history.length > 0) {
        console.log('\n📝 First analysis details:');
        const firstAnalysis = data.history[0];
        console.log('ID:', firstAnalysis.id);
        console.log('Argument text:', firstAnalysis.argumentText);
        console.log('Argument text length:', firstAnalysis.argumentText?.length);
        console.log('Analysis results:', firstAnalysis.analysisResults);
        console.log('Timestamp:', firstAnalysis.timestamp);
      } else {
        console.log('❌ No analysis history found');
      }
    } else {
      const error = await response.text();
      console.log('❌ Error response:', error);
    }
    
  } catch (error) {
    console.error('❌ Error during debug:', error);
  }
}

debugAnalysisData(); 