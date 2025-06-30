import { getAllUsers, saveUser, deleteUser } from './shared-storage.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const users = await getAllUsers();
    const migrationResults = [];

    for (const user of users) {
      const originalEmail = user.email;
      const normalizedEmail = originalEmail.toLowerCase();
      
      // Skip if email is already normalized
      if (originalEmail === normalizedEmail) {
        migrationResults.push({
          email: originalEmail,
          action: 'skipped',
          reason: 'already normalized'
        });
        continue;
      }

      try {
        // Create new user data with normalized email
        const updatedUser = {
          ...user,
          email: normalizedEmail
        };

        // Save user with normalized email
        await saveUser(updatedUser);
        
        // Delete old user with original email
        await deleteUser(originalEmail);
        
        migrationResults.push({
          email: originalEmail,
          action: 'migrated',
          newEmail: normalizedEmail
        });
      } catch (error) {
        migrationResults.push({
          email: originalEmail,
          action: 'failed',
          error: error.message
        });
      }
    }

    res.status(200).json({
      success: true,
      totalUsers: users.length,
      migrationResults
    });
  } catch (error) {
    console.error('Migration error:', error);
    res.status(500).json({ 
      error: 'Failed to migrate users',
      details: error.message 
    });
  }
} 