import { createClient } from "@/src/services/supabase/client";
import type { Career } from "@/src/types/database";
import { sanitizeStorageUrls } from "@/src/lib/storage-url";

/**
 * Career service — CRUD operations for career/work experience records.
 */
export const CareerService = {
  async getAll(): Promise<Career[]> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("careers")
      .select("*, career_skills(skill_id, skill:skills(*))")
      .order("start_date", { ascending: false });
    if (error) throw error;
    return sanitizeStorageUrls(data as Career[]);
  },

  async getById(id: string): Promise<Career> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("careers")
      .select("*, career_skills(skill_id, skill:skills(*))")
      .eq("id", id)
      .single();
    if (error) throw error;
    return sanitizeStorageUrls(data as Career);
  },

  async create(payload: Partial<Career>, skill_ids?: string[]) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("careers")
      .insert(payload)
      .select()
      .single();
    if (error) throw error;

    if (skill_ids && skill_ids.length > 0) {
      const { error: skillError } = await supabase
        .from("career_skills")
        .insert(skill_ids.map((id) => ({ career_id: data.id, skill_id: id })));
      if (skillError) console.error("Failed to insert career skills", skillError);
    }

    return data as Career;
  },

  async update(id: string, payload: Partial<Career>, skill_ids?: string[]) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("careers")
      .update(payload)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;

    if (skill_ids !== undefined) {
      // Replace all skills
      await supabase.from("career_skills").delete().eq("career_id", id);
      if (skill_ids.length > 0) {
        await supabase
          .from("career_skills")
          .insert(skill_ids.map((skillId) => ({ career_id: id, skill_id: skillId })));
      }
    }

    return data as Career;
  },

  async delete(id: string) {
    const supabase = createClient();
    const { error } = await supabase.from("careers").delete().eq("id", id);
    if (error) throw error;
  },
};
