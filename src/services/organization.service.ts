import { createClient } from "@/src/services/supabase/client";
import type { Organization } from "@/src/types/database";
import { sanitizeStorageUrls } from "@/src/lib/storage-url";

/**
 * Organization service — CRUD operations for organization records.
 */
export const OrganizationService = {
  async getAll(): Promise<Organization[]> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("organizations")
      .select("*")
      .order("start_date", { ascending: false });
    if (error) throw error;
    return sanitizeStorageUrls(data as Organization[]);
  },

  async getById(id: string): Promise<Organization> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("organizations")
      .select("*")
      .eq("id", id)
      .single();
    if (error) throw error;
    return sanitizeStorageUrls(data as Organization);
  },

  async create(payload: Partial<Organization>) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("organizations")
      .insert(payload)
      .select()
      .single();
    if (error) throw error;
    return data as Organization;
  },

  async update(id: string, payload: Partial<Organization>) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("organizations")
      .update(payload)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data as Organization;
  },

  async delete(id: string) {
    const supabase = createClient();
    const { error } = await supabase.from("organizations").delete().eq("id", id);
    if (error) throw error;
  },
};
