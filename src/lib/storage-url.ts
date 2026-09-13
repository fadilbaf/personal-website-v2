/**
 * Utility to convert raw Supabase storage public asset URLs into clean proxied URLs.
 * Example:
 * https://uiotodwgeplnmxbfsloi.supabase.co/storage/v1/object/public/assets/projects/1781448440650-bo17cxtryzn.png
 * -> /storage/projects/1781448440650-bo17cxtryzn.png
 */
export function toStorageUrl(url: string | null | undefined): string {
  if (!url) return "";
  if (url.includes("/storage/v1/object/public/assets/")) {
    return url.replace(/https?:\/\/[^/]+\/storage\/v1\/object\/public\/assets\//g, "/storage/");
  }
  return url;
}

/**
 * Recursively sanitizes objects, arrays, and nested structures to convert
 * all Supabase storage public asset URLs into clean /storage/... URLs.
 */
export function sanitizeStorageUrls<T>(data: T): T {
  if (!data) return data;
  if (typeof data === "string") {
    return toStorageUrl(data) as unknown as T;
  }
  if (Array.isArray(data)) {
    return data.map((item) => sanitizeStorageUrls(item)) as unknown as T;
  }
  if (typeof data === "object" && data !== null && !(data instanceof Date)) {
    const sanitized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
      sanitized[key] = sanitizeStorageUrls(value);
    }
    return sanitized as T;
  }
  return data;
}

