"use client";

import React, { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Star, ExternalLink } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useLanguage } from "@/context/language-context";
import { LinksIconPicker } from "@/src/components/dashboard/links/links-icon-picker";
import type { LinkItem } from "@/src/types/database";

const linkSchema = z.object({
  title_id: z.string().min(1, "Judul (ID) wajib diisi"),
  title_en: z.string().min(1, "Title (EN) is required"),
  description_id: z.string().optional().or(z.literal("")),
  description_en: z.string().optional().or(z.literal("")),
  url: z.string().min(1, "URL is required").url("Must be a valid URL (e.g. https://example.com)"),
  icon: z.string(),
  group_name_id: z.string().min(1, "Nama grup (ID) wajib diisi"),
  group_name_en: z.string().min(1, "Group name (EN) is required"),
  is_featured: z.boolean(),
  is_active: z.boolean(),
  open_in_new_tab: z.boolean(),
});

export type LinkFormData = z.infer<typeof linkSchema>;

interface LinkFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: LinkItem | null;
  onSubmit: (data: LinkFormData) => Promise<void>;
  isSubmitting?: boolean;
}

export function LinkFormDialog({
  open,
  onOpenChange,
  initialData,
  onSubmit,
  isSubmitting = false,
}: LinkFormDialogProps) {
  const { t, language } = useLanguage();
  const isEdit = !!initialData;

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { errors },
  } = useForm<LinkFormData>({
    resolver: zodResolver(linkSchema),
    defaultValues: {
      title_id: "",
      title_en: "",
      description_id: "",
      description_en: "",
      url: "https://",
      icon: "Globe",
      group_name_id: "Utama",
      group_name_en: "Main",
      is_featured: false,
      is_active: true,
      open_in_new_tab: true,
    },
  });

  useEffect(() => {
    if (open) {
      if (initialData) {
        reset({
          title_id: initialData.title_id || "",
          title_en: initialData.title_en || "",
          description_id: initialData.description_id || "",
          description_en: initialData.description_en || "",
          url: initialData.url || "",
          icon: initialData.icon || "Globe",
          group_name_id: initialData.group_name_id || "Utama",
          group_name_en: initialData.group_name_en || "Main",
          is_featured: !!initialData.is_featured,
          is_active: initialData.is_active ?? true,
          open_in_new_tab: initialData.open_in_new_tab ?? true,
        });
      } else {
        reset({
          title_id: "",
          title_en: "",
          description_id: "",
          description_en: "",
          url: "https://",
          icon: "Globe",
          group_name_id: "Utama",
          group_name_en: "Main",
          is_featured: false,
          is_active: true,
          open_in_new_tab: true,
        });
      }
    }
  }, [open, initialData, reset]);

  const groupPresets = [
    { id: "Utama", en: "Main", label: t("links.form.group_main") },
    { id: "Media Sosial", en: "Social Media", label: t("links.form.group_social") },
    { id: "Portofolio & Proyek", en: "Portfolio & Projects", label: t("links.form.group_portfolio") },
    { id: "Toko & Merchandise", en: "Store & Merchandise", label: t("links.form.group_store") },
    { id: "Komunitas & Grup", en: "Community & Groups", label: t("links.form.group_community") },
  ];

  const handleApplyPreset = (preset: { id: string; en: string }) => {
    setValue("group_name_id", preset.id, { shouldValidate: true, shouldDirty: true });
    setValue("group_name_en", preset.en, { shouldValidate: true, shouldDirty: true });
  };

  const handleFormSubmit = async (data: LinkFormData) => {
    await onSubmit(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto scrollbar-thin">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-neutral-900 dark:text-white">
            {isEdit ? t("links.edit_link") : t("links.add_link")}
          </DialogTitle>
          <DialogDescription className="text-xs text-neutral-500 dark:text-neutral-400">
            {language === "en"
              ? "Configure link details, group title, icons, and visual glow style."
              : "Atur rincian tautan, judul grup, ikon, dan gaya tampilan glow."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 pt-1">
          {/* Group Name Inputs + Preset Pills */}
          <div className="space-y-2 rounded-xl border border-neutral-200/80 bg-neutral-50/50 p-3.5 dark:border-white/10 dark:bg-neutral-900/40">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
                {language === "en" ? "Section / Group" : "Bagian / Grup"}
              </Label>
              <span className="text-[11px] text-neutral-400">
                {t("links.form.select_group_preset")}
              </span>
            </div>

            {/* Presets Pills */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {groupPresets.map((p) => (
                <button
                  key={p.en}
                  type="button"
                  onClick={() => handleApplyPreset(p)}
                  className="rounded-md border border-neutral-200 bg-white px-2 py-1 text-[11px] font-medium text-neutral-700 transition-colors hover:bg-neutral-100 hover:text-neutral-900 active:bg-neutral-100 dark:border-white/10 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700 dark:hover:text-white cursor-pointer"
                >
                  {p.label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1.5">
              <div className="space-y-1.5">
                <Label className="text-xs text-neutral-600 dark:text-neutral-400">
                  {t("links.form.group_id")} <span className="text-red-500">*</span>
                </Label>
                <Input
                  {...register("group_name_id")}
                  placeholder="e.g., Utama, Media Sosial"
                  className="h-9 text-xs"
                />
                {errors.group_name_id && (
                  <p className="text-[11px] text-red-500">{errors.group_name_id.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-neutral-600 dark:text-neutral-400">
                  {t("links.form.group_en")} <span className="text-red-500">*</span>
                </Label>
                <Input
                  {...register("group_name_en")}
                  placeholder="e.g., Main, Social Media"
                  className="h-9 text-xs"
                />
                {errors.group_name_en && (
                  <p className="text-[11px] text-red-500">{errors.group_name_en.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Titles (ID & EN) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">
                {t("links.form.title_id")} <span className="text-red-500">*</span>
              </Label>
              <Input
                {...register("title_id")}
                placeholder="misal: Situs Utama"
                className="h-9 text-xs"
              />
              {errors.title_id && (
                <p className="text-[11px] text-red-500">{errors.title_id.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium">
                {t("links.form.title_en")} <span className="text-red-500">*</span>
              </Label>
              <Input
                {...register("title_en")}
                placeholder="e.g., Main Website"
                className="h-9 text-xs"
              />
              {errors.title_en && (
                <p className="text-[11px] text-red-500">{errors.title_en.message}</p>
              )}
            </div>
          </div>

          {/* Descriptions (ID & EN) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-neutral-600 dark:text-neutral-400">
                {t("links.form.desc_id")} <span className="text-neutral-400 font-normal">({t("common.optional")})</span>
              </Label>
              <Input
                {...register("description_id")}
                placeholder="misal: Situs Web & Portofolio Pribadi"
                className="h-9 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-neutral-600 dark:text-neutral-400">
                {t("links.form.desc_en")} <span className="text-neutral-400 font-normal">({t("common.optional")})</span>
              </Label>
              <Input
                {...register("description_en")}
                placeholder="e.g., Personal Website & Portfolio"
                className="h-9 text-xs"
              />
            </div>
          </div>

          {/* URL & Icon Picker */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-8 space-y-1.5">
              <Label className="text-xs font-medium">
                {t("links.form.url")} <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  {...register("url")}
                  type="url"
                  placeholder="https://example.com"
                  className="h-10 text-xs pr-8"
                />
                <ExternalLink className="absolute right-2.5 top-3 h-4 w-4 text-neutral-400 pointer-events-none" />
              </div>
              {errors.url && (
                <p className="text-[11px] text-red-500">{errors.url.message}</p>
              )}
            </div>

            <div className="sm:col-span-4 space-y-1.5">
              <Label className="text-xs font-medium">{t("links.form.icon")}</Label>
              <Controller
                name="icon"
                control={control}
                render={({ field }) => (
                  <LinksIconPicker
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
            </div>
          </div>

          {/* Switches */}
          <div className="space-y-2.5 pt-2 border-t border-neutral-200/80 dark:border-white/10">
            {/* Featured Glow Card */}
            <div className="flex items-center justify-between rounded-lg border border-neutral-200/60 bg-neutral-50/40 p-3 dark:border-white/10 dark:bg-neutral-900/30">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-100 text-neutral-800 dark:bg-white/10 dark:text-neutral-200">
                  <Star className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-neutral-900 dark:text-white">
                    {t("links.form.featured_card")}
                  </p>
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                    {t("links.form.featured_desc")}
                  </p>
                </div>
              </div>
              <Controller
                name="is_featured"
                control={control}
                render={({ field }) => (
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
            </div>

            {/* Active Status */}
            <div className="flex items-center justify-between rounded-lg border border-neutral-200/60 bg-neutral-50/40 p-3 dark:border-white/10 dark:bg-neutral-900/30">
              <div>
                <p className="text-xs font-semibold text-neutral-900 dark:text-white">
                  {t("links.form.active")}
                </p>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                  {t("links.form.active_desc")}
                </p>
              </div>
              <Controller
                name="is_active"
                control={control}
                render={({ field }) => (
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
            </div>

            {/* Open in New Tab */}
            <div className="flex items-center justify-between rounded-lg border border-neutral-200/60 bg-neutral-50/40 p-3 dark:border-white/10 dark:bg-neutral-900/30">
              <div>
                <p className="text-xs font-semibold text-neutral-900 dark:text-white">
                  {t("links.form.open_in_new_tab")}
                </p>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                  {language === "en" ? "Open link in a new browser tab (target=\"_blank\")" : "Buka tautan di tab peramban baru"}
                </p>
              </div>
              <Controller
                name="open_in_new_tab"
                control={control}
                render={({ field }) => (
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
            </div>
          </div>

          <DialogFooter className="pt-3 gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="cursor-pointer"
            >
              {t("common.cancel")}
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-neutral-900 text-white hover:bg-neutral-800 active:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200 dark:active:bg-neutral-200 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("common.saving")}
                </>
              ) : (
                t("common.save")
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
