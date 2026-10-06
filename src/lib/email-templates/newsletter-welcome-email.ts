export function renderNewsletterWelcomeEmail({
  email,
  locale = "en",
  adminName = "Fadil Bafagih",
  adminEmail = "fadil@bafagih.id",
  adminWebsite = "fadil.bafagih.id",
  instagramUrl = "https://instagram.com/fadilbafagih",
  githubUrl = "https://github.com/fadilbafagih",
  linkedinUrl = "https://linkedin.com/in/fadilbafagih",
  tiktokUrl = "https://tiktok.com/@fadilbafagih",
}: {
  email: string;
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
    ? "Selamat Datang di Newsletter Fadil Bafagih"
    : "Welcome to Fadil Bafagih's Newsletter";

  const greeting = isId ? "Halo!" : "Hi there,";

  const intro = isId
    ? `Terima kasih telah berlangganan! Anda sekarang resmi terdaftar di komunitas newsletter saya (<a href="mailto:${escapeHtml(email)}" style="color: #0284c7 !important; text-decoration: none; font-weight: 600;">${escapeHtml(email)}</a>).`
    : `Thank you for subscribing! You are now officially part of my newsletter community (<a href="mailto:${escapeHtml(email)}" style="color: #0284c7 !important; text-decoration: none; font-weight: 600;">${escapeHtml(email)}</a>).`;

  const whatToExpectTitle = isId ? "Apa yang akan Anda dapatkan:" : "What to expect:";

  return `<!DOCTYPE html>
<html lang="${isId ? "id" : "en"}" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light only">
  <meta name="supported-color-schemes" content="light only">
  <title>${escapeHtml(title)}</title>
  <style>
    :root {
      color-scheme: light only;
      supported-color-schemes: light only;
    }
    html, body {
      margin: 0;
      padding: 0;
      background-color: transparent !important;
      background: transparent !important;
    }
    * {
      box-sizing: border-box;
    }
    a, a:link, a:visited {
      color: #0284c7 !important;
      text-decoration: none !important;
    }
    a[x-apple-data-detectors] {
      color: #0284c7 !important;
      text-decoration: none !important;
    }
    @media (prefers-color-scheme: dark) {
      .email-card {
        background-color: #ffffff !important;
        background: #ffffff !important;
        color: #27272a !important;
      }
    }
    u + .email-body a {
      color: #0284c7 !important;
      text-decoration: none !important;
    }
    u + .email-body .email-card {
      background-color: #ffffff !important;
    }
  </style>
</head>
<body class="email-body" style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #27272a; -webkit-font-smoothing: antialiased; background-color: transparent;">
  <div class="email-card" style="max-width: 600px; width: 100%; margin: 0 auto; border: 1px solid #e4e4e7; border-radius: 16px; overflow: hidden; background-color: #ffffff; background-image: linear-gradient(#ffffff, #ffffff); box-sizing: border-box;">
    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="width: 100%; margin: 0; padding: 0; border-collapse: separate; border-radius: 16px; overflow: hidden; background-color: #ffffff; background-image: linear-gradient(#ffffff, #ffffff); box-sizing: border-box;">
      <!-- Header (Logo Only - Same #fafafa Background as Footer) -->
      <tr>
        <td style="padding: 28px 32px; background-color: #fafafa; background-image: linear-gradient(#fafafa, #fafafa); border-bottom: 1px solid #f4f4f5; text-align: center; border-top-left-radius: 15px; border-top-right-radius: 15px;">
          <a href="https://${escapeHtml(resolvedWebsite)}" target="_blank" rel="noopener noreferrer" style="display: inline-block; text-decoration: none;">
            <img src="https://fadil.bafagih.id/assets/images/fadilbaf-black.svg" alt="Fadil Bafagih" height="34" style="display: block; margin: 0 auto; height: 34px; width: auto; max-height: 34px; border: 0;" />
          </a>
        </td>
      </tr>

      <!-- Middle Section (Content) -->
      <tr>
        <td style="padding: 32px 32px 36px; background-color: #ffffff; background-image: linear-gradient(#ffffff, #ffffff);">
          <!-- Welcome Title -->
          <h1 style="margin: 0 0 20px; font-size: 20px; font-weight: 700; color: #09090b; line-height: 1.35;">
            ${escapeHtml(title)}
          </h1>

          <!-- Greeting -->
          <p style="margin: 0 0 14px; font-size: 15px; color: #09090b; font-weight: 600;">
            ${greeting}
          </p>

          <!-- Intro Paragraph -->
          <p style="margin: 0 0 20px; font-size: 14.5px; color: #3f3f46; line-height: 1.65;">
            ${intro}
          </p>

          <!-- What to Expect Box (Clean, Light) -->
          <div style="background-color: #f8fafc; background-image: linear-gradient(#f8fafc, #f8fafc); border: 1px solid #e4e4e7; border-radius: 10px; padding: 18px 20px; margin-bottom: 24px;">
            <h3 style="margin: 0 0 12px; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #09090b;">
              ${whatToExpectTitle}
            </h3>
            <ul style="margin: 0; padding-left: 18px; color: #3f3f46; font-size: 14px; line-height: 1.75;">
              <li style="margin-bottom: 6px;">
                <strong style="color: #09090b;">${isId ? "Artikel & Wawasan Terbaru:" : "Latest Articles &amp; Insights:"}</strong> ${isId ? "Pembahasan mendalam seputar software engineering, web development, dan teknologi." : "In-depth write-ups on software engineering, web development, and tech trends."}
              </li>
              <li style="margin-bottom: 6px;">
                <strong style="color: #09090b;">${isId ? "Proyek Terbaru:" : "New Projects:"}</strong> ${isId ? "Pembaruan rilis produk digital, eksplorasi desain, dan studi kasus teknis." : "Updates on digital product launches, interactive creations, and case studies."}
              </li>
              <li style="margin-bottom: 6px;">
                <strong style="color: #09090b;">${isId ? "Pencapaian Terbaru:" : "New Achievements:"}</strong> ${isId ? "Tonggak pencapaian, sertifikasi, dan sorotan perjalanan karir." : "Milestones, recognitions, certifications, and career highlights."}
              </li>
              <li>
                <strong style="color: #09090b;">${isId ? "Info & Promosi:" : "Info &amp; Promotions:"}</strong> ${isId ? "Pengumuman eksklusif, penawaran kolaborasi, dan resource pilihan." : "Exclusive announcements, collaboration opportunities, and curated resources."}
              </li>
            </ul>
          </div>

          <!-- CTA Button (Explore My Portfolio) -->
          <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 26px;">
            <tr>
              <td>
                <a href="https://${escapeHtml(resolvedWebsite)}" target="_blank" rel="noopener noreferrer" style="display: inline-block; background-color: #09090b; background-image: linear-gradient(#09090b, #09090b); color: #ffffff !important; font-weight: 600; font-size: 13px; padding: 12px 24px; border-radius: 8px; text-decoration: none; text-align: center; box-shadow: 0 2px 6px rgba(0,0,0,0.08);">
                  ${isId ? "Jelajahi Portofolio Saya &rarr;" : "Explore My Portfolio &rarr;"}
                </a>
              </td>
            </tr>
          </table>

          <!-- Sign-off (Warm regards) -->
          <p style="margin: 0; font-size: 14px; color: #71717a; line-height: 1.6;">
            ${isId ? "Salam hangat," : "Warm regards,"}<br/>
            <strong style="color: #09090b; font-size: 15px; display: inline-block; margin-top: 4px;">${escapeHtml(resolvedName)}</strong><br/>
            <span style="font-size: 12px; color: #71717a;">Software Engineer</span>
          </p>
        </td>
      </tr>

      <!-- Footer Upper (Name, Email/Web, Sosmed) -->
      <tr>
        <td style="padding: 28px 32px 20px; background-color: #fafafa; background-image: linear-gradient(#fafafa, #fafafa); border-top: 1px solid #f4f4f5; text-align: center;">
          <!-- 1. Nama -->
          <p style="margin: 0 0 6px; font-size: 14px; font-weight: 600; color: #09090b; letter-spacing: 0.2px;">
            ${escapeHtml(resolvedName)}
          </p>

          <!-- 2. Email & Web -->
          <p style="margin: 0 0 12px; font-size: 12px; color: #71717a;">
            <a href="mailto:${escapeHtml(resolvedEmail)}" style="color: #0284c7; text-decoration: none;">${escapeHtml(resolvedEmail)}</a> &bull; <a href="https://${escapeHtml(resolvedWebsite)}" style="color: #71717a; text-decoration: none;">${escapeHtml(resolvedWebsite)}</a>
          </p>

          <!-- 3. Sosmed -->
          <p style="margin: 0; font-size: 12px; color: #71717a;">
            <a href="${escapeHtml(resolvedInstagram)}" target="_blank" rel="noopener noreferrer" style="color: #71717a; text-decoration: none; margin: 0 5px;">Instagram</a> &bull;
            <a href="${escapeHtml(resolvedGithub)}" target="_blank" rel="noopener noreferrer" style="color: #71717a; text-decoration: none; margin: 0 5px;">GitHub</a> &bull;
            <a href="${escapeHtml(resolvedLinkedin)}" target="_blank" rel="noopener noreferrer" style="color: #71717a; text-decoration: none; margin: 0 5px;">LinkedIn</a> &bull;
            <a href="${escapeHtml(resolvedTiktok)}" target="_blank" rel="noopener noreferrer" style="color: #71717a; text-decoration: none; margin: 0 5px;">TikTok</a>
          </p>
        </td>
      </tr>

      <!-- Footer Lower (Unsubscribe / Sent from - Full Width Divider) -->
      <tr>
        <td style="padding: 14px 32px 18px; background-color: #fafafa; background-image: linear-gradient(#fafafa, #fafafa); border-top: 1px solid #f4f4f5; text-align: center; border-bottom-left-radius: 15px; border-bottom-right-radius: 15px;">
          <p style="margin: 0 0 6px; font-size: 11px; color: #a1a1aa; line-height: 1.5;">
            ${isId ? `Anda menerima email ini karena telah berlangganan newsletter di ${escapeHtml(resolvedWebsite)}.` : `You received this email because you subscribed to the newsletter at ${escapeHtml(resolvedWebsite)}.`}
          </p>
          <p style="margin: 0; font-size: 11px; color: #a1a1aa;">
            <a href="https://${escapeHtml(resolvedWebsite)}/api/newsletter/unsubscribe?email=${encodeURIComponent(email)}" target="_blank" rel="noopener noreferrer" style="color: #71717a; text-decoration: underline;">
              ${isId ? "Berhenti Berlangganan (Unsubscribe)" : "Unsubscribe"}
            </a>
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
