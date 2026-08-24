import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = 'Society Maintenance <onboarding@resend.dev>'; // Resend test sender

/**
 * Send email when complaint status or priority changes
 */
export async function sendComplaintStatusEmail({
  residentEmail,
  residentName,
  complaintId,
  category,
  oldStatus,
  newStatus,
  newPriority,
  note,
}) {
  if (!process.env.RESEND_API_KEY || !residentEmail) {
    console.log('[Email Skipped] Resend key or recipient missing');
    return { success: false, error: 'Email configuration missing' };
  }

  const subject = `[Update] Complaint #${complaintId.slice(0, 8)}: Status changed to ${newStatus?.toUpperCase()}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f0ece4; padding: 24px; border-radius: 12px; color: #1a1a1a;">
      <div style="background-color: #ffffff; padding: 24px; border-radius: 8px; border: 1px solid #d1cdc5;">
        <h2 style="margin-top: 0; color: #1a1a1a;">Complaint Status Update</h2>
        <p>Hello <strong>${residentName}</strong>,</p>
        <p>Your maintenance complaint regarding <strong>${category?.replace('_', ' ')}</strong> has been updated by society administration.</p>
        
        <div style="background-color: #f7f5f0; padding: 16px; border-radius: 6px; margin: 16px 0; border: 1px solid #e2dfd8;">
          <p style="margin: 4px 0;"><strong>Complaint ID:</strong> ${complaintId}</p>
          <p style="margin: 4px 0;"><strong>Previous Status:</strong> ${oldStatus || 'N/A'}</p>
          <p style="margin: 4px 0;"><strong>Current Status:</strong> <span style="text-transform: uppercase; color: #4a7bbd; font-weight: bold;">${newStatus}</span></p>
          ${newPriority ? `<p style="margin: 4px 0;"><strong>Priority:</strong> ${newPriority.toUpperCase()}</p>` : ''}
          ${note ? `<p style="margin: 8px 0 0 0; font-style: italic; color: #4a4a4a;">"Admin Note: ${note}"</p>` : ''}
        </div>

        <p>You can view the full progress history in your resident dashboard.</p>
        <p style="margin-bottom: 0; color: #8a8a8a; font-size: 12px;">Society Maintenance Tracker</p>
      </div>
    </div>
  `;

  try {
    const data = await resend.emails.send({
      from: FROM_EMAIL,
      to: [residentEmail],
      subject,
      html,
    });
    console.log('[Email Sent]', data);
    return { success: true, data };
  } catch (error) {
    console.error('[Email Error]', error);
    return { success: false, error: error.message };
  }
}

/**
 * Send email notification for important notices
 */
export async function sendImportantNoticeEmail({
  recipients, // array of emails
  noticeTitle,
  noticeContent,
}) {
  if (!process.env.RESEND_API_KEY || !recipients || recipients.length === 0) {
    console.log('[Email Skipped] Resend key or recipients missing');
    return { success: false, error: 'Email configuration missing' };
  }

  const subject = `[Important Notice] ${noticeTitle}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f0ece4; padding: 24px; border-radius: 12px; color: #1a1a1a;">
      <div style="background-color: #ffffff; padding: 24px; border-radius: 8px; border: 1px solid #d1cdc5;">
        <span style="background-color: #c75c5c; color: #ffffff; font-size: 11px; padding: 4px 8px; border-radius: 4px; font-weight: bold; text-transform: uppercase;">Important Notice</span>
        <h2 style="margin-top: 12px; color: #1a1a1a;">${noticeTitle}</h2>
        
        <div style="background-color: #f7f5f0; padding: 16px; border-radius: 6px; margin: 16px 0; border: 1px solid #e2dfd8; white-space: pre-wrap;">
          ${noticeContent}
        </div>

        <p style="margin-bottom: 0; color: #8a8a8a; font-size: 12px;">Posted by Society Management</p>
      </div>
    </div>
  `;

  try {
    const data = await resend.emails.send({
      from: FROM_EMAIL,
      to: recipients,
      subject,
      html,
    });
    console.log('[Notice Emails Sent]', data);
    return { success: true, data };
  } catch (error) {
    console.error('[Notice Email Error]', error);
    return { success: false, error: error.message };
  }
}
