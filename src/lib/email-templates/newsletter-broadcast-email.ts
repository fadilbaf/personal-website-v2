export function renderNewsletterBroadcastEmail({
  subject,
  contentHtml,
  type = "general",
  recipientEmail,
}: {
  subject: string;
  contentHtml: string;
  type?: "general" | "blog" | "project" | "achievement";
  recipientEmail: string;
}): string {
  const typeBadgeMap: Record<string, string> = {
    general: "📰 Newsletter Update",
    blog: "✍️ New Blog Post",
    project: "🚀 New Project Launch",
    achievement: "🏆 New Achievement",
  };

  const badgeText = typeBadgeMap[type] || "📰 Newsletter Update";

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
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #141517; border: 1px solid #282a2e; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.5);">
          <!-- Header -->
          <tr>
            <td style="padding: 36px 32px 24px; border-bottom: 1px solid #232529;">
              <span style="display: inline-block; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #38bdf8; background-color: #0c2d48; padding: 4px 10px; border-radius: 6px; margin-bottom: 12px;">
                ${badgeText}
              </span>
              <h1 style="margin: 0; font-size: 24px; font-weight: 600; color: #ffffff; line-height: 1.3;">
                ${escapeHtml(subject)}
              </h1>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 32px; font-size: 15px; line-height: 1.7; color: #d4d4d8;">
              <div style="word-break: break-word;">
                ${contentHtml}
              </div>

              <!-- Signature -->
              <div style="margin-top: 36px; padding-top: 20px; border-top: 1px solid #232529;">
                <p style="margin: 0; font-size: 14px; color: #a1a1aa;">
                  Warm regards,<br/>
                  <strong style="color: #ffffff; font-size: 15px;">Fadil Bafagih</strong><br/>
                  <a href="https://bafagih.id" style="color: #38bdf8; text-decoration: none; font-size: 13px;">bafagih.id</a>
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 32px; background-color: #0e0f11; border-top: 1px solid #232529; text-align: center;">
              <p style="margin: 0 0 8px; font-size: 12px; color: #52525b;">
                You are receiving this email because you subscribed to Fadil Bafagih's newsletter.
              </p>
              <p style="margin: 0; font-size: 12px; color: #52525b;">
                <a href="https://bafagih.id/api/newsletter/unsubscribe?email=${encodeURIComponent(recipientEmail)}" style="color: #71717a; text-decoration: underline;">
                  Unsubscribe
                </a>
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
