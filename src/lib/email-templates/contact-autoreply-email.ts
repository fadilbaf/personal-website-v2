export function renderContactAutoReplyEmail({
  name,
  subject,
  locale = "en",
}: {
  name: string;
  subject: string;
  locale?: string;
}): string {
  const isId = locale === "id";

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

  return `
<!DOCTYPE html>
<html lang="${isId ? "id" : "en"}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0c0d0e; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #ededed; -webkit-font-smoothing: antialiased;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #0c0d0e; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 580px; background-color: #141517; border: 1px solid #282a2e; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.5);">
          <!-- Header -->
          <tr>
            <td style="padding: 36px 32px 24px; border-bottom: 1px solid #232529;">
              <span style="display: inline-block; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #a1a1aa; background-color: #222428; padding: 4px 10px; border-radius: 6px; margin-bottom: 12px;">
                Fadil Bafagih
              </span>
              <h1 style="margin: 0; font-size: 22px; font-weight: 600; color: #ffffff; line-height: 1.3;">
                ${title}
              </h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 32px;">
              <p style="margin: 0 0 16px; font-size: 15px; color: #ffffff; font-weight: 500;">
                ${greeting}
              </p>
              <p style="margin: 0 0 16px; font-size: 14px; color: #d4d4d8; line-height: 1.65;">
                ${paragraph1}
              </p>
              <p style="margin: 0 0 24px; font-size: 14px; color: #d4d4d8; line-height: 1.65;">
                ${paragraph2}
              </p>

              <div style="background-color: #181a1d; border-left: 3px solid #ffffff; padding: 14px 18px; border-radius: 0 8px 8px 0; margin-bottom: 24px;">
                <p style="margin: 0; font-size: 13px; color: #a1a1aa; line-height: 1.5;">
                  ${isId ? "Sementara menunggu, Anda dapat melihat karya dan proyek terbaru saya di:" : "In the meantime, feel free to explore my latest works and projects at:"}
                  <a href="https://bafagih.id" style="color: #38bdf8; text-decoration: none; font-weight: 500;"> bafagih.id</a>
                </p>
              </div>

              <p style="margin: 24px 0 0; font-size: 14px; color: #a1a1aa;">
                ${isId ? "Salam hangat," : "Warm regards,"}<br/>
                <strong style="color: #ffffff; font-size: 15px;">Fadil Bafagih</strong><br/>
                <span style="font-size: 12px; color: #71717a;">Software Engineer & Digital Creator</span>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 32px; background-color: #0e0f11; border-top: 1px solid #232529; text-align: center;">
              <p style="margin: 0; font-size: 12px; color: #52525b; line-height: 1.5;">
                ${footnote}
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
