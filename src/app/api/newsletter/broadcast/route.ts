import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/src/services/supabase/server";
import { resend, EMAIL_SENDERS, getAdminNotificationEmail } from "@/src/lib/resend";
import { renderNewsletterBroadcastEmail } from "@/src/lib/email-templates/newsletter-broadcast-email";

const broadcastSchema = z.object({
  subject: z.string().trim().min(1, "Subject is required").max(200),
  contentHtml: z.string().trim().min(1, "Content is required"),
  type: z.enum(["general", "blog", "project", "achievement"]).default("general"),
  testOnly: z.boolean().default(false),
  testEmail: z.string().email().optional(),
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

    const { subject, contentHtml, type, testOnly, testEmail } = validated.data;

    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json(
        { success: false, error: "RESEND_API_KEY is not configured." },
        { status: 500 }
      );
    }

    // 2. If test mode: send single email to testEmail or dynamic admin email
    if (testOnly) {
      const recipient = testEmail || (await getAdminNotificationEmail());
      const res = await resend.emails.send({
        from: EMAIL_SENDERS.NEWSLETTER,
        to: recipient,
        subject: `[TEST] ${subject}`,
        html: renderNewsletterBroadcastEmail({
          subject: `[TEST] ${subject}`,
          contentHtml,
          type,
          recipientEmail: recipient,
        }),
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

    // 3. Full Blast Mode: Fetch active subscribers
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

    let successCount = 0;
    const errors: string[] = [];

    // Send in chunks of 50 to avoid rate limits
    const CHUNK_SIZE = 50;
    for (let i = 0; i < subscribers.length; i += CHUNK_SIZE) {
      const chunk = subscribers.slice(i, i + CHUNK_SIZE);
      await Promise.allSettled(
        chunk.map(async (sub) => {
          try {
            const sendResult = await resend.emails.send({
              from: EMAIL_SENDERS.NEWSLETTER,
              to: sub.email,
              subject,
              html: renderNewsletterBroadcastEmail({
                subject,
                contentHtml,
                type,
                recipientEmail: sub.email,
              }),
            });
            if (sendResult.data) {
              successCount++;
            } else if (sendResult.error) {
              errors.push(`${sub.email}: ${sendResult.error.message}`);
            }
          } catch (e: unknown) {
            errors.push(
              `${sub.email}: ${e instanceof Error ? e.message : "Unknown error"}`
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
      message: `Newsletter broadcast successfully dispatched to ${successCount} of ${subscribers.length} subscriber(s).`,
      sentCount: successCount,
      totalSubscribers: subscribers.length,
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
