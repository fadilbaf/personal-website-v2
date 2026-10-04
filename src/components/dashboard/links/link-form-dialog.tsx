"use client";

import React, { useEffect, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Star, ExternalLink, Save, Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useLanguage } from "@/context/language-context";
import { LinksIconPicker } from "@/src/components/dashboard/links/links-icon-picker";
import type { LinkItem } from "@/src/types/database";
import type { LinkGroup } from "@/src/components/dashboard/links/group-form-dialog";

const linkSchema = z.object({
  title_id: z.string().min(1, "Judul (ID) wajib diisi"),
  title_en: z.string().min(1, "Title (EN) is required"),
  description_id: z.string().optional().or(z.literal("")),
  description_en: z.string().optional().or(z.literal("")),
  url: z.string().min(1, "URL wajib diisi").url("Format URL tidak valid"),
  icon: z.string(),
  group_name_id: z.string().min(1, "Grup (ID) wajib diisi"),
  group_name_en: z.string().min(1, "Group (EN) is required"),
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
  availableGroups: LinkGroup[];
  onOpenAddGroup?: () => void;
}

export function LinkFormDialog({
  open,
  onOpenChange,
  initialData,
  onSubmit,
  isSubmitting = false,
  availableGroups,
  onOpenAddGroup,
}: LinkFormDialogProps) {
  const { t, language } = useLanguage();
  const isEdit = !!initialData;

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = useForm<LinkFormData>({
    resolver: zodResolver(linkSchema),
    mode: "onChange",
    defaultValues: {
      title_id: "",
      title_en: "",
      description_id: "",
      description_en: "",
      url: "https://",
      icon: "Globe",
      group_name_id: "",
      group_name_en: "",
      is_featured: false,
      is_active: true,
      open_in_new_tab: true,
    },
  });

  const formValues = watch();

  // Determine if form is completely valid & filled
  const isFormComplete = useMemo(() => {
    const hasTitleId = !!formValues.title_id?.trim();
    const hasTitleEn = !!formValues.title_en?.trim();
    const hasUrl = !!formValues.url?.trim() && formValues.url.trim() !== "https://" && formValues.url.trim() !== "http://";
    const hasGroup = !!formValues.group_name_id?.trim() && !!formValues.group_name_en?.trim();
    const hasIcon = !!formValues.icon?.trim();

    return hasTitleId && hasTitleEn && hasUrl && hasGroup && hasIcon;
  }, [formValues]);

  // When editing, only enable save if something actually changed (isDirty)
  const canSubmit = isEdit ? (isDirty && isFormComplete) : isFormComplete;

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
          group_name_id: initialData.group_name_id || "",
          group_name_en: initialData.group_name_en || "",
          is_featured: !!initialData.is_featured,
          is_active: initialData.is_active ?? true,
          open_in_new_tab: initialData.open_in_new_tab ?? true,
        });
      } else {
        const defaultGroup = availableGroups.length > 0 ? availableGroups[0] : null;
        reset({
          title_id: "",
          title_en: "",
          description_id: "",
          description_en: "",
          url: "https://",
          icon: "Globe",
          group_name_id: defaultGroup ? defaultGroup.id : "",
          group_name_en: defaultGroup ? defaultGroup.en : "",
          is_featured: false,
          is_active: true,
          open_in_new_tab: true,
        });
      }
    }
  }, [open, initialData, reset, availableGroups]);

  // Current selected group composite value
  const selectedGroupValue = useMemo(() => {
    if (!formValues.group_name_id && !formValues.group_name_en) return "";
    return `${formValues.group_name_id}:::${formValues.group_name_en}`;
  }, [formValues.group_name_id, formValues.group_name_en]);

  const handleGroupSelectChange = (compositeVal: string) => {
    if (!compositeVal) {
      setValue("group_name_id", "", { shouldValidate: true });
      setValue("group_name_en", "", { shouldValidate: true });
      return;
    }
    const [idName, enName] = compositeVal.split(":::");
    setValue("group_name_id", idName || "", { shouldValidate: true });
    setValue("group_name_en", enName || idName || "", { shouldValidate: true });
  };

  const handleFormSubmit = async (data: LinkFormData) => {
    await onSubmit(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] p-0 flex flex-col gap-0 overflow-hidden">
        {/* Fixed Header */}
        <DialogHeader className="p-6 pb-4 border-b border-neutral-100 dark:border-white/10 shrink-0">
          <DialogTitle className="text-lg font-semibold text-neutral-900 dark:text-white">
            {isEdit ? t("links.edit_link") : t("links.add_link")}
          </DialogTitle>
          <DialogDescription className="text-xs text-neutral-500 dark:text-neutral-400">
            {language === "en"
              ? "Configure link details, group category, icons, and visual glow style."
              : "Atur rincian tautan, kategori grup, ikon, dan gaya tampilan glow."}
          </DialogDescription>
        </DialogHeader>

        {/* Form with custom scrollbar */}
        <form
          onSubmit={handleSubmit(handleFormSubmit)}
          className="flex flex-col flex-1 overflow-hidden"
        >
          <div className="flex-1 overflow-y-auto p-6 space-y-4 max-h-[calc(85vh-130px)] scrollbar-custom">
            {/* Group Dropdown Selection */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-medium text-neutral-800 dark:text-neutral-200">
                  {language === "en" ? "Group" : "Grup"}
                </Label>
                {onOpenAddGroup && (
                  <button
                    type="button"
                    onClick={() => {
                      onOpenAddGroup();
                    }}
                    className="text-[11px] font-medium text-neutral-500 hover:text-neutral-900 dark:hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Plus className="h-3 w-3" />
                    <span>{language === "en" ? "Add Group" : "Tambah Grup"}</span>
                  </button>
                )}
              </div>

              <Select
                value={selectedGroupValue}
                onValueChange={handleGroupSelectChange}
                searchable={true}
              >
                <SelectTrigger className="h-10 text-sm rounded-lg border-neutral-200/80 dark:border-white/10">
                  <SelectValue
                    placeholder={
                      language === "en"
                        ? "Select a group category..."
                        : "Pilih kategori grup..."
                    }
                  />
                </SelectTrigger>
                <SelectContent className="max-h-60 scrollbar-custom">
                  {availableGroups.map((grp) => {
                    const val = `${grp.id}:::${grp.en}`;
                    const label =
                      language === "id"
                        ? grp.id === grp.en
                          ? grp.id
                          : `${grp.id} (${grp.en})`
                        : grp.en === grp.id
                        ? grp.en
                        : `${grp.en} (${grp.id})`;

                    return (
                      <SelectItem key={val} value={val}>
                        {label}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              {errors.group_name_id && (
                <p className="text-[11px] text-red-500">{errors.group_name_id.message}</p>
              )}
            </div>

            {/* Titles (ID & EN) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-neutral-800 dark:text-neutral-200">
                  {t("links.form.title_id")}
                </Label>
                <Input
                  {...register("title_id")}
                  placeholder={language === "en" ? "e.g., Main Website" : "misal: Situs Utama"}
                  className="h-10 text-sm rounded-lg"
                />
                {errors.title_id && (
                  <p className="text-[11px] text-red-500">{errors.title_id.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-neutral-800 dark:text-neutral-200">
                  {t("links.form.title_en")}
                </Label>
                <Input
                  {...register("title_en")}
                  placeholder={language === "en" ? "e.g., Main Website" : "misal: Situs Utama"}
                  className="h-10 text-sm rounded-lg"
                />
                {errors.title_en && (
                  <p className="text-[11px] text-red-500">{errors.title_en.message}</p>
                )}
              </div>
            </div>

            {/* Descriptions (ID & EN) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                  {t("links.form.desc_id")}
                </Label>
                <Input
                  {...register("description_id")}
                  placeholder={language === "en" ? "e.g., Personal Website & Portfolio" : "misal: Situs Web & Portofolio"}
                  className="h-10 text-sm rounded-lg"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                  {t("links.form.desc_en")}
                </Label>
                <Input
                  {...register("description_en")}
                  placeholder="e.g., Personal Website & Portfolio"
                  className="h-10 text-sm rounded-lg"
                />
              </div>
            </div>

            {/* URL & Icon Picker */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
              <div className="sm:col-span-8 space-y-1.5">
                <Label className="text-xs font-medium text-neutral-800 dark:text-neutral-200">
                  {t("links.form.url")}
                </Label>
                <div className="relative">
                  <Input
                    {...register("url")}
                    type="url"
                    placeholder="https://example.com"
                    className="h-10 text-sm rounded-lg pr-9"
                  />
                  <ExternalLink className="absolute right-3 top-3 h-4 w-4 text-neutral-400 pointer-events-none" />
                </div>
                {errors.url && (
                  <p className="text-[11px] text-red-500">{errors.url.message}</p>
                )}
              </div>

              <div className="sm:col-span-4 space-y-1.5">
                <Label className="text-xs font-medium text-neutral-800 dark:text-neutral-200">
                  {t("links.form.icon")}
                </Label>
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
            <div className="space-y-2.5 pt-2 border-t border-neutral-100 dark:border-white/10">
              {/* Featured Glow Card */}
              <div className="flex items-center justify-between rounded-xl border border-neutral-200/70 bg-neutral-50/50 p-3.5 dark:border-white/10 dark:bg-neutral-900/30">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-200/60 text-neutral-800 dark:bg-white/10 dark:text-neutral-200">
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
              <div className="flex items-center justify-between rounded-xl border border-neutral-200/70 bg-neutral-50/50 p-3.5 dark:border-white/10 dark:bg-neutral-900/30">
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
              <div className="flex items-center justify-between rounded-xl border border-neutral-200/70 bg-neutral-50/50 p-3.5 dark:border-white/10 dark:bg-neutral-900/30">
                <div>
                  <p className="text-xs font-semibold text-neutral-900 dark:text-white">
                    {t("links.form.open_in_new_tab")}
                  </p>
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                    {t("links.form.open_in_new_tab_desc")}
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
          </div>

          {/* Fixed Footer */}
          <DialogFooter className="p-4 px-6 border-t border-neutral-100 dark:border-white/10 bg-neutral-50/40 dark:bg-neutral-900/40 shrink-0 flex items-center justify-end gap-2">
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
              disabled={!canSubmit || isSubmitting}
              className="bg-neutral-900 text-white hover:bg-neutral-800 active:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200 dark:active:bg-neutral-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>{t("common.saving")}</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>{t("common.save")}</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
