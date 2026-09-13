import { createClient } from "@/src/services/supabase/server";
import { LinksClient } from "@/src/components/links/links-client";
import type { LinksLocale } from "@/src/lib/links-translations";
import type { Profile, Role, Badge, Contact, About } from "@/src/types/database";
import { sanitizeStorageUrls } from "@/src/lib/storage-url";

// Keep it dynamic so it always fetches fresh data on requests (essential since database records update)
export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ locale: string }>;
}

/**
 * /links page — Server Component that pre-renders the Link-in-bio page.
 * Fetches data on the server via Supabase Server Client to eliminate client-side loading skeletons.
 */
export default async function LinksPage({ params }: PageProps) {
  const { locale } = (await params) as { locale: LinksLocale };

  // Fetch all public data concurrently on the server
  const supabase = await createClient();
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

  const initialData = sanitizeStorageUrls({
    profile: (profileRes.data as Profile) ?? null,
    roles: (rolesRes.data as Role[]) ?? [],
    badges: (badgesRes.data as Badge[]) ?? [],
    contact: (contactRes.data as Contact) ?? null,
    about: (aboutRes.data as About) ?? null,
  });

  return <LinksClient locale={locale} initialData={initialData} />;
}
