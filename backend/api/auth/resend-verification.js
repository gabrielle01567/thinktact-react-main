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

    console.log('Resend verification request for email:', email);

    // Find user by email (normalized)
    const user = await findUserByEmail(email);

    if (!user) {
      console.log('User not found for resend verification:', email);
      return res.status(404).json({ error: 'No account found with this email address' });
    }

    if (user.verified) {
      console.log('User already verified:', email);
      return res.status(400).json({ error: 'User is already verified' });
    }

    // Generate new verification token
    const newVerificationToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

    // Update user with new verification token
    const updatedUser = {
      ...user,
      verificationToken: newVerificationToken
    };

    await saveUser(updatedUser);

    // Send verification email
    if (process.env.RESEND_API_KEY) {
      try {
        const resend = new Resend(process.env.RESEND_API_KEY);
        
        const verificationUrl = `${process.env.VERCEL_URL || 'http://localhost:3000'}/verify?token=${newVerificationToken}`;
        
        await resend.emails.send({
          from: 'ThinkTact AI <noreply@thinktact.ai>',
          to: [email],
          subject: 'Verify your ThinkTact AI account',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #333;">Verify your ThinkTact AI account</h2>
              <p>Hi ${user.firstName},</p>
              <p>You requested a new verification email for your ThinkTact AI account. Please verify your email address by clicking the button below:</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${verificationUrl}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Verify Email</a>
              </div>
              <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #666;">${verificationUrl}</p>
              <p>This link will expire in 24 hours.</p>
              <p>Best regards,<br>The ThinkTact AI Team</p>
            </div>
          `
        });
        
        console.log(`📧 Verification email resent to: ${email}`);
      } catch (emailError) {
        console.error('Error sending verification email:', emailError);
        return res.status(500).json({ error: 'Failed to send verification email' });
      }
    } else {
      console.log('⚠️ RESEND_API_KEY not set - email service not configured');
      return res.status(500).json({ error: 'Email service not configured' });
    }

    res.status(200).json({
      success: true,
      message: 'Verification email sent successfully'
    });

  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({ error: 'Failed to resend verification email' });
  }
} 