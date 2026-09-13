import { createClient } from "@/src/services/supabase/client";
import type {
  Achievement,
  AchievementType,
  AchievementCategory,
} from "@/src/types/database";
import { sanitizeStorageUrls } from "@/src/lib/storage-url";

/**
 * Achievement service — CRUD for achievements, types, and categories.
 */
export const AchievementService = {
  async getAll(): Promise<Achievement[]> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("achievements")
      .select("*, type:achievement_types(*), category:achievement_categories(*)")
      .order("issue_date", { ascending: false });
    if (error) throw error;
    return sanitizeStorageUrls(data as Achievement[]);
  },

  async getById(id: string): Promise<Achievement> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("achievements")
      .select("*, type:achievement_types(*), category:achievement_categories(*)")
      .eq("id", id)
      .single();
    if (error) throw error;
    return sanitizeStorageUrls(data as Achievement);
  },

  async create(payload: Partial<Achievement>) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("achievements")
      .insert(payload)
      .select()
      .single();
    if (error) throw error;
    return data as Achievement;
  },

  async update(id: string, payload: Partial<Achievement>) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("achievements")
      .update(payload)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data as Achievement;
  },

  async delete(id: string) {
    const supabase = createClient();
    const { error } = await supabase.from("achievements").delete().eq("id", id);
    if (error) throw error;
  },

  // --- Types ---
  async getTypes(): Promise<AchievementType[]> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("achievement_types")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data as AchievementType[];
  },

  async createType(payload: Partial<AchievementType>) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("achievement_types")
      .insert(payload)
      .select()
      .single();
    if (error) throw error;
    return data as AchievementType;
  },

  async updateType(id: string, payload: Partial<AchievementType>) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("achievement_types")
      .update(payload)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data as AchievementType;
  },

  async deleteType(id: string) {
    const supabase = createClient();
    const { error } = await supabase.from("achievement_types").delete().eq("id", id);
    if (error) throw error;
  },

  // --- Categories ---
  async getCategories(): Promise<AchievementCategory[]> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("achievement_categories")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data as AchievementCategory[];
  },

  async createCategory(payload: Partial<AchievementCategory>) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("achievement_categories")
      .insert(payload)
      .select()
      .single();
    if (error) throw error;
    return data as AchievementCategory;
  },

  async updateCategory(id: string, payload: Partial<AchievementCategory>) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("achievement_categories")
      .update(payload)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data as AchievementCategory;
  },

  async deleteCategory(id: string) {
    const supabase = createClient();
    const { error } = await supabase
      .from("achievement_categories")
      .delete()
      .eq("id", id);
    if (error) throw error;
  },
};
