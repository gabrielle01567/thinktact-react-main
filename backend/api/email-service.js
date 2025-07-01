import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// Generate a random verification token
const generateVerificationToken = () => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

// Send verification email
export const sendVerificationEmail = async (email, verificationToken, name) => {
  try {
    // For now, use a simple from address that should work
    const fromEmail = 'onboarding@resend.dev'; // Resend's default sender
    
    const verificationUrl = `https://thinktact.ai/verify?token=${verificationToken}`;
    
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: [email],
      subject: 'Verify your ThinkTact account',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Welcome to ThinkTact!</h2>
          <p>Hi ${name},</p>
          <p>Thank you for registering with ThinkTact. Please verify your email address by clicking the button below:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" 
               style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Verify Email Address
            </a>
          </div>
          <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #666;">${verificationUrl}</p>
          <p>This link will expire in 24 hours.</p>
          <p>Best regards,<br>The ThinkTact Team</p>
        </div>
      `
    });

    if (error) {
      console.error('Error sending verification email:', error);
      return { success: false, error: error.message };
    }

    console.log('Verification email sent successfully to:', email);
    return { success: true, data };
  } catch (error) {
    console.error('Error sending verification email:', error);
    return { success: false, error: error.message };
  }
};

// Send password reset email
export const sendPasswordResetEmail = async (email, resetToken, name) => {
  try {
    const fromEmail = 'onboarding@resend.dev'; // Resend's default sender
    const resetUrl = `https://thinktact.ai/reset-password?token=${resetToken}`;
    
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: [email],
      subject: 'Reset your ThinkTact password',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Password Reset Request</h2>
          <p>Hi ${name},</p>
          <p>We received a request to reset your password. Click the button below to create a new password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background-color: #dc3545; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Reset Password
            </a>
          </div>
          <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #666;">${resetUrl}</p>
          <p>This link will expire in 1 hour.</p>
          <p>If you didn't request this password reset, you can safely ignore this email.</p>
          <p>Best regards,<br>The ThinkTact Team</p>
        </div>
      `
    });

    if (error) {
      console.error('Error sending password reset email:', error);
      return { success: false, error: error.message };
    }

    console.log('Password reset email sent successfully to:', email);
    return { success: true, data };
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return { success: false, error: error.message };
  }
};

export { generateVerificationToken }; 