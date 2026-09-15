import { NextResponse } from "next/server";
import { createClient } from "@/src/services/supabase/server";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
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

    const { error } = await supabase
      .from("email_templates")
      .delete()
      .eq("slug", slug);

    if (error) {
      console.error(`Failed to delete email_template ${slug}:`, error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Template "${slug}" has been reset to default built-in code template.`,
    });
  } catch (err: unknown) {
    console.error("POST /api/emails/templates/[slug]/reset error:", err);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
