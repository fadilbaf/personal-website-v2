"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, FileText, Plus, X } from "lucide-react";
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
import { BlogService } from "@/src/services/blog.service";
import { StorageService } from "@/src/services/storage.service";
import { STORAGE_PATHS } from "@/src/lib/constants";
import { AuthService } from "@/src/services/auth.service";
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

export default function BlogAddPage() {
  const { t, language } = useLanguage();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [createdAt] = useState(() => new Date().toISOString());
  const [thumbFile, setThumbFile] = useState<File | null>(null);
  const [contentId, setContentId] = useState("");
  const [contentEn, setContentEn] = useState("");

  const { data: types = [] } = useQuery({
    queryKey: ["blog-types"],
    queryFn: BlogService.getTypes,
    meta: { resource: "blogs.types" },
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["blog-categories"],
    queryFn: BlogService.getCategories,
    meta: { resource: "blogs.categories" },
  });

  const { data: allTags = [] } = useQuery({
    queryKey: ["blog-all-tags"],
    queryFn: BlogService.getUniqueTags,
    meta: { resource: "blogs.tags" },
  });

  const { 
    register, 
    handleSubmit, 
    setValue, 
    watch, 
    formState: { errors, isSubmitting, isValid } 
  } = useForm<FormData>({ 
    resolver: zodResolver(schema) as any, 
    defaultValues: { 
      is_published: true,
      slug: "",
      title_id: "",
      title_en: "",
      type_id: "",
      category_id: "",
      tags: []
    },
    mode: "onChange"
  });

  const isSubmitDisabled =
    isSubmitting ||
    !isValid ||
    !thumbFile ||
    !contentId?.trim() ||
    contentId === "<p></p>" ||
    !contentEn?.trim() ||
    contentEn === "<p></p>";

  const onSubmit = async (data: FormData) => {
    try {
      const user = await AuthService.getUser();
      let image_url: string | null = null;
      if (thumbFile) {
        const r = await StorageService.uploadImage(STORAGE_PATHS.BLOGS, thumbFile);
        image_url = r.publicUrl;
      }

      // Separate tags from the main blog data
      const { tags, ...blogData } = data;

      const blog = await BlogService.create({
        ...blogData,
        created_at: createdAt,
        author_id: user?.id,
        image_url,
        content_id: contentId || null,
        content_en: contentEn || null,
        likes_count: 0,
        views_count: 0
      });
      
      // Save tags separately
      if (tags && tags.length > 0) {
        await BlogService.syncTags(blog.id, tags);
      }
      
      toast.success(t("blogs.saved_success"));
      await queryClient.invalidateQueries({ queryKey: ["blogs"] });
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
        title={t("blogs.add_blog")} 
        icon={FileText}
        breadcrumbs={[
          { label: t("dashboard.title"), href: "/dashboard" }, 
          { label: t("blogs.title"), href: "/dashboard/blogs/list" }, 
          { label: t("common.add") }
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
                  <span className="text-xs text-neutral-500 dark:text-neutral-400 font-medium select-none">
                    {formatDateTime(createdAt, language)}
                  </span>
                </div>
                <div className="max-w-2xl">
                  <ImageUpload 
                    accept="image" 
                    onChange={(f) => setThumbFile(f)} 
                    previewClassName="aspect-video w-full"
                  />
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>{language === "en" ? "Title (ID)" : "Judul (ID)"}</Label>
                  <Input 
                    {...register("title_id")} 
                    placeholder="e.g., Cara membuat aplikasi Next.js" 
                  />
                  {errors.title_id && <p className="text-xs text-red-500">{errors.title_id.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>{language === "en" ? "Title (EN)" : "Judul (EN)"}</Label>
                  <Input 
                    {...register("title_en")} 
                    placeholder="e.g., How to build a Next.js application" 
                  />
                  {errors.title_en && <p className="text-xs text-red-500">{errors.title_en.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label>Slug</Label>
                  <Input 
                    {...register("slug")} 
                    placeholder="e.g., how-to-build-nextjs-app" 
                  />
                  {errors.slug && <p className="text-xs text-red-500">{errors.slug.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Tags</Label>
                  <TagsInput 
                    value={watch("tags") || []} 
                    onChange={(tags) => setValue("tags", tags)} 
                    suggestions={allTags}
                    placeholder={language === "en" ? "Type tag and press space/enter..." : "Ketik tag lalu tekan spasi/enter..."}
                  />
                </div>

                <div className="space-y-2">
                  <Label>{t("blogs.form_type")}</Label>
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
                </div>
                <div className="space-y-2">
                  <Label>{t("blogs.form_category")}</Label>
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
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>{language === "en" ? "Content (ID)" : "Konten (ID)"}</Label>
                  <RichTextEditor content={contentId} onChange={setContentId} />
                </div>
                <div className="space-y-2">
                  <Label>{language === "en" ? "Content (EN)" : "Konten (EN)"}</Label>
                  <RichTextEditor content={contentEn} onChange={setContentEn} />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Switch 
                checked={watch("is_published")} 
                onCheckedChange={(v) => setValue("is_published", v, { shouldValidate: true, shouldDirty: true })} 
              />
              <Label>{t("common.publish")}</Label>
            </div>

            <div className="flex justify-end gap-3">
              <Button type="button" 
                variant="outline" 
                onClick={() => router.back()} className="gap-1.5 cursor-pointer">
                <X className="h-4 w-4" /> {t("common.cancel")}
              </Button>
              <Button type="submit" 
                disabled={isSubmitDisabled} 
                className="bg-neutral-900 hover:bg-neutral-800 active:bg-neutral-800 text-white dark:bg-white dark:hover:bg-neutral-200 dark:active:bg-neutral-200 dark:text-neutral-900 gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
                {isSubmitting ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> {language === "en" ? "Creating..." : "Membuat..."}</>
                ) : (
                  <><Plus className="h-4 w-4" /> {t("blogs.add_blog")}</>
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </>
  );
}
