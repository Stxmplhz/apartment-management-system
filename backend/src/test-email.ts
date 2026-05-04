import { sendEmail } from './lib/email';

async function test() {
  console.log('🧪 Starting Email Service Test...');
  
  // Get the recipient from environment or use a placeholder
  const recipient = process.env.SMTP_USER || 'test@example.com';
  
  console.log(`📡 Attempting to send test email to: ${recipient}`);
  console.log(`⚙️ Config: Host=${process.env.SMTP_HOST}, Port=${process.env.SMTP_PORT}, User=${process.env.SMTP_USER}`);

  try {
    const info = await sendEmail({
      to: recipient,
      subject: 'Test Email - Apartment Management System',
      html: `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
          <h1 style="color: #10b981;">✅ SMTP Connection Successful</h1>
          <p>This is a test email from your <strong>Apartment Management System</strong>.</p>
          <p>If you received this, it means your Nodemailer configuration is working perfectly!</p>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
          <p style="font-size: 12px; color: #64748b;">Timestamp: ${new Date().toLocaleString()}</p>
        </div>
      `,
    });
    
    console.log('\n✨ SUCCESS! ✨');
    console.log('-----------------------------------');
    console.log('Message ID:', info.messageId);
    console.log('Preview URL:', info.testMessageUrl || 'N/A (Only available for Ethereal accounts)');
    console.log('-----------------------------------');
    console.log('Check your inbox at:', recipient);
  } catch (error: any) {
    console.log('\n❌ FAILED ❌');
    console.log('-----------------------------------');
    console.error('Error details:', error.message);
    if (error.code === 'EAUTH') {
      console.error('Hint: Authentication failed. Check your SMTP_USER and SMTP_PASS (App Password).');
    } else if (error.code === 'ESOCKET') {
      console.error('Hint: Could not connect to host. Check your SMTP_HOST and SMTP_PORT.');
    }
    console.log('-----------------------------------');
  }
}

test();
