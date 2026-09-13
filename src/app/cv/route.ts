import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/src/services/supabase/server";

export const dynamic = "force-dynamic";

const DEFAULT_CV_URL =
  "https://uiotodwgeplnmxbfsloi.supabase.co/storage/v1/object/public/assets/documents/CV-Hasan-Fadlullah.pdf";

const BOT_USER_AGENTS = [
  "whatsapp",
  "facebookexternalhit",
  "facebookcatalog",
  "facebot",
  "meta-external",
  "twitterbot",
  "linkedinbot",
  "telegrambot",
  "discordbot",
  "slackbot",
  "applebot",
  "skypeuripreview",
  "bingbot",
  "googlebot",
  "pinterest",
];

function isSocialCrawler(userAgent: string): boolean {
  const ua = userAgent.toLowerCase();
  return BOT_USER_AGENTS.some((bot) => ua.includes(bot));
}

export async function GET(request: NextRequest) {
  const userAgent = request.headers.get("user-agent") || "";
  const host =
    request.headers.get("x-forwarded-host") ||
    request.headers.get("host") ||
    "fadil.bafagih.id";
  const protocol =
    request.headers.get("x-forwarded-proto") ||
    (host.includes("localhost") ? "http" : "https");
  const siteUrl = process.env.SITE_URL || `${protocol}://${host}`;

  // 1. Social Crawler Handler — Return rich Open Graph preview cards for WhatsApp / LinkedIn / Twitter / Telegram
  if (isSocialCrawler(userAgent)) {
    const title = "Hasan Fadlullah | Curriculum Vitae";
    const description =
      "Software Engineer — View and download my professional resume.";
    const imageUrl = `${siteUrl}/assets/images/cv-thumbnail.png`;
    const canonicalUrl = `${siteUrl}/cv`;

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <meta name="description" content="${description}" />

  <!-- Open Graph / WhatsApp / Facebook / LinkedIn -->
  <meta property="og:type" content="website" />
  <meta property="og:url" content="${canonicalUrl}" />
  <meta property="og:title" content="${title}" />
  <meta property="og:description" content="${description}" />
  <meta property="og:image" content="${imageUrl}" />
  <meta property="og:image:secure_url" content="${imageUrl}" />
  <meta property="og:image:type" content="image/png" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:site_name" content="Fadil Bafagih" />

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:url" content="${canonicalUrl}" />
  <meta name="twitter:title" content="${title}" />
  <meta name="twitter:description" content="${description}" />
  <meta name="twitter:image" content="${imageUrl}" />
</head>
<body style="font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #fafafa;">
  <p>Loading resume...</p>
</body>
</html>`;

    return new NextResponse(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "public, max-age=86400, s-maxage=86400",
      },
    });
  }

  // 2. Human Visitor Handler — Stream PDF with custom filename
  try {
    const supabase = await createClient();

    // Fetch active CV URL from database
    let cvUrl = DEFAULT_CV_URL;
    try {
      const { data: about } = await supabase
        .from("about")
        .select("cv_url")
        .limit(1)
        .maybeSingle();

      if (about?.cv_url) {
        cvUrl = about.cv_url;
      }
    } catch {
      // Fallback to default CV URL if query fails
    }

    // Track analytics event in background
    try {
      const ip =
        request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
      const referrer = request.headers.get("referer") || "";

      let hash = 0;
      const hashInput = `${ip}-${userAgent}`;
      for (let i = 0; i < hashInput.length; i++) {
        hash = (hash << 5) - hash + hashInput.charCodeAt(i);
        hash |= 0;
      }
      const visitorHash = Math.abs(hash).toString(36);

      await supabase.from("analytics_events").insert({
        event_type: "cv_download",
        event_key: "cv_direct_link",
        page_path: "/cv",
        referrer: referrer || null,
        visitor_hash: visitorHash,
      });
    } catch {
      // Silent error for analytics tracking
    }

    // Fetch PDF file from Supabase Storage
    const pdfResponse = await fetch(cvUrl, { cache: "no-store" });
    if (!pdfResponse.ok) {
      return NextResponse.redirect(cvUrl);
    }

    const pdfBuffer = await pdfResponse.arrayBuffer();

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'inline; filename="Hasan-Fadlullah-CV.pdf"',
        "Cache-Control":
          "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch (error) {
    console.error("Failed to serve CV:", error);
    return NextResponse.redirect(DEFAULT_CV_URL);
  }
}
