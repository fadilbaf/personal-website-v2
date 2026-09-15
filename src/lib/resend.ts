import { Resend } from "resend";
import { createClient } from "@/src/services/supabase/server";
import { EMAIL_SENDERS, DEFAULT_ADMIN_EMAIL } from "@/src/lib/email-constants";

export { EMAIL_SENDERS, DEFAULT_ADMIN_EMAIL };

export const resend = new Resend(process.env.RESEND_API_KEY || "re_dummy_key_for_build");

/**
 * Dynamically resolves the admin notification recipient email from Supabase's `contact` table.
 * Falls back to process.env.ADMIN_EMAIL or DEFAULT_ADMIN_EMAIL if not set.
 */
export async function getAdminNotificationEmail(): Promise<string> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("contact")
      .select("email")
      .limit(1)
      .maybeSingle();

    if (!error && data?.email && data.email.trim().length > 0) {
      return data.email.trim();
    }
  } catch (err) {
    console.warn("Failed to fetch admin email from contact table, using fallback:", err);
  }

  return process.env.ADMIN_EMAIL || DEFAULT_ADMIN_EMAIL;
}
