import nodemailer from 'nodemailer';

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export const sendEmail = async ({ to, subject, html, text }: SendEmailOptions) => {
  // Check if SMTP credentials are provided and not placeholders
  const isConfigured = 
    process.env.SMTP_USER && 
    process.env.SMTP_USER !== 'your-email@gmail.com' &&
    process.env.SMTP_PASS && 
    process.env.SMTP_PASS !== 'your-app-password';

  if (!isConfigured) {
    console.log('\n--- 📧 [MOCK EMAIL] ---');
    console.log(`To:      ${to}`);
    console.log(`Subject: ${subject}`);
    console.log('--- Content Preview ---');
    // Strip HTML for a cleaner console view, or just show the first bit
    console.log(text || html.replace(/<[^>]*>?/gm, '').substring(0, 200) + '...');
    console.log('-----------------------\n');
    return { messageId: 'mock-id-' + Date.now(), isMock: true };
  }

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_PORT === '465',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || '"Apartment Management" <no-reply@example.com>',
      to,
      subject,
      text: text || html.replace(/<[^>]*>?/gm, ''),
      html,
    });

    console.log('✅ Email sent successfully: %s', info.messageId);
    return info;
  } catch (error) {
    console.error('❌ Error sending real email, falling back to console log:');
    console.log('\n--- 📧 [FALLBACK EMAIL LOG] ---');
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(html);
    console.log('-------------------------------\n');
    return { messageId: 'fallback-id-' + Date.now(), error };
  }
};
