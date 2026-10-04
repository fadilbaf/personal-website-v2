"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, FolderTree, Loader2, Save, X, MoreHorizontal } from "lucide-react";
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
import { ProjectService } from "@/src/services/project.service";
import type { ProjectType } from "@/src/types/database";
import { useLanguage } from "@/context/language-context";

import { useQuery, useQueryClient } from "@tanstack/react-query";

export default function ProjectTypesPage() {
  const { t, language } = useLanguage();
  const queryClient = useQueryClient();

  const { data: types = [], isLoading, isError } = useQuery({
    queryKey: ["project-types"],
    queryFn: ProjectService.getTypes,
    meta: { resource: "sidebar.Types" },
  });

  const loading = isLoading;

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingType, setEditingType] = useState<ProjectType | null>(null);

  // Form states
  const [formData, setFormData] = useState({ name_id: "", name_en: "", is_active: true });

  // Delete state
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const openAddModal = () => {
    setEditingType(null);
    setFormData({ name_id: "", name_en: "", is_active: true });
    setIsModalOpen(true);
  };

  const openEditModal = (type: ProjectType) => {
    setEditingType(type);
    setFormData({
      name_id: type.name_id,
      name_en: type.name_en,
      is_active: type.is_active,
    });
    setIsModalOpen(true);
  };

  const handleModalSubmit = async () => {
    if (!formData.name_id.trim() || !formData.name_en.trim()) {
      toast.error(t("skills.fill_all_fields"));
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingType) {
        await ProjectService.updateType(editingType.id, formData);
        toast.success(t("projects.type_saved"));
      } else {
        await ProjectService.createType(formData);
        toast.success(t("projects.type_saved"));
      }
      setIsModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ["project-types"] });
    } catch {
      toast.error(t("common.failed"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await ProjectService.deleteType(deleteId);
      toast.success(t("projects.type_deleted"));
      queryClient.invalidateQueries({ queryKey: ["project-types"] });
    } catch {
      toast.error(t("common.failed"));
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  };

  const columns: Column<ProjectType>[] = [
    {
      key: "name_en",
      header: t("skills.name_en"),
      className: "font-medium",
    },
    {
      key: "name_id",
      header: t("skills.name_id"),
      render: (type) => <Badge variant="secondary">{type.name_id}</Badge>,
    },
    {
      key: "is_active",
      header: t("projects.status"),
      render: (type) => (
        <Badge variant={type.is_active ? "default" : "secondary"}>
          {type.is_active ? t("skills.active") : t("skills.inactive")}
        </Badge>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title={t("projects.types")}
        icon={FolderTree}
        description={t("projects.type_description")}
        breadcrumbs={[
          { label: t("dashboard.title"), href: "/dashboard" },
          { label: t("projects.title"), href: "/dashboard/projects/list" },
          { label: t("projects.types") },
        ]}
        actions={
          <Button onClick={openAddModal} className="bg-neutral-900 hover:bg-neutral-800 active:bg-neutral-800 text-white dark:bg-white dark:hover:bg-neutral-200 dark:active:bg-neutral-200 dark:text-neutral-900 gap-1.5 cursor-pointer">
            <Plus className="h-4 w-4" /> {t("projects.add_type")}
          </Button>
        }
      />

      <DataTable
        data={types}
        columns={columns}
        loading={loading}
        error={isError}
        searchPlaceholder={t("projects.search_types")}
        emptyMessage={loading ? (language === "en" ? "Loading types..." : "Memuat tipe...") : (language === "en" ? "No types found." : "Tipe tidak ditemukan.")}
        filters={[
          {
            key: "is_active",
            label: t("projects.status"),
            options: [
              { label: t("skills.active"), value: true },
              { label: t("skills.inactive"), value: false },
            ],
          },
        ]}
        actions={(type) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 data-[state=open]:bg-neutral-100 dark:data-[state=open]:bg-white/10">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem className="cursor-pointer" onClick={() => openEditModal(type)}>
                <Pencil className="mr-2 h-4 w-4" />
                {t("common.edit")}
              </DropdownMenuItem>
              <DropdownMenuItem
                variant="destructive"
                className="cursor-pointer"
                onClick={() => setDeleteId(type.id)}
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
            <DialogTitle className="text-base font-semibold">{editingType ? t("projects.edit_type") : t("projects.add_type")}</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 max-h-[calc(85vh-130px)] scrollbar-custom">
            <div className="space-y-1.5">
              <Label>{t("skills.name_en")}</Label>
              <Input
                placeholder="e.g., Client Work"
                value={formData.name_en}
                onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>{t("skills.name_id")}</Label>
              <Input
                placeholder="e.g., Proyek Klien"
                value={formData.name_id}
                onChange={(e) => setFormData({ ...formData, name_id: e.target.value })}
              />
            </div>
            <div className="flex items-center gap-3 pt-2">
              <Switch
                checked={formData.is_active}
                onCheckedChange={(v) => setFormData({ ...formData, is_active: v })}
              />
              <Label>{t("skills.active")}</Label>
            </div>
          </div>
          <DialogFooter className="p-4 px-5 sm:px-6 border-t border-neutral-200/80 dark:border-white/10 bg-white dark:bg-neutral-900 shrink-0 flex items-center justify-end gap-2 sticky bottom-0 z-10">
            <Button variant="outline" onClick={() => setIsModalOpen(false)} className="gap-1.5 cursor-pointer">
              <X className="h-4 w-4" /> {t("common.cancel")}
            </Button>
            <Button onClick={handleModalSubmit}
              disabled={
                isSubmitting ||
                (editingType
                  ? formData.name_id.trim() === editingType.name_id &&
                    formData.name_en.trim() === editingType.name_en &&
                    formData.is_active === editingType.is_active
                  : !formData.name_id.trim() || !formData.name_en.trim())
              }
              className="bg-neutral-900 hover:bg-neutral-800 active:bg-neutral-800 text-white dark:bg-white dark:hover:bg-neutral-200 dark:active:bg-neutral-200 dark:text-neutral-900 gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
              {isSubmitting ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> {t("common.saving")}</>
              ) : editingType ? (
                <><Save className="h-4 w-4" /> {t("common.save_changes")}</>
              ) : (
                <><Plus className="h-4 w-4" /> {t("projects.add_type")}</>
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
        itemName={language === "en" ? "type" : "tipe"}
      />
    </>
  );
}
