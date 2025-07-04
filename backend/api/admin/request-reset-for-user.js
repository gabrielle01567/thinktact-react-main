import { findUserByEmail, updateUser } from '../supabase-service.js';
import { Resend } from 'resend';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Find user by email (normalized)
    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(404).json({ error: 'No account found with this email address' });
    }

    // Generate reset token
    const resetToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const resetTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Update user with reset token in Supabase
    await updateUser(user.id, {
      reset_token: resetToken,
      reset_token_expires: resetTokenExpiry.toISOString()
    });

    // Send reset email
    if (process.env.RESEND_API_KEY) {
      try {
        const resend = new Resend(process.env.RESEND_API_KEY);
        // Use the frontend URL for the reset link
        const baseUrl = process.env.FRONTEND_URL || 'https://thinktact.ai';
        const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`;
        await resend.emails.send({
          from: 'ThinkTact AI <noreply@thinktact.ai>',
          to: [email],
          subject: 'Reset your ThinkTact AI password',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #333;">Password Reset Request</h2>
              <p>Hi ${user.name || user.email},</p>
              <p>An admin has requested a password reset for your ThinkTact AI account. Click the button below to reset your password:</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${resetUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
              </div>
              <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #666;"><a href="${resetUrl}" style="color: #0066cc; text-decoration: underline;">${resetUrl}</a></p>
              <p>This link will expire in 24 hours.</p>
              <p>If you didn't request a password reset, you can safely ignore this email.</p>
              <p>Best regards,<br>The ThinkTact AI Team</p>
            </div>
          `
        });
      } catch (emailError) {
        console.error('Email sending error:', emailError);
        return res.status(500).json({ error: 'Failed to send reset email: ' + emailError.message });
      }
    } else {
      return res.status(500).json({ error: 'Email service not configured' });
    }

    res.status(200).json({
      success: true,
      message: 'Password reset email sent successfully'
    });
  } catch (error) {
    console.error('Reset request error:', error);
    res.status(500).json({ error: 'Failed to process reset request: ' + error.message });
  }
} 