"use client";

import React, { useState, useEffect } from "react";
import { FolderPlus, Pencil, Save, Loader2 } from "lucide-react";
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
import { useLanguage } from "@/context/language-context";

export interface LinkGroup {
  id: string; // ID Name, e.g. "Media Sosial"
  en: string; // EN Name, e.g. "Social Media"
}

interface GroupFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: LinkGroup | null;
  onSaveGroup: (group: LinkGroup, oldGroup?: LinkGroup | null) => Promise<void> | void;
  isSubmitting?: boolean;
}

export function GroupFormDialog({
  open,
  onOpenChange,
  initialData,
  onSaveGroup,
  isSubmitting = false,
}: GroupFormDialogProps) {
  const { language } = useLanguage();
  const isEdit = !!initialData;
  const [groupId, setGroupId] = useState("");
  const [groupEn, setGroupEn] = useState("");

  useEffect(() => {
    if (open) {
      if (initialData) {
        setGroupId(initialData.id || "");
        setGroupEn(initialData.en || "");
      } else {
        setGroupId("");
        setGroupEn("");
      }
    }
  }, [open, initialData]);

  const isValid = groupId.trim().length > 0 && groupEn.trim().length > 0;
  const isDirty = !initialData || (groupId.trim() !== (initialData.id || "").trim() || groupEn.trim() !== (initialData.en || "").trim());
  const canSubmit = isEdit ? (isDirty && isValid) : isValid;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || isSubmitting) return;

    await onSaveGroup(
      {
        id: groupId.trim(),
        en: groupEn.trim(),
      },
      initialData
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 flex flex-col gap-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="p-6 pb-4 border-b border-neutral-100 dark:border-white/10 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200">
              {isEdit ? <Pencil className="h-4 w-4" /> : <FolderPlus className="h-4 w-4" />}
            </div>
            <div>
              <DialogTitle className="text-base font-semibold text-neutral-900 dark:text-white">
                {isEdit
                  ? language === "en" ? "Edit Group" : "Ubah Grup"
                  : language === "en" ? "Add Group" : "Tambah Grup"}
              </DialogTitle>
              <DialogDescription className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                {language === "en"
                  ? "Configure bilingual names for this group category."
                  : "Atur nama dwibahasa (ID & EN) untuk kategori grup ini."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1">
          <div className="p-6 space-y-4 scrollbar-custom">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-neutral-800 dark:text-neutral-200">
                {language === "en" ? "Group Name (ID)" : "Nama Grup (ID)"}
              </Label>
              <Input
                value={groupId}
                onChange={(e) => setGroupId(e.target.value)}
                placeholder="misal: Portofolio & Proyek"
                className="h-10 text-sm rounded-lg"
                autoFocus
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-neutral-800 dark:text-neutral-200">
                {language === "en" ? "Group Name (EN)" : "Nama Grup (EN)"}
              </Label>
              <Input
                value={groupEn}
                onChange={(e) => setGroupEn(e.target.value)}
                placeholder="e.g., Portfolio & Projects"
                className="h-10 text-sm rounded-lg"
              />
            </div>
          </div>

          {/* Footer */}
          <DialogFooter className="p-4 px-6 border-t border-neutral-100 dark:border-white/10 bg-neutral-50/40 dark:bg-neutral-900/40 shrink-0 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="cursor-pointer"
            >
              {language === "en" ? "Cancel" : "Batal"}
            </Button>
            <Button
              type="submit"
              disabled={!canSubmit || isSubmitting}
              className="bg-neutral-900 text-white hover:bg-neutral-800 active:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200 dark:active:bg-neutral-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>{language === "en" ? "Saving..." : "Menyimpan..."}</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>{language === "en" ? "Save Group" : "Simpan Grup"}</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
