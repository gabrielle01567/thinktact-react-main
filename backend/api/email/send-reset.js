import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, resetUrl, userName } = req.body;

    if (!email || !resetUrl) {
      return res.status(400).json({ error: 'Email and reset URL are required' });
    }

    const { data, error } = await resend.emails.send({
      from: 'ThinkTactAI <noreply@thinktact.ai>',
      to: [email],
      subject: 'Reset Your ThinkTactAI Password',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reset Your Password</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #f9fafb;
            }
            .container {
              background-color: white;
              border-radius: 8px;
              padding: 40px;
              box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
            }
            .logo {
              display: inline-flex;
              align-items: center;
              margin-bottom: 20px;
            }
            .logo svg {
              width: 32px;
              height: 32px;
              margin-right: 12px;
            }
            .logo-text {
              font-size: 24px;
              font-weight: bold;
              color: #831843;
            }
            h1 {
              color: #111827;
              font-size: 24px;
              font-weight: 600;
              margin: 0 0 20px 0;
            }
            p {
              margin: 0 0 20px 0;
              color: #6b7280;
            }
            .button {
              display: inline-block;
              background-color: #831843;
              color: white;
              text-decoration: none;
              padding: 12px 24px;
              border-radius: 6px;
              font-weight: 500;
              margin: 20px 0;
            }
            .button:hover {
              background-color: #701a75;
            }
            .warning {
              background-color: #fef3c7;
              border: 1px solid #f59e0b;
              border-radius: 6px;
              padding: 16px;
              margin: 20px 0;
            }
            .warning p {
              margin: 0;
              color: #92400e;
              font-size: 14px;
            }
            .footer {
              margin-top: 40px;
              padding-top: 20px;
              border-top: 1px solid #e5e7eb;
              text-align: center;
              color: #9ca3af;
              font-size: 14px;
            }
            .link {
              color: #831843;
              text-decoration: none;
            }
            .link:hover {
              text-decoration: underline;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">
                <svg viewBox="0 0 24 24" fill="none" stroke="#831843" stroke-width="1.5">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
                  <path d="M12 6v12" />
                  <path d="M6 12h12" />
                  <path d="M8.5 8.5l7 7" />
                  <path d="M15.5 8.5l-7 7" />
                  <circle cx="12" cy="12" r="2" fill="#831843" />
                  <circle cx="8.5" cy="8.5" r="1" fill="#831843" />
                  <circle cx="15.5" cy="8.5" r="1" fill="#831843" />
                  <circle cx="8.5" cy="15.5" r="1" fill="#831843" />
                  <circle cx="15.5" cy="15.5" r="1" fill="#831843" />
                </svg>
                <span class="logo-text">ThinkTactAI</span>
              </div>
              <h1>Reset Your Password</h1>
            </div>
            
            <p>Hello${userName ? ` ${userName}` : ''},</p>
            
            <p>We received a request to reset your password for your ThinkTactAI account. Click the button below to create a new password:</p>
            
            <div style="text-align: center;">
              <a href="${resetUrl}" class="button">Reset Password</a>
            </div>
            
            <p>If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>
            
            <div class="warning">
              <p><strong>Security Notice:</strong> This link will expire in 24 hours for your security. If you need more time, please request a new password reset.</p>
            </div>
            
            <p>If the button above doesn't work, you can copy and paste this link into your browser:</p>
            <p><a href="${resetUrl}" class="link">${resetUrl}</a></p>
            
            <div class="footer">
              <p>This email was sent to ${email}</p>
              <p>If you have any questions, please contact our support team.</p>
              <p>&copy; 2024 ThinkTactAI. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    if (error) {
      console.error('Resend error:', error);
      return res.status(500).json({ error: 'Failed to send email' });
    }

    res.status(200).json({ success: true, messageId: data.id });
  } catch (error) {
    console.error('Email send error:', error);
    res.status(500).json({ error: 'Failed to send email' });
  }
} 