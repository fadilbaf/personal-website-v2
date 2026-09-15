export function renderContactNotificationEmail({
  name,
  email,
  subject,
  message,
  receivedAt,
}: {
  name: string;
  email: string;
  subject: string;
  message: string;
  receivedAt: string;
}): string {
  const formattedMessage = message.replace(/\n/g, "<br/>");
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Message: ${escapeHtml(subject)}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0c0d0e; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #ededed; -webkit-font-smoothing: antialiased;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #0c0d0e; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 580px; background-color: #141517; border: 1px solid #282a2e; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.5);">
          <!-- Header -->
          <tr>
            <td style="padding: 32px 32px 24px; border-bottom: 1px solid #232529;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <span style="display: inline-block; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #a1a1aa; background-color: #222428; padding: 4px 10px; border-radius: 6px; margin-bottom: 12px;">
                      📬 New Contact Message
                    </span>
                    <h1 style="margin: 0; font-size: 20px; font-weight: 600; color: #ffffff; line-height: 1.3;">
                      ${escapeHtml(subject)}
                    </h1>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Sender Details -->
          <tr>
            <td style="padding: 24px 32px; background-color: #181a1d; border-bottom: 1px solid #232529;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="padding-bottom: 10px;">
                    <span style="font-size: 12px; color: #71717a; text-transform: uppercase; letter-spacing: 0.5px;">From</span><br/>
                    <strong style="font-size: 15px; color: #ffffff;">${escapeHtml(name)}</strong>
                  </td>
                </tr>
                <tr>
                  <td style="padding-bottom: 10px;">
                    <span style="font-size: 12px; color: #71717a; text-transform: uppercase; letter-spacing: 0.5px;">Email Address</span><br/>
                    <a href="mailto:${escapeHtml(email)}" style="font-size: 14px; color: #38bdf8; text-decoration: none;">${escapeHtml(email)}</a>
                  </td>
                </tr>
                <tr>
                  <td>
                    <span style="font-size: 12px; color: #71717a; text-transform: uppercase; letter-spacing: 0.5px;">Received At</span><br/>
                    <span style="font-size: 13px; color: #a1a1aa;">${escapeHtml(receivedAt)}</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Message Body -->
          <tr>
            <td style="padding: 32px;">
              <span style="font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; color: #71717a; display: block; margin-bottom: 12px;">
                Message Content
              </span>
              <div style="background-color: #0c0d0e; border: 1px solid #232529; border-radius: 12px; padding: 20px; color: #e4e4e7; font-size: 14px; line-height: 1.6; white-space: pre-wrap; word-break: break-word;">
                ${formattedMessage}
              </div>

              <!-- Action Button -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-top: 28px;">
                <tr>
                  <td>
                    <a href="mailto:${escapeHtml(email)}?subject=Re:%20${encodeURIComponent(subject)}" style="display: inline-block; background-color: #ffffff; color: #09090b; font-weight: 600; font-size: 13px; padding: 12px 24px; border-radius: 8px; text-decoration: none; text-align: center;">
                      Reply to ${escapeHtml(name)} &rarr;
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 32px; background-color: #0e0f11; border-top: 1px solid #232529; text-align: center;">
              <p style="margin: 0; font-size: 12px; color: #52525b;">
                Sent from your personal website contact form (<a href="https://bafagih.id" style="color: #71717a; text-decoration: underline;">bafagih.id</a>).
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

function escapeHtml(str: string): string {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
