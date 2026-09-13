import { createClient } from "@/src/services/supabase/client";
import type { Education } from "@/src/types/database";
import { sanitizeStorageUrls } from "@/src/lib/storage-url";

/**
 * Education service — CRUD operations for education records.
 */
export const EducationService = {
  async getAll(): Promise<Education[]> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("educations")
      .select("*")
      .order("start_date", { ascending: false });
    if (error) throw error;
    return sanitizeStorageUrls(data as Education[]);
  },

  async getById(id: string): Promise<Education> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("educations")
      .select("*")
      .eq("id", id)
      .single();
    if (error) throw error;
    return sanitizeStorageUrls(data as Education);
  },

  async create(payload: Partial<Education>) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("educations")
      .insert(payload)
      .select()
      .single();
    if (error) throw error;
    return data as Education;
  },

  async update(id: string, payload: Partial<Education>) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("educations")
      .update(payload)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data as Education;
  },

  async delete(id: string) {
    const supabase = createClient();
    const { error } = await supabase.from("educations").delete().eq("id", id);
    if (error) throw error;
  },
};
