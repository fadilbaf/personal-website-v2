import { createClient } from "@/src/services/supabase/client";
import type { Badge } from "@/src/types/database";

/**
 * Badge service — CRUD operations for hero badges.
 */
export const BadgeService = {
  async getAll(): Promise<Badge[]> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("badges")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data as Badge[];
  },

  async getActive(): Promise<Badge[]> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("badges")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: true });
    if (error) throw error;
    return data as Badge[];
  },

  async getById(id: string): Promise<Badge> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("badges")
      .select("*")
      .eq("id", id)
      .single();
    if (error) throw error;
    return data as Badge;
  },

  async create(payload: Partial<Badge>) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("badges")
      .insert(payload)
      .select()
      .single();
    if (error) throw error;
    return data as Badge;
  },

  async update(id: string, payload: Partial<Badge>) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("badges")
      .update(payload)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data as Badge;
  },

  async delete(id: string) {
    const supabase = createClient();
    const { error } = await supabase.from("badges").delete().eq("id", id);
    if (error) throw error;
    return true;
  },
};
