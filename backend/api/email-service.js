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
    
    // Use your verified domain email address
    const fromEmail = 'noreply@thinktact.ai'; // Your verified domain email
    console.log('From:', fromEmail);
    
    const verificationUrl = `https://thinktact.ai/verify?token=${verificationToken}`;
    console.log('Verification URL:', verificationUrl);

    // Use the provided name as first name, fallback to email prefix if not provided
    let firstName = name;
    if (!firstName) {
      firstName = email.split('@')[0];
    }
    
    // Improved email template
    const emailData = {
      from: fromEmail,
      to: [email],
      subject: 'Verify your ThinkTact account',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9f9f9; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.04); padding: 32px 24px;">
          <div style="text-align: center; margin-bottom: 24px;">
            <img src="https://thinktact.ai/logo.png" alt="ThinkTact Logo" style="height: 48px; margin-bottom: 8px;" />
            <h2 style="color: #2d3748; margin: 0;">Welcome to ThinkTact!</h2>
          </div>
          <p style="font-size: 1.1em; color: #333;">Hi <strong>${firstName}</strong>,</p>
          <p style="color: #444;">Thank you for registering with ThinkTact. Please verify your email address by clicking the button below:</p>
          <div style="text-align: center; margin: 32px 0;">
            <a href="${verificationUrl}" style="background: #2563eb; color: #fff; padding: 14px 32px; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 1.1em; box-shadow: 0 2px 4px rgba(37,99,235,0.15);">Verify Email</a>
          </div>
          <p style="color: #666;">If the button above doesn't work, copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #2563eb; font-size: 0.97em; background: #eef2ff; padding: 8px 12px; border-radius: 4px;">${verificationUrl}</p>
          <p style="color: #888; font-size: 0.95em;">This link will expire in 24 hours.</p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 32px 0 16px 0;" />
          <p style="color: #888; font-size: 0.95em;">Best regards,<br>The ThinkTact Team</p>
        </div>
      `,
      text: `Hi ${firstName},\n\nThank you for registering with ThinkTact. Please verify your email by visiting: ${verificationUrl}\n\nIf the link doesn't work, copy and paste it into your browser.\n\nBest regards,\nThe ThinkTact Team`
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
    const fromEmail = 'noreply@thinktact.ai'; // Your verified domain email
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