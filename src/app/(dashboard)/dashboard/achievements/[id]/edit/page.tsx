"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Trophy, Save, X } from "lucide-react";
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
import { Skeleton } from "@/components/ui/skeleton";
import { AchievementService } from "@/src/services/achievement.service";
import { StorageService } from "@/src/services/storage.service";
import { STORAGE_PATHS } from "@/src/lib/constants";
import type { AchievementType, AchievementCategory } from "@/src/types/database";
import { useLanguage } from "@/context/language-context";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { DatePicker } from "@/components/dashboard/date-picker";

const schema = z.object({
  title_id: z.string().min(1, "Title (ID) is required"),
  title_en: z.string().min(1, "Title (EN) is required"),
  publisher: z.string().min(1, "Publisher is required"),
  issue_date: z.string().min(1, "Issue date is required"),
  credential_url: z.string().optional().or(z.literal("")),
  credential_id: z.string().optional().or(z.literal("")),
  type_id: z.string().min(1, "Type is required"),
  category_id: z.string().min(1, "Category is required"),
  is_published: z.boolean()
});

type FormData = z.infer<typeof schema>;

export default function AchievementEditPage() {
  const { t, language } = useLanguage();
  const router = useRouter();
  const { id } = useParams() as { id: string };
  const queryClient = useQueryClient();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);

  const { data: achievement, isLoading: isAchievementLoading } = useQuery({
    queryKey: ["achievement", id],
    queryFn: () => AchievementService.getById(id),
    meta: { resource: "sidebar.Achievements" },
  });

  const { data: types = [], isLoading: isTypesLoading } = useQuery({
    queryKey: ["achievement-types"],
    queryFn: AchievementService.getTypes,
    meta: { resource: "achievements.types" },
  });

  const { data: categories = [], isLoading: isCategoriesLoading } = useQuery({
    queryKey: ["achievement-categories"],
    queryFn: AchievementService.getCategories,
    meta: { resource: "achievements.categories" },
  });

  const loading = isAchievementLoading || isTypesLoading || isCategoriesLoading;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting, isValid, isDirty }
  } = useForm<FormData>({
    resolver: zodResolver(schema)
  });

  useEffect(() => {
    if (achievement) {
      setCurrentImageUrl(achievement.image_url);

      reset({
        title_id: achievement.title_id,
        title_en: achievement.title_en,
        publisher: achievement.publisher || "",
        issue_date: achievement.issue_date || "",
        credential_url: achievement.credential_url || "",
        credential_id: achievement.credential_id || "",
        type_id: achievement.type_id || "",
        category_id: achievement.category_id || "",
        is_published: achievement.is_published
      });
    }
  }, [achievement, reset]);

  const onSubmit = async (data: FormData) => {
    try {
      let image_url = currentImageUrl;
      if (imageFile) {
        const r = await StorageService.uploadImage(STORAGE_PATHS.ACHIEVEMENTS, imageFile);
        image_url = r.publicUrl;
      }

      await AchievementService.update(id, {
        ...data,
        image_url,
        credential_url: data.credential_url || null,
        credential_id: data.credential_id || null
      });

      toast.success(t("achievements.saved_success"));
      await queryClient.invalidateQueries({ queryKey: ["achievements"] });
      await queryClient.invalidateQueries({ queryKey: ["achievement", id] });
      router.push("/dashboard/achievements/list");
    } catch (e: unknown) {
      toast.error(t("achievements.saved_failed"), {
        description: e instanceof Error ? e.message : "An unexpected error occurred"
      });
    }
  };

  return (
    <>
      <PageHeader
        title={t("achievements.edit_achievement")}
        icon={Trophy}
        breadcrumbs={[
          { label: t("dashboard.title"), href: "/dashboard" },
          { label: t("achievements.title"), href: "/dashboard/achievements/list" },
          { label: t("common.edit") }
        ]}
      />

      <div className="w-full">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Card className="overflow-visible border-neutral-200/60 bg-white/80 backdrop-blur-sm dark:border-white/10 dark:bg-neutral-900/80">
            <CardContent className="p-6 space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>{language === "en" ? "Title (ID)" : "Judul (ID)"}</Label>
                  {loading ? (
                    <Skeleton className="h-10 w-full" />
                  ) : (
                    <Input
                      {...register("title_id")}
                      placeholder="Judul sertifikat..."
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
                      placeholder="Certificate title..."
                    />
                  )}
                  {errors.title_en && <p className="text-xs text-red-500">{errors.title_en.message}</p>}
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>{t("achievements.publisher")}</Label>
                  {loading ? (
                    <Skeleton className="h-10 w-full" />
                  ) : (
                    <Input
                      {...register("publisher")}
                      placeholder="e.g., Google, Microsoft, Udemy"
                    />
                  )}
                  {errors.publisher && <p className="text-xs text-red-500">{errors.publisher.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>{t("achievements.issue_date")}</Label>
                  {loading ? (
                    <Skeleton className="h-10 w-full" />
                  ) : (
                    <DatePicker
                      value={watch("issue_date")}
                      onChange={(v) => setValue("issue_date", v, { shouldValidate: true, shouldDirty: true })}
                    />
                  )}
                  {errors.issue_date && <p className="text-xs text-red-500">{errors.issue_date.message}</p>}
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>{t("projects.type")}</Label>
                  {loading ? (
                    <Skeleton className="h-10 w-full" />
                  ) : (
                    <Select
                      onValueChange={(v) => setValue("type_id", v, { shouldValidate: true, shouldDirty: true })}
                      value={watch("type_id")}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={language === "en" ? "Select type" : "Pilih tipe"} />
                      </SelectTrigger>
                      <SelectContent>
                        {types.map((tItem) => (
                          <SelectItem key={tItem.id} value={tItem.id}>{tItem[language === "en" ? "name_en" : "name_id"]}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  {errors.type_id && <p className="text-xs text-red-500">{errors.type_id.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>{t("projects.category")}</Label>
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
                  {errors.category_id && <p className="text-xs text-red-500">{errors.category_id.message}</p>}
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>{t("achievements.credential_url")}</Label>
                  {loading ? (
                    <Skeleton className="h-10 w-full" />
                  ) : (
                    <Input
                      {...register("credential_url")}
                      placeholder="https://verify.example.com/certificate/123"
                    />
                  )}
                </div>
                <div className="space-y-2">
                  <Label>{t("achievements.credential_id")}</Label>
                  {loading ? (
                    <Skeleton className="h-10 w-full" />
                  ) : (
                    <Input
                      {...register("credential_id")}
                      placeholder="e.g., 196/EKS/HCLGA/ATI/VIII/2025"
                    />
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label>{t("achievements.image")}</Label>
                {loading ? (
                  <Skeleton className="h-[120px] w-full rounded-xl" />
                ) : (
                  <ImageUpload
                    accept="image"
                    value={currentImageUrl || undefined}
                    onChange={(f) => {
                      setImageFile(f);
                    }}
                  />
                )}
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
                    disabled={isSubmitting || !isValid || (!isDirty && !imageFile)}
                    className="bg-neutral-900 hover:bg-neutral-800 active:bg-neutral-800 text-white dark:bg-white dark:hover:bg-neutral-200 dark:active:bg-neutral-200 dark:text-neutral-900 gap-1.5 cursor-pointer">
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
