"use client";

import React from "react";
import {
  GripVertical,
  Folder,
  Pencil,
  Trash2,
  ArrowUp,
  ArrowDown,
  MoreHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLanguage } from "@/context/language-context";
import { cn } from "@/src/app/lib/utils";

export interface GroupRowItem {
  id: string; // group composite key, e.g. "group:Utama:::Main"
  name_id: string;
  name_en: string;
  itemCount: number;
}

interface GroupItemRowProps {
  group: GroupRowItem;
  index: number;
  totalItems: number;
  onEdit: (group: GroupRowItem) => void;
  onDelete: (group: GroupRowItem) => void;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
}

export function GroupItemRow({
  group,
  index,
  totalItems,
  onEdit,
  onDelete,
  onMoveUp,
  onMoveDown,
}: GroupItemRowProps) {
  const { t, language } = useLanguage();

  const displayName = language === "id" ? group.name_id : group.name_en;
  const secondaryName = language === "id" ? group.name_en : group.name_id;

  return (
    <div
      className={cn(
        "group relative flex items-center justify-between gap-3 rounded-xl border border-dashed p-3 sm:px-3.5 transition-all shadow-2xs",
        "border-neutral-300 bg-neutral-100/90 hover:border-neutral-400",
        "dark:border-white/20 dark:bg-neutral-800/80 dark:hover:border-white/30"
      )}
    >
      {/* Left section: Drag Handle + Group Icon + Group Names */}
      <div className="flex items-center gap-2.5 min-w-0 flex-1">
        {/* Drag Handle */}
        <div
          className="cursor-grab active:cursor-grabbing text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors p-1 shrink-0"
          title="Drag to reorder"
        >
          <GripVertical className="h-4 w-4" />
        </div>

        {/* Group Folder Icon */}
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-900">
          <Folder className="h-4 w-4" />
        </div>

        {/* Group Name & Subtitle */}
        <div className="min-w-0 flex-1 space-y-0.5">
          <div className="flex items-center gap-2">
            <h4 className="truncate text-sm font-bold uppercase tracking-wider text-neutral-900 dark:text-white">
              {displayName}
            </h4>
            <Badge
              variant="outline"
              className="text-[10px] uppercase font-semibold border-neutral-300 dark:border-white/20 bg-white/70 dark:bg-neutral-900/70 text-neutral-700 dark:text-neutral-300 px-1.5 py-0 h-4.5"
            >
              {language === "id" ? "Grup" : "Group"}
            </Badge>
          </div>
          {secondaryName && secondaryName !== displayName && (
            <p className="truncate text-xs text-neutral-500 dark:text-neutral-400">
              {secondaryName}
            </p>
          )}
        </div>
      </div>

      {/* Right section: 3-Dots Dropdown Actions */}
      <div className="shrink-0">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-neutral-500 hover:text-neutral-900 dark:hover:text-white data-[state=open]:bg-neutral-200 dark:data-[state=open]:bg-white/10 cursor-pointer"
            >
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem
              disabled={index === 0}
              onClick={() => onMoveUp(index)}
              className="cursor-pointer"
            >
              <ArrowUp className="mr-2 h-4 w-4 text-neutral-500" />
              <span>{t("links.move_up")}</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              disabled={index === totalItems - 1}
              onClick={() => onMoveDown(index)}
              className="cursor-pointer"
            >
              <ArrowDown className="mr-2 h-4 w-4 text-neutral-500" />
              <span>{t("links.move_down")}</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEdit(group)} className="cursor-pointer">
              <Pencil className="mr-2 h-4 w-4 text-neutral-500" />
              <span>{t("common.edit")}</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              variant="destructive"
              onClick={() => onDelete(group)}
              className="cursor-pointer"
            >
              <Trash2 className="mr-2 h-4 w-4 text-neutral-500" />
              <span>{t("common.delete")}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
