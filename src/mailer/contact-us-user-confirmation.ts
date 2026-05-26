import { CreateContactUsDto } from '../contact-us/dto/create-contact-us.dto';

const toTitleCase = (value: string | null | undefined): string => {
  if (!value) return '';
  return value
    .split(' ')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
};

const formatEnum = (value: string | null | undefined): string => {
  if (!value) return '';
  return value.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
};

export const contactUsUserConfirmationTemplate = (
  submissionData: CreateContactUsDto,
  submissionId: string,
): string => {
  const fullName = toTitleCase(submissionData.fullName);
  const companyName = toTitleCase(submissionData.companyName);
  const subject = formatEnum(String(submissionData.subject));
  const budget = formatEnum(String(submissionData.proposedBudget));
  const timeline = formatEnum(String(submissionData.projectTimeline));

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>We Received Your Message</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Helvetica Neue', Arial, 'Noto Sans', 'Apple Color Emoji', 'Segoe UI Emoji', sans-serif; background:#f5f7fb; color:#223; margin:0; }
    .wrapper { max-width: 640px; margin:0 auto; padding:24px; }
    .card { background:#fff; border-radius:12px; overflow:hidden; box-shadow:0 6px 24px rgba(16,24,40,.06), 0 2px 8px rgba(16,24,40,.04); }
    .header { background: linear-gradient(135deg, #4f46e5, #7c3aed); color:#fff; padding:28px 24px; }
    .header h1 { margin:0 0 6px; font-size:22px; font-weight:700; }
    .header p { margin:0; opacity:.9; font-size:14px; }
    .content { padding:24px; }
    .greeting { font-size:16px; margin:0 0 12px; }
    .lead { font-size:14px; color:#475467; margin:0 0 20px; }
    .panel { background:#f8fafc; border:1px solid #eef2f7; border-radius:10px; padding:16px; }
    .row { display:flex; gap:12px; padding:10px 0; border-bottom:1px solid #eef2f7; align-items:flex-start; }
    .row:last-child { border-bottom:none; }
    .label { min-width:130px; color:#475467; font-weight:600; }
    .value { color:#101828; }
    .details { margin-top:16px; background:#f1f5ff; border-left:4px solid #4f46e5; padding:14px 16px; border-radius:8px; }
    .details h4 { margin:0 0 8px; font-size:14px; color:#344054; }
    .details p { margin:0; font-size:14px; color:#111827; line-height:1.6; }
    .actions { text-align:center; margin-top:24px; }
    .btn { display:inline-block; background:#4f46e5; color:#fff !important; text-decoration:none; padding:12px 18px; border-radius:10px; font-weight:600; font-size:14px; }
    .muted { color:#667085; font-size:12px; }
    .footer { padding:18px 24px; background:#fafafa; text-align:center; border-top:1px solid #f0f2f5; }
    .small { font-size:12px; color:#98a2b3; margin-top:6px; }
    .mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace; background:#eef2ff; padding:4px 8px; border-radius:6px; font-size:12px; color:#3730a3; }
  </style>
  </head>
  <body>
    <div class="wrapper">
      <div class="card">
        <div class="header">
          <h1>Thank You, ${fullName || 'There'}!</h1>
          <p>We’ve received your message and our team will get back to you shortly.</p>
        </div>
        <div class="content">
          <p class="greeting">Hello${fullName ? ' ' + fullName : ''},</p>
          <p class="lead">Thanks for contacting Best Technologies Limited. A member of our team will review your inquiry and respond within 1–2 business days. Below is a summary of what you sent.</p>

          <div class="panel">
            <div class="row"><div class="label">Subject</div><div class="value">${subject}</div></div>
            <div class="row"><div class="label">Email</div><div class="value">${submissionData.email}</div></div>
            ${companyName ? `<div class="row"><div class="label">Company</div><div class="value">${companyName}</div></div>` : ''}
            <div class="row"><div class="label">Phone</div><div class="value">${submissionData.phoneNumber}</div></div>
            <div class="row"><div class="label">Budget</div><div class="value">${budget}</div></div>
            <div class="row"><div class="label">Timeline</div><div class="value">${timeline}</div></div>
          </div>

          <div class="details">
            <h4>Project details</h4>
            <p>${submissionData.projectDetails}</p>
          </div>

          <div class="actions">
            <a class="btn" href="#" target="_blank">Visit Our Website</a>
          </div>

          <p class="muted" style="margin-top:18px;">Your reference ID is <span class="mono">${submissionId}</span>. Keep this for future correspondence.</p>
        </div>
        <div class="footer">
          <div>Best Technologies Limited</div>
          <div class="small">This is an automated confirmation. Please do not reply to this email.</div>
        </div>
      </div>
    </div>
  </body>
  </html>`;
};
