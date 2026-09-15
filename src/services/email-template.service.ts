import { createClient } from "./supabase/client";
import type { EmailTemplate } from "@/src/types/database";

export const EmailTemplateService = {
  /**
   * Fetches all customized email templates from Supabase.
   */
  async getAll(): Promise<EmailTemplate[]> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("email_templates")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) {
      console.warn("EmailTemplateService.getAll error (table may not exist yet):", error);
      return [];
    }
    return (data || []) as EmailTemplate[];
  },

  /**
   * Gets a specific template by slug from Supabase.
   */
  async getBySlug(slug: string): Promise<EmailTemplate | null> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("email_templates")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();

    if (error) {
      console.warn(`EmailTemplateService.getBySlug(${slug}) error:`, error);
      return null;
    }
    return data as EmailTemplate | null;
  },

  /**
   * Upserts (inserts or updates) a template in Supabase.
   */
  async upsert(template: {
    slug: string;
    name: string;
    category: "Contact" | "Newsletter";
    subject: string;
    html_content: string;
    description?: string | null;
    sender?: string | null;
  }): Promise<EmailTemplate> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("email_templates")
      .upsert(
        {
          slug: template.slug,
          name: template.name,
          category: template.category,
          subject: template.subject,
          html_content: template.html_content,
          description: template.description ?? null,
          sender: template.sender ?? null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "slug" }
      )
      .select()
      .single();

    if (error) {
      console.error("EmailTemplateService.upsert error:", error);
      throw error;
    }
    return data as EmailTemplate;
  },

  /**
   * Deletes a template record to revert back to default code template.
   */
  async deleteBySlug(slug: string): Promise<boolean> {
    const supabase = createClient();
    const { error } = await supabase
      .from("email_templates")
      .delete()
      .eq("slug", slug);

    if (error) {
      console.error(`EmailTemplateService.deleteBySlug(${slug}) error:`, error);
      throw error;
    }
    return true;
  },
};
