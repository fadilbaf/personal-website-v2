const SYSTEM_VARIABLE_DEFAULTS: Record<string, string> = {
  adminName: "Fadil Bafagih",
  adminEmail: "fadil@bafagih.id",
  adminWebsite: "fadil.bafagih.id",
  instagramUrl: "https://instagram.com/fadilbafagih",
  githubUrl: "https://github.com/fadilbafagih",
  linkedinUrl: "https://linkedin.com/in/fadilbafagih",
  tiktokUrl: "https://tiktok.com/@fadilbafagih",
};

const CAMPAIGN_TYPE_LABELS: Record<string, string> = {
  newsletter: "Newsletter",
  general: "General Update",
  blog: "Blog Article",
  project: "Project Launch",
  achievement: "Achievement",
  information: "Information",
  promotion: "Promotion",
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

  let compiled = templateHtml;

  // If buttonText is explicitly empty in variables, remove the CTA button block
  if (variables.buttonText !== undefined && !String(variables.buttonText).trim()) {
    compiled = compiled.replace(/<!-- CTA_BUTTON_START -->[\s\S]*?<!-- CTA_BUTTON_END -->/gi, "");
  }

  // Replace placeholders: {{variable_name}} or %7B%7Bvariable_name%7D%7D
  return compiled.replace(
    /(?:\{\{|\%7B\%7B)\s*([a-zA-Z0-9_]+)\s*(?:\}\}|\%7D\%7D)/gi,
    (match, key, offset, fullString) => {
      const val = variables[key] !== undefined ? variables[key] : SYSTEM_VARIABLE_DEFAULTS[key];
      if (val !== undefined && val !== null) {
        const strVal = String(val);

        // Format campaign type slug into human-readable label if matching
        if (key === "type") {
          const lower = strVal.toLowerCase();
          if (CAMPAIGN_TYPE_LABELS[lower]) {
            return CAMPAIGN_TYPE_LABELS[lower];
          }
        }

        // If variable is inside a URL query parameter (e.g., mailto:...?... or ?subject=...)
        const precedingSlice = fullString.slice(Math.max(0, offset - 150), offset);
        const isInUrlQuery =
          /href=["'][^"']*\?[^"']*$/i.test(precedingSlice) ||
          /subject=[^"&]*$/i.test(precedingSlice);

        if (isInUrlQuery) {
          return encodeURIComponent(strVal);
        }

        // If variable already contains HTML tags (like <p>, <div>, <br/>, <table>), return as is
        if (strVal.includes("<p") || strVal.includes("<div") || strVal.includes("<table") || strVal.includes("<br")) {
          return strVal;
        }

        // For multiline text variables with enters (e.g., contentHtml, message, replyMessage)
        if (strVal.includes("\n")) {
          if (key === "contentHtml") {
            // Split double enters into paragraphs, single enters into <br/>
            return strVal
              .replace(/\r\n/g, "\n")
              .replace(/\r/g, "\n")
              .split(/\n\s*\n/)
              .map((para) => {
                const trimmed = para.trim();
                if (!trimmed) return "";
                const withBr = trimmed.replace(/\n/g, "<br/>");
                return `<p style="margin: 0 0 16px; font-size: 15px; line-height: 1.7; color: #d4d4d8;">${withBr}</p>`;
              })
              .filter(Boolean)
              .join("");
          }

          // For standard text fields (e.g. message, replyMessage)
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


