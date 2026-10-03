"use client";

import React, { useState } from "react";
import { Check, ChevronsUpDown, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { cn } from "@/src/app/lib/utils";
import { AVAILABLE_LINK_ICONS, LinkIcon } from "@/src/components/links/link-icon";
import { useLanguage } from "@/context/language-context";

interface LinksIconPickerProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function LinksIconPicker({
  value,
  onChange,
  disabled = false,
}: LinksIconPickerProps) {
  const { language } = useLanguage();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filteredIcons = AVAILABLE_LINK_ICONS.filter((item) =>
    item.label.toLowerCase().includes(search.toLowerCase()) ||
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  const selectedItem = AVAILABLE_LINK_ICONS.find(
    (item) => item.name.toLowerCase() === (value || "globe").toLowerCase()
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className="w-full justify-between h-10 px-3 border-neutral-200/80 bg-white dark:border-white/10 dark:bg-neutral-900 cursor-pointer"
        >
          <div className="flex items-center gap-2.5 truncate">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white">
              <LinkIcon name={value || "Globe"} className="h-4 w-4" />
            </div>
            <span className="truncate text-sm font-medium text-neutral-900 dark:text-white">
              {selectedItem ? selectedItem.label : value || "Globe"}
            </span>
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[320px] p-2.5" align="start">
        {/* Search input */}
        <div className="relative mb-2">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-neutral-400" />
          <Input
            placeholder={language === "en" ? "Search icon..." : "Cari ikon..."}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8.5 pl-8 text-xs bg-neutral-50 dark:bg-neutral-900/60"
          />
        </div>

        {/* Icons Grid */}
        <div className="max-h-[220px] overflow-y-auto scrollbar-thin space-y-1 pr-1">
          {filteredIcons.length === 0 ? (
            <p className="py-4 text-center text-xs text-neutral-500 dark:text-neutral-400">
              {language === "en" ? "No icons found." : "Ikon tidak ditemukan."}
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-1.5">
              {filteredIcons.map((item) => {
                const isSelected =
                  (value || "globe").toLowerCase() === item.name.toLowerCase();

                return (
                  <button
                    key={item.name}
                    type="button"
                    onClick={() => {
                      onChange(item.name);
                      setOpen(false);
                      setSearch("");
                    }}
                    className={cn(
                      "flex items-center gap-2 rounded-lg p-2 text-left text-xs font-medium transition-colors cursor-pointer",
                      isSelected
                        ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                        : "text-neutral-700 hover:bg-neutral-100 active:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:active:bg-neutral-800"
                    )}
                  >
                    <div
                      className={cn(
                        "flex h-6 w-6 shrink-0 items-center justify-center rounded-md",
                        isSelected
                          ? "bg-white/20 text-white dark:bg-neutral-900/20 dark:text-neutral-900"
                          : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400"
                      )}
                    >
                      <item.component className="h-3.5 w-3.5" />
                    </div>
                    <span className="truncate flex-1">{item.label}</span>
                    {isSelected && (
                      <Check className="h-3.5 w-3.5 shrink-0 ml-auto" />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
