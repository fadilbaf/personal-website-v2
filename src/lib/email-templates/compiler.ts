const SYSTEM_VARIABLE_DEFAULTS: Record<string, string> = {
  adminName: "Fadil Bafagih",
  adminEmail: "fadil@bafagih.id",
  adminWebsite: "fadil.bafagih.id",
  instagramUrl: "https://instagram.com/fadilbafagih",
  githubUrl: "https://github.com/fadilbafagih",
  linkedinUrl: "https://linkedin.com/in/fadilbafagih",
  tiktokUrl: "https://tiktok.com/@fadilbafagih",
};

/**
 * Pure compiler function to interpolate variables into an HTML template string.
 * Safe to import in both Client and Server components.
 */
export function compileTemplate(
  templateHtml: string,
  variables: Record<string, any> = {}
): string {
  if (!templateHtml) return "";

  // Replace placeholders: {{variable_name}} or %7B%7Bvariable_name%7D%7D
  return templateHtml.replace(
    /(?:\{\{|\%7B\%7B)\s*([a-zA-Z0-9_]+)\s*(?:\}\}|\%7D\%7D)/gi,
    (match, key, offset, fullString) => {
      const val = variables[key] !== undefined ? variables[key] : SYSTEM_VARIABLE_DEFAULTS[key];
      if (val !== undefined && val !== null) {
        const strVal = String(val);

        // Check if placeholder is inside a URL query parameter (e.g., mailto:...?... or ?subject=...)
        const precedingSlice = fullString.slice(Math.max(0, offset - 150), offset);
        const isInUrlQuery =
          /href=["'][^"']*\?[^"']*$/i.test(precedingSlice) ||
          /subject=[^"&]*$/i.test(precedingSlice);

        if (isInUrlQuery) {
          return encodeURIComponent(strVal);
        }

        // If variable contains HTML tags (like contentHtml in newsletter), return as is
        if (key === "contentHtml" || strVal.includes("<p") || strVal.includes("<div") || strVal.includes("<table")) {
          return strVal;
        }

        // For plain text variables with newlines (e.g., message, replyMessage), convert \n to <br/>
        if (strVal.includes("\n")) {
          return strVal
            .replace(/\r\n/g, "\n")
            .replace(/\r/g, "\n")
            .split("\n")
            .map((line) => line.trim())
            .join("<br/>");
        }
        
        return strVal;
      }
      return match;
    }
  );
}

