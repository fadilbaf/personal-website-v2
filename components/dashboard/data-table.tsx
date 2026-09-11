"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Search, Filter, RotateCcw } from "lucide-react";
import { cn } from "@/src/app/lib/utils";
import { useLanguage } from "@/context/language-context";

export interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
  searchable?: boolean;
  className?: string;
}

export interface TableFilterConfig {
  key: string;
  label: string;
  options?: { label: string; value: any }[];
  getLabel?: (item: any) => string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  searchPlaceholder?: string;
  pageSize?: number;
  actions?: (item: T) => React.ReactNode;
  emptyMessage?: string;
  className?: string;
  loading?: boolean;
  error?: boolean;
  filters?: TableFilterConfig[];
}

/**
 * Reusable data table with search filtering, pagination, and dynamic popup filters.
 * Follows B&W minimalist design with subtle borders.
 */
export function DataTable<T>({
  data,
  columns,
  searchPlaceholder,
  pageSize = 10,
  actions,
  emptyMessage,
  className,
  loading = false,
  error = false,
  filters = [],
}: DataTableProps<T>) {
  const { t, language } = useLanguage();
  const actualPlaceholder = searchPlaceholder || t("common.search");
  const actualEmptyMessage = emptyMessage || t("common.no_data");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  // Filter States
  const [activeFilters, setActiveFilters] = useState<Record<string, any>>({});
  const [pendingFilters, setPendingFilters] = useState<Record<string, any>>({});
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isMultiFilter = filters.length > 1;

  // Sync pending filters when opening dropdown
  useEffect(() => {
    if (isFilterOpen) {
      setPendingFilters(activeFilters);
    }
  }, [isFilterOpen, activeFilters]);

  // Click outside listener to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsFilterOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Compute filters with dynamic options resolved from data
  const computedFilters = useMemo(() => {
    if (!filters || filters.length === 0) return [];

    return filters.map((filterConfig) => {
      if (filterConfig.options) {
        return {
          ...filterConfig,
          options: [{ label: t("common.all"), value: undefined }, ...filterConfig.options],
        };
      }

      // Extract unique values from actual data
      const uniqueValues = Array.from(
        new Set(
          data
            .map((item) => (item as Record<string, any>)[filterConfig.key])
            .filter((val) => val !== undefined && val !== null && val !== "")
        )
      );

      const dynamicOptions = uniqueValues.map((val) => {
        const matchingItem = data.find(
          (item) => (item as Record<string, any>)[filterConfig.key] === val
        );
        const label = filterConfig.getLabel
          ? filterConfig.getLabel(matchingItem)
          : String(val);
        return { label, value: val };
      });

      // Sort alphabetically by label
      dynamicOptions.sort((a, b) => a.label.localeCompare(b.label));

      return {
        ...filterConfig,
        options: [{ label: t("common.all"), value: undefined }, ...dynamicOptions],
      };
    });
  }, [data, filters]);

  // Count active filters
  const activeFilterCount = useMemo(() => {
    return Object.values(activeFilters).filter(
      (val) => val !== undefined && val !== null && val !== ""
    ).length;
  }, [activeFilters]);

  // Filter data by search term and active filters
  const filteredData = useMemo(() => {
    let result = data;

    // Apply active filters
    if (filters && filters.length > 0) {
      Object.entries(activeFilters).forEach(([key, val]) => {
        if (val === undefined || val === null || val === "") return;
        result = result.filter((item) => {
          const itemValue = (item as Record<string, any>)[key];
          
          if (typeof itemValue === "boolean") {
            return itemValue === (val === true || val === "true");
          }
          
          return String(itemValue ?? "") === String(val);
        });
      });
    }

    // Apply search filter
    if (!search.trim()) return result;
    const term = search.toLowerCase();
    const searchableKeys = columns
      .filter((col) => col.searchable !== false)
      .map((col) => col.key);

    return result.filter((item) =>
      searchableKeys.some((key) => {
        const value = (item as Record<string, unknown>)[key];
        return String(value ?? "")
          .toLowerCase()
          .includes(term);
      })
    );
  }, [data, search, columns, filters, activeFilters]);

  // Pagination
  const totalPages = Math.ceil(filteredData.length / pageSize);
  const displayTotalPages = totalPages === 0 ? 1 : totalPages;
  const paginatedData = filteredData.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  return (
    <div className={cn("space-y-4", className)}>
      {/* Search and Filters top bar */}
      <div className="flex items-center justify-between gap-4 relative z-30">
        {/* Search */}
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <Input
            placeholder={actualPlaceholder}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-9 bg-white dark:bg-neutral-950 border-neutral-200 dark:border-neutral-800"
          />
        </div>

        {/* Filter Trigger and Dropdown */}
        {filters && filters.length > 0 && (
          <div className="relative z-30" ref={dropdownRef}>
            <Button
              variant={activeFilterCount > 0 ? "default" : "outline"}
              size="sm"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={cn(
                "h-9 px-3 gap-2 text-xs font-medium transition-all duration-200 cursor-pointer border",
                activeFilterCount > 0
                  ? "bg-neutral-900 text-white border-neutral-900 dark:bg-white dark:text-neutral-900 dark:border-white hover:bg-neutral-800 active:bg-neutral-800 dark:hover:bg-neutral-200 dark:active:bg-neutral-200"
                  : "bg-white hover:bg-neutral-50 active:bg-neutral-50 text-neutral-700 border-neutral-200 dark:bg-neutral-950 dark:hover:bg-neutral-900 dark:active:bg-neutral-900 dark:text-neutral-300 dark:border-neutral-800"
              )}
            >
              <Filter className="h-3.5 w-3.5" />
              <span>{t("common.filter")}</span>
              {activeFilterCount > 0 && (
                <span className={cn(
                  "flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold transition-colors",
                  activeFilterCount > 0
                    ? "bg-white text-neutral-950 dark:bg-neutral-950 dark:text-white"
                    : "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                )}>
                  {activeFilterCount}
                </span>
              )}
            </Button>

            {/* Dropdown panel */}
            {isFilterOpen && computedFilters.length > 0 && (
              <div className="absolute right-0 top-full mt-2 z-50 w-80 rounded-lg border border-neutral-200 bg-white p-4 shadow-lg dark:border-white/10 dark:bg-popover transition-all duration-200">
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-center justify-between pb-2 border-b border-neutral-100 dark:border-white/10">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                      {t("common.filters")}
                    </span>
                    {activeFilterCount > 0 && (
                      <button
                        onClick={() => {
                          setActiveFilters({});
                          setPendingFilters({});
                          setIsFilterOpen(false);
                          setPage(1);
                        }}
                        className="text-[10px] flex items-center gap-1 text-neutral-400 hover:text-neutral-900 active:text-neutral-900 dark:hover:text-white dark:active:text-white transition-colors cursor-pointer"
                      >
                        <RotateCcw className="h-3 w-3" />
                        {t("common.clear_all")}
                      </button>
                    )}
                  </div>

                  {/* Filter Content */}
                  <div className="space-y-4 max-h-64 overflow-y-auto pr-1">
                    {computedFilters.map((filter) => {
                      const currentValue = isMultiFilter
                        ? pendingFilters[filter.key]
                        : activeFilters[filter.key];

                      return (
                        <div key={filter.key} className="space-y-2">
                          <span className="text-[11px] font-medium text-neutral-400 dark:text-neutral-500 uppercase tracking-wider block">
                            {filter.label}
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {filter.options?.map((opt) => {
                              const isSelected =
                                currentValue === opt.value ||
                                (currentValue === undefined && opt.value === undefined);

                              return (
                                <button
                                  key={String(opt.label) + String(opt.value)}
                                  type="button"
                                  onClick={() => {
                                    const nextValue = opt.value;
                                    if (isMultiFilter) {
                                      setPendingFilters((prev) => ({
                                        ...prev,
                                        [filter.key]: nextValue,
                                      }));
                                    } else {
                                      setActiveFilters((prev) => ({
                                        ...prev,
                                        [filter.key]: nextValue,
                                      }));
                                      setPage(1);
                                    }
                                  }}
                                  className={cn(
                                    "px-2.5 py-1 text-xs rounded-full border transition-all duration-150 cursor-pointer",
                                    isSelected
                                      ? "bg-neutral-900 text-white border-neutral-900 dark:bg-white dark:text-neutral-900 dark:border-white font-medium"
                                      : "bg-neutral-50 hover:bg-neutral-100 active:bg-neutral-100 text-neutral-600 border-neutral-200 dark:bg-neutral-900/50 dark:hover:bg-neutral-900 dark:active:bg-neutral-900 dark:text-neutral-400 dark:border-white/10"
                                  )}
                                >
                                  {opt.label}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Footer (Apply/Reset) for > 1 filter */}
                  {isMultiFilter && (
                    <div className="flex items-center gap-2 pt-2 border-t border-neutral-100 dark:border-white/10 w-full">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setActiveFilters({});
                          setPendingFilters({});
                          setIsFilterOpen(false);
                          setPage(1);
                        }}
                        className="flex-1 h-8 text-xs bg-white hover:bg-neutral-50 active:bg-neutral-50 border-neutral-200 text-neutral-700 dark:bg-transparent dark:hover:bg-white/5 dark:active:bg-white/5 dark:border-white/10 dark:text-neutral-300 cursor-pointer"
                      >
                        {t("common.reset")}
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => {
                          setActiveFilters(pendingFilters);
                          setIsFilterOpen(false);
                          setPage(1);
                        }}
                        className="flex-1 h-8 text-xs bg-neutral-900 text-white hover:bg-neutral-800 active:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200 dark:active:bg-neutral-200 cursor-pointer"
                      >
                        {t("common.apply")}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950">
        <Table>
          <TableHeader className="bg-neutral-100/60 dark:bg-neutral-900/60 border-b border-neutral-200 dark:border-white/10">
            <TableRow className="hover:bg-transparent border-none">
              {columns.map((col, colIndex) => (
                <TableHead
                  key={col.key}
                  className={cn(
                    "text-xs font-semibold! uppercase tracking-wider text-neutral-800 dark:text-neutral-200 py-3.5",
                    colIndex === 0 && "pl-6",
                    colIndex === columns.length - 1 && !actions && "pr-6",
                    col.className
                  )}
                >
                  {col.header}
                </TableHead>
              ))}
              {actions && (
                <TableHead className="w-[100px] text-xs font-semibold! uppercase tracking-wider text-neutral-800 dark:text-neutral-200 py-3.5 pr-6">
                  {t("common.actions")}
                </TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 10 }).map((_, i) => (
                <TableRow key={i} className="border-b border-neutral-100 dark:border-white/5 last:border-none">
                  {columns.map((col, colIndex) => (
                    <TableCell 
                      key={col.key} 
                      className={cn(
                        "py-4",
                        colIndex === 0 && "pl-6",
                        colIndex === columns.length - 1 && !actions && "pr-6"
                      )}
                    >
                      <div className="h-4 w-full animate-pulse rounded bg-neutral-100 dark:bg-white/10" />
                    </TableCell>
                  ))}
                  {actions && (
                    <TableCell className="py-4 pr-6">
                      <div className="h-8 w-8 animate-pulse rounded bg-neutral-100 dark:bg-white/10" />
                    </TableCell>
                  )}
                </TableRow>
              ))
            ) : error ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length + (actions ? 1 : 0)}
                  className="py-12 text-center text-sm text-red-500 dark:text-red-400 font-medium pl-6 pr-6"
                >
                  {t("common.failed_to_load_data")}
                </TableCell>
              </TableRow>
            ) : paginatedData.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length + (actions ? 1 : 0)}
                  className="py-12 text-center text-sm text-neutral-500 pl-6 pr-6"
                >
                  {actualEmptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((item, index) => (
                <TableRow
                  key={(item as Record<string, unknown>).id as string ?? index}
                  className="transition-colors border-b border-neutral-100 dark:border-white/5 last:border-none even:bg-neutral-100/60 dark:even:bg-neutral-800/30 hover:bg-neutral-100 active:bg-neutral-100 dark:hover:bg-neutral-800/60 dark:active:bg-neutral-800/60"
                >
                  {columns.map((col, colIndex) => {
                    const isPrimary = colIndex === 0 || (colIndex === 1 && (columns[0].key.includes("icon") || columns[0].key.includes("logo")));
                    return (
                      <TableCell
                        key={col.key}
                        className={cn(
                          "py-3.5 text-neutral-700 dark:text-neutral-300",
                          isPrimary && "font-medium text-neutral-950 dark:text-white",
                          colIndex === 0 && "pl-6",
                          colIndex === columns.length - 1 && !actions && "pr-6",
                          col.className
                        )}
                      >
                        {col.render
                          ? col.render(item)
                          : String((item as Record<string, unknown>)[col.key] ?? "-")}
                      </TableCell>
                    );
                  })}
                  {actions && (
                    <TableCell className="py-3.5 pr-6">{actions(item)}</TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Footer section inside the table box container */}
        <div className="flex items-center justify-between gap-4 border-t border-neutral-200 dark:border-white/10 px-4 sm:px-6 py-3 bg-white dark:bg-neutral-950">
          <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400 truncate">
            {t("common.showing_info", {
              start: String(filteredData.length === 0 ? 0 : (page - 1) * pageSize + 1),
              end: String(Math.min(page * pageSize, filteredData.length)),
              total: String(filteredData.length),
            })}
          </p>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="h-8 w-8 text-neutral-500 hover:text-neutral-900 active:text-neutral-900 dark:text-neutral-400 dark:hover:text-white dark:active:text-white disabled:opacity-30 cursor-pointer shrink-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <div className="flex items-center gap-1.5 sm:gap-2 text-xs font-semibold text-neutral-600 dark:text-neutral-400 select-none">
              <div className="flex h-8 min-w-8 px-2.5 items-center justify-center rounded-md border border-neutral-200 bg-white text-neutral-900 shadow-sm dark:border-neutral-800 dark:bg-neutral-950 dark:text-white">
                {page}
              </div>
              <span className="text-neutral-500 dark:text-neutral-500 font-medium whitespace-nowrap">
                {language === "en" ? "of" : "dari"} {displayTotalPages}
              </span>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setPage((p) => Math.min(displayTotalPages, p + 1))}
              disabled={page === displayTotalPages}
              className="h-8 w-8 text-neutral-500 hover:text-neutral-900 active:text-neutral-900 dark:text-neutral-400 dark:hover:text-white dark:active:text-white disabled:opacity-30 cursor-pointer shrink-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

