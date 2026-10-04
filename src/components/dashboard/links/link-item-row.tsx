"use client";

import React, { useState } from "react";
import {
  GripVertical,
  Pencil,
  Trash2,
  ExternalLink,
  ArrowUp,
  ArrowDown,
  Star,
  Copy,
  MoreHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";
import { cn } from "@/src/app/lib/utils";
import { useLanguage } from "@/context/language-context";
import { LinkIcon } from "@/src/components/links/link-icon";
import type { LinkItem } from "@/src/types/database";

interface LinkItemRowProps {
  item: LinkItem;
  index: number;
  totalItems: number;
  onEdit: (item: LinkItem) => void;
  onDelete: (item: LinkItem) => void;
  onToggleActive: (item: LinkItem, active: boolean) => void;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
}

export function LinkItemRow({
  item,
  index,
  totalItems,
  onEdit,
  onDelete,
  onToggleActive,
  onMoveUp,
  onMoveDown,
}: LinkItemRowProps) {
  const { t, language } = useLanguage();

  const title = language === "id" ? item.title_id : item.title_en;
  const desc = language === "id" ? item.description_id : item.description_en;
  const groupName = language === "id" ? item.group_name_id : item.group_name_en;

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(item.url);
      toast.success(language === "en" ? "URL copied to clipboard" : "URL disalin ke clipboard");
    } catch {
      toast.error(t("common.failed"));
    }
  };

  return (
    <TooltipProvider delayDuration={200}>
      <div
        className={cn(
          "group relative flex items-center gap-3 rounded-xl border bg-white p-3.5 transition-all shadow-xs",
          "dark:bg-neutral-900/90",
          item.is_active
            ? "border-neutral-200/80 hover:border-neutral-300 dark:border-white/10 dark:hover:border-white/20"
            : "border-neutral-200/40 opacity-60 bg-neutral-50/50 dark:border-white/5 dark:bg-neutral-950/40"
        )}
      >
        {/* Drag Handle */}
        <div
          className="cursor-grab active:cursor-grabbing text-neutral-400 hover:text-neutral-900 dark:hover:text-white p-1 shrink-0"
          title="Drag to reorder"
        >
          <GripVertical className="h-4 w-4" />
        </div>

        {/* Icon Preview - Pure B&W Monochrome */}
        <div
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-colors",
            item.is_featured
              ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
              : "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
          )}
        >
          <LinkIcon name={item.icon} className="h-4 w-4" />
        </div>

        {/* Info Column */}
        <div className="min-w-0 flex-1 space-y-0.5">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold text-sm text-neutral-900 dark:text-white truncate">
              {title || item.title_en || item.title_id}
            </p>

            {/* Group Badge - Monochrome */}
            <Badge
              variant="outline"
              className="text-[10px] px-2 py-0 h-5 font-normal bg-neutral-100/70 text-neutral-700 dark:bg-white/10 dark:text-neutral-300 border-neutral-200 dark:border-white/10"
            >
              {groupName || "Main"}
            </Badge>

            {/* Featured Badge - Star icon & Monochrome */}
            {item.is_featured && (
              <Badge
                variant="outline"
                className="text-[10px] px-2 py-0 h-5 gap-1 font-medium bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 border-neutral-900 dark:border-white"
              >
                <Star className="h-2.5 w-2.5 fill-current" />
                Featured
              </Badge>
            )}
          </div>

          {/* Subtitle / Description */}
          {desc && (
            <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
              {desc}
            </p>
          )}

          {/* URL with external link */}
          <div className="flex items-center gap-1.5 pt-0.5">
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 truncate max-w-[280px] sm:max-w-xs transition-colors inline-flex items-center gap-1"
            >
              <span className="truncate">{item.url}</span>
              <ExternalLink className="h-2.5 w-2.5 shrink-0" />
            </a>
          </div>
        </div>

        {/* Right Action Controls */}
        <div className="flex items-center gap-1 shrink-0">
          {/* Active Switch */}
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="px-1.5">
                <Switch
                  checked={item.is_active}
                  onCheckedChange={(checked) => onToggleActive(item, checked)}
                  className="cursor-pointer scale-85"
                />
              </div>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>{item.is_active ? t("badges.active") : t("badges.inactive")}</p>
            </TooltipContent>
          </Tooltip>

          {/* Move Up - Arrow with tail */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                disabled={index === 0}
                onClick={() => onMoveUp(index)}
                className="h-8 w-8 text-neutral-500 hover:text-neutral-900 dark:hover:text-white cursor-pointer disabled:opacity-30"
              >
                <ArrowUp className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>{t("links.move_up")}</p>
            </TooltipContent>
          </Tooltip>

          {/* Move Down - Arrow with tail */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                disabled={index === totalItems - 1}
                onClick={() => onMoveDown(index)}
                className="h-8 w-8 text-neutral-500 hover:text-neutral-900 dark:hover:text-white cursor-pointer disabled:opacity-30"
              >
                <ArrowDown className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>{t("links.move_down")}</p>
            </TooltipContent>
          </Tooltip>

          {/* 3-Dots Dropdown Actions: Copy, Edit, Delete */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-neutral-500 hover:text-neutral-900 dark:hover:text-white data-[state=open]:bg-neutral-100 dark:data-[state=open]:bg-white/10 cursor-pointer"
              >
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={handleCopyUrl} className="cursor-pointer">
                <Copy className="mr-2 h-4 w-4" />
                <span>{language === "en" ? "Copy URL" : "Salin URL"}</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(item)} className="cursor-pointer">
                <Pencil className="mr-2 h-4 w-4" />
                <span>{t("common.edit")}</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                variant="destructive"
                onClick={() => onDelete(item)}
                className="cursor-pointer"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                <span>{t("common.delete")}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </TooltipProvider>
  );
}
