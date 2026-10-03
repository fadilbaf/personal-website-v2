"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Briefcase, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { ImageUpload } from "@/components/dashboard/image-upload";
import { BulletListInput } from "@/components/dashboard/bullet-list-input";
import { MultiSelectSkill } from "@/components/dashboard/multi-select-skill";
import { CareerService } from "@/src/services/career.service";
import { SkillService } from "@/src/services/skill.service";
import { StorageService } from "@/src/services/storage.service";
import { STORAGE_PATHS } from "@/src/lib/constants";
import { useLanguage } from "@/context/language-context";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { DatePicker } from "@/components/dashboard/date-picker";

export default function CareerAddPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [activeSkills, setActiveSkills] = useState<{ id: string; name: string }[]>([]);

  const { data: skills = [] } = useQuery({
    queryKey: ["skills"],
    queryFn: SkillService.getAll,
    meta: { resource: "sidebar.Skills" },
  });

  useEffect(() => {
    if (skills.length > 0) {
      setActiveSkills(skills.filter(s => s.is_active).map(s => ({ id: s.id, name: s.name })));
    }
  }, [skills]);

  const schema = useMemo(() => z.object({
    role_id: z.string().min(1, t("common.required_field")),
    role_en: z.string().min(1, t("common.required_field")),
    company: z.string().min(1, t("common.required_field")),
    url: z.string().nullable().optional(),
    location: z.string().optional(),
    type_id: z.string().optional(),
    type_en: z.string().optional(),
    model_id: z.string().optional(),
    model_en: z.string().optional(),
    start_date: z.string().min(1, t("common.required_field")),
    end_date: z.string().optional(),
    detail_points_id: z.array(z.string()).optional(),
    detail_points_en: z.array(z.string()).optional(),
    skill_ids: z.array(z.string()).optional(),
    is_published: z.boolean(),
  }), [t]);

  type FormData = z.infer<typeof schema>;

  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting, isValid } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { is_published: true, detail_points_id: [], detail_points_en: [], skill_ids: [] },
    mode: "onChange",
  });

  const onSubmit = async (data: FormData) => {
    try {
      let logo_url: string | null = null;
      if (logoFile) {
        const r = await StorageService.uploadImage(STORAGE_PATHS.EXPERIENCES, logoFile);
        logo_url = r.publicUrl;
      }

      const { skill_ids, ...restData } = data;
      const careerData = {
        ...restData,
        end_date: data.end_date || null,
        detail_points_id: data.detail_points_id || [],
        detail_points_en: data.detail_points_en || [],
        logo_url
      };

      await CareerService.create(careerData, skill_ids || []);

      await queryClient.invalidateQueries({ queryKey: ["careers"] });
      toast.success(t("careers.saved_success"));
      router.push("/dashboard/careers");
    } catch (e: unknown) {
      toast.error(t("careers.saved_failed"), { description: e instanceof Error ? e.message : undefined });
    }
  };

  return (
    <>
      <PageHeader
        title={t("careers.add_career")}
        icon={Briefcase}
        breadcrumbs={[
          { label: t("dashboard.title"), href: "/dashboard" },
          { label: t("careers.title"), href: "/dashboard/careers" },
          { label: t("common.add") },
        ]}
      />
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card className="w-full overflow-visible border-neutral-200/60 bg-white/80 backdrop-blur-sm dark:border-white/10 dark:bg-neutral-900/80">
          <CardContent className="p-6 space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label>{t("careers.form_role")} (ID)</Label>
                <Input {...register("role_id")} placeholder="e.g., Software Engineer" />
                {errors.role_id && <p className="text-xs text-red-500">{errors.role_id.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>{t("careers.form_role")} (EN)</Label>
                <Input {...register("role_en")} placeholder="e.g., Software Engineer" />
                {errors.role_en && <p className="text-xs text-red-500">{errors.role_en.message}</p>}
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label>{t("careers.company")}</Label>
                <Input {...register("company")} placeholder="e.g., BAF Corp" />
                {errors.company && <p className="text-xs text-red-500">{errors.company.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>{t("careers.form_url")}</Label>
                <Input {...register("url")} placeholder="https://example.com" />
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label>{t("careers.form_location")}</Label>
                <Input {...register("location")} placeholder="e.g., Jakarta, Indonesia" />
              </div>
              <div className="space-y-2">
                <Label>{t("careers.form_skills")}</Label>
                <MultiSelectSkill
                  options={activeSkills}
                  selected={watch("skill_ids") || []}
                  onChange={(val) => setValue("skill_ids", val, { shouldValidate: true, shouldDirty: true })}
                  placeholder={t("careers.form_skills_placeholder")}
                />
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label>{t("careers.type")} (ID)</Label>
                <Input {...register("type_id")} placeholder="e.g., Purna Waktu" />
              </div>
              <div className="space-y-2">
                <Label>{t("careers.type")} (EN)</Label>
                <Input {...register("type_en")} placeholder="e.g., Full-time" />
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label>{t("careers.model")} (ID)</Label>
                <Input {...register("model_id")} placeholder="e.g., Jarak Jauh" />
              </div>
              <div className="space-y-2">
                <Label>{t("careers.model")} (EN)</Label>
                <Input {...register("model_en")} placeholder="e.g., Remote" />
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label>{t("careers.form_start_date")}</Label>
                <DatePicker
                  value={watch("start_date") || ""}
                  onChange={(v) => setValue("start_date", v, { shouldValidate: true, shouldDirty: true })}
                />
                {errors.start_date && <p className="text-xs text-red-500">{errors.start_date.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>{t("careers.form_end_date")}</Label>
                <DatePicker
                  value={watch("end_date") || ""}
                  onChange={(v) => setValue("end_date", v, { shouldValidate: true, shouldDirty: true })}
                />
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label>{t("careers.form_detail_points")} (ID)</Label>
                <BulletListInput
                  id="detail_id"
                  value={watch("detail_points_id")}
                  onChange={(val) => setValue("detail_points_id", val, { shouldValidate: true, shouldDirty: true })}
                  placeholder={t("careers.form_desc_placeholder")}
                />
              </div>
              <div className="space-y-2">
                <Label>{t("careers.form_detail_points")} (EN)</Label>
                <BulletListInput
                  id="detail_en"
                  value={watch("detail_points_en")}
                  onChange={(val) => setValue("detail_points_en", val, { shouldValidate: true, shouldDirty: true })}
                  placeholder={t("careers.form_desc_placeholder")}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>{t("careers.form_logo")}</Label>
              <ImageUpload accept="image" onChange={(f) => setLogoFile(f)} />
            </div>

          </CardContent>
        </Card>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Switch checked={watch("is_published")} onCheckedChange={(v) => setValue("is_published", v, { shouldValidate: true, shouldDirty: true })} />
            <Label>{t("common.publish")}</Label>
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => router.back()} className="gap-1.5 cursor-pointer">
              <X className="h-4 w-4" /> {t("common.cancel")}
            </Button>
            <Button type="submit" disabled={isSubmitting || !isValid} className="bg-neutral-900 hover:bg-neutral-800 active:bg-neutral-800 text-white dark:bg-white dark:hover:bg-neutral-200 dark:active:bg-neutral-200 dark:text-neutral-900 gap-1.5 cursor-pointer">
              {isSubmitting ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> {t("common.saving")}</>
              ) : (
                <><Plus className="h-4 w-4" /> {t("careers.add_career")}</>
              )}
            </Button>
          </div>
        </div>
      </form>
    </>
  );
}
