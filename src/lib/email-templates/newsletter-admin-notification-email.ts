export function renderNewsletterAdminNotificationEmail({
  email,
  totalSubscribers,
  subscribedAt,
}: {
  email: string;
  totalSubscribers: number;
  subscribedAt: string;
}): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Newsletter Subscriber</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0c0d0e; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #ededed; -webkit-font-smoothing: antialiased;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #0c0d0e; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 580px; background-color: #141517; border: 1px solid #282a2e; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.5);">
          <!-- Header -->
          <tr>
            <td style="padding: 32px 32px 24px; border-bottom: 1px solid #232529;">
              <span style="display: inline-block; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #34d399; background-color: #064e3b; padding: 4px 10px; border-radius: 6px; margin-bottom: 12px;">
                🎉 New Subscriber
              </span>
              <h1 style="margin: 0; font-size: 20px; font-weight: 600; color: #ffffff; line-height: 1.3;">
                Someone just subscribed to your newsletter!
              </h1>
            </td>
          </tr>

          <!-- Details -->
          <tr>
            <td style="padding: 28px 32px;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="padding-bottom: 14px;">
                    <span style="font-size: 12px; color: #71717a; text-transform: uppercase; letter-spacing: 0.5px;">Subscriber Email</span><br/>
                    <strong style="font-size: 16px; color: #ffffff;">${escapeHtml(email)}</strong>
                  </td>
                </tr>
                <tr>
                  <td style="padding-bottom: 14px;">
                    <span style="font-size: 12px; color: #71717a; text-transform: uppercase; letter-spacing: 0.5px;">Date Subscribed</span><br/>
                    <span style="font-size: 14px; color: #d4d4d8;">${escapeHtml(subscribedAt)}</span>
                  </td>
                </tr>
                <tr>
                  <td>
                    <span style="font-size: 12px; color: #71717a; text-transform: uppercase; letter-spacing: 0.5px;">Total Active Subscribers</span><br/>
                    <strong style="font-size: 18px; color: #38bdf8;">${totalSubscribers}</strong>
                  </td>
                </tr>
              </table>

              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-top: 28px;">
                <tr>
                  <td>
                    <a href="https://bafagih.id/dashboard/newsletter" style="display: inline-block; background-color: #ffffff; color: #09090b; font-weight: 600; font-size: 13px; padding: 12px 24px; border-radius: 8px; text-decoration: none;">
                      Open Newsletter Dashboard &rarr;
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 16px 32px; background-color: #0e0f11; border-top: 1px solid #232529; text-align: center;">
              <p style="margin: 0; font-size: 12px; color: #52525b;">
                Sent automatically by your website backend (<a href="https://bafagih.id" style="color: #71717a; text-decoration: underline;">bafagih.id</a>).
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
