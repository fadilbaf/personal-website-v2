"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Code2, Plus, X } from "lucide-react";
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
import type { SkillCategory } from "@/src/types/database";
import { useLanguage } from "@/context/language-context";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export default function SkillAddPage() {
  const router = useRouter();
  const { t, language } = useLanguage();
  const queryClient = useQueryClient();
  const [iconFile, setIconFile] = useState<File | null>(null);

  const { data: categories = [] } = useQuery({
    queryKey: ["skill-categories"],
    queryFn: SkillService.getCategories,
    meta: { resource: "skills.categories" },
  });

  const schema = useMemo(() => z.object({
    name: z.string().min(1, t("common.required_field")),
    category_id: z.string().min(1, t("common.required_field")),
    is_active: z.boolean(),
  }), [t]);

  type FormData = z.infer<typeof schema>;

  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting, isValid } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { is_active: true },
    mode: "onChange",
  });

  const onSubmit = async (data: FormData) => {
    try {
      let icon_url: string | null = null;
      if (iconFile) {
        const result = await StorageService.uploadImage(STORAGE_PATHS.SKILLS, iconFile);
        icon_url = result.publicUrl;
      }
      await SkillService.create({ ...data, icon_url });
      await queryClient.invalidateQueries({ queryKey: ["skills"] });
      toast.success(t("skills.saved_success"));
      router.push("/dashboard/skills/list");
    } catch (error: unknown) {
      toast.error(t("skills.saved_failed"), { description: error instanceof Error ? error.message : undefined });
    }
  };

  return (
    <>
      <PageHeader
        title={t("skills.add_skill")}
        icon={Code2}
        breadcrumbs={[
          { label: t("dashboard.title"), href: "/dashboard" },
          { label: t("skills.title"), href: "/dashboard/skills/list" },
          { label: t("common.add") },
        ]}
      />
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card className="overflow-visible border-neutral-200/60 bg-white/80 backdrop-blur-sm dark:border-white/10 dark:bg-neutral-900/80">
          <CardContent className="p-6 space-y-6">
            <div className="space-y-2">
              <Label>{t("skills.name")}</Label>
              <Input {...register("name")} placeholder="e.g., React.js" />
              {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>{t("skills.category")}</Label>
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
              {errors.category_id && <p className="text-xs text-red-500">{errors.category_id.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>{t("skills.icon")}</Label>
              <ImageUpload accept="image" onChange={(file) => setIconFile(file)} />
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Switch checked={watch("is_active")} onCheckedChange={(v) => setValue("is_active", v, { shouldValidate: true, shouldDirty: true })} />
            <Label>{t("skills.active")}</Label>
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => router.back()} className="gap-1.5 cursor-pointer">
              <X className="h-4 w-4" /> {t("common.cancel")}
            </Button>
            <Button type="submit" disabled={isSubmitting || !isValid} className="bg-neutral-900 hover:bg-neutral-800 active:bg-neutral-800 text-white dark:bg-white dark:hover:bg-neutral-200 dark:active:bg-neutral-200 dark:text-neutral-900 gap-1.5 cursor-pointer">
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> {t("common.saving")}
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" /> {t("skills.add_skill")}
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </>
  );
}
