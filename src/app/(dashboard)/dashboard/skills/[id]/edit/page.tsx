"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Code2, Save, X } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ImageUpload } from "@/components/dashboard/image-upload";
import { SkillService } from "@/src/services/skill.service";
import { StorageService } from "@/src/services/storage.service";
import { STORAGE_PATHS } from "@/src/lib/constants";
import { Skeleton } from "@/components/ui/skeleton";
import type { SkillCategory } from "@/src/types/database";
import { useLanguage } from "@/context/language-context";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export default function SkillEditPage() {
  const router = useRouter();
  const { t, language } = useLanguage();
  const params = useParams();
  const id = params.id as string;
  const queryClient = useQueryClient();
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [currentIconUrl, setCurrentIconUrl] = useState<string | null>(null);
  const [isImageChanged, setIsImageChanged] = useState(false);

  const { data: skill, isLoading: isSkillLoading } = useQuery({
    queryKey: ["skill", id],
    queryFn: () => SkillService.getById(id),
    meta: { resource: "sidebar.Skills" },
  });

  const { data: categories = [], isLoading: isCategoriesLoading } = useQuery({
    queryKey: ["skill-categories"],
    queryFn: SkillService.getCategories,
    meta: { resource: "skills.categories" },
  });

  const loading = isSkillLoading || isCategoriesLoading;

  const schema = useMemo(() => z.object({
    name: z.string().min(1, t("common.required_field")),
    category_id: z.string().min(1, t("common.required_field")),
    is_active: z.boolean(),
  }), [t]);

  type FormData = z.infer<typeof schema>;

  const { register, handleSubmit, setValue, watch, reset, formState: { errors, isSubmitting, isValid, isDirty } } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: "onChange",
  });

  useEffect(() => {
    if (skill) {
      setCurrentIconUrl(skill.icon_url);
      reset({ name: skill.name, category_id: skill.category_id, is_active: skill.is_active });
    }
  }, [skill, reset]);

  const onSubmit = async (data: FormData) => {
    try {
      let icon_url = currentIconUrl;
      if (iconFile) {
        const result = await StorageService.uploadImage(STORAGE_PATHS.SKILLS, iconFile);
        icon_url = result.publicUrl;
      }
      await SkillService.update(id, { ...data, icon_url });
      await queryClient.invalidateQueries({ queryKey: ["skills"] });
      await queryClient.invalidateQueries({ queryKey: ["skill", id] });
      toast.success(t("skills.saved_success"));
      router.push("/dashboard/skills/list");
    } catch (error: unknown) {
      toast.error(t("skills.saved_failed"), { description: error instanceof Error ? error.message : undefined });
    }
  };

  return (
    <>
      <PageHeader
        title={t("skills.edit_skill")}
        icon={Code2}
        breadcrumbs={[
          { label: t("dashboard.title"), href: "/dashboard" },
          { label: t("skills.title"), href: "/dashboard/skills/list" },
          { label: t("common.edit") },
        ]}
      />
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card className="overflow-visible border-neutral-200/60 bg-white/80 backdrop-blur-sm dark:border-white/10 dark:bg-neutral-900/80">
          <CardContent className="p-6 space-y-6">
            <div className="space-y-2">
              <Label>{t("skills.name")}</Label>
              {loading ? <Skeleton className="h-10 w-full" /> : <Input {...register("name")} />}
              {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>{t("skills.category")}</Label>
              {loading ? (
                <Skeleton className="h-10 w-full" />
              ) : (
                <Select onValueChange={(v) => setValue("category_id", v, { shouldValidate: true, shouldDirty: true })} value={watch("category_id")}>
                  <SelectTrigger><SelectValue placeholder={t("skills.form_category")} /></SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {(cat[`name_${language}` as keyof typeof cat] as string) || cat.name_en}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
            <div className="space-y-2">
              <Label>{t("skills.icon")}</Label>
              {loading ? (
                <Skeleton className="h-[120px] w-full rounded-xl" />
              ) : (
                <ImageUpload accept="image" value={currentIconUrl || undefined} onChange={(file) => { setIconFile(file); setIsImageChanged(true); if (!file) setCurrentIconUrl(null); }} />
              )}
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {loading ? (
              <Skeleton className="h-6 w-10 rounded-full" />
            ) : (
              <Switch checked={!!watch("is_active")} onCheckedChange={(v) => setValue("is_active", v, { shouldValidate: true, shouldDirty: true })} />
            )}
            <Label>{t("skills.active")}</Label>
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
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> {t("common.saving")}
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" /> {t("common.save_changes")}
                    </>
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
