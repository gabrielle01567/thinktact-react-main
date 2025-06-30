import { getBlobName } from '../shared-storage.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const testEmail = 'alex.hawke54@gmail.com';
    const normalizedEmail = testEmail.toLowerCase().trim();
    
    // Get normalized blob name
    const normalizedBlobName = getBlobName(normalizedEmail);
    
    // For reference, show what the old format would have been
    const encodedEmail = Buffer.from(normalizedEmail).toString('base64');
    const oldBlobName = `users/${encodedEmail.replace(/[^a-zA-Z0-9]/g, '')}.json`;
    
    res.status(200).json({
      success: true,
      email: testEmail,
      normalizedEmail: normalizedEmail,
      normalizedBlobName: normalizedBlobName,
      oldBlobName: oldBlobName,
      note: 'System now uses normalized blob name format consistently'
    });

  } catch (error) {
    console.error('Test blob names error:', error);
    res.status(500).json({
      error: 'Test failed',
      details: error.message
    });
  }
} 