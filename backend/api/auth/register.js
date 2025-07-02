import { findUserByEmail, createUser } from '../supabase-service.js';
import { sendVerificationEmail } from '../email-service.js';

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

    // Create user data for the new supabase service
    const userData = {
      email: email.toLowerCase().trim(),
      password: password,
      name: `${firstName.trim()} ${lastName.trim()}`,
      securityQuestion: securityQuestion.trim(),
      securityAnswer: securityAnswer.trim(),
      isVerified: false,
      isAdmin: false
    };

    // Create user using the new supabase service
    const result = await createUser(userData);
    
    if (!result.success) {
      if (result.error === 'User already exists') {
        return res.status(409).json({ error: 'Email already in use', canReset: true });
      }
      return res.status(500).json({ error: result.error });
    }

    // Send verification email using the email service
    if (result.verificationToken) {
      try {
        const emailResult = await sendVerificationEmail(email, result.verificationToken, firstName);
        if (!emailResult.success) {
          console.error('Error sending verification email:', emailResult.error);
          // Don't fail registration if email fails
        }
      } catch (emailError) {
        console.error('Error sending verification email:', emailError);
        // Don't fail registration if email fails
      }
    }

    res.status(201).json({
      success: true,
      message: 'User registered successfully. Please check your email to verify your account.',
      user: result.user
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
} 