export function renderNewsletterWelcomeEmail({
  email,
  locale = "en",
}: {
  email: string;
  locale?: string;
}): string {
  const isId = locale === "id";

  const title = isId
    ? "Selamat Datang di Newsletter Fadil Bafagih"
    : "Welcome to Fadil Bafagih's Newsletter";

  const greeting = isId ? "Halo!" : "Hi there,";

  const intro = isId
    ? `Terima kasih telah berlangganan! Anda sekarang resmi terdaftar di newsletter saya (<code>${escapeHtml(email)}</code>).`
    : `Thank you for subscribing! You are now officially on my newsletter list (<code>${escapeHtml(email)}</code>).`;

  const whatToExpect = isId
    ? "Apa yang akan Anda dapatkan?"
    : "What to expect:";

  const point1 = isId
    ? "🚀 <strong>Artikel & Tutorial Terbaru:</strong> Pembahasan mendalam tentang web development, software engineering, dan tips teknologi."
    : "🚀 <strong>Latest Articles & Insights:</strong> In-depth breakdowns on web development, software engineering, and modern tech.";

  const point2 = isId
    ? "💡 <strong>Project Showcases:</strong> Update proyek digital inovatif, studi kasus, dan eksperimen teknis terbaru."
    : "💡 <strong>Project Showcases:</strong> Updates on new digital products, design experiments, and technical case studies.";

  const point3 = isId
    ? "🎯 <strong>Curated Resources:</strong> Rekomendasi tools, pustaka kode, dan inspirasi desain pilihan."
    : "🎯 <strong>Curated Resources:</strong> Handpicked developer tools, useful libraries, and curated design gems.";

  const frequencyNote = isId
    ? "Saya sangat menghargai privasi dan kotak masuk Anda — tidak akan ada spam, hanya konten berkualitas yang dikirim secara berkala."
    : "I deeply respect your inbox — no spam, only high-value content sent periodically.";

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
                Fadil Bafagih &bull; Newsletter
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
              <p style="margin: 0 0 20px; font-size: 14.5px; color: #d4d4d8; line-height: 1.65;">
                ${intro}
              </p>

              <div style="background-color: #181a1d; border: 1px solid #282a2e; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
                <h3 style="margin: 0 0 14px; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: #ffffff;">
                  ${whatToExpect}
                </h3>
                <ul style="margin: 0; padding-left: 20px; color: #d4d4d8; font-size: 14px; line-height: 1.8;">
                  <li style="margin-bottom: 8px;">${point1}</li>
                  <li style="margin-bottom: 8px;">${point2}</li>
                  <li>${point3}</li>
                </ul>
              </div>

              <p style="margin: 0 0 24px; font-size: 13.5px; color: #a1a1aa; line-height: 1.6;">
                ${frequencyNote}
              </p>

              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-top: 24px;">
                <tr>
                  <td>
                    <a href="https://bafagih.id/blogs" style="display: inline-block; background-color: #ffffff; color: #09090b; font-weight: 600; font-size: 13px; padding: 12px 24px; border-radius: 8px; text-decoration: none;">
                      ${isId ? "Jelajahi Artikel Terbaru &rarr;" : "Explore Latest Articles &rarr;"}
                    </a>
                  </td>
                </tr>
              </table>

              <div style="margin-top: 32px; padding-top: 20px; border-top: 1px solid #232529;">
                <p style="margin: 0; font-size: 14px; color: #a1a1aa;">
                  ${isId ? "Salam hangat," : "Cheers,"}<br/>
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
                You received this email because you subscribed to Fadil Bafagih's newsletter.
              </p>
              <p style="margin: 0; font-size: 12px; color: #52525b;">
                <a href="https://bafagih.id/api/newsletter/unsubscribe?email=${encodeURIComponent(email)}" style="color: #71717a; text-decoration: underline;">
                  ${isId ? "Berhenti Berlangganan (Unsubscribe)" : "Unsubscribe"}
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
