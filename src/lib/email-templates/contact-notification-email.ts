export function renderContactNotificationEmail({
  name,
  email,
  subject,
  message,
  receivedAt,
  adminName = "Fadil Bafagih",
  adminEmail = "fadil@bafagih.id",
  adminWebsite = "fadil.bafagih.id",
  instagramUrl = "https://instagram.com/fadilbafagih",
  githubUrl = "https://github.com/fadilbafagih",
  linkedinUrl = "https://linkedin.com/in/fadilbafagih",
  tiktokUrl = "https://tiktok.com/@fadilbafagih",
}: {
  name: string;
  email: string;
  subject: string;
  message: string;
  receivedAt: string;
  adminName?: string;
  adminEmail?: string;
  adminWebsite?: string;
  instagramUrl?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  tiktokUrl?: string;
}): string {
  // Format message lines cleanly, preserving all original enters and line breaks
  const formattedMessage = escapeHtml(String(message || "").trim())
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .split("\n")
    .map((line) => line.trim())
    .join("<br/>");

  const resolvedName = adminName || "Fadil Bafagih";
  const resolvedEmail = adminEmail || "fadil@bafagih.id";
  const resolvedWebsite = adminWebsite || "fadil.bafagih.id";
  const resolvedInstagram = instagramUrl || "https://instagram.com/fadilbafagih";
  const resolvedGithub = githubUrl || "https://github.com/fadilbafagih";
  const resolvedLinkedin = linkedinUrl || "https://linkedin.com/in/fadilbafagih";
  const resolvedTiktok = tiktokUrl || "https://tiktok.com/@fadilbafagih";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light dark">
  <meta name="supported-color-schemes" content="light dark">
  <title>New Message: ${escapeHtml(subject)}</title>
  <style>
    :root, html, body {
      margin: 0;
      padding: 0;
      background-color: transparent !important;
      background: transparent !important;
    }
  </style>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #ededed; -webkit-font-smoothing: antialiased; background-color: transparent;">
  <div style="max-width: 600px; width: 100%; margin: 0 auto; border: 1px solid #282a2e; border-radius: 16px; overflow: hidden; background-color: #121316;">
    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="width: 100%; margin: 0; padding: 0; border-collapse: collapse; background-color: #121316;">
      <!-- Header (Dark Tone - Logo Only) -->
      <tr>
        <td style="padding: 28px 32px; background-color: #121316; border-bottom: 1px solid #232529; text-align: center;">
          <a href="https://${escapeHtml(resolvedWebsite)}" target="_blank" rel="noopener noreferrer" style="display: inline-block; text-decoration: none;">
            <img src="https://fadil.bafagih.id/assets/images/fadilbaf-white.svg" alt="Fadil Bafagih" height="34" style="display: block; margin: 0 auto; height: 34px; width: auto; max-height: 34px; border: 0;" />
          </a>
        </td>
      </tr>

      <!-- Middle Section (Lighter Tone - Details to Message) -->
      <tr>
        <td style="padding: 28px 32px; background-color: #1c1e22;">
          <!-- Sender & Message Details -->
          <table width="100%" border="0" cellspacing="0" cellpadding="0">
            <tr>
              <td style="padding-bottom: 14px;">
                <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.2px; color: #858992;">SUBJECT</span>
                <strong style="display: block; font-size: 15px; color: #ffffff; margin-top: 3px;">${escapeHtml(subject)}</strong>
              </td>
            </tr>
            <tr>
              <td style="padding-bottom: 14px;">
                <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.2px; color: #858992;">FROM</span>
                <strong style="display: block; font-size: 15px; color: #ffffff; margin-top: 3px;">${escapeHtml(name)}</strong>
              </td>
            </tr>
            <tr>
              <td style="padding-bottom: 14px;">
                <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.2px; color: #858992;">EMAIL ADDRESS</span>
                <a href="mailto:${escapeHtml(email)}" style="display: block; font-size: 14px; color: #38bdf8; text-decoration: none; margin-top: 3px;">${escapeHtml(email)}</a>
              </td>
            </tr>
            <tr>
              <td style="padding-bottom: 14px;">
                <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.2px; color: #858992;">RECEIVED AT</span>
                <span style="display: block; font-size: 13px; color: #c4c7cf; margin-top: 3px;">${escapeHtml(receivedAt)}</span>
              </td>
            </tr>
          </table>

          <!-- Message Section -->
          <div>
            <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.2px; color: #858992; display: block; margin-bottom: 8px;">
              MESSAGE
            </span>
            <div style="background-color: #121316; border: 1px solid #282a2e; border-radius: 12px; padding: 18px 20px; color: #e4e4e7; font-size: 14px; line-height: 1.6; word-break: break-word;">${formattedMessage}</div>
          </div>

          <!-- Action Button -->
          <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-top: 26px;">
            <tr>
              <td>
                <a href="mailto:${escapeHtml(email)}?subject=Re:%20${subject.includes("{{") ? subject : encodeURIComponent(subject)}" target="_blank" style="display: inline-block; background-color: #ffffff; color: #09090b; font-weight: 600; font-size: 13px; padding: 11px 22px; border-radius: 8px; text-decoration: none; text-align: center; box-shadow: 0 4px 14px rgba(255,255,255,0.1);">
                  Reply to ${escapeHtml(name)} &rarr;
                </a>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- Footer Upper (Name, Email/Web, Sosmed) -->
      <tr>
        <td style="padding: 28px 32px 20px; background-color: #121316; border-top: 1px solid #232529; text-align: center;">
          <!-- 1. Nama -->
          <p style="margin: 0 0 6px; font-size: 14px; font-weight: 600; color: #ffffff; letter-spacing: 0.2px;">
            ${escapeHtml(resolvedName)}
          </p>

          <!-- 2. Email & Web -->
          <p style="margin: 0 0 12px; font-size: 12px; color: #858992;">
            <a href="mailto:${escapeHtml(resolvedEmail)}" style="color: #38bdf8; text-decoration: none;">${escapeHtml(resolvedEmail)}</a> &bull; <a href="https://${escapeHtml(resolvedWebsite)}" style="color: #a1a1aa; text-decoration: none;">${escapeHtml(resolvedWebsite)}</a>
          </p>

          <!-- 3. Sosmed -->
          <p style="margin: 0; font-size: 12px; color: #71717a;">
            <a href="${escapeHtml(resolvedInstagram)}" target="_blank" rel="noopener noreferrer" style="color: #a1a1aa; text-decoration: none; margin: 0 5px;">Instagram</a> &bull;
            <a href="${escapeHtml(resolvedGithub)}" target="_blank" rel="noopener noreferrer" style="color: #a1a1aa; text-decoration: none; margin: 0 5px;">GitHub</a> &bull;
            <a href="${escapeHtml(resolvedLinkedin)}" target="_blank" rel="noopener noreferrer" style="color: #a1a1aa; text-decoration: none; margin: 0 5px;">LinkedIn</a> &bull;
            <a href="${escapeHtml(resolvedTiktok)}" target="_blank" rel="noopener noreferrer" style="color: #a1a1aa; text-decoration: none; margin: 0 5px;">TikTok</a>
          </p>
        </td>
      </tr>

      <!-- Footer Lower (Sent from - Full Width Divider) -->
      <tr>
        <td style="padding: 14px 32px 18px; background-color: #121316; border-top: 1px solid #1f2126; text-align: center;">
          <p style="margin: 0; font-size: 11px; color: #52525b;">
            Sent from your personal website contact form (<a href="https://${escapeHtml(resolvedWebsite)}" style="color: #71717a; text-decoration: underline;">${escapeHtml(resolvedWebsite)}</a>).
          </p>
        </td>
      </tr>
    </table>
  </div>
</body>
</html>`;
}

function escapeHtml(str: string): string {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
