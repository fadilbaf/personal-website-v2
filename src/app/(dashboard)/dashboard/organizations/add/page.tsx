"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Users, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { ImageUpload } from "@/components/dashboard/image-upload";
import { BulletListInput } from "@/components/dashboard/bullet-list-input";
import { OrganizationService } from "@/src/services/organization.service";
import { StorageService } from "@/src/services/storage.service";
import { STORAGE_PATHS } from "@/src/lib/constants";
import { useLanguage } from "@/context/language-context";
import { useQueryClient } from "@tanstack/react-query";
import { DatePicker } from "@/components/dashboard/date-picker";

export default function OrganizationAddPage() {
  const router = useRouter();
  const { t, language } = useLanguage();
  const queryClient = useQueryClient();
  const [logoFile, setLogoFile] = useState<File | null>(null);

  const schema = useMemo(() => z.object({
    organization: z.string().min(1, t("common.required_field")),
    url: z.string().nullable().optional(),
    location: z.string().optional(),
    role_id: z.string().min(1, t("common.required_field")),
    role_en: z.string().min(1, t("common.required_field")),
    start_date: z.string().min(1, t("common.required_field")),
    end_date: z.string().optional(),
    detail_points_id: z.array(z.string()).optional(),
    detail_points_en: z.array(z.string()).optional(),
    is_published: z.boolean(),
  }), [t]);

  type FormData = z.infer<typeof schema>;

  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting, isValid } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { is_published: true },
    mode: "onChange",
  });

  const onSubmit = async (data: FormData) => {
    try {
      let logo_url: string | null = null;
      if (logoFile) {
        const r = await StorageService.uploadImage(STORAGE_PATHS.EXPERIENCES, logoFile);
        logo_url = r.publicUrl;
      }
      
      const payload = {
        ...data,
        end_date: data.end_date || null,
        detail_points_id: data.detail_points_id || [],
        detail_points_en: data.detail_points_en || [],
        logo_url
      };
      
      await OrganizationService.create(payload);
      await queryClient.invalidateQueries({ queryKey: ["organizations"] });
      toast.success(t("organizations.saved_success"));
      router.push("/dashboard/organizations");
    } catch (e: unknown) {
      toast.error(t("organizations.saved_failed"), { description: e instanceof Error ? e.message : undefined });
    }
  };

  return (
    <>
      <PageHeader
        title={t("organizations.add_organization")}
        icon={Users}
        breadcrumbs={[
          { label: t("dashboard.title"), href: "/dashboard" },
          { label: t("organizations.title"), href: "/dashboard/organizations" },
          { label: t("common.add") },
        ]}
      />
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card className="w-full overflow-visible border-neutral-200/60 bg-white/80 backdrop-blur-sm dark:border-white/10 dark:bg-neutral-900/80">
          <CardContent className="p-6 space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label>{t("organizations.form_org")}</Label>
                <Input {...register("organization")} placeholder="e.g., Google Developer Student Clubs" />
                {errors.organization && <p className="text-xs text-red-500">{errors.organization.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>{t("common.location")}</Label>
                <Input {...register("location")} placeholder="e.g., Jakarta, Indonesia" />
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label>{t("organizations.title")} URL</Label>
                <Input {...register("url")} placeholder="https://example.com" />
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label>{t("organizations.form_role")} (ID)</Label>
                <Input {...register("role_id")} placeholder="e.g., Ketua Divisi IT" />
                {errors.role_id && <p className="text-xs text-red-500">{errors.role_id.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>{t("organizations.form_role")} (EN)</Label>
                <Input {...register("role_en")} placeholder="e.g., Head of IT Division" />
                {errors.role_en && <p className="text-xs text-red-500">{errors.role_en.message}</p>}
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label>{t("organizations.form_start_date")}</Label>
                <DatePicker
                  value={watch("start_date") || ""}
                  onChange={(v) => setValue("start_date", v, { shouldValidate: true, shouldDirty: true })}
                />
                {errors.start_date && <p className="text-xs text-red-500">{errors.start_date.message}</p>}
              </div>
              <div className="space-y-2">
                <div className="flex flex-col gap-1">
                  <Label>{t("organizations.form_end_date")}</Label>
                </div>
                <DatePicker
                  value={watch("end_date") || ""}
                  onChange={(v) => setValue("end_date", v, { shouldValidate: true, shouldDirty: true })}
                />
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label>{t("organizations.form_detail_points")} (ID)</Label>
                <BulletListInput
                  id="detail_id"
                  value={watch("detail_points_id") || []}
                  onChange={(val) => setValue("detail_points_id", val, { shouldValidate: true, shouldDirty: true })}
                  placeholder={t("organizations.form_desc_placeholder")}
                />
              </div>
              <div className="space-y-2">
                <Label>{t("organizations.form_detail_points")} (EN)</Label>
                <BulletListInput
                  id="detail_en"
                  value={watch("detail_points_en") || []}
                  onChange={(val) => setValue("detail_points_en", val, { shouldValidate: true, shouldDirty: true })}
                  placeholder={t("organizations.form_desc_placeholder")}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>{t("organizations.form_logo")}</Label>
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
                <><Plus className="h-4 w-4" /> {t("organizations.add_organization")}</>
              )}
            </Button>
          </div>
        </div>
      </form>
    </>
  );
}
