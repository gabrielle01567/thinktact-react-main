import { findUserByEmail, deleteUser } from '../shared-storage.js';

export default async function handler(req, res) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    console.log('Account deletion requested for:', email);

    // Find the user
    const user = await findUserByEmail(email);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Store email for confirmation before deletion
    const userEmail = user.email;
    const userName = user.firstName || user.name || 'User';

    // Delete the user account
    const success = await deleteUser(email);

    if (!success) {
      return res.status(500).json({ error: 'Failed to delete user account' });
    }

    // Send confirmation email
    try {
      if (process.env.RESEND_API_KEY) {
        const { Resend } = await import('resend');
        const resend = new Resend(process.env.RESEND_API_KEY);

        await resend.emails.send({
          from: 'ThinkTactAI <noreply@thinktact.ai>',
          to: userEmail,
          subject: 'Your ThinkTactAI Account Has Been Deleted',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #be185d;">Account Deletion Confirmation</h2>
              
              <p>Dear ${userName},</p>
              
              <p>We're sad to see you go, but we want to confirm that your ThinkTactAI account has been successfully deleted as requested.</p>
              
              <div style="background-color: #fef2f2; border: 1px solid #fecaca; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <h3 style="color: #dc2626; margin-top: 0;">What was deleted:</h3>
                <ul style="color: #dc2626;">
                  <li>Your account profile and personal information</li>
                  <li>All saved analyses and data</li>
                  <li>Account preferences and settings</li>
                  <li>All associated data from our systems</li>
                </ul>
              </div>
              
              <p>All data associated with your account has been permanently purged from our systems and cannot be recovered.</p>
              
              <p>We would love to welcome you back anytime! If you change your mind, you can always create a new account using the same or a different email address.</p>
              
              <p>Thank you for being part of the ThinkTactAI community. We hope our AI-powered argument analysis tools were helpful to you.</p>
              
              <p>Best regards,<br>
              The ThinkTactAI Team</p>
              
              <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
              <p style="font-size: 12px; color: #6b7280;">
                This email was sent to confirm the deletion of your ThinkTactAI account. 
                If you did not request this deletion, please contact us immediately.
              </p>
            </div>
          `
        });

        console.log('Account deletion confirmation email sent to:', userEmail);
      } else {
        console.log('⚠️ RESEND_API_KEY not set - skipping confirmation email');
      }
    } catch (emailError) {
      console.error('Failed to send account deletion confirmation email:', emailError);
      // Don't fail the deletion if email fails
    }

    console.log('✅ Account deleted successfully for:', email);

    res.status(200).json({
      success: true,
      message: 'Account deleted successfully'
    });

  } catch (error) {
    console.error('Account deletion error:', error);
    res.status(500).json({
      error: 'Internal server error during account deletion'
    });
  }
} 