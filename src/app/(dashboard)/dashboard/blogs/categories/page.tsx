"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, FileText, Loader2, Save, X, MoreHorizontal } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/dashboard/page-header";
import { DataTable, type Column } from "@/components/dashboard/data-table";
import { DeleteDialog } from "@/components/dashboard/delete-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { BlogService } from "@/src/services/blog.service";
import type { BlogCategory } from "@/src/types/database";
import { useLanguage } from "@/context/language-context";

import { useQuery, useQueryClient } from "@tanstack/react-query";

export default function BlogCategoriesPage() {
  const { t, language } = useLanguage();
  const queryClient = useQueryClient();

  const { data: categories = [], isLoading, isError } = useQuery({
    queryKey: ["blog-categories"],
    queryFn: BlogService.getCategories,
    meta: { resource: "sidebar.Categories" },
  });

  const loading = isLoading;

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingCategory, setEditingCategory] = useState<BlogCategory | null>(null);

  // Form states
  const [formData, setFormData] = useState({ name_id: "", name_en: "", is_active: true });

  // Delete state
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const openAddModal = () => {
    setEditingCategory(null);
    setFormData({ name_id: "", name_en: "", is_active: true });
    setIsModalOpen(true);
  };

  const openEditModal = (category: BlogCategory) => {
    setEditingCategory(category);
    setFormData({
      name_id: category.name_id,
      name_en: category.name_en,
      is_active: category.is_active,
    });
    setIsModalOpen(true);
  };

  const handleModalSubmit = async () => {
    if (!formData.name_id.trim() || !formData.name_en.trim()) {
      toast.error(language === "en" ? "Please fill in all fields" : "Mohon isi semua field");
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingCategory) {
        await BlogService.updateCategory(editingCategory.id, formData);
        toast.success(t("blogs.saved_success"));
      } else {
        await BlogService.createCategory(formData);
        toast.success(t("blogs.saved_success"));
      }
      setIsModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ["blog-categories"] });
    } catch {
      toast.error(t("blogs.saved_failed"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await BlogService.deleteCategory(deleteId);
      toast.success(t("blogs.deleted_success"));
      queryClient.invalidateQueries({ queryKey: ["blog-categories"] });
    } catch {
      toast.error(t("blogs.deleted_failed"));
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  };

  const columns: Column<BlogCategory>[] = [
    {
      key: "name_en",
      header: language === "en" ? "Name (EN)" : "Nama (EN)",
      className: "font-medium",
    },
    {
      key: "name_id",
      header: language === "en" ? "Name (ID)" : "Nama (ID)",
      render: (cat) => <Badge variant="secondary">{cat.name_id}</Badge>,
    },
    {
      key: "is_active",
      header: t("common.status"),
      render: (cat) => (
        <Badge variant={cat.is_active ? "default" : "secondary"}>
          {cat.is_active ? (language === "en" ? "Active" : "Aktif") : (language === "en" ? "Inactive" : "Nonaktif")}
        </Badge>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title={t("blogs.categories")}
        icon={FileText}
        description={language === "en" ? "Manage blog post category classifications." : "Kelola klasifikasi kategori artikel blog."}
        breadcrumbs={[
          { label: t("dashboard.title"), href: "/dashboard" },
          { label: t("blogs.title"), href: "/dashboard/blogs/list" },
          { label: t("projects.categories") },
        ]}
        actions={
          <Button onClick={openAddModal} className="bg-neutral-900 hover:bg-neutral-800 active:bg-neutral-800 text-white dark:bg-white dark:hover:bg-neutral-200 dark:active:bg-neutral-200 dark:text-neutral-900 gap-1.5 cursor-pointer">
            <Plus className="h-4 w-4" /> {t("blogs.add_category")}
          </Button>
        }
      />

      <DataTable
        data={categories}
        columns={columns}
        loading={loading}
        error={isError}
        searchPlaceholder={language === "en" ? "Search categories..." : "Cari kategori..."}
        emptyMessage={loading ? t("common.loading") : t("common.no_data")}
        filters={[
          {
            key: "is_active",
            label: t("common.status"),
            options: [
              { label: language === "en" ? "Active" : "Aktif", value: true },
              { label: language === "en" ? "Inactive" : "Nonaktif", value: false },
            ],
          },
        ]}
        actions={(cat) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 data-[state=open]:bg-neutral-100 dark:data-[state=open]:bg-white/10">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem className="cursor-pointer" onClick={() => openEditModal(cat)}>
                <Pencil className="mr-2 h-4 w-4" />
                {t("common.edit")}
              </DropdownMenuItem>
              <DropdownMenuItem
                variant="destructive"
                className="cursor-pointer"
                onClick={() => setDeleteId(cat.id)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {t("common.delete")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      />

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md max-h-[85vh] p-0 flex flex-col gap-0 overflow-hidden">
          <DialogHeader className="p-5 sm:p-6 pr-14 sm:pr-16 pb-4 border-b border-neutral-200/80 dark:border-white/10 shrink-0 bg-white dark:bg-neutral-900 sticky top-0 z-10">
            <DialogTitle className="text-base font-semibold">{editingCategory ? t("blogs.edit_category") : t("blogs.add_category")}</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 max-h-[calc(85vh-130px)] scrollbar-custom">
            <div className="space-y-1.5">
              <Label>{language === "en" ? "Name (EN)" : "Nama (EN)"}</Label>
              <Input
                placeholder="e.g., Programming"
                value={formData.name_en}
                onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>{language === "en" ? "Name (ID)" : "Nama (ID)"}</Label>
              <Input
                placeholder="e.g., Pemrograman"
                value={formData.name_id}
                onChange={(e) => setFormData({ ...formData, name_id: e.target.value })}
              />
            </div>
            <div className="flex items-center gap-3 pt-2">
              <Switch
                checked={formData.is_active}
                onCheckedChange={(v) => setFormData({ ...formData, is_active: v })}
              />
              <Label>{language === "en" ? "Active" : "Aktif"}</Label>
            </div>
          </div>
          <DialogFooter className="p-4 px-5 sm:px-6 border-t border-neutral-200/80 dark:border-white/10 bg-white dark:bg-neutral-900 shrink-0 flex items-center justify-end gap-2 sticky bottom-0 z-10">
            <Button variant="outline" onClick={() => setIsModalOpen(false)} className="gap-1.5 cursor-pointer">
              <X className="h-4 w-4" /> {t("common.cancel")}
            </Button>
            <Button onClick={handleModalSubmit}
              disabled={
                isSubmitting ||
                (editingCategory
                  ? formData.name_id.trim() === editingCategory.name_id &&
                    formData.name_en.trim() === editingCategory.name_en &&
                    formData.is_active === editingCategory.is_active
                  : !formData.name_id.trim() || !formData.name_en.trim())
              }
              className="bg-neutral-900 hover:bg-neutral-800 active:bg-neutral-800 text-white dark:bg-white dark:hover:bg-neutral-200 dark:active:bg-neutral-200 dark:text-neutral-900 gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
              {isSubmitting ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> {t("common.saving")}</>
              ) : editingCategory ? (
                <><Save className="h-4 w-4" /> {t("common.save_changes")}</>
              ) : (
                <><Plus className="h-4 w-4" /> {t("blogs.add_category")}</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DeleteDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        onConfirm={handleDelete}
        loading={deleting}
        itemName={language === "en" ? "category" : "kategori"}
      />
    </>
  );
}
