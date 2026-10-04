"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Trash2, X } from "lucide-react";
import { useLanguage } from "@/context/language-context";

interface DeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
  itemName?: string;
  loading?: boolean;
}

/**
 * Confirmation dialog for delete actions.
 * Shows a warning with cancel/confirm buttons.
 */
export function DeleteDialog({
  open,
  onOpenChange,
  onConfirm,
  title,
  description,
  itemName,
  loading = false,
}: DeleteDialogProps) {
  const { t } = useLanguage();

  const displayTitle = title || t("common.delete_title");
  const displayDescription = description || (itemName
    ? `${t("common.delete_warning", { item: itemName.toLowerCase() })} ${t("common.delete_warning_desc")}`
    : `${t("common.delete_warning", { item: "item" })} ${t("common.delete_warning_desc")}`);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{displayTitle}</DialogTitle>
          <DialogDescription>
            {displayDescription}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex flex-row flex-wrap items-center sm:justify-end gap-2.5 pt-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
            className="flex-1 sm:flex-initial min-w-[110px] gap-1.5 cursor-pointer"
          >
            <X className="h-4 w-4" /> {t("common.cancel")}
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 sm:flex-initial min-w-[110px] gap-1.5 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {t("common.deleting")}
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4" />
                {t("common.delete")}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
