import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/src/services/supabase/server";
import {
  resend,
  EMAIL_SENDERS,
  getAdminNotificationEmail,
} from "@/src/lib/resend";
import { resolveEmailTemplate } from "@/src/lib/email-templates/resolver";

const contactSubmissionSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().trim().email("Invalid email address").max(255),
  subject: z.string().trim().min(1, "Subject is required").max(200),
  message: z.string().trim().min(1, "Message is required").max(5000),
  locale: z.string().optional().default("en"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validated = contactSubmissionSchema.safeParse(body);

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

    const { name, email, subject, message, locale } = validated.data;
    const supabase = await createClient();

    // 1. Save to Supabase
    const { error: dbError } = await supabase
      .from("contact_messages")
      .insert({
        name,
        email,
        subject,
        message,
        is_read: false,
        status: "unread",
      });

    if (dbError) {
      console.error("Database insert error on contact_messages:", dbError);
      return NextResponse.json(
        { success: false, error: "Failed to save message." },
        { status: 500 }
      );
    }

    // 2. Resolve admin recipient dynamically
    const adminEmail = await getAdminNotificationEmail();
    const receivedAtFormatted = new Date().toLocaleString("en-US", {
      timeZone: "Asia/Jakarta",
      dateStyle: "full",
      timeStyle: "short",
    });

    // 3. Send Admin Notification Email via Resend
    try {
      if (process.env.RESEND_API_KEY) {
        const resolvedAdmin = await resolveEmailTemplate({
          slug: "contact_notification",
          variables: {
            name,
            email,
            subject,
            message,
            receivedAt: `${receivedAtFormatted} (WIB)`,
          },
        });

        const adminRes = await resend.emails.send({
          from: resolvedAdmin.sender || EMAIL_SENDERS.NOREPLY,
          to: adminEmail,
          replyTo: email,
          subject: `[Contact Form] ${subject} - from ${name}`,
          html: resolvedAdmin.html,
        });

        if (adminRes.error) {
          console.error("Resend error sending admin notification:", adminRes.error);
        } else {
          console.log("Admin notification sent successfully:", adminRes.data?.id);
        }

        // 4. Send Auto-Reply Confirmation Email to Visitor
        const resolvedVisitor = await resolveEmailTemplate({
          slug: "contact_autoreply",
          variables: {
            name,
            subject,
          },
          locale: locale === "id" ? "id" : "en",
        });

        const visitorRes = await resend.emails.send({
          from: resolvedVisitor.sender || EMAIL_SENDERS.NOREPLY,
          to: email,
          subject:
            locale === "id"
              ? `Pesan Anda telah diterima: "${subject}"`
              : `Message received: "${subject}"`,
          html: resolvedVisitor.html,
        });

        if (visitorRes.error) {
          console.error("Resend error sending visitor auto-reply:", visitorRes.error);
        } else {
          console.log("Visitor auto-reply sent successfully:", visitorRes.data?.id);
        }
      } else {
        console.warn("RESEND_API_KEY is not set. Email dispatch skipped.");
      }
    } catch (emailError) {
      console.error("Exception dispatching emails via Resend:", emailError);
    }

    return NextResponse.json(
      {
        success: true,
        message: "Message sent successfully.",
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    console.error("Unexpected error in /api/contact:", err);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
