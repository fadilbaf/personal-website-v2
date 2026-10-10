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
  FolderPlus,
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
  GroupItemRow,
  type GroupRowItem,
} from "@/src/components/dashboard/links/group-item-row";
import {
  LinkFormDialog,
  type LinkFormData,
} from "@/src/components/dashboard/links/link-form-dialog";
import {
  GroupFormDialog,
  type LinkGroup,
} from "@/src/components/dashboard/links/group-form-dialog";
import { LinksLivePreview } from "@/src/components/dashboard/links/links-live-preview";
import type { LinkItem } from "@/src/types/database";

const DEFAULT_GROUPS: LinkGroup[] = [
  { id: "Utama", en: "Main" },
  { id: "Media Sosial", en: "Social Media" },
];

export type ListItem =
  | {
      type: "group";
      id: string; // group:id:::en
      name_id: string;
      name_en: string;
      itemCount: number;
    }
  | {
      type: "link";
      id: string; // link uuid
      data: LinkItem;
    };

export default function LinksDashboardPage() {
  const { t, language } = useLanguage();
  const queryClient = useQueryClient();

  // Dialog states for Link
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<LinkItem | null>(null);
  const [deletingItem, setDeletingItem] = useState<LinkItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dialog states for Group
  const [isGroupDialogOpen, setIsGroupDialogOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<LinkGroup | null>(null);
  const [deletingGroup, setDeletingGroup] = useState<GroupRowItem | null>(null);
  const [isDeletingGroup, setIsDeletingGroup] = useState(false);
  const [isSubmittingGroup, setIsSubmittingGroup] = useState(false);

  // Custom Groups State
  const [customGroups, setCustomGroups] = useState<LinkGroup[]>([]);
  const [deletedGroupKeys, setDeletedGroupKeys] = useState<string[]>([]);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGroup, setSelectedGroup] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterDropdownRef = useRef<HTMLDivElement>(null);

  // Combined Draggable Items List State
  const [listItems, setListItems] = useState<ListItem[]>([]);
  const [isDirty, setIsDirty] = useState(false);
  const [isSavingChanges, setIsSavingChanges] = useState(false);

  // Load custom groups & deleted groups from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("custom_link_groups");
      if (saved) setCustomGroups(JSON.parse(saved));
      const delSaved = localStorage.getItem("deleted_link_groups");
      if (delSaved) setDeletedGroupKeys(JSON.parse(delSaved));
    } catch {
      // Ignore
    }
  }, []);

  // 1. Fetch Links Data
  const { data: serverLinks, isLoading: isLoadingLinks } = useQuery({
    queryKey: ["admin-links"],
    queryFn: () => LinksService.getAllLinks(),
  });

  // 2. Fetch Public Profile & Context for Live Preview
  const { data: publicData, isLoading: isLoadingPublicData } = useQuery({
    queryKey: ["public-links-context"],
    queryFn: () => LinksService.getAll(),
  });

  // 3. Fetch Statistics
  const { data: stats, isLoading: isLoadingStats } = useQuery({
    queryKey: ["links-stats"],
    queryFn: () => LinksService.getStats(),
  });

  // Combine Default, Server, and Custom Groups (excluding deleted groups)
  const availableGroups = useMemo(() => {
    const map = new Map<string, LinkGroup>();

    DEFAULT_GROUPS.forEach((g) => {
      const key = `${g.id}:::${g.en}`.toLowerCase();
      if (!deletedGroupKeys.includes(key)) {
        map.set(key, g);
      }
    });

    (serverLinks || []).forEach((l) => {
      if (l.group_name_id && l.group_name_en) {
        const key = `${l.group_name_id}:::${l.group_name_en}`.toLowerCase();
        if (!deletedGroupKeys.includes(key)) {
          map.set(key, {
            id: l.group_name_id,
            en: l.group_name_en,
          });
        }
      }
    });

    customGroups.forEach((g) => {
      const key = `${g.id}:::${g.en}`.toLowerCase();
      if (!deletedGroupKeys.includes(key)) {
        map.set(key, g);
      }
    });

    return Array.from(map.values());
  }, [serverLinks, customGroups, deletedGroupKeys]);

  // Sync server links and groups into listItems state
  useEffect(() => {
    if (!serverLinks || isDirty) return;

    const links = [...serverLinks].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
    
    // Group links by their group composite key
    const groupMap = new Map<string, LinkItem[]>();
    const groupInfoMap = new Map<string, { id: string; en: string }>();

    // Register all available groups
    availableGroups.forEach((g) => {
      const key = `${g.id}:::${g.en}`.toLowerCase();
      groupMap.set(key, []);
      groupInfoMap.set(key, g);
    });

    // Bucket links
    links.forEach((l) => {
      const key = `${l.group_name_id || "Utama"}:::${l.group_name_en || "Main"}`.toLowerCase();
      if (!groupMap.has(key)) {
        groupMap.set(key, []);
        groupInfoMap.set(key, { id: l.group_name_id || "Utama", en: l.group_name_en || "Main" });
      }
      groupMap.get(key)!.push(l);
    });

    // Build ordered list items: Group Header followed by its links
    const items: ListItem[] = [];
    groupMap.forEach((gLinks, gKey) => {
      const gInfo = groupInfoMap.get(gKey) || { id: "Utama", en: "Main" };
      items.push({
        type: "group",
        id: `group:${gInfo.id}:::${gInfo.en}`,
        name_id: gInfo.id,
        name_en: gInfo.en,
        itemCount: gLinks.length,
      });

      gLinks.forEach((link) => {
        items.push({
          type: "link",
          id: link.id,
          data: link,
        });
      });
    });

    setListItems(items);
    setIsDirty(false);
  }, [serverLinks, availableGroups, isDirty]);

  // Extracted pure links from listItems for Live Preview and Stats
  const currentLinks = useMemo(() => {
    return listItems
      .filter((item): item is Extract<ListItem, { type: "link" }> => item.type === "link")
      .map((item) => item.data);
  }, [listItems]);

  // Handle Add/Edit Group Save
  const handleSaveGroup = async (group: LinkGroup, oldGroup?: LinkGroup | null) => {
    setIsSubmittingGroup(true);
    try {
      if (oldGroup) {
        // Edit existing group: update links in DB with the old group name
        const oldKey = `${oldGroup.id}:::${oldGroup.en}`.toLowerCase();
        const linksToUpdate = (serverLinks || []).filter(
          (l) => `${l.group_name_id}:::${l.group_name_en}`.toLowerCase() === oldKey
        );

        if (linksToUpdate.length > 0) {
          await Promise.all(
            linksToUpdate.map((l) =>
              LinksService.updateLink(l.id, {
                group_name_id: group.id,
                group_name_en: group.en,
              })
            )
          );
        }

        // Update customGroups state
        setCustomGroups((prev) => {
          const filtered = prev.filter(
            (g) => `${g.id}:::${g.en}`.toLowerCase() !== oldKey
          );
          const updated = [...filtered, group];
          try {
            localStorage.setItem("custom_link_groups", JSON.stringify(updated));
          } catch {
            // Ignore
          }
          return updated;
        });

        toast.success(
          language === "en"
            ? `Group "${group.en}" updated successfully`
            : `Grup "${group.id}" berhasil diperbarui`
        );
      } else {
        // Add new group
        setCustomGroups((prev) => {
          const key = `${group.id}:::${group.en}`.toLowerCase();
          const filtered = prev.filter(
            (g) => `${g.id}:::${g.en}`.toLowerCase() !== key
          );
          const updated = [...filtered, group];
          try {
            localStorage.setItem("custom_link_groups", JSON.stringify(updated));
          } catch {
            // Ignore
          }
          return updated;
        });

        // Add Group Row to listItems immediately
        setListItems((prev) => [
          ...prev,
          {
            type: "group",
            id: `group:${group.id}:::${group.en}`,
            name_id: group.id,
            name_en: group.en,
            itemCount: 0,
          },
        ]);

        toast.success(
          language === "en"
            ? `Group "${group.en}" added successfully`
            : `Grup "${group.id}" berhasil ditambahkan`
        );
      }

      setIsGroupDialogOpen(false);
      setEditingGroup(null);
      queryClient.invalidateQueries({ queryKey: ["admin-links"] });
      queryClient.invalidateQueries({ queryKey: ["public-links-context"] });
    } catch (err: unknown) {
      toast.error(
        language === "en" ? "Failed to save group" : "Gagal menyimpan grup",
        {
          description: err instanceof Error ? err.message : undefined,
        }
      );
    } finally {
      setIsSubmittingGroup(false);
    }
  };

  // Handle Delete Group Confirmation
  const handleDeleteGroupConfirm = async () => {
    if (!deletingGroup) return;
    setIsDeletingGroup(true);
    try {
      const gKey = `${deletingGroup.name_id}:::${deletingGroup.name_en}`.toLowerCase();

      // 1. Delete all links in this group from DB
      const linksToDelete = (serverLinks || []).filter(
        (l) => `${l.group_name_id}:::${l.group_name_en}`.toLowerCase() === gKey
      );

      if (linksToDelete.length > 0) {
        await Promise.all(linksToDelete.map((l) => LinksService.deleteLink(l.id)));
      }

      // 2. Mark group as deleted in localStorage and customGroups
      const newDeleted = [...deletedGroupKeys, gKey];
      setDeletedGroupKeys(newDeleted);
      try {
        localStorage.setItem("deleted_link_groups", JSON.stringify(newDeleted));
      } catch {
        // Ignore
      }

      setCustomGroups((prev) => {
        const updated = prev.filter(
          (g) => `${g.id}:::${g.en}`.toLowerCase() !== gKey
        );
        try {
          localStorage.setItem("custom_link_groups", JSON.stringify(updated));
        } catch {
          // Ignore
        }
        return updated;
      });

      // 3. Remove group and its links from listItems
      setListItems((prev) =>
        prev.filter((item) => {
          if (item.type === "group" && item.id === deletingGroup.id) return false;
          if (
            item.type === "link" &&
            `${item.data.group_name_id}:::${item.data.group_name_en}`.toLowerCase() === gKey
          ) {
            return false;
          }
          return true;
        })
      );

      toast.success(
        language === "en"
          ? `Group "${deletingGroup.name_en}" and its links deleted`
          : `Grup "${deletingGroup.name_id}" dan seluruh tautannya berhasil dihapus`
      );

      setDeletingGroup(null);
      queryClient.invalidateQueries({ queryKey: ["admin-links"] });
      queryClient.invalidateQueries({ queryKey: ["links-stats"] });
      queryClient.invalidateQueries({ queryKey: ["public-links-context"] });
    } catch (err: unknown) {
      toast.error(
        language === "en" ? "Failed to delete group" : "Gagal menghapus grup",
        {
          description: err instanceof Error ? err.message : undefined,
        }
      );
    } finally {
      setIsDeletingGroup(false);
    }
  };

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

  // Filter pills
  const uniqueFilterGroups = useMemo(() => {
    const groups = new Set<string>();
    availableGroups.forEach((g) => {
      groups.add(language === "id" ? g.id : g.en);
    });
    return Array.from(groups);
  }, [availableGroups, language]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (selectedGroup !== "all") count++;
    if (selectedStatus !== "all") count++;
    return count;
  }, [selectedGroup, selectedStatus]);

  // Filtered List items
  const filteredItems = useMemo(() => {
    return listItems.filter((item) => {
      if (item.type === "group") {
        if (selectedGroup !== "all") {
          const groupName = language === "id" ? item.name_id : item.name_en;
          if (groupName !== selectedGroup) return false;
        }
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          if (
            !item.name_id.toLowerCase().includes(q) &&
            !item.name_en.toLowerCase().includes(q)
          ) {
            return false;
          }
        }
        return true;
      }

      // Link Item Filter
      const link = item.data;
      if (selectedGroup !== "all") {
        const itemGroup = language === "id" ? link.group_name_id : link.group_name_en;
        if (itemGroup !== selectedGroup) return false;
      }

      if (selectedStatus === "active" && !link.is_active) return false;
      if (selectedStatus === "inactive" && link.is_active) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const tId = link.title_id?.toLowerCase() || "";
        const tEn = link.title_en?.toLowerCase() || "";
        const descId = link.description_id?.toLowerCase() || "";
        const descEn = link.description_en?.toLowerCase() || "";
        const url = link.url?.toLowerCase() || "";

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
  }, [listItems, selectedGroup, selectedStatus, searchQuery, language]);

  // Reorder mutations for unified list
  const handleReorder = (newOrder: ListItem[]) => {
    if (searchQuery || selectedGroup !== "all" || selectedStatus !== "all") {
      setListItems(newOrder);
      return;
    }

    setListItems(newOrder);
    setIsDirty(true);
  };

  const handleMoveUp = (index: number) => {
    if (index <= 0) return;
    const newItems = [...listItems];
    const target = newItems[index];
    newItems[index] = newItems[index - 1];
    newItems[index - 1] = target;
    setListItems(newItems);
    setIsDirty(true);
  };

  const handleMoveDown = (index: number) => {
    if (index >= listItems.length - 1) return;
    const newItems = [...listItems];
    const target = newItems[index];
    newItems[index] = newItems[index + 1];
    newItems[index + 1] = target;
    setListItems(newItems);
    setIsDirty(true);
  };

  // Save all local list changes (order, active status, group assignments) to Supabase
  const handleSaveChanges = async () => {
    if (!isDirty || isSavingChanges) return;
    setIsSavingChanges(true);
    try {
      let currentGroupId = "Utama";
      let currentGroupEn = "Main";

      const updates: Promise<any>[] = [];
      let linkIndex = 0;

      for (const item of listItems) {
        if (item.type === "group") {
          currentGroupId = item.name_id;
          currentGroupEn = item.name_en;
        } else if (item.type === "link") {
          linkIndex++;
          updates.push(
            LinksService.updateLink(item.data.id, {
              sort_order: linkIndex,
              is_active: item.data.is_active,
              group_name_id: currentGroupId,
              group_name_en: currentGroupEn,
            })
          );
        }
      }

      if (updates.length > 0) {
        await Promise.all(updates);
      }

      toast.success(t("links.saved_success") || "Perubahan berhasil disimpan");
      setIsDirty(false);
      queryClient.invalidateQueries({ queryKey: ["admin-links"] });
      queryClient.invalidateQueries({ queryKey: ["links-stats"] });
      queryClient.invalidateQueries({ queryKey: ["public-links-context"] });
    } catch {
      toast.error(t("links.saved_failed") || "Gagal menyimpan perubahan");
    } finally {
      setIsSavingChanges(false);
    }
  };

  // Toggle Active Status on a Link (Local only, saved when Save Changes button is clicked)
  const handleToggleActive = (link: LinkItem, active: boolean) => {
    setListItems((prev) =>
      prev.map((item) =>
        item.type === "link" && item.data.id === link.id
          ? { ...item, data: { ...item.data, is_active: active } }
          : item
      )
    );
    setIsDirty(true);
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

  // Delete Link Confirmation
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
    <div className="space-y-6 pb-4">
      {/* Page Header: Dashboard > Links */}
      <PageHeader
        title={t("sidebar.Links")}
        icon={LinkIconLucide}
        description={t("links.description")}
        breadcrumbs={[
          { label: t("dashboard.title"), href: "/dashboard" },
          { label: t("sidebar.Links") },
        ]}
      />

      {/* 4 Large Overview Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <OverviewStatCard
          title={t("links.total_links")}
          value={stats?.total_links ?? currentLinks.length}
          icon={Layers}
          loading={isLoadingStats}
        />
        <OverviewStatCard
          title={t("links.active_links")}
          value={stats?.active_links ?? currentLinks.filter((l) => l.is_active).length}
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

      {/* Main Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Controls & Draggable Unified List */}
        <div className="lg:col-span-7 space-y-4">
          {/* Controls Bar: Search Input + Filter Dropdown */}
          <div className="flex items-center gap-2.5 relative z-30">
            {/* Search Input */}
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
              <Input
                placeholder={t("links.search_placeholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-white dark:bg-neutral-900 border-neutral-200/80 dark:border-white/10 text-xs sm:text-sm h-9 w-full"
              />
            </div>

            {/* Filter Trigger Button & Dropdown */}
            <div className="relative z-30 shrink-0" ref={filterDropdownRef}>
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
                        {language === "id" ? "Grup" : "Group"}
                      </span>
                      <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto scrollbar-custom pr-1">
                        <button
                          type="button"
                          onClick={() => setSelectedGroup("all")}
                          className={cn(
                            "px-2.5 py-1 text-xs rounded-full border transition-all duration-150 cursor-pointer",
                            selectedGroup === "all"
                              ? "bg-neutral-900 text-white border-neutral-900 dark:bg-white dark:text-neutral-900 dark:border-white font-medium"
                              : "bg-neutral-100 hover:bg-neutral-200 text-neutral-700 border-neutral-200/80 dark:bg-white/10 dark:hover:bg-white/20 dark:text-neutral-200 dark:border-white/10"
                          )}
                        >
                          {t("common.all")}
                        </button>
                        {uniqueFilterGroups.map((grp) => (
                          <button
                            key={grp}
                            type="button"
                            onClick={() => setSelectedGroup(grp)}
                            className={cn(
                              "px-2.5 py-1 text-xs rounded-full border transition-all duration-150 cursor-pointer",
                              selectedGroup === grp
                                ? "bg-neutral-900 text-white border-neutral-900 dark:bg-white dark:text-neutral-900 dark:border-white font-medium"
                                : "bg-neutral-100 hover:bg-neutral-200 text-neutral-700 border-neutral-200/80 dark:bg-white/10 dark:hover:bg-white/20 dark:text-neutral-200 dark:border-white/10"
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
                            "px-2.5 py-1 text-xs rounded-full border transition-all duration-150 cursor-pointer",
                            selectedStatus === "all"
                              ? "bg-neutral-900 text-white border-neutral-900 dark:bg-white dark:text-neutral-900 dark:border-white font-medium"
                              : "bg-neutral-100 hover:bg-neutral-200 text-neutral-700 border-neutral-200/80 dark:bg-white/10 dark:hover:bg-white/20 dark:text-neutral-200 dark:border-white/10"
                          )}
                        >
                          {t("common.all")}
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedStatus("active")}
                          className={cn(
                            "px-2.5 py-1 text-xs rounded-full border transition-all duration-150 cursor-pointer",
                            selectedStatus === "active"
                              ? "bg-neutral-900 text-white border-neutral-900 dark:bg-white dark:text-neutral-900 dark:border-white font-medium"
                              : "bg-neutral-100 hover:bg-neutral-200 text-neutral-700 border-neutral-200/80 dark:bg-white/10 dark:hover:bg-white/20 dark:text-neutral-200 dark:border-white/10"
                          )}
                        >
                          {t("badges.active")}
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedStatus("inactive")}
                          className={cn(
                            "px-2.5 py-1 text-xs rounded-full border transition-all duration-150 cursor-pointer",
                            selectedStatus === "inactive"
                              ? "bg-neutral-900 text-white border-neutral-900 dark:bg-white dark:text-neutral-900 dark:border-white font-medium"
                              : "bg-neutral-100 hover:bg-neutral-200 text-neutral-700 border-neutral-200/80 dark:bg-white/10 dark:hover:bg-white/20 dark:text-neutral-200 dark:border-white/10"
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

          {/* Action Buttons: Add Link & Add Group full-width side-by-side */}
          <div className="grid grid-cols-2 gap-2.5 w-full">
            <Button
              type="button"
              onClick={() => {
                setEditingItem(null);
                setIsFormOpen(true);
              }}
              className="h-9 w-full gap-1.5 text-xs font-medium cursor-pointer bg-neutral-900 hover:bg-neutral-800 active:bg-neutral-800 text-white dark:bg-white dark:hover:bg-neutral-200 dark:active:bg-neutral-200 dark:text-neutral-900 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>{t("links.add_link")}</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setEditingGroup(null);
                setIsGroupDialogOpen(true);
              }}
              className="h-9 w-full gap-1.5 text-xs font-medium cursor-pointer border bg-white hover:bg-neutral-100 active:bg-neutral-100 text-neutral-700 border-neutral-200 dark:bg-neutral-900 dark:hover:bg-neutral-800 dark:active:bg-neutral-800 dark:text-neutral-300 dark:border-neutral-800 transition-colors"
            >
              <FolderPlus className="h-3.5 w-3.5" />
              <span>{language === "id" ? "Tambah Grup" : "Add Group"}</span>
            </Button>
          </div>

          {/* Reorder Hint Bar */}
          <div className="flex items-center text-xs text-neutral-500 dark:text-neutral-400 px-1">
            <span>{t("links.drag_reorder_hint")}</span>
          </div>

          {/* Draggable List Container */}
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
                      ? "Get started by adding your first group or link."
                      : "Mulai dengan menambahkan grup atau tautan pertama Anda."}
                  </p>
                </div>
                <div className="flex items-center justify-center gap-2 pt-2">
                  <Button
                    onClick={() => {
                      setEditingGroup(null);
                      setIsGroupDialogOpen(true);
                    }}
                    variant="outline"
                    className="gap-1.5 cursor-pointer"
                  >
                    <FolderPlus className="h-4 w-4" />
                    <span>{language === "id" ? "Tambah Grup" : "Add Group"}</span>
                  </Button>
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
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              <Reorder.Group
                axis="y"
                values={listItems}
                onReorder={handleReorder}
                className="space-y-2.5"
              >
                {filteredItems.map((item, index) => (
                  <Reorder.Item
                    key={item.id}
                    value={item}
                    className="select-none cursor-default"
                  >
                    {item.type === "group" ? (
                      <GroupItemRow
                        group={item}
                        index={index}
                        totalItems={filteredItems.length}
                        onEdit={(grp) => {
                          setEditingGroup({ id: grp.name_id, en: grp.name_en });
                          setIsGroupDialogOpen(true);
                        }}
                        onDelete={(grp) => setDeletingGroup(grp)}
                        onMoveUp={handleMoveUp}
                        onMoveDown={handleMoveDown}
                      />
                    ) : (
                      <LinkItemRow
                        item={item.data}
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
                    )}
                  </Reorder.Item>
                ))}
              </Reorder.Group>

              {/* Bottom Save Changes Button */}
              <div className="flex justify-end pt-2">
                <Button
                  type="button"
                  onClick={handleSaveChanges}
                  disabled={!isDirty || isSavingChanges}
                  className="bg-neutral-900 text-white hover:bg-neutral-800 active:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200 dark:active:bg-neutral-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 font-medium"
                >
                  {isSavingChanges ? (
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

        {/* Right Column: Live Preview Card */}
        <div className="lg:col-span-5 lg:sticky lg:top-20">
          <LinksLivePreview
            items={listItems}
            links={currentLinks}
            profile={publicData?.profile ?? null}
            roles={publicData?.roles ?? []}
            badges={publicData?.badges ?? []}
            contact={publicData?.contact ?? null}
            isLoading={isLoadingLinks || isLoadingPublicData || !publicData}
          />
        </div>
      </div>

      {/* Add / Edit Link Dialog */}
      <LinkFormDialog
        open={isFormOpen}
        onOpenChange={(open) => {
          setIsFormOpen(open);
          if (!open) setEditingItem(null);
        }}
        initialData={editingItem}
        onSubmit={handleFormSubmit}
        isSubmitting={isSubmitting}
        availableGroups={availableGroups}
        onOpenAddGroup={() => {
          setEditingGroup(null);
          setIsGroupDialogOpen(true);
        }}
      />

      {/* Add / Edit Group Dialog */}
      <GroupFormDialog
        open={isGroupDialogOpen}
        onOpenChange={(open) => {
          setIsGroupDialogOpen(open);
          if (!open) setEditingGroup(null);
        }}
        initialData={editingGroup}
        onSaveGroup={handleSaveGroup}
        isSubmitting={isSubmittingGroup}
      />

      {/* Delete Link Confirmation Dialog */}
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

      {/* Delete Group Confirmation Dialog */}
      <DeleteDialog
        open={!!deletingGroup}
        onOpenChange={(open) => !open && setDeletingGroup(null)}
        onConfirm={handleDeleteGroupConfirm}
        loading={isDeletingGroup}
        title={language === "en" ? "Delete Group" : "Hapus Grup"}
        description={
          language === "en"
            ? `Are you sure you want to delete group "${deletingGroup?.name_en}"? All links in this group will also be deleted.`
            : `Apakah Anda yakin ingin menghapus grup "${deletingGroup?.name_id}"? Semua tautan di dalam grup ini juga akan dihapus.`
        }
      />
    </div>
  );
}
