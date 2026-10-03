"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Plus, X, FolderKanban, GripVertical, Trash2, ArrowUp, ArrowDown } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BulletListInput } from "@/components/dashboard/bullet-list-input";
import { MultiSelectSkill } from "@/components/dashboard/multi-select-skill";
import { ImageUpload } from "@/components/dashboard/image-upload";
import { ImageViewerModal } from "@/components/dashboard/image-viewer-modal";
import { ProjectService } from "@/src/services/project.service";
import { SkillService } from "@/src/services/skill.service";
import { StorageService } from "@/src/services/storage.service";
import { STORAGE_PATHS } from "@/src/lib/constants";
import type { ProjectType, ProjectCategory } from "@/src/types/database";
import { useLanguage } from "@/context/language-context";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { DatePicker } from "@/components/dashboard/date-picker";

export default function ProjectAddPage() {
  const router = useRouter();
  const { t, language } = useLanguage();
  const queryClient = useQueryClient();

  const { data: types = [] } = useQuery({
    queryKey: ["project-types"],
    queryFn: ProjectService.getTypes,
    meta: { resource: "projects.types" },
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["project-categories"],
    queryFn: ProjectService.getCategories,
    meta: { resource: "projects.categories" },
  });

  const { data: skillsData = [] } = useQuery({
    queryKey: ["skills"],
    queryFn: SkillService.getAll,
    meta: { resource: "sidebar.Skills" },
  });

  const activeSkills = useMemo(() => {
    return skillsData.filter(s => s.is_active).map(s => ({ id: s.id, name: s.name }));
  }, [skillsData]);
  
  // Image states
  const [imageSlots, setImageSlots] = useState<{ id: string; file: File | null; previewUrl?: string }[]>([{ id: Date.now().toString(), file: null }]);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);

  const galleryImages = imageSlots
    .map((slot) => ({
      url: slot.previewUrl || "",
      name: slot.file?.name || undefined,
    }))
    .filter((img) => !!img.url);

  const schema = useMemo(() => z.object({
    slug: z.string().min(1, t("common.required_field")),
    title_id: z.string().min(1, t("common.required_field")),
    title_en: z.string().min(1, t("common.required_field")),
    bio_id: z.string().min(1, t("common.required_field")),
    bio_en: z.string().min(1, t("common.required_field")),
    type_id: z.string().optional(),
    category_id: z.string().optional(),
    project_date: z.string().min(1, t("common.required_field")),
    github_url: z.string().optional(),
    live_url: z.string().optional(),
    video_url: z.string().optional(),
    overview_id: z.string().min(1, t("common.required_field")),
    overview_en: z.string().min(1, t("common.required_field")),
    challenge_intro_id: z.string().optional(),
    challenge_intro_en: z.string().optional(),
    challenge_points_id: z.array(z.string()).optional(),
    challenge_points_en: z.array(z.string()).optional(),
    result_intro_id: z.string().optional(),
    result_intro_en: z.string().optional(),
    result_points_id: z.array(z.string()).optional(),
    result_points_en: z.array(z.string()).optional(),
    lesson_intro_id: z.string().optional(),
    lesson_intro_en: z.string().optional(),
    lesson_points_id: z.array(z.string()).optional(),
    lesson_points_en: z.array(z.string()).optional(),
    responsibilities_id: z.array(z.string()).optional(),
    responsibilities_en: z.array(z.string()).optional(),
    features_id: z.array(z.string()).optional(),
    features_en: z.array(z.string()).optional(),
    skill_ids: z.array(z.string()).optional(),
    is_published: z.boolean(),
  }), [t]);

  type FormData = z.infer<typeof schema>;

  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting, isValid } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { 
      is_published: true,
      slug: "",
      title_id: "",
      title_en: "",
      bio_id: "",
      bio_en: "",
      project_date: "",
      overview_id: "",
      overview_en: "",
      challenge_points_id: [], challenge_points_en: [],
      result_points_id: [], result_points_en: [],
      lesson_points_id: [], lesson_points_en: [],
      responsibilities_id: [], responsibilities_en: [],
      features_id: [], features_en: [],
      skill_ids: []
    },
    mode: "onChange",
  });

  const moveImage = (index: number, dir: 'up' | 'down') => {
    const newSlots = [...imageSlots];
    if (dir === 'up' && index > 0) {
      [newSlots[index - 1], newSlots[index]] = [newSlots[index], newSlots[index - 1]];
    } else if (dir === 'down' && index < newSlots.length - 1) {
      [newSlots[index + 1], newSlots[index]] = [newSlots[index], newSlots[index + 1]];
    }
    setImageSlots(newSlots);
  };

  const removeImage = (id: string) => {
    setImageSlots(imageSlots.filter(s => s.id !== id));
  };

  const updateImageSlot = (id: string, file: File | null, previewUrl?: string) => {
    setImageSlots(imageSlots.map(s => s.id === id ? { ...s, file, previewUrl } : s));
  };

  const addImageSlot = () => {
    setImageSlots([...imageSlots, { id: Date.now().toString(), file: null }]);
  };

  const onSubmit = async (data: FormData) => {
    try {
      // 1. Upload Images
      const uploadedImages: { url: string; sort_order: number }[] = [];
      let sortOrder = 0;
      for (const slot of imageSlots) {
        if (slot.file) {
          const r = await StorageService.uploadImage(STORAGE_PATHS.PROJECTS, slot.file);
          uploadedImages.push({ url: r.publicUrl, sort_order: sortOrder++ });
        }
      }

      // 2. Parse Features
      const parsedFeatures = [];
      const f_id = data.features_id || [];
      const f_en = data.features_en || [];
      const maxFeatLen = Math.max(f_id.length, f_en.length);
      for(let i=0; i<maxFeatLen; i++) {
         const idStr = f_id[i] || "";
         const enStr = f_en[i] || "";
         const idParts = idStr.split(":");
         const enParts = enStr.split(":");
         
         const title_id = idParts[0]?.trim() || "";
         const desc_id = idParts.slice(1).join(":").trim() || "";
         const title_en = enParts[0]?.trim() || title_id; // fallback
         const desc_en = enParts.slice(1).join(":").trim() || desc_id; // fallback
         
         if(title_id || desc_id || title_en || desc_en) {
             parsedFeatures.push({
                 title_id, description_id: desc_id,
                 title_en, description_en: desc_en,
                 sort_order: i
             });
         }
      }

      // 3. Parse Responsibilities
      const parsedResponsibilities = [];
      const r_id = data.responsibilities_id || [];
      const r_en = data.responsibilities_en || [];
      const rMaxLen = Math.max(r_id.length, r_en.length);
      for(let i=0; i<rMaxLen; i++) {
          if(r_id[i] || r_en[i]) {
              parsedResponsibilities.push({
                  content_id: r_id[i] || "",
                  content_en: r_en[i] || "",
                  sort_order: i
              })
          }
      }

      // 4. Prepare Core Data
      const coreData = {
        slug: data.slug,
        title_id: data.title_id,
        title_en: data.title_en,
        bio_id: data.bio_id || null,
        bio_en: data.bio_en || null,
        type_id: data.type_id || null,
        category_id: data.category_id || null,
        project_date: data.project_date || null,
        github_url: data.github_url || null,
        live_url: data.live_url || null,
        video_url: data.video_url || null,
        overview_id: data.overview_id || null,
        overview_en: data.overview_en || null,
        challenge_intro_id: data.challenge_intro_id || null,
        challenge_intro_en: data.challenge_intro_en || null,
        challenge_points_id: data.challenge_points_id || [],
        challenge_points_en: data.challenge_points_en || [],
        result_intro_id: data.result_intro_id || null,
        result_intro_en: data.result_intro_en || null,
        result_points_id: data.result_points_id || [],
        result_points_en: data.result_points_en || [],
        lesson_intro_id: data.lesson_intro_id || null,
        lesson_intro_en: data.lesson_intro_en || null,
        lesson_points_id: data.lesson_points_id || [],
        lesson_points_en: data.lesson_points_en || [],
        is_published: data.is_published,
      };

      await ProjectService.create(coreData, uploadedImages, data.skill_ids, parsedResponsibilities, parsedFeatures);

      await queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast.success(t("projects.saved_success"));
      router.push("/dashboard/projects/list");
    } catch (e: unknown) {
      toast.error(t("projects.saved_failed"), { description: e instanceof Error ? e.message : undefined });
    }
  };

  return (
    <>
      <PageHeader
        title={t("projects.add_project")}
        icon={FolderKanban}
        breadcrumbs={[
          { label: t("dashboard.title"), href: "/dashboard" },
          { label: t("projects.title"), href: "/dashboard/projects/list" },
          { label: t("common.add") },
        ]}
      />
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        
        {/* Basic Information */}
        <Card className="relative z-30 overflow-visible border-neutral-200/60 bg-white/80 backdrop-blur-sm dark:border-white/10 dark:bg-neutral-900/80">
          <CardContent className="p-6 space-y-6">
            <h3 className="font-semibold text-lg">{language === "en" ? "Basic Information" : "Informasi Dasar"}</h3>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Slug</Label>
                <Input {...register("slug")} placeholder="e.g., my-awesome-project" />
                {errors.slug && <p className="text-xs text-red-500">{errors.slug.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>{t("projects.form_date")}</Label>
                <DatePicker
                  value={watch("project_date") || ""}
                  onChange={(v) => setValue("project_date", v, { shouldValidate: true, shouldDirty: true })}
                />
              </div>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label>{t("projects.form_title")} (ID)</Label>
                <Input {...register("title_id")} placeholder="Project title (ID)" />
                {errors.title_id && <p className="text-xs text-red-500">{errors.title_id.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>{t("projects.form_title")} (EN)</Label>
                <Input {...register("title_en")} placeholder="Project title (EN)" />
                {errors.title_en && <p className="text-xs text-red-500">{errors.title_en.message}</p>}
              </div>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label>{t("projects.form_subtitle")} (ID)</Label>
                <Textarea {...register("bio_id")} rows={2} placeholder="Short bio (ID)..." />
              </div>
              <div className="space-y-2">
                <Label>{t("projects.form_subtitle")} (EN)</Label>
                <Textarea {...register("bio_en")} rows={2} placeholder="Short bio (EN)..." />
              </div>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label>{t("projects.form_desc")} (ID)</Label>
                <Textarea {...register("overview_id")} rows={4} placeholder="Project overview (ID)..." />
              </div>
              <div className="space-y-2">
                <Label>{t("projects.form_desc")} (EN)</Label>
                <Textarea {...register("overview_en")} rows={4} placeholder="Project overview (EN)..." />
              </div>
            </div>
          </CardContent>
        </Card>
 
        {/* Classification & Links */}
        <Card className="relative z-20 overflow-visible border-neutral-200/60 bg-white/80 backdrop-blur-sm dark:border-white/10 dark:bg-neutral-900/80">
          <CardContent className="p-6 space-y-6">
            <h3 className="font-semibold text-lg">{language === "en" ? "Classification & Links" : "Klasifikasi & Tautan"}</h3>
            <div className="grid gap-6 md:grid-cols-3">
              <div className="space-y-2">
                <Label>{t("projects.type")}</Label>
                <Select onValueChange={(v) => setValue("type_id", v, { shouldValidate: true, shouldDirty: true })} value={watch("type_id")}>
                  <SelectTrigger><SelectValue placeholder={language === "en" ? "Select type" : "Pilih tipe"} /></SelectTrigger>
                  <SelectContent>
                    {types.map((t) => <SelectItem key={t.id} value={t.id}>{(t[`name_${language}` as keyof ProjectType] as string) || t.name_en}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t("projects.category")}</Label>
                <Select onValueChange={(v) => setValue("category_id", v, { shouldValidate: true, shouldDirty: true })} value={watch("category_id")}>
                  <SelectTrigger><SelectValue placeholder={language === "en" ? "Select category" : "Pilih kategori"} /></SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => <SelectItem key={c.id} value={c.id}>{(c[`name_${language}` as keyof ProjectCategory] as string) || c.name_en}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t("projects.form_tech")}</Label>
                <MultiSelectSkill
                  options={activeSkills}
                  selected={watch("skill_ids") || []}
                  onChange={(val) => setValue("skill_ids", val, { shouldValidate: true, shouldDirty: true })}
                  placeholder={language === "en" ? "Select technologies..." : "Pilih teknologi..."}
                />
              </div>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              <div className="space-y-2">
                <Label>GitHub URL</Label>
                <Input {...register("github_url")} placeholder="https://github.com/..." />
              </div>
              <div className="space-y-2">
                <Label>Live URL</Label>
                <Input {...register("live_url")} placeholder="https://..." />
              </div>
              <div className="space-y-2">
                <Label>Video URL</Label>
                <Input {...register("video_url")} placeholder="https://youtube.com/..." />
              </div>
            </div>
          </CardContent>
        </Card>
 
        {/* Gallery */}
        <Card className="relative z-10 border-neutral-200/60 bg-white/80 backdrop-blur-sm dark:border-white/10 dark:bg-neutral-900/80">
          <CardContent className="p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-lg">{language === "en" ? "Project Gallery" : "Galeri Proyek"}</h3>
              <Button type="button" variant="outline" size="sm" onClick={addImageSlot} className="gap-1.5 cursor-pointer">
                <Plus className="h-4 w-4" /> {language === "en" ? "Add Image" : "Tambah Gambar"}
              </Button>
            </div>
            <p className="text-sm text-neutral-500">
              {language === "en" 
                ? "The first image in the list will automatically become the project thumbnail." 
                : "Gambar pertama dalam daftar akan otomatis menjadi thumbnail proyek."}
            </p>
            
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {imageSlots.map((slot, index) => (
                <div key={slot.id} className="relative group border rounded-xl p-3 bg-neutral-50 dark:bg-neutral-800/50 flex flex-col gap-3">
                  <div className="absolute -top-3 -left-3 bg-neutral-900 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold z-10 border-2 border-white dark:border-neutral-900 shadow-sm">
                    {index + 1}
                  </div>
                  <ImageUpload 
                    accept="image" 
                    onChange={(f, p) => updateImageSlot(slot.id, f, p || undefined)} 
                    onViewImage={() => {
                      const url = slot.previewUrl;
                      if (!url) return;
                      const idx = galleryImages.findIndex((img) => img.url === url);
                      if (idx !== -1) {
                        setViewerIndex(idx);
                        setViewerOpen(true);
                      }
                    }}
                    previewClassName="w-full aspect-video"
                  />
                  <div className="flex justify-between items-center gap-1">
                    <div className="flex gap-1">
                      <Button type="button" variant="ghost" size="icon" className="h-7 w-7 hover:bg-neutral-100 active:bg-neutral-100 dark:hover:bg-neutral-800 dark:active:bg-neutral-800 cursor-pointer" disabled={index === 0} onClick={() => moveImage(index, 'up')}>
                        <ArrowUp className="h-4 w-4" />
                      </Button>
                      <Button type="button" variant="ghost" size="icon" className="h-7 w-7 hover:bg-neutral-100 active:bg-neutral-100 dark:hover:bg-neutral-800 dark:active:bg-neutral-800 cursor-pointer" disabled={index === imageSlots.length - 1} onClick={() => moveImage(index, 'down')}>
                        <ArrowDown className="h-4 w-4" />
                      </Button>
                    </div>
                    <Button type="button" variant="ghost" size="icon" className="h-7 w-7 text-red-500 hover:text-red-600 active:text-red-600 hover:bg-red-50 active:bg-red-50 dark:hover:bg-red-950/50 dark:active:bg-red-950/50 cursor-pointer" onClick={() => removeImage(slot.id)} disabled={imageSlots.length === 1}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
 
        {/* Roles & Features */}
        <Card className="border-neutral-200/60 bg-white/80 backdrop-blur-sm dark:border-white/10 dark:bg-neutral-900/80">
          <CardContent className="p-6 space-y-6">
            <h3 className="font-semibold text-lg">{language === "en" ? "Responsibilities & Key Features" : "Tanggung Jawab & Fitur Utama"}</h3>
            
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label>{language === "en" ? "Responsibilities (ID)" : "Tanggung Jawab (ID)"}</Label>
                <BulletListInput
                  id="resp_id"
                  value={watch("responsibilities_id")}
                  onChange={(val) => setValue("responsibilities_id", val, { shouldValidate: true, shouldDirty: true })}
                  placeholder="Responsibilities (ID)..."
                />
              </div>
              <div className="space-y-2">
                <Label>{language === "en" ? "Responsibilities (EN)" : "Tanggung Jawab (EN)"}</Label>
                <BulletListInput
                  id="resp_en"
                  value={watch("responsibilities_en")}
                  onChange={(val) => setValue("responsibilities_en", val, { shouldValidate: true, shouldDirty: true })}
                  placeholder="Responsibilities (EN)..."
                />
              </div>
            </div>
 
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label>{language === "en" ? "Key Features (ID)" : "Fitur Utama (ID)"} <code className="bg-neutral-100 dark:bg-neutral-800 px-1 py-0.5 rounded text-xs text-primary">Title: Description</code></Label>
                <BulletListInput
                  id="feat_id"
                  value={watch("features_id")}
                  onChange={(val) => setValue("features_id", val, { shouldValidate: true, shouldDirty: true })}
                  placeholder="Login: Fitur autentikasi (ID)..."
                />
              </div>
              <div className="space-y-2">
                <Label>{language === "en" ? "Key Features (EN)" : "Fitur Utama (EN)"} <code className="bg-neutral-100 dark:bg-neutral-800 px-1 py-0.5 rounded text-xs text-primary">Title: Description</code></Label>
                <BulletListInput
                  id="feat_en"
                  value={watch("features_en")}
                  onChange={(val) => setValue("features_en", val, { shouldValidate: true, shouldDirty: true })}
                  placeholder="Login: Authentication feature (EN)..."
                />
              </div>
            </div>
          </CardContent>
        </Card>
 
        {/* Deep Dives (Challenge, Result, Lesson) */}
        <Card className="border-neutral-200/60 bg-white/80 backdrop-blur-sm dark:border-white/10 dark:bg-neutral-900/80">
          <CardContent className="p-6 space-y-8">
            <h3 className="font-semibold text-lg">{language === "en" ? "Deep Dive Sections" : "Bagian Deep Dive"}</h3>
            
            {/* Challenge */}
            <div className="space-y-4">
              <h4 className="font-medium text-primary">{language === "en" ? "Challenge" : "Tantangan"}</h4>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>{language === "en" ? "Challenge Intro (ID)" : "Pengantar Tantangan (ID)"}</Label>
                  <Textarea {...register("challenge_intro_id")} rows={2} placeholder="Challenge intro (ID)..." />
                </div>
                <div className="space-y-2">
                  <Label>{language === "en" ? "Challenge Intro (EN)" : "Pengantar Tantangan (EN)"}</Label>
                  <Textarea {...register("challenge_intro_en")} rows={2} placeholder="Challenge intro (EN)..." />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>{language === "en" ? "Challenge Points (ID)" : "Poin Tantangan (ID)"}</Label>
                  <BulletListInput id="ch_pts_id" value={watch("challenge_points_id")} onChange={(v) => setValue("challenge_points_id", v, { shouldValidate: true, shouldDirty: true })} placeholder="Challenge points (ID)..." />
                </div>
                <div className="space-y-2">
                  <Label>{language === "en" ? "Challenge Points (EN)" : "Poin Tantangan (EN)"}</Label>
                  <BulletListInput id="ch_pts_en" value={watch("challenge_points_en")} onChange={(v) => setValue("challenge_points_en", v, { shouldValidate: true, shouldDirty: true })} placeholder="Challenge points (EN)..." />
                </div>
              </div>
            </div>
 
            {/* Result */}
            <div className="space-y-4">
              <h4 className="font-medium text-primary">{language === "en" ? "Result" : "Hasil"}</h4>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>{language === "en" ? "Result Intro (ID)" : "Pengantar Hasil (ID)"}</Label>
                  <Textarea {...register("result_intro_id")} rows={2} placeholder="Result intro (ID)..." />
                </div>
                <div className="space-y-2">
                  <Label>{language === "en" ? "Result Intro (EN)" : "Pengantar Hasil (EN)"}</Label>
                  <Textarea {...register("result_intro_en")} rows={2} placeholder="Result intro (EN)..." />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>{language === "en" ? "Result Points (ID)" : "Poin Hasil (ID)"}</Label>
                  <BulletListInput id="rs_pts_id" value={watch("result_points_id")} onChange={(v) => setValue("result_points_id", v, { shouldValidate: true, shouldDirty: true })} placeholder="Result points (ID)..." />
                </div>
                <div className="space-y-2">
                  <Label>{language === "en" ? "Result Points (EN)" : "Poin Hasil (EN)"}</Label>
                  <BulletListInput id="rs_pts_en" value={watch("result_points_en")} onChange={(v) => setValue("result_points_en", v, { shouldValidate: true, shouldDirty: true })} placeholder="Result points (EN)..." />
                </div>
              </div>
            </div>
 
            {/* Lesson */}
            <div className="space-y-4">
              <h4 className="font-medium text-primary">{language === "en" ? "Lesson Learned" : "Pelajaran yang Didapat"}</h4>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>{language === "en" ? "Lesson Intro (ID)" : "Pengantar Pelajaran (ID)"}</Label>
                  <Textarea {...register("lesson_intro_id")} rows={2} placeholder="Lesson intro (ID)..." />
                </div>
                <div className="space-y-2">
                  <Label>{language === "en" ? "Lesson Intro (EN)" : "Pengantar Pelajaran (EN)"}</Label>
                  <Textarea {...register("lesson_intro_en")} rows={2} placeholder="Lesson intro (EN)..." />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>{language === "en" ? "Lesson Points (ID)" : "Poin Pelajaran (ID)"}</Label>
                  <BulletListInput id="ls_pts_id" value={watch("lesson_points_id")} onChange={(v) => setValue("lesson_points_id", v, { shouldValidate: true, shouldDirty: true })} placeholder="Lesson points (ID)..." />
                </div>
                <div className="space-y-2">
                  <Label>{language === "en" ? "Lesson Points (EN)" : "Poin Pelajaran (EN)"}</Label>
                  <BulletListInput id="ls_pts_en" value={watch("lesson_points_en")} onChange={(v) => setValue("lesson_points_en", v, { shouldValidate: true, shouldDirty: true })} placeholder="Lesson points (EN)..." />
                </div>
              </div>
            </div>
 
          </CardContent>
        </Card>
 
        {/* Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Switch checked={watch("is_published")} onCheckedChange={(v) => setValue("is_published", v, { shouldValidate: true, shouldDirty: true })} />
            <Label>{t("common.publish")}</Label>
          </div>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => router.back()} className="gap-1.5 cursor-pointer">
              <X className="h-4 w-4" /> {t("common.cancel")}
            </Button>
            <Button type="submit" disabled={isSubmitting || !isValid} className="bg-neutral-900 hover:bg-neutral-800 active:bg-neutral-800 text-white dark:bg-white dark:hover:bg-neutral-200 dark:active:bg-neutral-200 dark:text-neutral-900 gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
              {isSubmitting ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> {t("common.saving")}</>
              ) : (
                <><Plus className="h-4 w-4" /> {t("projects.add_project")}</>
              )}
            </Button>
          </div>
        </div>
 
      </form>
 
      <ImageViewerModal
        isOpen={viewerOpen}
        onClose={() => setViewerOpen(false)}
        images={galleryImages}
        initialIndex={viewerIndex}
      />
    </>
  );
}
