"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { Check, ChevronDown, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/context/language-context";

interface SkillOption {
  id: string;
  name: string;
}

interface MultiSelectSkillProps {
  options: SkillOption[];
  selected: string[]; // array of skill IDs
  onChange: (selected: string[]) => void;
  placeholder?: string;
}

export function MultiSelectSkill({ options, selected, onChange, placeholder }: MultiSelectSkillProps) {
  const { t } = useLanguage();
  const activePlaceholder = placeholder || t("common.multi_select.select_skills");
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Focus input when open and reset search when closed
  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    } else {
      setSearch("");
    }
  }, [open]);

  const toggleOption = (id: string) => {
    if (selected.includes(id)) {
      onChange(selected.filter((item) => item !== id));
    } else {
      onChange([...selected, id]);
    }
  };

  const removeOption = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    onChange(selected.filter((item) => item !== id));
  };

  const filteredOptions = useMemo(() => {
    if (!search.trim()) return options;
    const query = search.toLowerCase();
    return options.filter((opt) => opt.name.toLowerCase().includes(query));
  }, [options, search]);

  return (
    <div className="relative w-full" ref={containerRef}>
      <div
        className="flex min-h-9 w-full cursor-pointer flex-wrap items-center justify-between gap-1.5 rounded-md border border-input bg-transparent py-2 pr-2 pl-2.5 text-sm shadow-xs transition-[color,box-shadow,background-color] outline-none dark:bg-input/30 dark:hover:bg-input/50"
        onClick={() => setOpen(!open)}
      >
        <div className="flex flex-wrap items-center gap-1.5 flex-1">
          {selected.length === 0 && !open && <span className="text-muted-foreground">{activePlaceholder}</span>}
          {selected.map((id) => {
            const option = options.find((o) => o.id === id);
            if (!option) return null;
            return (
              <Badge key={id} variant="secondary" className="flex items-center gap-1 px-1.5 py-0.5 hover:bg-secondary">
                {option.name}
                <div
                  className="ml-1 cursor-pointer rounded-full p-0.5 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeOption(e, id);
                  }}
                >
                  <X className="h-3 w-3" />
                </div>
              </Badge>
            );
          })}
          {open && (
            <input
              ref={searchInputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={selected.length === 0 ? activePlaceholder : ""}
              className="flex-1 bg-transparent outline-none placeholder:text-muted-foreground min-w-[120px] text-neutral-900 dark:text-white"
              onClick={(e) => e.stopPropagation()}
            />
          )}
        </div>
        <ChevronDown className={cn(
          "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200",
          open && "rotate-180"
        )} />
      </div>

      {open && (
        <div className="absolute top-full z-70 mt-1 max-h-60 w-full overflow-y-auto overflow-x-hidden rounded-md bg-popover text-popover-foreground shadow-md ring-1 ring-foreground/10 p-1">
          {options.length === 0 ? (
            <div className="p-2 text-center text-sm text-muted-foreground">{t("common.multi_select.no_options")}</div>
          ) : filteredOptions.length === 0 ? (
            <div className="p-2 text-center text-sm text-muted-foreground">{t("common.multi_select.no_results")}</div>
          ) : (
            filteredOptions.map((option) => {
              const isSelected = selected.includes(option.id);
              return (
                <div
                  key={option.id}
                  className={cn(
                    "relative flex w-full cursor-pointer select-none items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground transition-colors",
                    isSelected ? "bg-accent text-accent-foreground font-medium" : ""
                  )}
                  onClick={() => toggleOption(option.id)}
                >
                  <span>{option.name}</span>
                  {isSelected && (
                    <span className="pointer-events-none absolute right-2 flex size-4 items-center justify-center">
                      <Check className="h-4 w-4" />
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
