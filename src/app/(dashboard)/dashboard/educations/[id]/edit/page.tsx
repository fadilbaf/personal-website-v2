"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, GraduationCap, Save, X } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { ImageUpload } from "@/components/dashboard/image-upload";
import { Skeleton } from "@/components/ui/skeleton";
import { BulletListInput } from "@/components/dashboard/bullet-list-input";
import { EducationService } from "@/src/services/education.service";
import { StorageService } from "@/src/services/storage.service";
import { STORAGE_PATHS } from "@/src/lib/constants";
import { useLanguage } from "@/context/language-context";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { DatePicker } from "@/components/dashboard/date-picker";

export default function EducationEditPage() {
  const router = useRouter();
  const { t, language } = useLanguage();
  const { id } = useParams() as { id: string };
  const queryClient = useQueryClient();
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [currentLogoUrl, setCurrentLogoUrl] = useState<string | null>(null);
  const [isImageChanged, setIsImageChanged] = useState(false);

  const { data: education, isLoading } = useQuery({
    queryKey: ["education", id],
    queryFn: () => EducationService.getById(id),
    meta: { resource: "sidebar.Educations" },
  });

  const loading = isLoading;

  const schema = useMemo(() => z.object({
    school: z.string().min(1, t("common.required_field")),
    location: z.string().optional(),
    url: z.string().nullable().optional(),
    level_major_id: z.string().min(1, t("common.required_field")),
    level_major_en: z.string().min(1, t("common.required_field")),
    gpa: z.string().optional().nullable(),
    max_gpa: z.string().optional().nullable(),
    start_date: z.string().min(1, t("common.required_field")),
    end_date: z.string().optional(),
    detail_points_id: z.array(z.string()).optional(),
    detail_points_en: z.array(z.string()).optional(),
    is_published: z.boolean(),
  }), [t]);

  type FormData = z.infer<typeof schema>;

  const { register, handleSubmit, setValue, watch, reset, formState: { errors, isSubmitting, isValid, isDirty } } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: "onChange"
  });

  useEffect(() => {
    if (education) {
      setCurrentLogoUrl(education.logo_url);

      reset({
        school: education.school,
        location: education.location || "",
        url: education.url || "",
        level_major_id: education.level_major_id,
        level_major_en: education.level_major_en,
        gpa: education.gpa !== null ? String(education.gpa) : "",
        max_gpa: education.max_gpa !== null ? String(education.max_gpa) : "",
        start_date: education.start_date,
        end_date: education.end_date || "",
        detail_points_id: education.detail_points_id || [],
        detail_points_en: education.detail_points_en || [],
        is_published: education.is_published
      });
    }
  }, [education, reset]);

  const onSubmit = async (data: FormData) => {
    try {
      let logo_url = currentLogoUrl;
      if (logoFile) {
        const r = await StorageService.uploadImage(STORAGE_PATHS.EXPERIENCES, logoFile);
        logo_url = r.publicUrl;
      }

      const payload = {
        ...data,
        end_date: data.end_date || null,
        detail_points_id: data.detail_points_id || [],
        detail_points_en: data.detail_points_en || [],
        gpa: data.gpa ? Number(data.gpa) : null,
        max_gpa: data.max_gpa ? Number(data.max_gpa) : null,
        logo_url
      };

      await EducationService.update(id, payload);
      await queryClient.invalidateQueries({ queryKey: ["educations"] });
      await queryClient.invalidateQueries({ queryKey: ["education", id] });
      toast.success(t("educations.saved_success"));
      router.push("/dashboard/educations");
    } catch (e: unknown) {
      toast.error(t("educations.saved_failed"), { description: e instanceof Error ? e.message : undefined });
    }
  };

  return (
    <>
      <PageHeader
        title={t("educations.edit_education")}
        icon={GraduationCap}
        breadcrumbs={[
          { label: t("dashboard.title"), href: "/dashboard" },
          { label: t("educations.title"), href: "/dashboard/educations" },
          { label: t("common.edit") }
        ]}
      />
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card className="w-full overflow-visible border-neutral-200/60 bg-white/80 backdrop-blur-sm dark:border-white/10 dark:bg-neutral-900/80">
          <CardContent className="p-6 space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label>{t("educations.school")}</Label>
                {loading ? (
                  <Skeleton className="h-10 w-full" />
                ) : (
                  <Input {...register("school")} placeholder="e.g., Universitas Indonesia" />
                )}
                {errors.school && <p className="text-xs text-red-500">{errors.school.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>{t("common.location")}</Label>
                {loading ? (
                  <Skeleton className="h-10 w-full" />
                ) : (
                  <Input {...register("location")} placeholder="e.g., Depok, Indonesia" />
                )}
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label>{t("educations.school")} URL</Label>
                {loading ? (
                  <Skeleton className="h-10 w-full" />
                ) : (
                  <Input {...register("url")} placeholder="https://example.edu" />
                )}
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label>{t("educations.level_major")} (ID)</Label>
                {loading ? (
                  <Skeleton className="h-10 w-full" />
                ) : (
                  <Input {...register("level_major_id")} placeholder="e.g., S1 Ilmu Komputer" />
                )}
                {errors.level_major_id && <p className="text-xs text-red-500">{errors.level_major_id.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>{t("educations.level_major")} (EN)</Label>
                {loading ? (
                  <Skeleton className="h-10 w-full" />
                ) : (
                  <Input {...register("level_major_en")} placeholder="e.g., B.Sc. in Computer Science" />
                )}
                {errors.level_major_en && <p className="text-xs text-red-500">{errors.level_major_en.message}</p>}
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label>{t("educations.gpa")}</Label>
                {loading ? (
                  <Skeleton className="h-10 w-full" />
                ) : (
                  <Input type="number" step="0.01" {...register("gpa")} placeholder="e.g., 3.85" />
                )}
              </div>
              <div className="space-y-2">
                <Label>{t("educations.form_max_gpa")}</Label>
                {loading ? (
                  <Skeleton className="h-10 w-full" />
                ) : (
                  <Input type="number" step="0.01" {...register("max_gpa")} placeholder="e.g., 4.00" />
                )}
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label>{t("educations.form_start_date")}</Label>
                {loading ? (
                  <Skeleton className="h-10 w-full" />
                ) : (
                  <DatePicker
                    value={watch("start_date") || ""}
                    onChange={(v) => setValue("start_date", v, { shouldValidate: true, shouldDirty: true })}
                  />
                )}
                {errors.start_date && <p className="text-xs text-red-500">{errors.start_date.message}</p>}
              </div>
              <div className="space-y-2">
                <div className="flex flex-col gap-1">
                  <Label>{t("educations.form_end_date")}</Label>
                </div>
                {loading ? (
                  <Skeleton className="h-10 w-full" />
                ) : (
                  <DatePicker
                    value={watch("end_date") || ""}
                    onChange={(v) => setValue("end_date", v, { shouldValidate: true, shouldDirty: true })}
                  />
                )}
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label>{t("educations.form_detail_points")} (ID)</Label>
                {loading ? (
                  <Skeleton className="h-[200px] w-full rounded-lg" />
                ) : (
                  <BulletListInput
                    id="detail_id"
                    value={watch("detail_points_id")}
                    onChange={(val) => setValue("detail_points_id", val, { shouldValidate: true, shouldDirty: true })}
                    placeholder={t("educations.form_desc_placeholder")}
                  />
                )}
              </div>
              <div className="space-y-2">
                <Label>{t("educations.form_detail_points")} (EN)</Label>
                {loading ? (
                  <Skeleton className="h-[200px] w-full rounded-lg" />
                ) : (
                  <BulletListInput
                    id="detail_en"
                    value={watch("detail_points_en")}
                    onChange={(val) => setValue("detail_points_en", val, { shouldValidate: true, shouldDirty: true })}
                    placeholder={t("educations.form_desc_placeholder")}
                  />
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label>{t("educations.form_logo")}</Label>
              {loading ? (
                <Skeleton className="h-[120px] w-full rounded-xl" />
              ) : (
                <ImageUpload
                  accept="image"
                  value={currentLogoUrl || undefined}
                  onChange={(f) => { setLogoFile(f); setIsImageChanged(true); if (!f) setCurrentLogoUrl(null); }}
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
              <Switch checked={!!watch("is_published")} onCheckedChange={(v) => setValue("is_published", v, { shouldValidate: true, shouldDirty: true })} />
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
                <Button type="button" variant="outline" onClick={() => router.back()} className="gap-1.5 cursor-pointer">
                  <X className="h-4 w-4" /> {t("common.cancel")}
                </Button>
                <Button type="submit" disabled={isSubmitting || !isValid || (!isDirty && !isImageChanged)} className="bg-neutral-900 hover:bg-neutral-800 active:bg-neutral-800 text-white dark:bg-white dark:hover:bg-neutral-200 dark:active:bg-neutral-200 dark:text-neutral-900 gap-1.5 cursor-pointer">
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
    </>
  );
}
