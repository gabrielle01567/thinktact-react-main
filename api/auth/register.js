import { findUserByEmail, saveUser } from '../shared-storage.js';
import { Resend } from 'resend';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { firstName, lastName, email, password, securityQuestion, securityAnswer } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !password || !securityQuestion || !securityAnswer) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Check if user already exists
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({ error: 'User already exists' });
    }

    // Hash password
    const bcrypt = await import('bcryptjs');
    const SALT_ROUNDS = 12;
    const passwordHash = await bcrypt.default.hash(password, SALT_ROUNDS);

    // Generate verification token
    const verificationToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

    // Create user data
    const userData = {
      id: `user-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.toLowerCase().trim(), // Normalize email
      passwordHash,
      securityQuestion: securityQuestion.trim(),
      securityAnswer: securityAnswer.trim(),
      verified: false,
      verificationToken,
      isAdmin: false,
      isSuperUser: false,
      blocked: false,
      createdAt: new Date().toISOString(),
      lastLogin: null
    };

    // Save user
    await saveUser(userData);

    // Send verification email
    if (process.env.RESEND_API_KEY) {
      try {
        const resend = new Resend(process.env.RESEND_API_KEY);
        
        const verificationUrl = `${process.env.VERCEL_URL || 'http://localhost:3000'}/verify?token=${verificationToken}`;
        
        await resend.emails.send({
          from: 'ThinkTact AI <noreply@thinktact.ai>',
          to: [email],
          subject: 'Verify your ThinkTact AI account',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #333;">Welcome to ThinkTact AI!</h2>
              <p>Hi ${firstName},</p>
              <p>Thank you for registering with ThinkTact AI. Please verify your email address by clicking the button below:</p>
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
        
        console.log(`📧 Verification email sent to: ${email}`);
      } catch (emailError) {
        console.error('Error sending verification email:', emailError);
        // Don't fail registration if email fails
      }
    } else {
      console.log('⚠️ RESEND_API_KEY not set - skipping verification email');
    }

    res.status(201).json({
      success: true,
      message: 'User registered successfully. Please check your email to verify your account.',
      userId: userData.id
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
} 