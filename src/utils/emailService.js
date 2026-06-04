import { Resend } from 'resend';

export const sendVerificationEmail = async (email, name, token) => {
  const appUrl = process.env.APP_URL || 'http://localhost:3000';
  const verificationLink = `${appUrl}/api/auth/verify?token=${token}`;
  
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
  const apiKey = process.env.RESEND_API_KEY;
  const subject = 'Verify your Lumina Account';
  const htmlContent = `
    <h3>Hello ${name},</h3>
    <p>Thank you for registering on Lumina LMS!</p>
    <p>Please verify your email address by clicking the link below:</p>
    <p><a href="${verificationLink}" target="_blank">Verify Email Address</a></p>
    <p>Or copy and paste this link in your browser:</p>
    <p>${verificationLink}</p>
    <br/>
    <p>Best regards,</p>
    <p>The Lumina Team</p>
  `;

  let resendInstance = null;
  if (apiKey && apiKey !== 're_YOUR_API_KEY_HERE') {
    resendInstance = new Resend(apiKey);
  }

  if (resendInstance) {
    try {
      await resendInstance.emails.send({
        from: fromEmail,
        to: email,
        subject: subject,
        html: htmlContent,
      });
      console.log(`✉️ Email successfully sent to ${email} via Resend.`);
      return true;
    } catch (error) {
      console.error('❌ Failed to send email via Resend:', error);
      // Fall back to console log if Resend API call fails
    }
  }

  // Fallback / Development logger
  console.log('\n====================================');
  console.log(`✉️ MOCK EMAIL SENT (Resend API Key not configured or failed)`);
  console.log(`To: ${email}`);
  console.log(`Subject: ${subject}`);
  console.log(`Link: ${verificationLink}`);
  console.log(`Verification Token: ${token}`);
  console.log('====================================\n');
  return true;
};
