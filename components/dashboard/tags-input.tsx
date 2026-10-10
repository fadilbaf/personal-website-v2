"use client";

import { useState, useRef, useEffect, KeyboardEvent } from "react";
import { ChevronDown, Tag as TagIcon, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/src/app/lib/utils";
import { useLanguage } from "@/context/language-context";

interface TagsInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  suggestions?: string[];
  placeholder?: string;
}

export function TagsInput({
  value = [],
  onChange,
  suggestions = [],
  placeholder,
}: TagsInputProps) {
  const { t } = useLanguage();
  const activePlaceholder = placeholder || t("common.tags_input.placeholder");
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredSuggestions = suggestions.filter(
    (tag) =>
      tag.toLowerCase().includes(inputValue.toLowerCase()) &&
      !value.includes(tag)
  );

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim();
    if (trimmedTag && !value.includes(trimmedTag)) {
      onChange([...value, trimmedTag]);
    }
    setInputValue("");
  };

  const removeTag = (e: React.MouseEvent, tagToRemove: string) => {
    e.stopPropagation();
    onChange(value.filter((tag) => tag !== tagToRemove));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (inputValue.trim()) {
        addTag(inputValue);
      }
    } else if (e.key === "Backspace" && inputValue === "" && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      <div
        className={cn(
          "flex min-h-9 w-full cursor-pointer flex-wrap items-center justify-between gap-1.5 rounded-md border border-input bg-transparent py-2 pr-2 pl-2.5 text-sm shadow-xs transition-[color,box-shadow,background-color] outline-none dark:bg-input/30 dark:hover:bg-input/50 dark:active:bg-input/50"
        )}
        onClick={() => inputRef.current?.focus()}
      >
        <div className="flex flex-wrap items-center gap-1.5 flex-1">
          {value.map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="flex items-center gap-1 px-1.5 py-0.5 hover:bg-secondary"
            >
              {tag}
              <div
                className="ml-1 cursor-pointer rounded-full p-0.5 hover:bg-neutral-200 active:bg-neutral-200 dark:hover:bg-neutral-700 dark:active:bg-neutral-700 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  removeTag(e, tag);
                }}
              >
                <X className="h-3 w-3" />
              </div>
            </Badge>
          ))}
          <input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => {
              const val = e.target.value;
              if (val.endsWith(" ") || val.endsWith(",") || val.endsWith("\n")) {
                const tagValue = val.slice(0, -1).trim().replace(/,$/, "");
                if (tagValue) {
                  addTag(tagValue);
                } else {
                  setInputValue("");
                }
              } else {
                setInputValue(val);
                setOpen(true);
              }
            }}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              setOpen(true);
              setIsFocused(true);
            }}
            onBlur={() => setIsFocused(false)}
            placeholder={value.length === 0 ? activePlaceholder : ""}
            className="flex-1 bg-transparent outline-none placeholder:text-muted-foreground min-w-[120px]"
          />
        </div>
        <ChevronDown className={cn(
          "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200",
          open && "rotate-180"
        )} />
      </div>

      {open && (
        <div className="absolute top-full z-70 mt-1 max-h-60 w-full overflow-y-auto overflow-x-hidden rounded-md bg-popover text-popover-foreground shadow-md ring-1 ring-foreground/10 p-1">
          {suggestions.length === 0 ? (
            <div className="p-2 text-center text-sm text-muted-foreground">{t("common.tags_input.no_options")}</div>
          ) : filteredSuggestions.length === 0 ? (
            <div className="p-2 text-center text-sm text-muted-foreground">{t("common.tags_input.no_results")}</div>
          ) : (
            filteredSuggestions.map((suggestion) => (
              <div
                key={suggestion}
                className="relative flex w-full cursor-pointer select-none items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground active:bg-accent active:text-accent-foreground"
                onClick={() => {
                  addTag(suggestion);
                  setOpen(false);
                }}
              >
                <TagIcon className="h-4 w-4 opacity-50" />
                <span>{suggestion}</span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
