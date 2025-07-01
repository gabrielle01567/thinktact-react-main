import { getAllUsers, findUserByEmail, deleteUser } from '../shared-storage.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    console.log(`🗑️ Force deleting user: ${email}`);
    
    // First, check if user exists
    const userBeforeDelete = await findUserByEmail(email);
    console.log(`User found before deletion:`, userBeforeDelete ? 'YES' : 'NO');
    
    if (userBeforeDelete) {
      console.log('User details before deletion:', {
        id: userBeforeDelete.id,
        email: userBeforeDelete.email,
        firstName: userBeforeDelete.firstName,
        lastName: userBeforeDelete.lastName
      });
    }
    
    // Get all users before deletion
    const usersBeforeDelete = await getAllUsers();
    console.log(`Total users before deletion: ${usersBeforeDelete.length}`);
    
    // Attempt deletion
    console.log(`Attempting to delete user: ${email}`);
    const deleteResult = await deleteUser(email);
    console.log(`Delete result: ${deleteResult}`);
    
    // Verify deletion
    console.log(`Verifying deletion...`);
    const userAfterDelete = await findUserByEmail(email);
    console.log(`User found after deletion:`, userAfterDelete ? 'YES' : 'NO');
    
    // Get updated user list
    const usersAfterDelete = await getAllUsers();
    console.log(`Total users after deletion: ${usersAfterDelete.length}`);
    
    // Check if user count decreased
    const userCountDecreased = usersAfterDelete.length < usersBeforeDelete.length;
    console.log(`User count decreased: ${userCountDecreased}`);
    
    // If deletion failed, try manual deletion through getAllUsers
    if (userAfterDelete || !userCountDecreased) {
      console.log(`Manual deletion attempt through getAllUsers...`);
      
      // Find the user in the list and try to delete their blob directly
      const { list, del, head } = await import('@vercel/blob');
      const { blobs } = await list({ prefix: 'users/' });
      
      console.log(`Found ${blobs.length} blobs in users/ directory`);
      
      for (const blob of blobs) {
        try {
          const response = await fetch(blob.url);
          const user = await response.json();
          
          if (user.email === email.toLowerCase().trim()) {
            console.log(`Found user in blob: ${blob.pathname}`);
            console.log(`Attempting to delete blob: ${blob.pathname}`);
            
            await del(blob.pathname);
            console.log(`Successfully deleted blob: ${blob.pathname}`);
            
            // Verify the deletion
            try {
              const verifyResult = await head(blob.pathname);
              console.log(`Blob still exists after deletion:`, !!verifyResult.blob);
            } catch (error) {
              console.log(`Blob successfully deleted (head failed): ${blob.pathname}`);
            }
            
            break;
          }
        } catch (error) {
          console.error(`Error processing blob ${blob.pathname}:`, error);
        }
      }
      
      // Final verification
      const finalUserCheck = await findUserByEmail(email);
      const finalUsers = await getAllUsers();
      
      console.log(`Final user check:`, finalUserCheck ? 'FOUND' : 'NOT FOUND');
      console.log(`Final user count: ${finalUsers.length}`);
      
      res.status(200).json({
        success: true,
        message: 'Force deletion completed',
        email: email,
        deleteResult: deleteResult,
        userBeforeDelete: !!userBeforeDelete,
        userAfterDelete: !!userAfterDelete,
        userCountDecreased: userCountDecreased,
        finalUserFound: !!finalUserCheck,
        finalUserCount: finalUsers.length,
        manualDeletionAttempted: true
      });
    } else {
      res.status(200).json({
        success: true,
        message: 'User deleted successfully',
        email: email,
        deleteResult: deleteResult,
        userBeforeDelete: !!userBeforeDelete,
        userAfterDelete: !!userAfterDelete,
        userCountDecreased: userCountDecreased,
        finalUserFound: !!userAfterDelete,
        finalUserCount: usersAfterDelete.length
      });
    }

  } catch (error) {
    console.error('Force delete error:', error);
    res.status(500).json({
      error: 'Force delete failed',
      details: error.message
    });
  }
} 