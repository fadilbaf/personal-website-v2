import { createClient } from "@/src/services/supabase/client";
import type { Project, ProjectType, ProjectCategory } from "@/src/types/database";
import { sanitizeStorageUrls } from "@/src/lib/storage-url";

/**
 * Project service — CRUD for projects, types, and categories.
 */
export const ProjectService = {
  // --- Projects ---
  async getAll(): Promise<Project[]> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("projects")
      .select("*, type:project_types(*), category:project_categories(*), project_images(*), project_skills(skill_id, skill:skills(*))")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return sanitizeStorageUrls(data as Project[]);
  },

  async getById(id: string): Promise<Project> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("projects")
      .select(`
        *,
        type:project_types(*),
        category:project_categories(*),
        project_images(*),
        project_skills(skill_id, skill:skills(*)),
        project_responsibilities(*),
        project_features(*)
      `)
      .eq("id", id)
      .order("sort_order", { foreignTable: "project_images", ascending: true })
      .order("sort_order", { foreignTable: "project_responsibilities", ascending: true })
      .order("sort_order", { foreignTable: "project_features", ascending: true })
      .single();
    if (error) throw error;
    return sanitizeStorageUrls(data as Project);
  },

  async getBySlug(slug: string): Promise<Project> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("projects")
      .select(`
        *,
        type:project_types(*),
        category:project_categories(*),
        project_images(*),
        project_skills(skill_id, skill:skills(*)),
        project_responsibilities(*),
        project_features(*)
      `)
      .eq("slug", slug)
      .order("sort_order", { foreignTable: "project_images", ascending: true })
      .order("sort_order", { foreignTable: "project_responsibilities", ascending: true })
      .order("sort_order", { foreignTable: "project_features", ascending: true })
      .single();
    if (error) throw error;
    return sanitizeStorageUrls(data as Project);
  },

  async create(
    payload: Partial<Project>,
    images?: { url: string; sort_order: number }[],
    skill_ids?: string[],
    responsibilities?: { content_id: string; content_en: string; sort_order: number }[],
    features?: { title_id: string; title_en: string; description_id: string; description_en: string; sort_order: number }[]
  ) {
    const supabase = createClient();
    
    const { data: project, error } = await supabase
      .from("projects")
      .insert(payload)
      .select()
      .single();
    if (error) throw error;

    if (images && images.length > 0) {
      const { error: imgError } = await supabase.from("project_images").insert(
        images.map((img) => ({
          project_id: project.id,
          image_url: img.url,
          sort_order: img.sort_order,
        }))
      );
      if (imgError) console.error("Failed to insert project images", imgError);
    }

    if (skill_ids && skill_ids.length > 0) {
      const { error: skillError } = await supabase.from("project_skills").insert(
        skill_ids.map((id) => ({
          project_id: project.id,
          skill_id: id,
        }))
      );
      if (skillError) console.error("Failed to insert project skills", skillError);
    }

    if (responsibilities && responsibilities.length > 0) {
      const { error: respError } = await supabase.from("project_responsibilities").insert(
        responsibilities.map((resp) => ({
          project_id: project.id,
          ...resp,
        }))
      );
      if (respError) console.error("Failed to insert project responsibilities", respError);
    }

    if (features && features.length > 0) {
      const { error: featError } = await supabase.from("project_features").insert(
        features.map((feat) => ({
          project_id: project.id,
          ...feat,
        }))
      );
      if (featError) console.error("Failed to insert project features", featError);
    }

    return project as Project;
  },

  async update(
    id: string,
    payload: Partial<Project>,
    images?: { url: string; sort_order: number }[],
    skill_ids?: string[],
    responsibilities?: { content_id: string; content_en: string; sort_order: number }[],
    features?: { title_id: string; title_en: string; description_id: string; description_en: string; sort_order: number }[]
  ) {
    const supabase = createClient();
    
    // 1. Update core project data
    const { data: project, error } = await supabase
      .from("projects")
      .update(payload)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;

    // 2. Update images if provided
    if (images) {
      await supabase.from("project_images").delete().eq("project_id", id);
      if (images.length > 0) {
        await supabase.from("project_images").insert(
          images.map((img) => ({
            project_id: id,
            image_url: img.url,
            sort_order: img.sort_order,
          }))
        );
      }
    }

    // 3. Update skills if provided
    if (skill_ids) {
      await supabase.from("project_skills").delete().eq("project_id", id);
      if (skill_ids.length > 0) {
        await supabase.from("project_skills").insert(
          skill_ids.map((skillId) => ({
            project_id: id,
            skill_id: skillId,
          }))
        );
      }
    }

    // 4. Update responsibilities if provided
    if (responsibilities) {
      await supabase.from("project_responsibilities").delete().eq("project_id", id);
      if (responsibilities.length > 0) {
        await supabase.from("project_responsibilities").insert(
          responsibilities.map((resp) => ({
            project_id: id,
            ...resp,
          }))
        );
      }
    }

    // 5. Update features if provided
    if (features) {
      await supabase.from("project_features").delete().eq("project_id", id);
      if (features.length > 0) {
        await supabase.from("project_features").insert(
          features.map((feat) => ({
            project_id: id,
            ...feat,
          }))
        );
      }
    }

    return project as Project;
  },

  async delete(id: string) {
    const supabase = createClient();
    const { error } = await supabase.from("projects").delete().eq("id", id);
    if (error) throw error;
  },

  // --- Types ---
  async getTypes(): Promise<ProjectType[]> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("project_types")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data as ProjectType[];
  },

  async createType(payload: Partial<ProjectType>) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("project_types")
      .insert(payload)
      .select()
      .single();
    if (error) throw error;
    return data as ProjectType;
  },

  async updateType(id: string, payload: Partial<ProjectType>) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("project_types")
      .update(payload)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data as ProjectType;
  },

  async deleteType(id: string) {
    const supabase = createClient();
    const { error } = await supabase.from("project_types").delete().eq("id", id);
    if (error) throw error;
  },

  // --- Categories ---
  async getCategories(): Promise<ProjectCategory[]> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("project_categories")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data as ProjectCategory[];
  },

  async createCategory(payload: Partial<ProjectCategory>) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("project_categories")
      .insert(payload)
      .select()
      .single();
    if (error) throw error;
    return data as ProjectCategory;
  },

  async updateCategory(id: string, payload: Partial<ProjectCategory>) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("project_categories")
      .update(payload)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data as ProjectCategory;
  },

  async deleteCategory(id: string) {
    const supabase = createClient();
    const { error } = await supabase
      .from("project_categories")
      .delete()
      .eq("id", id);
    if (error) throw error;
  },
};
