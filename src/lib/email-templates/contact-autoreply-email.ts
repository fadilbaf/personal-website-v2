export function renderContactAutoReplyEmail({
  name,
  subject,
  locale = "en",
  adminName = "Fadil Bafagih",
  adminEmail = "fadil@bafagih.id",
  adminWebsite = "fadil.bafagih.id",
  instagramUrl = "https://instagram.com/fadilbafagih",
  githubUrl = "https://github.com/fadilbafagih",
  linkedinUrl = "https://linkedin.com/in/fadilbafagih",
  tiktokUrl = "https://tiktok.com/@fadilbafagih",
}: {
  name: string;
  subject: string;
  locale?: string;
  adminName?: string;
  adminEmail?: string;
  adminWebsite?: string;
  instagramUrl?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  tiktokUrl?: string;
}): string {
  const isId = locale === "id";

  const resolvedName = adminName || "Fadil Bafagih";
  const resolvedEmail = adminEmail || "fadil@bafagih.id";
  const resolvedWebsite = adminWebsite || "fadil.bafagih.id";
  const resolvedInstagram = instagramUrl || "https://instagram.com/fadilbafagih";
  const resolvedGithub = githubUrl || "https://github.com/fadilbafagih";
  const resolvedLinkedin = linkedinUrl || "https://linkedin.com/in/fadilbafagih";
  const resolvedTiktok = tiktokUrl || "https://tiktok.com/@fadilbafagih";

  const title = isId
    ? "Pesan Anda telah kami terima"
    : "Thank you for reaching out!";

  const greeting = isId
    ? `Halo, ${escapeHtml(name)}!`
    : `Hi ${escapeHtml(name)},`;

  const paragraph1 = isId
    ? `Terima kasih telah menghubungi saya melalui formulir kontak website. Pesan Anda mengenai <strong>"${escapeHtml(subject)}"</strong> telah berhasil diterima.`
    : `Thank you for getting in touch through my website contact form. Your message regarding <strong>"${escapeHtml(subject)}"</strong> has been safely received.`;

  const paragraph2 = isId
    ? `Saya akan meninjau pesan Anda dan merespons secepat mungkin (biasanya dalam 1-2 hari kerja).`
    : `I will review your message and get back to you as soon as possible (usually within 1-2 business days).`;

  const footnote = isId
    ? `Ini adalah email konfirmasi otomatis. Mohon tidak membalas langsung ke alamat email noreply ini.`
    : `This is an automated confirmation email. Please do not reply directly to this noreply address.`;

  return `<!DOCTYPE html>
<html lang="${isId ? "id" : "en"}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light dark">
  <meta name="supported-color-schemes" content="light dark">
  <title>${escapeHtml(title)}</title>
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

      <!-- Middle Section (Lighter Tone - Content) -->
      <tr>
        <td style="padding: 32px 32px 36px; background-color: #1c1e22;">
          <!-- Greeting -->
          <p style="margin: 0 0 16px; font-size: 15px; color: #ffffff; font-weight: 600;">
            ${greeting}
          </p>

          <!-- Paragraph 1 -->
          <p style="margin: 0 0 14px; font-size: 14px; color: #d4d4d8; line-height: 1.65;">
            ${paragraph1}
          </p>

          <!-- Paragraph 2 -->
          <p style="margin: 0 0 22px; font-size: 14px; color: #d4d4d8; line-height: 1.65;">
            ${paragraph2}
          </p>

          <!-- Callout / Note Box -->
          <div style="background-color: #121316; border: 1px solid #282a2e; border-radius: 10px; padding: 14px 18px; margin-bottom: 24px;">
            <p style="margin: 0; font-size: 13px; color: #a1a1aa; line-height: 1.55;">
              ${isId ? "Sementara menunggu, Anda dapat melihat karya dan proyek terbaru saya di:" : "In the meantime, feel free to explore my latest works and projects at:"}
              <a href="https://${escapeHtml(resolvedWebsite)}" target="_blank" rel="noopener noreferrer" style="color: #38bdf8; text-decoration: none; font-weight: 500;"> ${escapeHtml(resolvedWebsite)}</a>
            </p>
          </div>

          <!-- Sign-off -->
          <p style="margin: 0; font-size: 14px; color: #a1a1aa; line-height: 1.6;">
            ${isId ? "Salam hangat," : "Warm regards,"}<br/>
            <strong style="color: #ffffff; font-size: 15px; display: inline-block; margin-top: 4px;">${escapeHtml(resolvedName)}</strong><br/>
            <span style="font-size: 12px; color: #71717a;">Software Engineer</span>
          </p>
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

      <!-- Footer Lower (Footnote / Sent from - Full Width Divider) -->
      <tr>
        <td style="padding: 14px 32px 18px; background-color: #121316; border-top: 1px solid #1f2126; text-align: center;">
          <p style="margin: 0; font-size: 11px; color: #52525b; line-height: 1.5;">
            ${footnote}
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
