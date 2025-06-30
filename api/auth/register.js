import bcrypt from 'bcryptjs';
import { findUserByEmail, saveUser } from '../shared-storage.js';

const SALT_ROUNDS = 12;
const USERS_BLOB_PREFIX = 'users/';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { firstName, lastName, email, password, securityQuestion, securityAnswer } = req.body;

    // Validate input
    if (!firstName || !lastName || !email || !password || !securityQuestion || !securityAnswer) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Generate blob name for user
    const blobName = `${USERS_BLOB_PREFIX}${btoa(email).replace(/[^a-zA-Z0-9]/g, '')}.json`;

    // Check if user already exists
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // Generate verification token
    const verificationToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

    // Create user data
    const userData = {
      id: Math.random().toString(36).substring(2, 15),
      firstName,
      lastName,
      email,
      passwordHash: hashedPassword,
      securityQuestion,
      securityAnswer,
      verified: false,
      blocked: false,
      verificationToken,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString()
    };

    // Store user data
    await saveUser(blobName, userData);

    // Send verification email if Resend API key is set
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
              <p>Hi ${firstName},</p>
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
      } catch (emailError) {
        console.error('Failed to send verification email:', emailError);
        // Don't fail registration if email fails, but log the error
        console.log('⚠️ Registration successful but verification email failed to send');
      }
    } else {
      console.log('⚠️ RESEND_API_KEY not set - skipping verification email');
      // In development mode, provide the verification link directly
      if (!process.env.BLOB_READ_WRITE_TOKEN) {
        console.log(`🔗 Development verification link: http://localhost:3000/verify?token=${verificationToken}`);
      }
    }

    // Return success without sensitive data
    const { passwordHash: _, verificationToken: __, ...userResponse } = userData;
    
    res.status(201).json({
      success: true,
      message: 'User registered successfully. Please check your email to verify your account.',
      user: userResponse
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
} 