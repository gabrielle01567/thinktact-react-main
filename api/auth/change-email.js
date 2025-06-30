import { devStorage, findUserByEmail, saveUser } from '../shared-storage.js';

const USERS_BLOB_PREFIX = 'users/';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { currentEmail, newEmail } = req.body;

    // Validate input
    if (!currentEmail || !newEmail) {
      return res.status(400).json({ error: 'Current email and new email are required' });
    }

    if (currentEmail === newEmail) {
      return res.status(400).json({ error: 'New email must be different from current email' });
    }

    // Check if current user exists
    const currentUser = findUserByEmail(currentEmail);
    if (!currentUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if new email is already taken
    const existingUser = findUserByEmail(newEmail);
    if (existingUser) {
      return res.status(409).json({ error: 'Email address is already in use' });
    }

    // Generate verification token for email change
    const emailChangeToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

    // Store email change request
    const emailChangeRequest = {
      currentEmail,
      newEmail,
      userId: currentUser.id,
      token: emailChangeToken,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
    };

    // Store the email change request
    const emailChangeBlobName = `email-changes/${btoa(emailChangeToken).replace(/[^a-zA-Z0-9]/g, '')}.json`;
    devStorage.set(emailChangeBlobName, emailChangeRequest);

    // Send verification email if Resend API key is set
    if (process.env.RESEND_API_KEY) {
      try {
        const { Resend } = await import('resend');
        const resend = new Resend(process.env.RESEND_API_KEY);
        
        await resend.emails.send({
          from: 'ThinkTactAI <noreply@thinktactai.com>',
          to: [newEmail],
          subject: 'Verify your new email address',
          html: `
            <h2>Email Change Request</h2>
            <p>Hi ${currentUser.firstName},</p>
            <p>You have requested to change your email address from ${currentEmail} to ${newEmail}.</p>
            <p>Please click the link below to verify your new email address:</p>
            <p><a href="${process.env.VERCEL_URL || 'http://localhost:3000'}/verify-email-change?token=${emailChangeToken}">Verify New Email</a></p>
            <p>This link will expire in 24 hours.</p>
            <p>If you didn't request this change, you can safely ignore this email.</p>
            <p>Best regards,<br>The ThinkTactAI Team</p>
          `
        });
      } catch (emailError) {
        console.error('Failed to send email change verification email:', emailError);
        return res.status(500).json({ error: 'Failed to send verification email' });
      }
    } else {
      // In development, return the verification URL
      const verificationUrl = `${process.env.VERCEL_URL || 'http://localhost:3000'}/verify-email-change?token=${emailChangeToken}`;
      return res.status(200).json({
        success: true,
        message: 'Email change request created. In development, use this verification URL:',
        verificationUrl
      });
    }

    res.status(200).json({
      success: true,
      message: 'Verification email sent to your new email address'
    });
  } catch (error) {
    console.error('Email change error:', error);
    res.status(500).json({ error: 'Email change request failed' });
  }
} 