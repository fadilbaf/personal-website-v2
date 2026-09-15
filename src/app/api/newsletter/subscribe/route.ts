import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/src/services/supabase/server";
import {
  resend,
  EMAIL_SENDERS,
  getAdminNotificationEmail,
} from "@/src/lib/resend";
import { resolveEmailTemplate } from "@/src/lib/email-templates/resolver";

const subscribeSchema = z.object({
  email: z.string().trim().email("Invalid email address").toLowerCase(),
  locale: z.string().optional().default("en"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validated = subscribeSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Please provide a valid email address.",
        },
        { status: 400 }
      );
    }

    const { email, locale } = validated.data;
    const supabase = await createClient();

    // 1. Check if already subscribed
    const { data: existing } = await supabase
      .from("newsletter_subscribers")
      .select("*")
      .eq("email", email)
      .maybeSingle();

    if (existing && existing.status === "active") {
      return NextResponse.json(
        {
          success: true,
          alreadySubscribed: true,
          message:
            locale === "id"
              ? "Anda sudah terdaftar di newsletter kami."
              : "You are already subscribed to our newsletter.",
        },
        { status: 200 }
      );
    }

    // 2. Upsert subscriber (new subscription or reactivation)
    const now = new Date().toISOString();
    const { error: dbError } = await supabase
      .from("newsletter_subscribers")
      .upsert(
        {
          email,
          status: "active",
          subscribed_at: now,
          unsubscribed_at: null,
          updated_at: now,
        },
        { onConflict: "email" }
      );

    if (dbError) {
      console.error("Database upsert error on newsletter_subscribers:", dbError);
      return NextResponse.json(
        { success: false, error: "Failed to process subscription." },
        { status: 500 }
      );
    }

    // 3. Count total active subscribers for admin notification
    const { count: totalActive } = await supabase
      .from("newsletter_subscribers")
      .select("*", { count: "exact", head: true })
      .eq("status", "active");

    const adminEmail = await getAdminNotificationEmail();
    const subscribedAtFormatted = new Date().toLocaleString("en-US", {
      timeZone: "Asia/Jakarta",
      dateStyle: "full",
      timeStyle: "short",
    });

    // 4. Dispatch Welcome Email & Admin Notification via Resend
    try {
      if (process.env.RESEND_API_KEY) {
        // Send Welcome Email to Subscriber
        const resolvedWelcome = await resolveEmailTemplate({
          slug: "newsletter_welcome",
          variables: { email },
          locale: locale === "id" ? "id" : "en",
        });

        const welcomeRes = await resend.emails.send({
          from: resolvedWelcome.sender || EMAIL_SENDERS.NOREPLY,
          to: email,
          subject:
            locale === "id"
              ? "Selamat Datang di Newsletter Fadil Bafagih 🎉"
              : "Welcome to Fadil Bafagih's Newsletter 🎉",
          html: resolvedWelcome.html,
        });

        if (welcomeRes.error) {
          console.error("Resend error sending welcome email:", welcomeRes.error);
        } else {
          console.log("Welcome email sent successfully:", welcomeRes.data?.id);
        }

        // Send Notification Email to Admin
        const resolvedAdmin = await resolveEmailTemplate({
          slug: "newsletter_admin_notification",
          variables: {
            email,
            totalSubscribers: totalActive || 1,
            subscribedAt: `${subscribedAtFormatted} (WIB)`,
          },
        });

        const adminRes = await resend.emails.send({
          from: resolvedAdmin.sender || EMAIL_SENDERS.NOREPLY,
          to: adminEmail,
          subject: `[New Subscriber] ${email} just joined your newsletter!`,
          html: resolvedAdmin.html,
        });

        if (adminRes.error) {
          console.error("Resend error sending admin subscriber notification:", adminRes.error);
        } else {
          console.log("Admin subscriber notification sent successfully:", adminRes.data?.id);
        }
      }
    } catch (emailError) {
      console.error("Error sending newsletter emails:", emailError);
    }

    return NextResponse.json(
      {
        success: true,
        message:
          locale === "id"
            ? "Terima kasih telah berlangganan newsletter!"
            : "Thank you for subscribing to the newsletter!",
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    console.error("Unexpected error in /api/newsletter/subscribe:", err);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
