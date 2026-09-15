import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/src/services/supabase/server";
import { resend, EMAIL_SENDERS } from "@/src/lib/resend";
import { renderContactReplyEmail } from "@/src/lib/email-templates/contact-reply-email";

const replySchema = z.object({
  messageId: z.string().uuid("Invalid message ID"),
  replySubject: z.string().trim().min(1, "Subject is required").max(200),
  replyMessage: z.string().trim().min(1, "Reply message is required"),
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
    const validated = replySchema.safeParse(body);

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

    const { messageId, replySubject, replyMessage } = validated.data;

    // 2. Fetch original message
    const { data: original, error: fetchError } = await supabase
      .from("contact_messages")
      .select("*")
      .eq("id", messageId)
      .single();

    if (fetchError || !original) {
      return NextResponse.json(
        { success: false, error: "Original message not found." },
        { status: 404 }
      );
    }

    // 3. Send direct reply email via Resend (from fadil@bafagih.id)
    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json(
        { success: false, error: "RESEND_API_KEY is not configured." },
        { status: 500 }
      );
    }

    const emailResponse = await resend.emails.send({
      from: EMAIL_SENDERS.PERSONAL,
      to: original.email,
      replyTo: "fadil@bafagih.id",
      subject: replySubject,
      html: renderContactReplyEmail({
        recipientName: original.name,
        subject: replySubject,
        replyMessage,
        originalMessage: original.message,
        originalSubject: original.subject,
      }),
    });

    if (emailResponse.error) {
      console.error("Resend error sending reply:", emailResponse.error);
      return NextResponse.json(
        {
          success: false,
          error: emailResponse.error.message || "Failed to send email via Resend.",
        },
        { status: 500 }
      );
    }

    // 4. Update message status in Supabase
    const { data: updatedMessage, error: updateError } = await supabase
      .from("contact_messages")
      .update({
        status: "replied",
        is_read: true,
        replied_at: new Date().toISOString(),
        reply_content: replyMessage,
        updated_at: new Date().toISOString(),
      })
      .eq("id", messageId)
      .select()
      .single();

    if (updateError) {
      console.error("Error updating contact_message status:", updateError);
    }

    return NextResponse.json({
      success: true,
      message: "Reply sent successfully.",
      data: updatedMessage,
    });
  } catch (err: unknown) {
    console.error("Unexpected error in /api/contact/reply:", err);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
