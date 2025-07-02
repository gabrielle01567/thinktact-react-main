import { Resend } from 'resend';

console.log('🔧 Email Service Configuration:');
console.log('RESEND_API_KEY:', process.env.RESEND_API_KEY ? `Set (${process.env.RESEND_API_KEY.substring(0, 10)}...)` : 'Not set');

// Only create Resend client if API key is available
let resend = null;
if (process.env.RESEND_API_KEY) {
  try {
    resend = new Resend(process.env.RESEND_API_KEY);
    console.log('✅ Resend client created successfully');
  } catch (error) {
    console.error('❌ Failed to create Resend client:', error.message);
  }
} else {
  console.log('⚠️ RESEND_API_KEY not set - email service disabled');
}

// Generate a random verification token
const generateVerificationToken = () => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

// Send verification email
export const sendVerificationEmail = async (email, verificationToken, name) => {
  try {
    console.log('📧 Attempting to send verification email...');
    console.log('To:', email);
    console.log('Token:', verificationToken ? verificationToken.substring(0, 10) + '...' : 'null');
    console.log('Name:', name);
    
    if (!resend) {
      console.error('❌ Resend client not available');
      return { success: false, error: 'Email service not configured' };
    }
    
    // Use a simple from address that should work
    const fromEmail = 'onboarding@resend.dev'; // Resend's default sender
    console.log('From:', fromEmail);
    
    const verificationUrl = `https://thinktact.ai/verify?token=${verificationToken}`;
    console.log('Verification URL:', verificationUrl);
    
    // Create a simpler email template to avoid potential issues
    const emailData = {
      from: fromEmail,
      to: [email],
      subject: 'Verify your ThinkTact account',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Welcome to ThinkTact!</h2>
          <p>Hi ${name},</p>
          <p>Thank you for registering with ThinkTact. Please verify your email address by clicking the link below:</p>
          <p><a href="${verificationUrl}">${verificationUrl}</a></p>
          <p>This link will expire in 24 hours.</p>
          <p>Best regards,<br>The ThinkTact Team</p>
        </div>
      `,
      text: `Welcome to ThinkTact! Please verify your email by visiting: ${verificationUrl}`
    };
    
    console.log('📧 Sending email with data:', {
      from: emailData.from,
      to: emailData.to,
      subject: emailData.subject
    });
    
    const { data, error } = await resend.emails.send(emailData);

    if (error) {
      console.error('❌ Error sending verification email:', error);
      console.error('Error details:', error.message);
      console.error('Error code:', error.code);
      console.error('Error status:', error.status);
      return { success: false, error: error.message };
    }

    console.log('✅ Verification email sent successfully to:', email);
    console.log('Resend response data:', data);
    return { success: true, data };
  } catch (error) {
    console.error('❌ Exception sending verification email:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
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