/**
 * Pure compiler function to interpolate variables into an HTML template string.
 * Safe to import in both Client and Server components.
 */
export function compileTemplate(
  templateHtml: string,
  variables: Record<string, any> = {}
): string {
  if (!templateHtml) return "";

  // Replace placeholders: {{variable_name}}
  return templateHtml.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (match, key) => {
    if (key in variables) {
      const val = variables[key];
      if (val === null || val === undefined) return "";
      return String(val);
    }
    return match;
  });
}
