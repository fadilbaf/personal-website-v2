import { createClient } from "@/src/services/supabase/client";
import type { Skill, SkillCategory } from "@/src/types/database";
import { sanitizeStorageUrls } from "@/src/lib/storage-url";

/**
 * Skill service — CRUD operations for skills and their categories.
 */
export const SkillService = {
  // --- Skills ---
  async getAll(): Promise<Skill[]> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("skills")
      .select("*, category:skill_categories(*)")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return sanitizeStorageUrls(data as Skill[]);
  },

  async getById(id: string): Promise<Skill> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("skills")
      .select("*, category:skill_categories(*)")
      .eq("id", id)
      .single();
    if (error) throw error;
    return sanitizeStorageUrls(data as Skill);
  },

  async create(payload: Partial<Skill>) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("skills")
      .insert(payload)
      .select()
      .single();
    if (error) throw error;
    return data as Skill;
  },

  async update(id: string, payload: Partial<Skill>) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("skills")
      .update(payload)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data as Skill;
  },

  async delete(id: string) {
    const supabase = createClient();
    const { error } = await supabase.from("skills").delete().eq("id", id);
    if (error) throw error;
  },

  // --- Categories ---
  async getCategories(): Promise<SkillCategory[]> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("skill_categories")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data as SkillCategory[];
  },

  async createCategory(payload: Partial<SkillCategory>) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("skill_categories")
      .insert(payload)
      .select()
      .single();
    if (error) throw error;
    return data as SkillCategory;
  },

  async updateCategory(id: string, payload: Partial<SkillCategory>) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("skill_categories")
      .update(payload)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data as SkillCategory;
  },

  async deleteCategory(id: string) {
    const supabase = createClient();
    const { error } = await supabase.from("skill_categories").delete().eq("id", id);
    if (error) throw error;
  },
};
