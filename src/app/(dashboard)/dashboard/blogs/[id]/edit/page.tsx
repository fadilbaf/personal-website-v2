"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, FileText, Save, X } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { ImageUpload } from "@/components/dashboard/image-upload";
import { RichTextEditor } from "@/components/dashboard/rich-text-editor";
import { TagsInput } from "@/components/dashboard/tags-input";
import { Skeleton } from "@/components/ui/skeleton";
import { BlogService } from "@/src/services/blog.service";
import { StorageService } from "@/src/services/storage.service";
import { STORAGE_PATHS } from "@/src/lib/constants";
import type { BlogType, BlogCategory } from "@/src/types/database";
import { useLanguage } from "@/context/language-context";
import { useQuery, useQueryClient } from "@tanstack/react-query";

const schema = z.object({
  slug: z.string().min(1, "Slug is required"),
  title_id: z.string().min(1, "Title (ID) is required"),
  title_en: z.string().min(1, "Title (EN) is required"),
  type_id: z.string().min(1, "Type is required"),
  category_id: z.string().min(1, "Category is required"),
  is_published: z.boolean(),
  tags: z.array(z.string()).min(1, "At least one tag is required")
});

type FormData = z.infer<typeof schema>;

const formatDateTime = (dateStr?: string | null, lang: "en" | "id" = "en") => {
  if (!dateStr) return "-";
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString(lang === "en" ? "en-US" : "id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  } catch {
    return dateStr;
  }
};

export default function BlogEditPage() {
  const { t, language } = useLanguage();
  const router = useRouter();
  const { id } = useParams() as { id: string };
  const queryClient = useQueryClient();
  const [thumbFile, setThumbFile] = useState<File | null>(null);
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);
  const [contentId, setContentId] = useState("");
  const [contentEn, setContentEn] = useState("");
  const [initialContentId, setInitialContentId] = useState("");
  const [initialContentEn, setInitialContentEn] = useState("");

  const { data: blog, isLoading: isBlogLoading } = useQuery({
    queryKey: ["blog", id],
    queryFn: () => BlogService.getById(id),
    meta: { resource: "sidebar.Blogs" },
  });

  const { data: types = [], isLoading: isTypesLoading } = useQuery({
    queryKey: ["blog-types"],
    queryFn: BlogService.getTypes,
    meta: { resource: "blogs.types" },
  });

  const { data: categories = [], isLoading: isCategoriesLoading } = useQuery({
    queryKey: ["blog-categories"],
    queryFn: BlogService.getCategories,
    meta: { resource: "blogs.categories" },
  });

  const { data: allTags = [], isLoading: isAllTagsLoading } = useQuery({
    queryKey: ["blog-all-tags"],
    queryFn: BlogService.getUniqueTags,
    meta: { resource: "blogs.tags" },
  });

  const { data: currentTags = [], isLoading: isCurrentTagsLoading } = useQuery({
    queryKey: ["blog-tags", id],
    queryFn: () => BlogService.getTagsByBlogId(id),
    meta: { resource: "blogs.tags" },
  });

  const loading = isBlogLoading || isTypesLoading || isCategoriesLoading || isAllTagsLoading || isCurrentTagsLoading;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting, isDirty, isValid }
  } = useForm<FormData>({
    resolver: zodResolver(schema) as any,
    mode: "onChange"
  });

  const hasContentChanged = contentId !== initialContentId || contentEn !== initialContentEn;
  const hasImageChanged = thumbFile !== null;
  const isSaveDisabled = 
    isSubmitting || 
    !isValid || 
    (!isDirty && !hasContentChanged && !hasImageChanged) ||
    !contentId?.trim() ||
    contentId === "<p></p>" ||
    !contentEn?.trim() ||
    contentEn === "<p></p>" ||
    (!currentImageUrl && !thumbFile);

  useEffect(() => {
    if (blog) {
      setCurrentImageUrl(blog.image_url);
      setContentId(blog.content_id || "");
      setContentEn(blog.content_en || "");
      setInitialContentId(blog.content_id || "");
      setInitialContentEn(blog.content_en || "");
      reset({
        slug: blog.slug,
        title_id: blog.title_id,
        title_en: blog.title_en,
        type_id: blog.type_id || "",
        category_id: blog.category_id || "",
        is_published: blog.is_published,
        tags: currentTags || []
      });
    }
  }, [blog, currentTags, reset]);

  const onSubmit = async (data: FormData) => {
    try {
      let image_url = currentImageUrl;
      if (thumbFile) {
        const r = await StorageService.uploadImage(STORAGE_PATHS.BLOGS, thumbFile);
        image_url = r.publicUrl;
      }

      // Separate tags from the main blog data
      const { tags, ...blogData } = data;

      await BlogService.update(id, {
        ...blogData,
        image_url,
        content_id: contentId || null,
        content_en: contentEn || null
      });

      // Sync tags
      await BlogService.syncTags(id, tags || []);

      toast.success(t("blogs.saved_success"));
      await queryClient.invalidateQueries({ queryKey: ["blogs"] });
      await queryClient.invalidateQueries({ queryKey: ["blog", id] });
      await queryClient.invalidateQueries({ queryKey: ["blog-tags", id] });
      router.push("/dashboard/blogs/list");
    } catch (e: unknown) {
      toast.error(t("blogs.saved_failed"), {
        description: e instanceof Error ? e.message : "An unexpected error occurred"
      });
    }
  };

  return (
    <>
      <PageHeader
        title={t("blogs.edit_blog")}
        icon={FileText}
        breadcrumbs={[
          { label: t("dashboard.title"), href: "/dashboard" },
          { label: t("blogs.title"), href: "/dashboard/blogs/list" },
          { label: t("common.edit") }
        ]}
      />

      <div className="w-full">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Card className="overflow-visible border-neutral-200/60 bg-white/80 backdrop-blur-sm dark:border-white/10 dark:bg-neutral-900/80">
            <CardContent className="p-6 space-y-8">
              {/* Thumbnail Section with Top-Right Date Time */}
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-4">
                  <Label className="text-base font-semibold text-neutral-900 dark:text-white">
                    {language === "en" ? "Thumbnail Blog" : "Thumbnail Artikel"}
                  </Label>
                  {blog?.created_at && (
                    <span className="text-xs text-neutral-500 dark:text-neutral-400 font-medium select-none">
                      {formatDateTime(blog.created_at, language)}
                    </span>
                  )}
                </div>
                <div className="max-w-2xl">
                  {loading ? (
                    <Skeleton className="aspect-video w-full rounded-xl" />
                  ) : (
                    <ImageUpload
                      accept="image"
                      value={currentImageUrl || undefined}
                      onChange={(f) => {
                        setThumbFile(f);
                        if (!f) setCurrentImageUrl(null);
                      }}
                      previewClassName="aspect-video w-full"
                    />
                  )}
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>{language === "en" ? "Title (ID)" : "Judul (ID)"}</Label>
                  {loading ? (
                    <Skeleton className="h-10 w-full" />
                  ) : (
                    <Input
                      {...register("title_id")}
                      placeholder="e.g., Cara membuat aplikasi Next.js"
                    />
                  )}
                  {errors.title_id && <p className="text-xs text-red-500">{errors.title_id.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>{language === "en" ? "Title (EN)" : "Judul (EN)"}</Label>
                  {loading ? (
                    <Skeleton className="h-10 w-full" />
                  ) : (
                    <Input
                      {...register("title_en")}
                      placeholder="e.g., How to build a Next.js application"
                    />
                  )}
                  {errors.title_en && <p className="text-xs text-red-500">{errors.title_en.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label>Slug</Label>
                  {loading ? (
                    <Skeleton className="h-10 w-full" />
                  ) : (
                    <Input
                      {...register("slug")}
                      placeholder="e.g., how-to-build-nextjs-app"
                    />
                  )}
                  {errors.slug && <p className="text-xs text-red-500">{errors.slug.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Tags</Label>
                  {loading ? (
                    <Skeleton className="h-10 w-full" />
                  ) : (
                    <TagsInput
                      value={watch("tags") || []}
                      onChange={(tags) => {
                        setValue("tags", tags, { shouldDirty: true });
                      }}
                      suggestions={allTags}
                      placeholder={language === "en" ? "Type tag and press space/enter..." : "Ketik tag lalu tekan spasi/enter..."}
                    />
                  )}
                </div>

                <div className="space-y-2">
                  <Label>{t("blogs.form_type")}</Label>
                  {loading ? (
                    <Skeleton className="h-10 w-full" />
                  ) : (
                    <Select
                      onValueChange={(v) => setValue("type_id", v, { shouldValidate: true, shouldDirty: true })}
                      value={watch("type_id")}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={language === "en" ? "Select post type" : "Pilih tipe artikel"} />
                      </SelectTrigger>
                      <SelectContent>
                        {types.map((tItem) => (
                          <SelectItem key={tItem.id} value={tItem.id}>{tItem[language === "en" ? "name_en" : "name_id"]}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>{t("blogs.form_category")}</Label>
                  {loading ? (
                    <Skeleton className="h-10 w-full" />
                  ) : (
                    <Select
                      onValueChange={(v) => setValue("category_id", v, { shouldValidate: true, shouldDirty: true })}
                      value={watch("category_id")}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={language === "en" ? "Select category" : "Pilih kategori"} />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((c) => (
                          <SelectItem key={c.id} value={c.id}>{c[language === "en" ? "name_en" : "name_id"]}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>{language === "en" ? "Content (ID)" : "Konten (ID)"}</Label>
                  {loading ? (
                    <Skeleton className="h-[300px] w-full rounded-xl" />
                  ) : (
                    <RichTextEditor content={contentId} onChange={setContentId} />
                  )}
                </div>
                <div className="space-y-2">
                  <Label>{language === "en" ? "Content (EN)" : "Konten (EN)"}</Label>
                  {loading ? (
                    <Skeleton className="h-[300px] w-full rounded-xl" />
                  ) : (
                    <RichTextEditor content={contentEn} onChange={setContentEn} />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {loading ? (
                <Skeleton className="h-6 w-10 rounded-full" />
              ) : (
                <Switch
                  checked={!!watch("is_published")}
                  onCheckedChange={(v) => setValue("is_published", v, { shouldValidate: true, shouldDirty: true })}
                />
              )}
              <Label>{t("common.publish")}</Label>
            </div>

            <div className="flex justify-end gap-3">
              {loading ? (
                <>
                  <Skeleton className="h-10 w-24" />
                  <Skeleton className="h-10 w-32" />
                </>
              ) : (
                <>
                  <Button type="button"
                    variant="outline"
                    onClick={() => router.back()} className="gap-1.5 cursor-pointer">
                    <X className="h-4 w-4" /> {t("common.cancel")}
                  </Button>
                  <Button type="submit"
                    disabled={isSaveDisabled}
                    className="bg-neutral-900 hover:bg-neutral-800 active:bg-neutral-800 text-white dark:bg-white dark:hover:bg-neutral-200 dark:active:bg-neutral-200 dark:text-neutral-900 gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
                    {isSubmitting ? (
                      <><Loader2 className="h-4 w-4 animate-spin" /> {t("common.saving")}</>
                    ) : (
                      <><Save className="h-4 w-4" /> {t("common.save_changes")}</>
                    )}
                  </Button>
                </>
              )}
            </div>
          </div>
        </form>
      </div>
    </>
  );
}
