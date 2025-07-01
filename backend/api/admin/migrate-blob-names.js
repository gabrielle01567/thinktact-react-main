import { getAllUsers, saveUser, getBlobName } from '../shared-storage.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('🔄 Starting blob name migration...');
    
    // Get all users
    const users = await getAllUsers();
    console.log(`📋 Found ${users.length} users to migrate`);
    
    const migrationResults = [];
    let migratedCount = 0;
    let errorCount = 0;
    
    for (const user of users) {
      try {
        const normalizedEmail = user.email.toLowerCase().trim();
        const expectedBlobName = getBlobName(normalizedEmail);
        
        console.log(`🔄 Processing user: ${normalizedEmail}`);
        console.log(`  Expected blob name: ${expectedBlobName}`);
        
        // Save user with normalized blob name (this will handle migration automatically)
        await saveUser(user);
        
        console.log(`✅ Successfully migrated user: ${normalizedEmail}`);
        migrationResults.push({
          email: normalizedEmail,
          status: 'success',
          expectedBlobName: expectedBlobName
        });
        migratedCount++;
        
      } catch (error) {
        console.error(`❌ Error migrating user ${user.email}:`, error);
        migrationResults.push({
          email: user.email,
          status: 'error',
          error: error.message
        });
        errorCount++;
      }
    }
    
    console.log(`🎉 Migration completed!`);
    console.log(`✅ Successfully migrated: ${migratedCount} users`);
    console.log(`❌ Errors: ${errorCount} users`);
    
    res.status(200).json({
      success: true,
      message: 'Blob name migration completed',
      totalUsers: users.length,
      migratedCount: migratedCount,
      errorCount: errorCount,
      results: migrationResults
    });

  } catch (error) {
    console.error('Migration error:', error);
    res.status(500).json({
      error: 'Migration failed',
      details: error.message
    });
  }
} 