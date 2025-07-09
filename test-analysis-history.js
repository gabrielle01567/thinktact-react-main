import { getAnalysisHistory, saveAnalysis } from './backend/api/supabase-service.js';

async function testAnalysisHistory() {
  console.log('🔍 Testing analysis history functionality...');
  
  try {
    // Test 1: Try to get analysis history
    console.log('\n📋 Test 1: Getting analysis history...');
    const history = await getAnalysisHistory('test-user-id');
    console.log('✅ Analysis history result:', history);
    console.log('History length:', history.length);
    
    // Test 2: Try to save a test analysis
    console.log('\n💾 Test 2: Saving test analysis...');
    const testAnalysis = {
      originalArgument: 'This is a test argument for testing the analysis history functionality.',
      processedAnalysis: {
        conclusionType: 'Test Conclusion',
        keyFlaw: 'Test Flaw',
        assumptionsCount: 2
      }
    };
    
    const saveResult = await saveAnalysis('test-user-id', testAnalysis);
    console.log('✅ Save result:', saveResult);
    
    // Test 3: Get history again to see if the new analysis appears
    console.log('\n📋 Test 3: Getting analysis history after save...');
    const historyAfterSave = await getAnalysisHistory('test-user-id');
    console.log('✅ Analysis history after save:', historyAfterSave);
    console.log('History length after save:', historyAfterSave.length);
    
  } catch (error) {
    console.error('❌ Error during test:', error);
    console.error('Error details:', error.message);
    console.error('Error stack:', error.stack);
  }
}

testAnalysisHistory(); 