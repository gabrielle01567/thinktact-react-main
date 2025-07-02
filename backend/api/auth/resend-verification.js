import { findUserByEmail, updateUser } from '../supabase-service.js';
import { sendVerificationEmail } from '../email-service.js';

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

    if (user.isVerified) {
      console.log('User already verified:', email);
      return res.status(400).json({ error: 'User is already verified' });
    }

    // Generate new verification token
    const newVerificationToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

    // Update user with new verification token
    await updateUser(user.id, { verification_token: newVerificationToken });

    // Send verification email using the email service
    const emailResult = await sendVerificationEmail(email, newVerificationToken, user.name);
    
    if (!emailResult.success) {
      console.error('Error sending verification email:', emailResult.error);
      return res.status(500).json({ error: 'Failed to send verification email' });
    }
    
    console.log(`📧 Verification email resent to: ${email}`);

    res.status(200).json({
      success: true,
      message: 'Verification email sent successfully'
    });

  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({ error: 'Failed to resend verification email' });
  }
} 