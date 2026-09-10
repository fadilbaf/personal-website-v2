import { createClient } from "@/src/services/supabase/client";
import type { Profile, Role, Badge, Contact, About } from "@/src/types/database";

/**
 * Public data needed for the /links page and main layout.
 */
export interface LinksPageData {
  profile: Profile | null;
  roles: Role[];
  badges: Badge[];
  contact: Contact | null;
  about: About | null;
}

/**
 * Links service — fetches public data for the Link in Bio page.
 * No authentication required; relies on RLS public read policies.
 */
export const LinksService = {
  async getAll(): Promise<LinksPageData> {
    const supabase = createClient();

    const [profileRes, rolesRes, badgesRes, contactRes, aboutRes] = await Promise.all([
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
    ]);

    return {
      profile: (profileRes.data as Profile) ?? null,
      roles: (rolesRes.data as Role[]) ?? [],
      badges: (badgesRes.data as Badge[]) ?? [],
      contact: (contactRes.data as Contact) ?? null,
      about: (aboutRes.data as About) ?? null,
    };
  },
};
