import { createClient } from "@/src/services/supabase/client";
import type { Blog, BlogType, BlogCategory } from "@/src/types/database";

/**
 * Blog service — CRUD for blogs, types, and categories.
 */
export const BlogService = {
  async getAll(): Promise<Blog[]> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("blogs")
      .select("*, type:blog_types(*), category:blog_categories(*), author:profiles(*)")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data as Blog[];
  },

  async getById(id: string): Promise<Blog> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("blogs")
      .select("*, type:blog_types(*), category:blog_categories(*), author:profiles(*)")
      .eq("id", id)
      .single();
    if (error) throw error;

    if (data) {
      const { data: tagsData } = await supabase
        .from("blog_tags")
        .select("tag")
        .eq("blog_id", data.id);
      if (tagsData) {
        data.tags = tagsData.map((t) => t.tag);
      }
    }

    return data as Blog;
  },

  async getBySlug(slug: string): Promise<Blog | null> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("blogs")
      .select("*, type:blog_types(*), category:blog_categories(*), author:profiles(*)")
      .eq("slug", slug)
      .single();
    if (error) {
      if (error.code === "PGRST116") return null;
      throw error;
    }

    if (data) {
      const { data: tagsData } = await supabase
        .from("blog_tags")
        .select("tag")
        .eq("blog_id", data.id);
      if (tagsData) {
        data.tags = tagsData.map((t) => t.tag);
      }
    }

    return data as Blog;
  },

  /**
   * Increment blog views using PostgreSQL Atomic Function (RPC)
   * to avoid race conditions.
   */
  async incrementViews(id: string): Promise<void> {
    const supabase = createClient();
    const { error } = await supabase.rpc("increment_blog_views", {
      target_id: id,
    });
    if (error) {
      // Fallback if RPC is not installed or errors
      const { data: blog } = await supabase
        .from("blogs")
        .select("views_count")
        .eq("id", id)
        .single();
      if (blog) {
        await supabase
          .from("blogs")
          .update({ views_count: (blog.views_count || 0) + 1 })
          .eq("id", id);
      }
    }
  },

  /**
   * Check if a specific visitor has already liked this blog.
   */
  async getLikeStatus(blogId: string, visitorHash: string): Promise<boolean> {
    const supabase = createClient();
    const { data } = await supabase
      .from("blog_likes")
      .select("id")
      .eq("blog_id", blogId)
      .eq("visitor_hash", visitorHash)
      .maybeSingle();
    return !!data;
  },

  /**
   * Toggle like for a specific visitor hash.
   * Inserts or deletes from blog_likes; DB trigger automatically keeps likes_count in sync.
   */
  async toggleLike(
    blogId: string,
    visitorHash: string
  ): Promise<{ hasLiked: boolean; likesCount: number }> {
    const supabase = createClient();
    
    // Check existing like
    const { data: existing } = await supabase
      .from("blog_likes")
      .select("id")
      .eq("blog_id", blogId)
      .eq("visitor_hash", visitorHash)
      .maybeSingle();

    if (existing) {
      // Unlike
      await supabase.from("blog_likes").delete().eq("id", existing.id);
    } else {
      // Like
      await supabase.from("blog_likes").insert({
        blog_id: blogId,
        visitor_hash: visitorHash,
      });
    }

    // Fetch updated likes_count
    const { data: blog } = await supabase
      .from("blogs")
      .select("likes_count")
      .eq("id", blogId)
      .single();

    return {
      hasLiked: !existing,
      likesCount: blog?.likes_count ?? 0,
    };
  },

  async getSidebarBlogs(currentId: string, categoryId?: string | null) {
    const supabase = createClient();

    const { data: popular } = await supabase
      .from("blogs")
      .select("*, type:blog_types(*), category:blog_categories(*), author:profiles(*)")
      .eq("is_published", true)
      .neq("id", currentId)
      .order("views_count", { ascending: false })
      .limit(3);

    let relatedQuery = supabase
      .from("blogs")
      .select("*, type:blog_types(*), category:blog_categories(*), author:profiles(*)")
      .eq("is_published", true)
      .neq("id", currentId);

    if (categoryId) {
      relatedQuery = relatedQuery.eq("category_id", categoryId);
    }

    const { data: related } = await relatedQuery
      .order("created_at", { ascending: false })
      .limit(3);

    const { data: latest } = await supabase
      .from("blogs")
      .select("*, type:blog_types(*), category:blog_categories(*), author:profiles(*)")
      .eq("is_published", true)
      .neq("id", currentId)
      .order("created_at", { ascending: false })
      .limit(3);

    return {
      popular: (popular || []) as Blog[],
      related: (related || []) as Blog[],
      latest: (latest || []) as Blog[],
    };
  },

  async create(payload: Partial<Blog>) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("blogs")
      .insert(payload)
      .select()
      .single();
    if (error) throw error;
    return data as Blog;
  },

  async update(id: string, payload: Partial<Blog>) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("blogs")
      .update(payload)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data as Blog;
  },

  async delete(id: string) {
    const supabase = createClient();
    const { error } = await supabase.from("blogs").delete().eq("id", id);
    if (error) throw error;
  },

  // --- Types ---
  async getTypes(): Promise<BlogType[]> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("blog_types")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data as BlogType[];
  },

  async createType(payload: Partial<BlogType>) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("blog_types")
      .insert(payload)
      .select()
      .single();
    if (error) throw error;
    return data as BlogType;
  },

  async updateType(id: string, payload: Partial<BlogType>) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("blog_types")
      .update(payload)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data as BlogType;
  },

  async deleteType(id: string) {
    const supabase = createClient();
    const { error } = await supabase.from("blog_types").delete().eq("id", id);
    if (error) throw error;
  },

  // --- Categories ---
  async getCategories(): Promise<BlogCategory[]> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("blog_categories")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data as BlogCategory[];
  },

  async createCategory(payload: Partial<BlogCategory>) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("blog_categories")
      .insert(payload)
      .select()
      .single();
    if (error) throw error;
    return data as BlogCategory;
  },

  async updateCategory(id: string, payload: Partial<BlogCategory>) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("blog_categories")
      .update(payload)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data as BlogCategory;
  },

  async deleteCategory(id: string) {
    const supabase = createClient();
    const { error } = await supabase
      .from("blog_categories")
      .delete()
      .eq("id", id);
    if (error) throw error;
  },

  // --- Tags ---
  async getUniqueTags(): Promise<string[]> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("blog_tags")
      .select("tag");
    
    if (error) throw error;
    
    // Extract unique tags and sort alphabetically
    const tags = data.map((t) => t.tag);
    return Array.from(new Set(tags)).sort();
  },

  async syncTags(blogId: string, tags: string[]) {
    const supabase = createClient();
    
    // 1. Delete old tags
    const { error: deleteError } = await supabase
      .from("blog_tags")
      .delete()
      .eq("blog_id", blogId);
    
    if (deleteError) throw deleteError;

    // 2. Insert new tags
    if (tags.length > 0) {
      const tagRows = tags.map((tag) => ({
        blog_id: blogId,
        tag: tag.trim(),
      }));
      
      const { error: insertError } = await supabase
        .from("blog_tags")
        .insert(tagRows);
      
      if (insertError) throw insertError;
    }
  },

  async getTagsByBlogId(blogId: string): Promise<string[]> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("blog_tags")
      .select("tag")
      .eq("blog_id", blogId);
    
    if (error) throw error;
    return data.map((t) => t.tag);
  },
};
