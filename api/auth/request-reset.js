import { findUserByEmail, saveUser } from '../shared-storage.js';
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

    console.log('Password reset request for email:', email);

    // Find user by email (normalized)
    const user = await findUserByEmail(email);

    if (!user) {
      console.log('User not found for password reset:', email);
      return res.status(404).json({ error: 'No account found with this email address' });
    }

    // Generate reset token
    const resetToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const resetTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    console.log('🔑 Generated reset token:', resetToken.substring(0, 10) + '...');

    // Update user with reset token
    const updatedUser = {
      ...user,
      resetToken,
      resetTokenExpiry: resetTokenExpiry.toISOString()
    };

    await saveUser(updatedUser);
    console.log('💾 Saved user with reset token');

    // Send reset email
    if (process.env.RESEND_API_KEY) {
      try {
        const resend = new Resend(process.env.RESEND_API_KEY);
        
        const resetUrl = `${process.env.VERCEL_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
        console.log('🔗 Generated reset URL:', resetUrl);
        
        await resend.emails.send({
          from: 'ThinkTact AI <noreply@thinktact.ai>',
          to: [email],
          subject: 'Reset your ThinkTact AI password',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #333;">Password Reset Request</h2>
              <p>Hi ${user.firstName},</p>
              <p>We received a request to reset your password for your ThinkTact AI account. Click the button below to reset your password:</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${resetUrl}" style="background-color: #dc3545; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
              </div>
              <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #666;"><a href="${resetUrl}" style="color: #0066cc; text-decoration: underline;">ThinkTact AI Password Reset</a></p>
              <p>This link will expire in 24 hours.</p>
              <p>If you didn't request a password reset, you can safely ignore this email.</p>
              <p>Best regards,<br>The ThinkTact AI Team</p>
            </div>
          `
        });
        
        console.log(`📧 Password reset email sent to: ${email}`);
      } catch (emailError) {
        console.error('Error sending password reset email:', emailError);
        return res.status(500).json({ error: 'Failed to send reset email' });
      }
    } else {
      console.log('⚠️ RESEND_API_KEY not set - email service not configured');
      return res.status(500).json({ error: 'Email service not configured' });
    }

    res.status(200).json({
      success: true,
      message: 'Password reset email sent successfully'
    });

  } catch (error) {
    console.error('Password reset request error:', error);
    res.status(500).json({ error: 'Failed to process reset request' });
  }
} 