import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/src/services/supabase/server";
import { resend, EMAIL_SENDERS, getAdminNotificationEmail } from "@/src/lib/resend";
import { EMAIL_TEMPLATES } from "@/src/lib/email-templates";

import { compileTemplate } from "@/src/lib/email-templates/resolver";

const testSendSchema = z.object({
  templateId: z.string(),
  recipientEmail: z.string().email("Valid email is required"),
  variables: z.record(z.string(), z.any()).default({}),
  locale: z.enum(["en", "id"]).default("en"),
  customHtml: z.string().optional(),
  customSubject: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const supabase = await createClient();

    // Authenticate admin user
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
    const validated = testSendSchema.safeParse(body);

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

    const { templateId, recipientEmail, variables, locale, customHtml, customSubject } =
      validated.data;

    const template = EMAIL_TEMPLATES.find((t) => t.id === templateId);
    if (!template) {
      return NextResponse.json(
        { success: false, error: `Template "${templateId}" not found.` },
        { status: 404 }
      );
    }

    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json(
        { success: false, error: "RESEND_API_KEY is not configured." },
        { status: 500 }
      );
    }

    let html: string;
    let rawSubject: string;

    if (customHtml && customHtml.trim().length > 0) {
      html = compileTemplate(customHtml, variables);
      rawSubject = customSubject || template.defaultSubject;
    } else {
      html = template.renderHtml(variables, locale);
      rawSubject = variables.subject || template.defaultSubject;
    }

    const subject = `[TEST] ${compileTemplate(rawSubject, variables)}`;

    const res = await resend.emails.send({
      from: template.sender,
      to: recipientEmail,
      subject,
      html,
    });

    if (res.error) {
      return NextResponse.json(
        { success: false, error: res.error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Test email successfully sent to ${recipientEmail}.`,
      resendId: res.data?.id,
    });
  } catch (err: unknown) {
    console.error("Unexpected error in /api/emails/test-send:", err);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
