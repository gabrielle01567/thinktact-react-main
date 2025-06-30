import { findUserByEmail, saveUser, devStorage } from '../shared-storage.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Find user by email
    const user = findUserByEmail(email);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.verified) {
      return res.status(400).json({ error: 'User is already verified' });
    }

    // Generate new verification token
    const verificationToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

    // Update user with new verification token
    const updatedUser = {
      ...user,
      verificationToken
    };

    // Save updated user
    const blobName = `users/${btoa(email).replace(/[^a-zA-Z0-9]/g, '')}.json`;
    saveUser(blobName, updatedUser);

    // Send verification email using Resend
    if (process.env.RESEND_API_KEY) {
      try {
        const { Resend } = await import('resend');
        const resend = new Resend(process.env.RESEND_API_KEY);
        
        await resend.emails.send({
          from: 'ThinkTactAI <noreply@thinktactai.com>',
          to: [email],
          subject: 'Verify your ThinkTactAI account',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #9d1755; text-align: center;">Welcome to ThinkTactAI!</h2>
              <p>Hi ${user.firstName},</p>
              <p>Thank you for registering with ThinkTactAI. Please verify your email address by clicking the button below:</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.VERCEL_URL || 'http://localhost:3000'}/verify?token=${verificationToken}" 
                   style="background-color: #9d1755; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                  Verify Email Address
                </a>
              </div>
              <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #666;">
                ${process.env.VERCEL_URL || 'http://localhost:3000'}/verify?token=${verificationToken}
              </p>
              <p>If you didn't create this account, you can safely ignore this email.</p>
              <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
              <p style="color: #666; font-size: 14px;">
                Best regards,<br>
                The ThinkTactAI Team
              </p>
            </div>
          `
        });

        console.log(`✅ Verification email sent to: ${email}`);
        
        res.status(200).json({
          success: true,
          message: 'Verification email sent successfully'
        });

      } catch (emailError) {
        console.error('Failed to send verification email:', emailError);
        
        // Provide more specific error messages
        let errorMessage = 'Failed to send verification email';
        
        if (emailError.message) {
          if (emailError.message.includes('Unauthorized')) {
            errorMessage = 'Email service configuration error. Please contact support.';
          } else if (emailError.message.includes('Invalid')) {
            errorMessage = 'Invalid email address format.';
          } else if (emailError.message.includes('Rate limit')) {
            errorMessage = 'Too many email requests. Please try again later.';
          } else {
            errorMessage = `Email service error: ${emailError.message}`;
          }
        }
        
        res.status(500).json({ error: errorMessage });
      }
    } else {
      console.log('⚠️ RESEND_API_KEY not set - email service not configured');
      res.status(500).json({ 
        error: 'Email service not configured. Please contact support to set up email verification.' 
      });
    }

  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({ error: 'Failed to resend verification email' });
  }
} 