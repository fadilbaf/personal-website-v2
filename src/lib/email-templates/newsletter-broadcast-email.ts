import type { CampaignType } from "@/src/types/database";

export function renderNewsletterBroadcastEmail({
  subject,
  contentHtml,
  type = "newsletter",
  buttonText,
  buttonUrl,
  recipientEmail,
  adminName = "Fadil Bafagih",
  adminEmail = "fadil@bafagih.id",
  adminWebsite = "fadil.bafagih.id",
  instagramUrl = "https://instagram.com/fadilbafagih",
  githubUrl = "https://github.com/fadilbafagih",
  linkedinUrl = "https://linkedin.com/in/fadilbafagih",
  tiktokUrl = "https://tiktok.com/@fadilbafagih",
}: {
  subject: string;
  contentHtml: string;
  type?: CampaignType | string;
  buttonText?: string;
  buttonUrl?: string;
  recipientEmail: string;
  adminName?: string;
  adminEmail?: string;
  adminWebsite?: string;
  instagramUrl?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  tiktokUrl?: string;
}): string {
  const resolvedName = adminName || "Fadil Bafagih";
  const resolvedEmail = adminEmail || "fadil@bafagih.id";
  const resolvedWebsite = adminWebsite || "fadil.bafagih.id";
  const resolvedInstagram = instagramUrl || "https://instagram.com/fadilbafagih";
  const resolvedGithub = githubUrl || "https://github.com/fadilbafagih";
  const resolvedLinkedin = linkedinUrl || "https://linkedin.com/in/fadilbafagih";
  const resolvedTiktok = tiktokUrl || "https://tiktok.com/@fadilbafagih";

  const typeBadgeMap: Record<string, string> = {
    newsletter: "Newsletter",
    general: "General Update",
    blog: "Blog Article",
    project: "Project Launch",
    achievement: "Achievement",
    information: "Information",
    promotion: "Promotion",
  };

  const isTypePlaceholder = String(type || "").includes("{{");
  const rawType = String(type || "newsletter").toLowerCase();
  const badgeText = isTypePlaceholder ? type : (typeBadgeMap[rawType] || "Newsletter");

  // If contentHtml is raw plain text without HTML paragraph tags, format enters into styled paragraphs
  const rawContent = String(contentHtml || "").trim();
  const hasHtmlTags = /<[a-z][\s\S]*>/i.test(rawContent);

  const resolvedContent = hasHtmlTags
    ? rawContent
    : escapeHtml(rawContent)
        .replace(/\r\n/g, "\n")
        .replace(/\r/g, "\n")
        .split(/\n\s*\n/)
        .map((para) => {
          const trimmed = para.trim();
          if (!trimmed) return "";
          const withBr = trimmed.replace(/\n/g, "<br/>");
          return `<p style="margin: 0 0 16px; font-size: 15px; line-height: 1.7; color: #3f3f46;">${withBr}</p>`;
        })
        .filter(Boolean)
        .join("");

  const isButtonPlaceholder = String(buttonText || "").includes("{{");
  let buttonHtml = "";
  if (isButtonPlaceholder || (buttonText && buttonText.trim() && buttonUrl && buttonUrl.trim())) {
    const safeText = isButtonPlaceholder ? buttonText : escapeHtml(buttonText!.trim());
    const safeUrl = isButtonPlaceholder ? (buttonUrl || "{{buttonUrl}}") : escapeHtml(buttonUrl!.trim());
    buttonHtml = `
          <!-- CTA_BUTTON_START -->
          <table border="0" cellspacing="0" cellpadding="0" style="margin: 28px 0 24px;">
            <tr>
              <td align="center" style="border-radius: 8px; background-color: #09090b; background-image: linear-gradient(#09090b, #09090b);">
                <a href="${safeUrl}" target="_blank" rel="noopener noreferrer" style="display: inline-block; padding: 12px 24px; font-size: 14px; font-weight: 600; color: #ffffff !important; text-decoration: none; border-radius: 8px; letter-spacing: 0.2px;">
                  ${safeText} &rarr;
                </a>
              </td>
            </tr>
          </table>
          <!-- CTA_BUTTON_END -->`;
  }

  return `<!DOCTYPE html>
<html lang="en" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light only">
  <meta name="supported-color-schemes" content="light only">
  <title>${escapeHtml(subject)}</title>
  <style>
    :root {
      color-scheme: light only;
      supported-color-scheme: light only;
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
          <!-- Campaign Type Badge -->
          <div style="margin-bottom: 12px;">
            <span style="display: inline-block; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 1.2px; color: #52525b; background-color: #f4f4f5; background-image: linear-gradient(#f4f4f5, #f4f4f5); border: 1px solid #e4e4e7; padding: 4px 10px; border-radius: 6px;">
              ${escapeHtml(badgeText)}
            </span>
          </div>

          <!-- Subject Heading -->
          <h1 style="margin: 0 0 20px; font-size: 20px; font-weight: 700; color: #09090b; line-height: 1.35;">
            ${escapeHtml(subject)}
          </h1>

          <!-- Main Broadcast Content (Seamless without divider) -->
          <div style="font-size: 15px; line-height: 1.7; color: #3f3f46; word-break: break-word;">
            ${resolvedContent}
          </div>
${buttonHtml}
          <!-- Sign-off (Warm regards) -->
          <p style="margin: 24px 0 0; font-size: 14px; color: #71717a; line-height: 1.6;">
            Warm regards,<br/>
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
            <a href="mailto:${escapeHtml(resolvedEmail)}" style="color: #0284c7 !important; text-decoration: none;">${escapeHtml(resolvedEmail)}</a> &bull; <a href="https://${escapeHtml(resolvedWebsite)}" style="color: #71717a !important; text-decoration: none;">${escapeHtml(resolvedWebsite)}</a>
          </p>

          <!-- 3. Sosmed -->
          <p style="margin: 0; font-size: 12px; color: #71717a;">
            <a href="${escapeHtml(resolvedInstagram)}" target="_blank" rel="noopener noreferrer" style="color: #71717a !important; text-decoration: none; margin: 0 5px;">Instagram</a> &bull;
            <a href="${escapeHtml(resolvedGithub)}" target="_blank" rel="noopener noreferrer" style="color: #71717a !important; text-decoration: none; margin: 0 5px;">GitHub</a> &bull;
            <a href="${escapeHtml(resolvedLinkedin)}" target="_blank" rel="noopener noreferrer" style="color: #71717a !important; text-decoration: none; margin: 0 5px;">LinkedIn</a> &bull;
            <a href="${escapeHtml(resolvedTiktok)}" target="_blank" rel="noopener noreferrer" style="color: #71717a !important; text-decoration: none; margin: 0 5px;">TikTok</a>
          </p>
        </td>
      </tr>

      <!-- Footer Lower (Unsubscribe / Sent from - Full Width Divider) -->
      <tr>
        <td style="padding: 14px 32px 18px; background-color: #fafafa; background-image: linear-gradient(#fafafa, #fafafa); border-top: 1px solid #f4f4f5; text-align: center; border-bottom-left-radius: 15px; border-bottom-right-radius: 15px;">
          <p style="margin: 0 0 6px; font-size: 11px; color: #a1a1aa; line-height: 1.5;">
            You received this email because you subscribed to the newsletter at ${escapeHtml(resolvedWebsite)}.
          </p>
          <p style="margin: 0; font-size: 11px; color: #a1a1aa;">
            <a href="https://${escapeHtml(resolvedWebsite)}/api/newsletter/unsubscribe?email=${encodeURIComponent(recipientEmail)}" target="_blank" rel="noopener noreferrer" style="color: #71717a !important; text-decoration: underline;">
              Unsubscribe
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
