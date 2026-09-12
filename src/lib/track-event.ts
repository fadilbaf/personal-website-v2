import { AnalyticsService } from "@/src/services/analytics.service";

declare global {
  interface Window {
    umami?: {
      track: (
        eventName: string | Record<string, any>,
        eventData?: Record<string, any>
      ) => void;
    };
  }
}

/**
 * Generate an anonymous visitor hash using browser-native SubtleCrypto.
 * Based on UserAgent + screen dimensions — no real IP is stored.
 */
export async function getVisitorHash(): Promise<string> {
  if (typeof window === "undefined") return "anonymous";
  try {
    const raw = navigator.userAgent + screen.width + screen.height;
    const encoder = new TextEncoder();
    const hashBuffer = await crypto.subtle.digest("SHA-256", encoder.encode(raw));
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  } catch {
    return "anonymous_fallback";
  }
}

/**
 * Track an analytics event.
 * Synchronously records to both Umami Cloud (if available) and Supabase database.
 * Fails silently to never break visitor UX.
 *
 * @param eventType - 'page_view' | 'project_click' | 'blog_click' | 'language_switch' | 'cv_download'
 * @param eventKey  - Additional identifier (slug, locale code, etc.)
 * @param customData - Any additional key-value payload
 */
export async function trackEvent(
  eventType: string,
  eventKey?: string,
  customData?: Record<string, any>
): Promise<void> {
  try {
    // 1. Send to Umami Cloud tracker
    if (typeof window !== "undefined" && window.umami) {
      window.umami.track(eventType, {
        name: eventKey,
        path: window.location.pathname,
        ...customData,
      });
    }

    // 2. Send to Supabase database (powers local & deployed Admin Dashboard)
    const visitorHash = await getVisitorHash();
    await AnalyticsService.trackEvent({
      event_type: eventType,
      event_key: eventKey,
      page_path: typeof window !== "undefined" ? window.location.pathname : undefined,
      referrer: typeof document !== "undefined" ? document.referrer || undefined : undefined,
      visitor_hash: visitorHash,
    });
  } catch {
    // Silent fail — analytics should never break user experience
  }
}
