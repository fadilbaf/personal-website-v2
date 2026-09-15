export function renderContactReplyEmail({
  recipientName,
  subject,
  replyMessage,
  originalMessage,
  originalSubject,
}: {
  recipientName: string;
  subject: string;
  replyMessage: string;
  originalMessage?: string;
  originalSubject?: string;
}): string {
  const formattedReply = replyMessage.replace(/\n/g, "<br/>");
  const formattedOriginal = originalMessage ? originalMessage.replace(/\n/g, "<br/>") : "";

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(subject)}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0c0d0e; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #ededed; -webkit-font-smoothing: antialiased;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #0c0d0e; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 580px; background-color: #141517; border: 1px solid #282a2e; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.5);">
          <!-- Header -->
          <tr>
            <td style="padding: 32px 32px 20px; border-bottom: 1px solid #232529;">
              <span style="display: inline-block; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #a1a1aa; background-color: #222428; padding: 4px 10px; border-radius: 6px; margin-bottom: 12px;">
                Fadil Bafagih
              </span>
              <h1 style="margin: 0; font-size: 20px; font-weight: 600; color: #ffffff; line-height: 1.3;">
                ${escapeHtml(subject)}
              </h1>
            </td>
          </tr>

          <!-- Reply Body -->
          <tr>
            <td style="padding: 32px;">
              <p style="margin: 0 0 16px; font-size: 15px; color: #ffffff;">
                Hi ${escapeHtml(recipientName)},
              </p>
              
              <div style="font-size: 14.5px; color: #e4e4e7; line-height: 1.7; word-break: break-word;">
                ${formattedReply}
              </div>

              <div style="margin-top: 32px; padding-top: 20px; border-top: 1px solid #232529;">
                <p style="margin: 0; font-size: 14px; color: #a1a1aa;">
                  Best regards,<br/>
                  <strong style="color: #ffffff; font-size: 15px;">Fadil Bafagih</strong><br/>
                  <a href="mailto:fadil@bafagih.id" style="color: #38bdf8; text-decoration: none; font-size: 13px;">fadil@bafagih.id</a> &bull; <a href="https://bafagih.id" style="color: #a1a1aa; text-decoration: none; font-size: 13px;">bafagih.id</a>
                </p>
              </div>

              ${
                originalMessage
                  ? `
              <!-- Quoted Previous Message -->
              <div style="margin-top: 28px; padding: 16px; background-color: #0d0e10; border-left: 2px solid #3f3f46; border-radius: 4px;">
                <span style="display: block; font-size: 11px; color: #71717a; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">
                  Original Message (${escapeHtml(originalSubject || "Inquiry")}):
                </span>
                <div style="font-size: 13px; color: #a1a1aa; line-height: 1.5;">
                  ${formattedOriginal}
                </div>
              </div>
              `
                  : ""
              }
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 16px 32px; background-color: #0e0f11; border-top: 1px solid #232529; text-align: center;">
              <p style="margin: 0; font-size: 12px; color: #52525b;">
                You can reply directly to this email to continue the conversation.
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
