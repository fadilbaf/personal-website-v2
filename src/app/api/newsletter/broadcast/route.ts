import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/src/services/supabase/server";
import { resend, EMAIL_SENDERS, getAdminNotificationEmail } from "@/src/lib/resend";
import { resolveEmailTemplate } from "@/src/lib/email-templates/resolver";

const broadcastSchema = z.object({
  subject: z.string().trim().min(1, "Subject is required").max(200),
  contentHtml: z.string().trim().min(1, "Content is required"),
  type: z
    .enum([
      "newsletter",
      "general",
      "blog",
      "project",
      "achievement",
      "information",
      "promotion",
    ])
    .default("newsletter"),
  buttonText: z.string().trim().optional(),
  buttonUrl: z.string().trim().optional(),
  testOnly: z.boolean().default(false),
  testEmail: z.string().email().optional(),
  recipients: z.array(z.string().email()).optional(),
});

export async function POST(req: Request) {
  try {
    const supabase = await createClient();

    // 1. Authenticate admin user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized access." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const validated = broadcastSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: validated.error.flatten(),
        },
        { status: 400 }
      );
    }

    const { subject, contentHtml, type, buttonText, buttonUrl, testOnly, testEmail, recipients } = validated.data;

    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json(
        { success: false, error: "RESEND_API_KEY is not configured." },
        { status: 500 }
      );
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, email")
      .limit(1)
      .maybeSingle();

    const { data: contact } = await supabase
      .from("contacts")
      .select("email, instagram_url, github_url, linkedin_url, tiktok_url")
      .limit(1)
      .maybeSingle();

    const adminName = profile?.full_name || "Fadil Bafagih";
    const adminContactEmail = contact?.email || profile?.email || "fadil@bafagih.id";
    const adminWebsite = "fadil.bafagih.id";
    const instagramUrl = contact?.instagram_url || "https://instagram.com/fadilbafagih";
    const githubUrl = contact?.github_url || "https://github.com/fadilbafagih";
    const linkedinUrl = contact?.linkedin_url || "https://linkedin.com/in/fadilbafagih";
    const tiktokUrl = contact?.tiktok_url || "https://tiktok.com/@fadilbafagih";

    // 2. If test mode: send single email to testEmail or dynamic admin email
    if (testOnly) {
      const recipient = testEmail || (await getAdminNotificationEmail());
      const resolved = await resolveEmailTemplate({
        slug: "newsletter_broadcast",
        variables: {
          subject: `[TEST] ${subject}`,
          contentHtml,
          type,
          buttonText,
          buttonUrl,
          recipientEmail: recipient,
          adminName,
          adminEmail: adminContactEmail,
          adminWebsite,
          instagramUrl,
          githubUrl,
          linkedinUrl,
          tiktokUrl,
        },
      });

      const res = await resend.emails.send({
        from: resolved.sender || EMAIL_SENDERS.NEWSLETTER,
        to: recipient,
        subject: `[TEST] ${subject}`,
        html: resolved.html,
      });

      if (res.error) {
        return NextResponse.json(
          { success: false, error: res.error.message },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        testMode: true,
        message: `Test email successfully sent to ${recipient}.`,
      });
    }

    // 3. Determine target recipient emails
    let targetEmails: string[] = [];

    if (recipients && recipients.length > 0) {
      targetEmails = Array.from(new Set(recipients.map((e) => e.trim().toLowerCase())));
    } else {
      // Fallback to all active subscribers from database
      const { data: subscribers, error: fetchError } = await supabase
        .from("newsletter_subscribers")
        .select("email")
        .eq("status", "active");

      if (fetchError || !subscribers || subscribers.length === 0) {
        return NextResponse.json(
          {
            success: false,
            error: "No active subscribers found to broadcast to.",
          },
          { status: 400 }
        );
      }
      targetEmails = subscribers.map((sub) => sub.email);
    }

    if (targetEmails.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "No recipients selected for this broadcast.",
        },
        { status: 400 }
      );
    }

    let successCount = 0;
    const errors: string[] = [];

    // Send in chunks of 50 to avoid rate limits
    const CHUNK_SIZE = 50;
    for (let i = 0; i < targetEmails.length; i += CHUNK_SIZE) {
      const chunk = targetEmails.slice(i, i + CHUNK_SIZE);
      await Promise.allSettled(
        chunk.map(async (email) => {
          try {
            const resolved = await resolveEmailTemplate({
              slug: "newsletter_broadcast",
              variables: {
                subject,
                contentHtml,
                type,
                buttonText,
                buttonUrl,
                recipientEmail: email,
                adminName,
                adminEmail: adminContactEmail,
                adminWebsite,
                instagramUrl,
                githubUrl,
                linkedinUrl,
                tiktokUrl,
              },
            });

            const sendResult = await resend.emails.send({
              from: resolved.sender || EMAIL_SENDERS.NEWSLETTER,
              to: email,
              subject,
              html: resolved.html,
            });
            if (sendResult.data) {
              successCount++;
            } else if (sendResult.error) {
              errors.push(`${email}: ${sendResult.error.message}`);
            }
          } catch (e: unknown) {
            errors.push(
              `${email}: ${e instanceof Error ? e.message : "Unknown error"}`
            );
          }
        })
      );
    }

    // 4. Record Campaign in Supabase
    const { data: campaign, error: campaignError } = await supabase
      .from("newsletter_campaigns")
      .insert({
        subject,
        content: contentHtml,
        type,
        sent_count: successCount,
        recipients: targetEmails,
        status: successCount > 0 ? "sent" : "failed",
        sent_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (campaignError) {
      console.error("Failed to record campaign history:", campaignError);
    }

    if (successCount === 0 && errors.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Broadcast failed: ${errors[0]}`,
          errors,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Newsletter broadcast successfully dispatched to ${successCount} of ${targetEmails.length} recipient(s).`,
      sentCount: successCount,
      totalSubscribers: targetEmails.length,
      errors: errors.length > 0 ? errors.slice(0, 5) : undefined,
      campaign,
    });
  } catch (err: unknown) {
    console.error("Unexpected error in /api/newsletter/broadcast:", err);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
