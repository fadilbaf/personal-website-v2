import { NextResponse } from "next/server";
import { createClient } from "@/src/services/supabase/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email")?.toLowerCase().trim();

  if (!email) {
    return new Response(renderUnsubscribeHtml("Invalid unsubscribe link.", false), {
      status: 400,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("newsletter_subscribers")
      .update({
        status: "unsubscribed",
        unsubscribed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("email", email);

    if (error) {
      console.error("Unsubscribe update error:", error);
      return new Response(
        renderUnsubscribeHtml("Failed to process unsubscribe request. Please try again later.", false),
        { status: 500, headers: { "Content-Type": "text/html; charset=utf-8" } }
      );
    }

    return new Response(
      renderUnsubscribeHtml(`You have been successfully unsubscribed from Fadil Bafagih's newsletter (${email}).`, true),
      { status: 200, headers: { "Content-Type": "text/html; charset=utf-8" } }
    );
  } catch (err) {
    console.error("Unexpected error in unsubscribe:", err);
    return new Response(
      renderUnsubscribeHtml("An unexpected error occurred. Please try again later.", false),
      { status: 500, headers: { "Content-Type": "text/html; charset=utf-8" } }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = body.email?.toLowerCase().trim();

    if (!email) {
      return NextResponse.json({ success: false, error: "Email is required." }, { status: 400 });
    }

    const supabase = await createClient();
    const { error } = await supabase
      .from("newsletter_subscribers")
      .update({
        status: "unsubscribed",
        unsubscribed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("email", email);

    if (error) {
      return NextResponse.json({ success: false, error: "Failed to unsubscribe." }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Unsubscribed successfully." });
  } catch {
    return NextResponse.json({ success: false, error: "Unexpected error." }, { status: 500 });
  }
}

function renderUnsubscribeHtml(message: string, success: boolean): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${success ? "Unsubscribed Successfully" : "Unsubscribe Request"}</title>
  <style>
    body {
      margin: 0;
      background-color: #0c0d0e;
      color: #ededed;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 20px;
      box-sizing: border-box;
    }
    .card {
      background-color: #141517;
      border: 1px solid #282a2e;
      border-radius: 16px;
      padding: 40px 32px;
      max-width: 480px;
      text-align: center;
      box-shadow: 0 20px 40px rgba(0,0,0,0.5);
    }
    h1 {
      font-size: 22px;
      margin: 0 0 16px;
      color: #ffffff;
    }
    p {
      color: #a1a1aa;
      font-size: 14.5px;
      line-height: 1.6;
      margin: 0 0 24px;
    }
    a.btn {
      display: inline-block;
      background-color: #ffffff;
      color: #09090b;
      font-weight: 600;
      font-size: 13px;
      padding: 10px 20px;
      border-radius: 8px;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="card">
    <div style="font-size: 32px; margin-bottom: 12px;">${success ? "👋" : "⚠️"}</div>
    <h1>${success ? "Unsubscribed" : "Notice"}</h1>
    <p>${message}</p>
    <a href="https://bafagih.id" class="btn">Return to Website</a>
  </div>
</body>
</html>
  `;
}
