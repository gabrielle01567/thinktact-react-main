const { getBlobClient } = require('./shared-storage');

// Save a new analysis to user's history
const saveAnalysis = async (userId, analysisData) => {
  try {
    const blobClient = getBlobClient();
    const containerClient = blobClient.getContainerClient('analysis-history');
    
    // Create container if it doesn't exist
    await containerClient.createIfNotExists();
    
    const timestamp = new Date().toISOString();
    const analysisId = `${userId}-${timestamp}`;
    const blobName = `${analysisId}.json`;
    
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    
    const analysisRecord = {
      id: analysisId,
      userId: userId,
      timestamp: timestamp,
      argumentText: analysisData.originalArgument,
      analysisResults: analysisData.processedAnalysis,
      createdAt: timestamp
    };
    
    await blockBlobClient.upload(JSON.stringify(analysisRecord), JSON.stringify(analysisRecord).length, {
      blobHTTPHeaders: { blobContentType: 'application/json' }
    });
    
    console.log(`Analysis saved for user ${userId}: ${analysisId}`);
    return { success: true, analysisId };
    
  } catch (error) {
    console.error('Error saving analysis:', error);
    throw new Error('Failed to save analysis');
  }
};

// Get user's analysis history (last 10)
const getAnalysisHistory = async (userId) => {
  try {
    const blobClient = getBlobClient();
    const containerClient = blobClient.getContainerClient('analysis-history');
    
    // Check if container exists
    const exists = await containerClient.exists();
    if (!exists) {
      return [];
    }
    
    const analyses = [];
    
    // List all blobs for this user
    for await (const blob of containerClient.listBlobsFlat({ prefix: `${userId}-` })) {
      try {
        const blockBlobClient = containerClient.getBlockBlobClient(blob.name);
        const downloadResponse = await blockBlobClient.download();
        const content = await streamToString(downloadResponse.readableStreamBody);
        const analysis = JSON.parse(content);
        analyses.push(analysis);
      } catch (error) {
        console.error(`Error reading analysis ${blob.name}:`, error);
        // Continue with other analyses
      }
    }
    
    // Sort by timestamp (newest first) and return last 10
    analyses.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    return analyses.slice(0, 10);
    
  } catch (error) {
    console.error('Error getting analysis history:', error);
    throw new Error('Failed to get analysis history');
  }
};

// Delete a specific analysis
const deleteAnalysis = async (userId, analysisId) => {
  try {
    const blobClient = getBlobClient();
    const containerClient = blobClient.getContainerClient('analysis-history');
    
    // Verify the analysis belongs to the user
    const blobName = `${analysisId}.json`;
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    
    // Check if blob exists and belongs to user
    const exists = await blockBlobClient.exists();
    if (!exists) {
      throw new Error('Analysis not found');
    }
    
    // Download to verify ownership
    const downloadResponse = await blockBlobClient.download();
    const content = await streamToString(downloadResponse.readableStreamBody);
    const analysis = JSON.parse(content);
    
    if (analysis.userId !== userId) {
      throw new Error('Unauthorized to delete this analysis');
    }
    
    // Delete the blob
    await blockBlobClient.delete();
    
    console.log(`Analysis deleted: ${analysisId}`);
    return { success: true };
    
  } catch (error) {
    console.error('Error deleting analysis:', error);
    throw new Error('Failed to delete analysis');
  }
};

// Helper function to convert stream to string
const streamToString = async (readableStream) => {
  return new Promise((resolve, reject) => {
    const chunks = [];
    readableStream.on('data', (data) => {
      chunks.push(data.toString());
    });
    readableStream.on('end', () => {
      resolve(chunks.join(''));
    });
    readableStream.on('error', reject);
  });
};

module.exports = {
  saveAnalysis,
  getAnalysisHistory,
  deleteAnalysis
}; 