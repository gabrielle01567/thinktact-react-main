import { findUserByEmail, saveUser } from '../shared-storage.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, securityAnswer } = req.body;

    if (!email || !securityAnswer) {
      return res.status(400).json({ error: 'Email and security answer are required' });
    }

    // Find user by email
    const userData = findUserByEmail(email);
    if (!userData) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify security answer
    if (userData.securityAnswer.toLowerCase() !== securityAnswer.toLowerCase()) {
      return res.status(401).json({ error: 'Incorrect security answer' });
    }

    // Generate reset token
    const resetToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const resetTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Update user with reset token
    const updatedUserData = {
      ...userData,
      resetToken,
      resetTokenExpiry: resetTokenExpiry.toISOString()
    };

    // Generate blob name for user
    const USERS_BLOB_PREFIX = 'users/';
    const blobName = `${USERS_BLOB_PREFIX}${btoa(email).replace(/[^a-zA-Z0-9]/g, '')}.json`;
    
    // Save updated user data
    saveUser(blobName, updatedUserData);

    // Send reset email if Resend API key is set
    if (process.env.RESEND_API_KEY) {
      try {
        const { Resend } = await import('resend');
        const resend = new Resend(process.env.RESEND_API_KEY);
        
        await resend.emails.send({
          from: 'ThinkTactAI <noreply@thinktact.ai>',
          to: [email],
          subject: 'Password Reset Request',
          html: `
            <h2>Password Reset Request</h2>
            <p>Hi ${userData.firstName},</p>
            <p>You requested a password reset for your ThinkTactAI account. Click the link below to reset your password:</p>
            <p><a href="${process.env.VERCEL_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}">Reset Password</a></p>
            <p>This link will expire in 24 hours. If you didn't request this reset, you can safely ignore this email.</p>
            <p>Best regards,<br>The ThinkTactAI Team</p>
          `
        });
      } catch (emailError) {
        console.error('Failed to send reset email:', emailError);
        // Don't fail the request if email fails
      }
    }

    res.status(200).json({
      success: true,
      message: 'Password reset email sent successfully'
    });
  } catch (error) {
    console.error('Request reset error:', error);
    res.status(500).json({ error: 'Failed to process reset request' });
  }
} 