"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  Link as LinkIconLucide,
  Plus,
  Search,
  Filter,
  Eye,
  Users,
  Layers,
  Link2,
  RotateCcw,
  Loader2,
  Save,
} from "lucide-react";
import { Reorder } from "framer-motion";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { PageHeader } from "@/components/dashboard/page-header";
import { OverviewStatCard } from "@/components/dashboard/charts/overview-stat-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { DeleteDialog } from "@/components/dashboard/delete-dialog";
import { cn } from "@/src/app/lib/utils";
import { useLanguage } from "@/context/language-context";
import { LinksService } from "@/src/services/links.service";
import { LinkItemRow } from "@/src/components/dashboard/links/link-item-row";
import {
  LinkFormDialog,
  type LinkFormData,
} from "@/src/components/dashboard/links/link-form-dialog";
import { LinksLivePreview } from "@/src/components/dashboard/links/links-live-preview";
import type { LinkItem } from "@/src/types/database";

export default function LinksDashboardPage() {
  const { t, language } = useLanguage();
  const queryClient = useQueryClient();

  // Dialog states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<LinkItem | null>(null);
  const [deletingItem, setDeletingItem] = useState<LinkItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGroup, setSelectedGroup] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterDropdownRef = useRef<HTMLDivElement>(null);

  // Local reorder items state
  const [localItems, setLocalItems] = useState<LinkItem[]>([]);
  const [isOrderDirty, setIsOrderDirty] = useState(false);
  const [isSavingOrder, setIsSavingOrder] = useState(false);

  // 1. Fetch Links Data
  const { data: serverLinks, isLoading: isLoadingLinks } = useQuery({
    queryKey: ["admin-links"],
    queryFn: () => LinksService.getAllLinks(),
  });

  // 2. Fetch Public Profile & Context for Live Preview
  const { data: publicData } = useQuery({
    queryKey: ["public-links-context"],
    queryFn: () => LinksService.getAll(),
  });

  // 3. Fetch Statistics
  const { data: stats, isLoading: isLoadingStats } = useQuery({
    queryKey: ["links-stats"],
    queryFn: () => LinksService.getStats(),
  });

  // Click outside listener for filter dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        filterDropdownRef.current &&
        !filterDropdownRef.current.contains(event.target as Node)
      ) {
        setIsFilterOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Sync server links into local items state when fetched
  useEffect(() => {
    if (serverLinks) {
      setLocalItems(serverLinks);
      setIsOrderDirty(false);
    }
  }, [serverLinks]);

  // Unique groups in the dataset for the filter dropdown
  const uniqueGroups = useMemo(() => {
    const groups = new Set<string>();
    (serverLinks || []).forEach((l) => {
      const g = language === "id" ? l.group_name_id : l.group_name_en;
      if (g) groups.add(g);
    });
    return Array.from(groups);
  }, [serverLinks, language]);

  // Active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (selectedGroup !== "all") count++;
    if (selectedStatus !== "all") count++;
    return count;
  }, [selectedGroup, selectedStatus]);

  // Filtered links based on search & filters
  const filteredItems = useMemo(() => {
    return localItems.filter((item) => {
      // Group Filter
      if (selectedGroup !== "all") {
        const itemGroup = language === "id" ? item.group_name_id : item.group_name_en;
        if (itemGroup !== selectedGroup) return false;
      }

      // Status Filter
      if (selectedStatus === "active" && !item.is_active) return false;
      if (selectedStatus === "inactive" && item.is_active) return false;

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const tId = item.title_id?.toLowerCase() || "";
        const tEn = item.title_en?.toLowerCase() || "";
        const descId = item.description_id?.toLowerCase() || "";
        const descEn = item.description_en?.toLowerCase() || "";
        const url = item.url?.toLowerCase() || "";

        if (
          !tId.includes(q) &&
          !tEn.includes(q) &&
          !descId.includes(q) &&
          !descEn.includes(q) &&
          !url.includes(q)
        ) {
          return false;
        }
      }

      return true;
    });
  }, [localItems, selectedGroup, selectedStatus, searchQuery, language]);

  // Reorder mutations
  const handleReorder = (newOrder: LinkItem[]) => {
    if (searchQuery || selectedGroup !== "all" || selectedStatus !== "all") {
      setLocalItems(newOrder);
      return;
    }

    setLocalItems(newOrder);
    setIsOrderDirty(true);
  };

  // Move Up / Move Down Actions
  const handleMoveUp = (index: number) => {
    if (index <= 0) return;
    const newItems = [...localItems];
    const target = newItems[index];
    newItems[index] = newItems[index - 1];
    newItems[index - 1] = target;
    setLocalItems(newItems);
    setIsOrderDirty(true);
  };

  const handleMoveDown = (index: number) => {
    if (index >= localItems.length - 1) return;
    const newItems = [...localItems];
    const target = newItems[index];
    newItems[index] = newItems[index + 1];
    newItems[index + 1] = target;
    setLocalItems(newItems);
    setIsOrderDirty(true);
  };

  // Save Order to Supabase
  const handleSaveOrder = async () => {
    if (!isOrderDirty || isSavingOrder) return;
    setIsSavingOrder(true);
    try {
      const payload = localItems.map((item, idx) => ({
        id: item.id,
        sort_order: idx + 1,
      }));

      await LinksService.reorderLinks(payload);
      toast.success(t("links.order_saved"));
      setIsOrderDirty(false);
      queryClient.invalidateQueries({ queryKey: ["admin-links"] });
      queryClient.invalidateQueries({ queryKey: ["public-links-context"] });
    } catch {
      toast.error(t("links.order_failed"));
    } finally {
      setIsSavingOrder(false);
    }
  };

  // Toggle Active Status
  const handleToggleActive = async (item: LinkItem, active: boolean) => {
    setLocalItems((prev) =>
      prev.map((l) => (l.id === item.id ? { ...l, is_active: active } : l))
    );

    try {
      await LinksService.updateLink(item.id, { is_active: active });
      queryClient.invalidateQueries({ queryKey: ["admin-links"] });
      queryClient.invalidateQueries({ queryKey: ["links-stats"] });
      queryClient.invalidateQueries({ queryKey: ["public-links-context"] });
    } catch {
      toast.error(t("common.update_status_failed"));
      setLocalItems((prev) =>
        prev.map((l) => (l.id === item.id ? { ...l, is_active: item.is_active } : l))
      );
    }
  };

  // Submit Add / Edit Link Form
  const handleFormSubmit = async (data: LinkFormData) => {
    setIsSubmitting(true);
    try {
      if (editingItem) {
        await LinksService.updateLink(editingItem.id, data);
        toast.success(t("links.saved_success"));
      } else {
        await LinksService.createLink(data);
        toast.success(t("links.saved_success"));
      }

      setIsFormOpen(false);
      setEditingItem(null);
      queryClient.invalidateQueries({ queryKey: ["admin-links"] });
      queryClient.invalidateQueries({ queryKey: ["links-stats"] });
      queryClient.invalidateQueries({ queryKey: ["public-links-context"] });
    } catch (err: unknown) {
      toast.error(t("links.saved_failed"), {
        description: err instanceof Error ? err.message : undefined,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Link
  const handleDeleteConfirm = async () => {
    if (!deletingItem) return;
    setIsDeleting(true);
    try {
      await LinksService.deleteLink(deletingItem.id);
      toast.success(t("links.deleted_success"));
      setDeletingItem(null);
      queryClient.invalidateQueries({ queryKey: ["admin-links"] });
      queryClient.invalidateQueries({ queryKey: ["links-stats"] });
      queryClient.invalidateQueries({ queryKey: ["public-links-context"] });
    } catch {
      toast.error(t("links.deleted_failed"));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header: Dashboard > Links, Title "Links", Subtitle "Manage your link-in-bio..." */}
      <PageHeader
        title={t("sidebar.Links")}
        icon={LinkIconLucide}
        description={t("links.description")}
        breadcrumbs={[
          { label: t("dashboard.title"), href: "/dashboard" },
          { label: t("sidebar.Links") },
        ]}
        actions={
          <Button
            onClick={() => {
              setEditingItem(null);
              setIsFormOpen(true);
            }}
            className="bg-neutral-900 hover:bg-neutral-800 active:bg-neutral-800 text-white dark:bg-white dark:hover:bg-neutral-200 dark:active:bg-neutral-200 dark:text-neutral-900 gap-1.5 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>{t("links.add_link")}</span>
          </Button>
        }
      />

      {/* 4 Large Overview Stat Cards - Pure Monochrome */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <OverviewStatCard
          title={t("links.total_links")}
          value={stats?.total_links ?? localItems.length}
          icon={Layers}
          loading={isLoadingStats}
        />
        <OverviewStatCard
          title={t("links.active_links")}
          value={stats?.active_links ?? localItems.filter((l) => l.is_active).length}
          icon={Link2}
          loading={isLoadingStats}
        />
        <OverviewStatCard
          title={t("links.page_views")}
          value={stats?.total_views ?? 0}
          icon={Eye}
          loading={isLoadingStats}
        />
        <OverviewStatCard
          title={t("links.unique_visitors")}
          value={stats?.unique_visitors ?? 0}
          icon={Users}
          loading={isLoadingStats}
        />
      </div>

      {/* Main Workspace (Split-Screen: Left List/Editor, Right Live Preview Card) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Filter Button + Dropdown & Draggable Link Items List (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Controls Bar: Search Input + Filter Dropdown Button */}
          <div className="flex items-center justify-between gap-3 relative z-30">
            {/* Search Input */}
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
              <Input
                placeholder={t("links.search_placeholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-white dark:bg-neutral-900 border-neutral-200/80 dark:border-white/10 text-xs sm:text-sm"
              />
            </div>

            {/* Filter Trigger Button & Dropdown */}
            <div className="relative z-30" ref={filterDropdownRef}>
              <Button
                type="button"
                variant={activeFilterCount > 0 ? "default" : "outline"}
                size="sm"
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={cn(
                  "h-9 px-3 gap-2 text-xs font-medium transition-all duration-200 cursor-pointer border",
                  activeFilterCount > 0
                    ? "bg-neutral-900 text-white border-neutral-900 dark:bg-white dark:text-neutral-900 dark:border-white hover:bg-neutral-800 active:bg-neutral-800 dark:hover:bg-neutral-200 dark:active:bg-neutral-200"
                    : "bg-white hover:bg-neutral-100 active:bg-neutral-100 text-neutral-700 border-neutral-200 dark:bg-neutral-900 dark:hover:bg-neutral-800 dark:active:bg-neutral-800 dark:text-neutral-300 dark:border-neutral-800"
                )}
              >
                <Filter className="h-3.5 w-3.5" />
                <span>{t("common.filter")}</span>
                {activeFilterCount > 0 && (
                  <span
                    className={cn(
                      "flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold",
                      activeFilterCount > 0
                        ? "bg-white text-neutral-950 dark:bg-neutral-950 dark:text-white"
                        : "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                    )}
                  >
                    {activeFilterCount}
                  </span>
                )}
              </Button>

              {/* Dropdown Panel */}
              {isFilterOpen && (
                <div className="absolute right-0 top-full mt-2 z-50 w-72 rounded-xl border border-neutral-200 bg-white p-4 shadow-xl dark:border-white/10 dark:bg-neutral-900 transition-all duration-200">
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-center justify-between pb-2 border-b border-neutral-100 dark:border-white/10">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                        {t("common.filters")}
                      </span>
                      {activeFilterCount > 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedGroup("all");
                            setSelectedStatus("all");
                            setIsFilterOpen(false);
                          }}
                          className="text-[10px] flex items-center gap-1 text-neutral-400 hover:text-neutral-900 active:text-neutral-900 dark:hover:text-white dark:active:text-white transition-colors cursor-pointer"
                        >
                          <RotateCcw className="h-3 w-3" />
                          {t("common.clear_all")}
                        </button>
                      )}
                    </div>

                    {/* Group Filter Section */}
                    <div className="space-y-2">
                      <span className="text-[11px] font-medium text-neutral-400 dark:text-neutral-500 uppercase tracking-wider block">
                        {language === "id" ? "Grup / Kategori" : "Group / Category"}
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        <button
                          type="button"
                          onClick={() => setSelectedGroup("all")}
                          className={cn(
                            "px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer border",
                            selectedGroup === "all"
                              ? "bg-neutral-900 text-white border-neutral-900 dark:bg-white dark:text-neutral-900 dark:border-white"
                              : "bg-neutral-50 hover:bg-neutral-100 text-neutral-600 border-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 dark:text-neutral-300 dark:border-white/10"
                          )}
                        >
                          {t("common.all")}
                        </button>
                        {uniqueGroups.map((grp) => (
                          <button
                            key={grp}
                            type="button"
                            onClick={() => setSelectedGroup(grp)}
                            className={cn(
                              "px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer border",
                              selectedGroup === grp
                                ? "bg-neutral-900 text-white border-neutral-900 dark:bg-white dark:text-neutral-900 dark:border-white"
                                : "bg-neutral-50 hover:bg-neutral-100 text-neutral-600 border-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 dark:text-neutral-300 dark:border-white/10"
                            )}
                          >
                            {grp}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Status Filter Section */}
                    <div className="space-y-2">
                      <span className="text-[11px] font-medium text-neutral-400 dark:text-neutral-500 uppercase tracking-wider block">
                        {t("common.status")}
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        <button
                          type="button"
                          onClick={() => setSelectedStatus("all")}
                          className={cn(
                            "px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer border",
                            selectedStatus === "all"
                              ? "bg-neutral-900 text-white border-neutral-900 dark:bg-white dark:text-neutral-900 dark:border-white"
                              : "bg-neutral-50 hover:bg-neutral-100 text-neutral-600 border-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 dark:text-neutral-300 dark:border-white/10"
                          )}
                        >
                          {t("common.all")}
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedStatus("active")}
                          className={cn(
                            "px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer border",
                            selectedStatus === "active"
                              ? "bg-neutral-900 text-white border-neutral-900 dark:bg-white dark:text-neutral-900 dark:border-white"
                              : "bg-neutral-50 hover:bg-neutral-100 text-neutral-600 border-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 dark:text-neutral-300 dark:border-white/10"
                          )}
                        >
                          {t("badges.active")}
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedStatus("inactive")}
                          className={cn(
                            "px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer border",
                            selectedStatus === "inactive"
                              ? "bg-neutral-900 text-white border-neutral-900 dark:bg-white dark:text-neutral-900 dark:border-white"
                              : "bg-neutral-50 hover:bg-neutral-100 text-neutral-600 border-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 dark:text-neutral-300 dark:border-white/10"
                          )}
                        >
                          {t("badges.inactive")}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Reorder Hint Bar */}
          <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400 px-1">
            <span>{t("links.drag_reorder_hint")}</span>
            <span>
              {filteredItems.length} / {localItems.length} links
            </span>
          </div>

          {/* Links List Container */}
          {isLoadingLinks ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-18 w-full rounded-xl" />
              ))}
            </div>
          ) : filteredItems.length === 0 ? (
            <Card className="border-dashed border-neutral-200 dark:border-white/10 bg-white/40 dark:bg-neutral-900/40">
              <CardContent className="py-12 text-center space-y-3">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-100 dark:bg-neutral-800 text-neutral-400">
                  <LinkIconLucide className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-neutral-900 dark:text-white">
                    {t("common.no_data")}
                  </p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-sm mx-auto">
                    {language === "en"
                      ? "Get started by adding your first link or adjust your filters."
                      : "Mulai dengan menambahkan tautan pertama Anda atau sesuaikan filter."}
                  </p>
                </div>
                <Button
                  onClick={() => {
                    setEditingItem(null);
                    setIsFormOpen(true);
                  }}
                  className="bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-white dark:hover:bg-neutral-200 dark:text-neutral-900 gap-1.5 cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                  <span>{t("links.add_link")}</span>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              <Reorder.Group
                axis="y"
                values={localItems}
                onReorder={handleReorder}
                className="space-y-2.5"
              >
                {filteredItems.map((item, index) => (
                  <Reorder.Item
                    key={item.id}
                    value={item}
                    className="select-none cursor-default"
                  >
                    <LinkItemRow
                      item={item}
                      index={index}
                      totalItems={filteredItems.length}
                      onEdit={(target) => {
                        setEditingItem(target);
                        setIsFormOpen(true);
                      }}
                      onDelete={(target) => setDeletingItem(target)}
                      onToggleActive={handleToggleActive}
                      onMoveUp={handleMoveUp}
                      onMoveDown={handleMoveDown}
                    />
                  </Reorder.Item>
                ))}
              </Reorder.Group>

              {/* Bottom Save Changes Button (Enabled only when order changes exist) */}
              <div className="flex justify-end pt-3 border-t border-neutral-200/60 dark:border-white/10">
                <Button
                  type="button"
                  onClick={handleSaveOrder}
                  disabled={!isOrderDirty || isSavingOrder}
                  className={cn(
                    "gap-2 font-medium cursor-pointer transition-all",
                    isOrderDirty
                      ? "bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-white dark:hover:bg-neutral-200 dark:text-neutral-900 shadow-sm"
                      : "opacity-40 cursor-not-allowed bg-neutral-100 text-neutral-400 dark:bg-neutral-800 dark:text-neutral-500"
                  )}
                >
                  {isSavingOrder ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>{t("common.saving")}</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      <span>{t("common.save_changes")}</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Live Preview Container Card (5 cols) */}
        <div className="lg:col-span-5 lg:sticky lg:top-20">
          <LinksLivePreview
            links={localItems}
            profile={publicData?.profile ?? null}
            roles={publicData?.roles ?? []}
            badges={publicData?.badges ?? []}
            contact={publicData?.contact ?? null}
          />
        </div>
      </div>

      {/* Add / Edit Dialog */}
      <LinkFormDialog
        open={isFormOpen}
        onOpenChange={(open) => {
          setIsFormOpen(open);
          if (!open) setEditingItem(null);
        }}
        initialData={editingItem}
        onSubmit={handleFormSubmit}
        isSubmitting={isSubmitting}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteDialog
        open={!!deletingItem}
        onOpenChange={(open) => !open && setDeletingItem(null)}
        onConfirm={handleDeleteConfirm}
        loading={isDeleting}
        title={t("common.delete_title")}
        description={
          language === "en"
            ? `Are you sure you want to delete "${deletingItem?.title_en || deletingItem?.title_id}"? This action cannot be undone.`
            : `Apakah Anda yakin ingin menghapus "${deletingItem?.title_id || deletingItem?.title_en}"? Tindakan ini tidak dapat dibatalkan.`
        }
      />
    </div>
  );
}
