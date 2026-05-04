const emailLayout = (content: string) => `
  <div style="background-color: #f8fafc; padding: 40px 20px; font-family: 'Lexend', 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #0f172a; line-height: 1.6;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); border: 1px solid #e2e8f0;">
      <!-- Header Area -->
      <div style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); padding: 32px; text-align: center;">
        <!-- Centered Icon Container (No Flex for compatibility) -->
        <div style="background-color: rgba(255, 255, 255, 0.2); width: 64px; height: 64px; line-height: 64px; border-radius: 12px; margin: 0 auto 16px auto; text-align: center;">
          <span style="font-size: 32px; vertical-align: middle;">🏢</span>
        </div>
        <h2 style="color: #ffffff; margin: 0; font-size: 20px; font-weight: 600; letter-spacing: -0.025em; font-family: sans-serif;">NEST ADMIN</h2>
        <p style="color: rgba(255, 255, 255, 0.8); margin: 4px 0 0 0; font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; font-family: sans-serif;">Apartment Management System</p>
      </div>

      <!-- Main Content -->
      <div style="padding: 40px 32px;">
        ${content}
      </div>

      <!-- Footer Area -->
      <div style="padding: 24px 32px; background-color: #f1f5f9; border-top: 1px solid #e2e8f0; text-align: center;">
        <p style="margin: 0; color: #64748b; font-size: 12px; font-family: sans-serif;">
          &copy; ${new Date().getFullYear()} NestAdmin. All rights reserved.
        </p>
        <p style="margin: 8px 0 0 0; color: #94a3b8; font-size: 11px; font-family: sans-serif;">
          This is an automated notification. Please do not reply to this email.
        </p>
      </div>
    </div>
  </div>
`;

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

export const welcomeEmailTemplate = (data: {
  tenantName: string;
  roomNumber: string;
  email: string;
  tempPassword: string;
}) => emailLayout(`
  <h1 style="font-size: 24px; font-weight: 700; color: #0f172a; margin-top: 0; margin-bottom: 16px; font-family: sans-serif;">Welcome Home, ${data.tenantName}!</h1>
  <p style="font-size: 16px; color: #475569; margin-bottom: 24px;">Your move-in for <strong>Room ${data.roomNumber}</strong> has been successfully processed. We're thrilled to have you with us!</p>
  
  <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; margin-bottom: 32px;">
    <h3 style="margin-top: 0; margin-bottom: 16px; font-size: 14px; color: #3b82f6; text-transform: uppercase; letter-spacing: 0.05em; font-family: sans-serif;">Access Your Portal</h3>
    
    <div style="margin-bottom: 12px;">
      <span style="color: #64748b; font-size: 13px;">Email Address</span>
      <div style="font-weight: 600; color: #0f172a; font-size: 15px;">${data.email}</div>
    </div>
    
    <div>
      <span style="color: #64748b; font-size: 13px;">Temporary Password</span>
      <br/>
      <div style="font-family: 'Courier New', Courier, monospace; font-weight: 700; color: #2563eb; font-size: 18px; background: #eff6ff; padding: 8px 12px; border-radius: 6px; display: inline-block; margin-top: 4px; border: 1px dashed #bfdbfe;">
        ${data.tempPassword}
      </div>
    </div>
  </div>

  <div style="text-align: center;">
    <a href="${FRONTEND_URL}/login" style="background-color: #3b82f6; color: #ffffff; padding: 14px 32px; border-radius: 10px; text-decoration: none; font-weight: 600; font-size: 15px; display: inline-block; box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.3); font-family: sans-serif;">Login to Tenant Portal</a>
  </div>
  
  <p style="font-size: 13px; color: #94a3b8; text-align: center; margin-top: 24px; font-family: sans-serif;">
    * For security, please change your password immediately after your first login.
  </p>
`);

export const invoiceEmailTemplate = (data: {
  tenantName: string;
  roomNumber: string;
  month: string;
  totalAmount: number;
  dueDate: string;
}) => emailLayout(`
  <div style="display: inline-block; background-color: #fee2e2; color: #ef4444; font-size: 11px; font-weight: 700; padding: 4px 12px; border-radius: 20px; margin-bottom: 12px; font-family: sans-serif;">UNPAID INVOICE</div>
  <h1 style="font-size: 24px; font-weight: 700; color: #0f172a; margin-top: 0; margin-bottom: 16px; font-family: sans-serif;">Invoice for ${data.month}</h1>
  <p style="font-size: 15px; color: #475569; margin-bottom: 24px;">Hi ${data.tenantName}, your billing statement for <strong>Room ${data.roomNumber}</strong> is now available.</p>
  
  <div style="background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; margin-bottom: 32px; overflow: hidden;">
    <div style="padding: 20px; border-bottom: 1px solid #f1f5f9;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="font-size: 13px; color: #64748b; font-family: sans-serif;">Total Amount Due</td>
          <td style="font-size: 13px; color: #64748b; text-align: right; font-family: sans-serif;">Due Date</td>
        </tr>
        <tr>
          <td style="font-size: 24px; font-weight: 700; color: #2563eb; font-family: sans-serif;">฿${data.totalAmount.toLocaleString()}</td>
          <td style="font-size: 15px; font-weight: 600; color: #0f172a; text-align: right; font-family: sans-serif;">${data.dueDate}</td>
        </tr>
      </table>
    </div>
    <div style="padding: 16px 20px; background-color: #f8fafc;">
      <p style="margin: 0; font-size: 12px; color: #64748b; text-align: center; font-family: sans-serif;">Please pay before the due date to avoid any late fees.</p>
    </div>
  </div>

  <div style="text-align: center;">
    <a href="${FRONTEND_URL}/my-invoices" style="background-color: #3b82f6; color: #ffffff; padding: 14px 32px; border-radius: 10px; text-decoration: none; font-weight: 600; font-size: 15px; display: inline-block; font-family: sans-serif;">View Details & Pay</a>
  </div>
`);

export const paymentVerifiedTemplate = (data: {
  tenantName: string;
  invoiceNumber: string;
  amount: number;
  status: 'PAID' | 'REJECTED';
  reason?: string;
}) => emailLayout(`
  <div style="text-align: center; margin-bottom: 24px;">
    <!-- Status Icon Wrapper -->
    <div style="background-color: ${data.status === 'PAID' ? '#dcfce7' : '#fee2e2'}; width: 48px; height: 48px; line-height: 48px; border-radius: 50%; margin: 0 auto 16px auto; text-align: center;">
      <span style="font-size: 24px; vertical-align: middle;">${data.status === 'PAID' ? '✅' : '❌'}</span>
    </div>
    <h1 style="font-size: 22px; font-weight: 700; color: #0f172a; margin: 0; font-family: sans-serif;">Payment ${data.status === 'PAID' ? 'Confirmed' : 'Declined'}</h1>
  </div>
  
  <p style="font-size: 15px; color: #475569; text-align: center; margin-bottom: 24px;">
    Hi ${data.tenantName}, your payment for invoice <strong>${data.invoiceNumber}</strong> has been processed.
  </p>
  
  <div style="background-color: #f8fafc; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
    <table style="width: 100%; border-collapse: collapse;">
      <tr>
        <td style="padding: 8px 0; color: #64748b; font-size: 14px; font-family: sans-serif;">Amount Processed</td>
        <td style="padding: 8px 0; text-align: right; font-weight: 700; color: #0f172a; font-size: 16px; font-family: sans-serif;">฿${data.amount.toLocaleString()}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; color: #64748b; font-size: 14px; font-family: sans-serif;">Verification Result</td>
        <td style="padding: 8px 0; text-align: right; font-weight: 700; color: ${data.status === 'PAID' ? '#10b981' : '#ef4444'}; font-size: 14px; text-transform: uppercase; font-family: sans-serif;">
          ${data.status === 'PAID' ? 'SUCCESS' : 'REJECTED'}
        </td>
      </tr>
      ${data.reason ? `
      <tr>
        <td style="padding: 16px 0 0 0; color: #64748b; font-size: 13px;" colspan="2">
          <div style="background: #ffffff; padding: 12px; border-radius: 8px; border: 1px solid #e2e8f0; color: #ef4444; font-family: sans-serif;">
            <strong>Reason:</strong> ${data.reason}
          </div>
        </td>
      </tr>
      ` : ''}
    </table>
  </div>

  ${data.status === 'REJECTED' ? `
    <p style="font-size: 14px; color: #64748b; text-align: center; font-family: sans-serif;">Please log in to your portal to re-upload the correct payment slip.</p>
  ` : ''}
`);

export const maintenanceUpdateTemplate = (data: {
  tenantName: string;
  requestId: string;
  status: string;
  description: string;
  technicianName?: string;
  adminNotes?: string;
}) => emailLayout(`
  <div style="display: inline-block; background-color: #eff6ff; color: #3b82f6; font-size: 11px; font-weight: 700; padding: 4px 12px; border-radius: 20px; margin-bottom: 12px; font-family: sans-serif;">MAINTENANCE UPDATE</div>
  <h1 style="font-size: 24px; font-weight: 700; color: #0f172a; margin-top: 0; margin-bottom: 16px; font-family: sans-serif;">Request #${data.requestId}</h1>
  
  <div style="background-color: #f8fafc; border-left: 4px solid #3b82f6; padding: 16px; margin-bottom: 24px;">
    <p style="margin: 0; font-size: 14px; color: #475569; font-style: italic;">"${data.description}"</p>
  </div>
  
  <div style="background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; margin-bottom: 32px;">
    <table style="width: 100%; border-collapse: collapse;">
      <tr>
        <td style="padding: 8px 0; color: #64748b; font-size: 14px; font-family: sans-serif;">Current Status</td>
        <td style="padding: 8px 0; text-align: right; font-weight: 700; color: #3b82f6; font-size: 14px; font-family: sans-serif;">${data.status}</td>
      </tr>
      ${data.technicianName ? `
      <tr>
        <td style="padding: 8px 0; color: #64748b; font-size: 14px; font-family: sans-serif;">Technician</td>
        <td style="padding: 8px 0; text-align: right; font-weight: 600; color: #0f172a; font-family: sans-serif;">${data.technicianName}</td>
      </tr>
      ` : ''}
    </table>
    
    ${data.adminNotes ? `
    <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid #f1f5f9;">
      <span style="font-size: 12px; font-weight: 600; color: #64748b; font-family: sans-serif;">Note from Management:</span>
      <p style="margin: 4px 0 0 0; font-size: 14px; color: #475569; font-family: sans-serif;">${data.adminNotes}</p>
    </div>
    ` : ''}
  </div>

  <div style="text-align: center;">
    <a href="${FRONTEND_URL}/my-maintenance" style="background-color: #3b82f6; color: #ffffff; padding: 14px 32px; border-radius: 10px; text-decoration: none; font-weight: 600; font-size: 15px; display: inline-block; font-family: sans-serif;">Track Progress</a>
  </div>
`);
