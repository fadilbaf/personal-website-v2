import { createClient } from "@/src/services/supabase/server";
import { EMAIL_TEMPLATES, type TemplateId, type EmailTemplateDefinition } from "./index";
import { compileTemplate } from "./compiler";

export { compileTemplate };

export interface ResolvedEmail {
  subject: string;
  html: string;
  sender: string;
  isCustomized: boolean;
}

/**
 * Resolves an email template by slug.
 * 1. Checks Supabase `email_templates` table for user-saved custom HTML.
 * 2. If present, compiles the dynamic placeholders with provided variables.
 * 3. Fallback: Uses the built-in TypeScript generator function.
 */
export async function resolveEmailTemplate({
  slug,
  variables = {},
  locale = "en",
}: {
  slug: TemplateId;
  variables?: Record<string, any>;
  locale?: "en" | "id";
}): Promise<ResolvedEmail> {
  const defaultDef = EMAIL_TEMPLATES.find((t) => t.id === slug) || EMAIL_TEMPLATES[0];

  try {
    const supabase = await createClient();
    const { data: dbTemplate, error } = await supabase
      .from("email_templates")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();

    if (!error && dbTemplate && dbTemplate.html_content && dbTemplate.html_content.trim().length > 0) {
      const subject = compileTemplate(dbTemplate.subject || defaultDef.defaultSubject, variables);
      const html = compileTemplate(dbTemplate.html_content, variables);
      const sender = dbTemplate.sender || defaultDef.sender;

      return {
        subject,
        html,
        sender,
        isCustomized: true,
      };
    }
  } catch (err) {
    console.warn(`Failed to fetch custom email_template for "${slug}", falling back to code default:`, err);
  }

  // Fallback to TypeScript template generator
  const subject = compileTemplate(defaultDef.defaultSubject, variables);
  const html = defaultDef.renderHtml(variables, locale);

  return {
    subject,
    html,
    sender: defaultDef.sender,
    isCustomized: false,
  };
}
