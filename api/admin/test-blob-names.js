export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const email = 'alex.hawke54@gmail.com';
    const normalizedEmail = email.toLowerCase().trim();
    const safeEmail = normalizedEmail.replace(/[^a-zA-Z0-9]/g, '_');
    const blobName = `users/${safeEmail}.json`;
    
    // Also test the old method
    const encodedEmail = btoa(normalizedEmail);
    const oldBlobName = `users/${encodedEmail.replace(/[^a-zA-Z0-9]/g, '')}.json`;
    
    res.status(200).json({
      success: true,
      email: email,
      normalizedEmail: normalizedEmail,
      safeEmail: safeEmail,
      blobName: blobName,
      oldBlobName: oldBlobName,
      environment: process.env.BLOB_READ_WRITE_TOKEN ? 'production' : 'development'
    });

  } catch (error) {
    console.error('Error testing blob names:', error);
    res.status(500).json({ error: 'Failed to test blob names', details: error.message });
  }
} 