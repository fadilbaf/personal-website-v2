import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/src/services/supabase/server";

const upsertTemplateSchema = z.object({
  slug: z.string().min(1, "Slug is required"),
  name: z.string().min(1, "Name is required"),
  category: z.enum(["Contact", "Newsletter"]),
  subject: z.string().min(1, "Subject is required"),
  html_content: z.string().min(1, "HTML content is required"),
  description: z.string().optional().nullable(),
  sender: z.string().optional().nullable(),
});

export async function GET() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("email_templates")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) {
      console.warn("Error querying email_templates:", error);
      return NextResponse.json({ success: true, data: [] });
    }

    return NextResponse.json({ success: true, data: data || [] });
  } catch (err) {
    console.error("GET /api/emails/templates error:", err);
    return NextResponse.json({ success: true, data: [] });
  }
}

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
    const validated = upsertTemplateSchema.safeParse(body);

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

    const { slug, name, category, subject, html_content, description, sender } =
      validated.data;

    const { data, error } = await supabase
      .from("email_templates")
      .upsert(
        {
          slug,
          name,
          category,
          subject,
          html_content,
          description: description || null,
          sender: sender || null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "slug" }
      )
      .select()
      .single();

    if (error) {
      console.error("Failed to upsert email_templates in Supabase:", error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Email template "${name}" successfully saved.`,
      data,
    });
  } catch (err: unknown) {
    console.error("POST /api/emails/templates error:", err);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
