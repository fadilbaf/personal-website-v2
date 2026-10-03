import { createClient } from "@/src/services/supabase/client";
import type {
  Profile,
  Role,
  Badge,
  Contact,
  About,
  LinkItem,
  LinksStatistics,
} from "@/src/types/database";
import { sanitizeStorageUrls } from "@/src/lib/storage-url";

/**
 * Public data needed for the /links page and main layout.
 */
export interface LinksPageData {
  profile: Profile | null;
  roles: Role[];
  badges: Badge[];
  contact: Contact | null;
  about: About | null;
  links: LinkItem[];
}

/**
 * Links service — manages dynamic links and public Link-in-bio data.
 */
export const LinksService = {
  // ─── PUBLIC DATA ─────────────────────────────────────────────
  /** Fetch all public profile & active link data for the Link in Bio page */
  async getAll(): Promise<LinksPageData> {
    const supabase = createClient();

    const [profileRes, rolesRes, badgesRes, contactRes, aboutRes, linksRes] =
      await Promise.all([
        supabase.from("profiles").select("*").limit(1).single(),
        supabase
          .from("roles")
          .select("id, role_id, role_en, is_active")
          .eq("is_active", true)
          .order("created_at", { ascending: true }),
        supabase
          .from("badges")
          .select("id, name_id, name_en, is_active")
          .eq("is_active", true)
          .order("created_at", { ascending: true }),
        supabase.from("contacts").select("*").limit(1).single(),
        supabase.from("about").select("*").limit(1).single(),
        supabase
          .from("links")
          .select("*")
          .eq("is_active", true)
          .order("sort_order", { ascending: true }),
      ]);

    return {
      ...sanitizeStorageUrls({
        profile: (profileRes.data as Profile) ?? null,
        roles: (rolesRes.data as Role[]) ?? [],
        badges: (badgesRes.data as Badge[]) ?? [],
        contact: (contactRes.data as Contact) ?? null,
        about: (aboutRes.data as About) ?? null,
      }),
      links: (linksRes.data as LinkItem[]) ?? [],
    };
  },

  // ─── ADMIN CRUD OPERATIONS ──────────────────────────────────
  /** Fetch all links (both active and inactive) for admin dashboard */
  async getAllLinks(): Promise<LinkItem[]> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("links")
      .select("*")
      .order("sort_order", { ascending: true });

    if (error) throw error;
    return (data as LinkItem[]) ?? [];
  },

  /** Fetch active links only */
  async getActiveLinks(): Promise<LinkItem[]> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("links")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    if (error) throw error;
    return (data as LinkItem[]) ?? [];
  },

  /** Fetch single link by ID */
  async getLinkById(id: string): Promise<LinkItem> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("links")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data as LinkItem;
  },

  /** Create a new link */
  async createLink(payload: Partial<LinkItem>): Promise<LinkItem> {
    const supabase = createClient();

    // Determine highest sort_order if not provided
    if (payload.sort_order === undefined) {
      const { data: latest } = await supabase
        .from("links")
        .select("sort_order")
        .order("sort_order", { ascending: false })
        .limit(1);

      payload.sort_order = latest && latest.length > 0 ? (latest[0].sort_order || 0) + 1 : 1;
    }

    const { data, error } = await supabase
      .from("links")
      .insert(payload)
      .select()
      .single();

    if (error) throw error;
    return data as LinkItem;
  },

  /** Update an existing link */
  async updateLink(id: string, payload: Partial<LinkItem>): Promise<LinkItem> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("links")
      .update(payload)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data as LinkItem;
  },

  /** Delete a link by ID */
  async deleteLink(id: string): Promise<boolean> {
    const supabase = createClient();
    const { error } = await supabase.from("links").delete().eq("id", id);
    if (error) throw error;
    return true;
  },

  /** Batch update sort orders for links */
  async reorderLinks(items: { id: string; sort_order: number }[]): Promise<boolean> {
    const supabase = createClient();

    // Use Promise.all to update sort orders concurrently
    const updates = items.map((item) =>
      supabase
        .from("links")
        .update({ sort_order: item.sort_order })
        .eq("id", item.id)
    );

    const results = await Promise.all(updates);
    const hasError = results.some((r) => r.error);
    if (hasError) {
      const firstError = results.find((r) => r.error)?.error;
      throw firstError || new Error("Failed to reorder links");
    }

    return true;
  },

  /** Fetch statistics for links page and link items */
  async getStats(): Promise<LinksStatistics> {
    const supabase = createClient();

    // Fetch link counts from Supabase
    const { data: linksData } = await supabase
      .from("links")
      .select("id, is_active");

    const total_links = linksData?.length || 0;
    const active_links = linksData?.filter((l) => l.is_active).length || 0;

    // Fetch views and unique visitors for /links from analytics_events
    let total_views = 0;
    let unique_visitors = 0;

    try {
      const { data: pageviewsData } = await supabase
        .from("analytics_events")
        .select("visitor_hash")
        .eq("event_type", "page_view")
        .ilike("page_path", "%/links%");

      if (pageviewsData) {
        total_views = pageviewsData.length;
        const uniqueSet = new Set(pageviewsData.map((d) => d.visitor_hash).filter(Boolean));
        unique_visitors = uniqueSet.size;
      }
    } catch {
      // Ignore if analytics query fails
    }

    return {
      total_links,
      active_links,
      total_views,
      unique_visitors,
    };
  },
};
