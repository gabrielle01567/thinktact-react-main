# Email Service Setup for Password Reset

This guide explains how to set up Resend email service for sending password reset emails in your ThinkTactAI application.

## Prerequisites

1. A Resend account (free tier available)
2. Your project deployed on Vercel
3. Domain verification (optional but recommended)

## Setup Steps

### 1. Create a Resend Account

1. Go to [resend.com](https://resend.com)
2. Sign up for a free account
3. Verify your email address

### 2. Get Your API Key

1. In your Resend dashboard, go to "API Keys"
2. Click "Create API Key"
3. Give it a name (e.g., "ThinkTactAI Password Reset")
4. Copy the API key (starts with `re_`)

### 3. Add Environment Variable to Vercel

1. Go to your Vercel dashboard
2. Navigate to your project
3. Go to "Settings" → "Environment Variables"
4. Add a new variable:
   - **Name**: `RESEND_API_KEY`
   - **Value**: Your Resend API key from step 2
   - **Environment**: Production, Preview, and Development
5. Click "Save"

### 4. Configure Sending Domain (Optional but Recommended)

For production use, you should verify your domain:

1. In Resend dashboard, go to "Domains"
2. Click "Add Domain"
3. Enter your domain (e.g., `thinktact.ai`)
4. Follow the DNS verification steps
5. Update the `from` email in `/api/email/send-reset.js` to use your verified domain

### 5. Test the Email Service

1. Deploy your changes to Vercel
2. Test the password reset flow:
   - Go to `/forgot-password`
   - Enter a registered email
   - Answer the security question
   - Check if the email is received

## Email Template Features

The password reset email includes:

- **Branded Design**: ThinkTactAI logo and styling
- **Security Notice**: 24-hour expiration warning
- **Clear Call-to-Action**: Prominent reset button
- **Fallback Link**: Text link in case button doesn't work
- **Responsive Design**: Works on mobile and desktop

## Configuration Options

### Customizing the Email Template

You can modify the email template in `/api/email/send-reset.js`:

- **From Address**: Change `noreply@thinktact.ai` to your verified domain
- **Subject Line**: Modify the email subject
- **Styling**: Update the CSS in the HTML template
- **Content**: Customize the email text and branding

### Environment-Specific Settings

For different environments, you can:

1. **Development**: Use Resend's sandbox domain for testing
2. **Staging**: Use a test domain
3. **Production**: Use your verified domain

## Troubleshooting

### Common Issues

1. **"Failed to send email" error**:
   - Check if `RESEND_API_KEY` is set correctly
   - Verify the API key is valid in Resend dashboard
   - Check Vercel function logs for detailed errors

2. **Emails not received**:
   - Check spam/junk folder
   - Verify the recipient email is correct
   - Check Resend dashboard for delivery status

3. **Domain verification issues**:
   - Ensure DNS records are set correctly
   - Wait for DNS propagation (can take up to 24 hours)
   - Check Resend dashboard for verification status

### Debug Mode

To enable debug logging, add this to your environment variables:
- **Name**: `DEBUG_EMAIL`
- **Value**: `true`

This will log additional information about email operations.

## Security Considerations

1. **API Key Security**: Never commit API keys to version control
2. **Rate Limiting**: Resend has rate limits (check their documentation)
3. **Domain Verification**: Use verified domains for production
4. **Email Validation**: Validate email addresses before sending

## Alternative Email Services

If you prefer a different email service, you can replace Resend with:

- **SendGrid**: Popular email service with good free tier
- **Mailgun**: Developer-friendly email API
- **AWS SES**: Cost-effective for high volume
- **Postmark**: Great for transactional emails

To switch services, update the `/api/email/send-reset.js` file with the new service's SDK and API calls.

## Monitoring and Analytics

Resend provides:

- **Delivery Reports**: Track email delivery status
- **Open Rates**: Monitor email engagement
- **Bounce Management**: Handle failed deliveries
- **Webhook Support**: Real-time delivery notifications

## Cost Considerations

- **Resend Free Tier**: 3,000 emails/month
- **Paid Plans**: Start at $20/month for 50,000 emails
- **Volume Discounts**: Available for high-volume senders

## Support

If you encounter issues:

1. Check Resend's [documentation](https://resend.com/docs)
2. Review Vercel function logs
3. Test with Resend's sandbox domain first
4. Contact Resend support if needed

## Next Steps

After setup:

1. Test the complete password reset flow
2. Monitor email delivery rates
3. Consider setting up webhooks for delivery tracking
4. Implement email templates for other notifications (welcome, etc.) 