"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Pencil, Trash2, Eye, FileText, Heart, MoreHorizontal } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/dashboard/page-header";
import { DataTable, type Column } from "@/components/dashboard/data-table";
import { DeleteDialog } from "@/components/dashboard/delete-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BlogService } from "@/src/services/blog.service";
import type { Blog } from "@/src/types/database";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLanguage } from "@/context/language-context";

import { useQuery, useQueryClient } from "@tanstack/react-query";

export default function BlogsListPage() {
  const { t, language } = useLanguage();
  const queryClient = useQueryClient();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const { data: items = [], isLoading, isError } = useQuery({
    queryKey: ["blogs"],
    queryFn: BlogService.getAll,
    meta: { resource: "sidebar.Blogs" },
  });

  const loading = isLoading;

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await BlogService.delete(deleteId);
      toast.success(t("blogs.deleted_success"));
      queryClient.invalidateQueries({ queryKey: ["blogs"] });
    } catch {
      toast.error(t("blogs.deleted_failed"));
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  };

  const formatDate = (dateStr?: string | null, lang: "en" | "id" = "en") => {
    if (!dateStr) return "-";
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString(lang === "en" ? "en-US" : "id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const columns: Column<Blog>[] = [
    { 
      key: language === "en" ? "title_en" : "title_id", 
      header: language === "en" ? "Title" : "Judul",
      render: (b) => (
        <span className="font-medium text-neutral-900 dark:text-white block max-w-[260px] truncate" title={language === "en" ? b.title_en : b.title_id}>
          {language === "en" ? b.title_en : b.title_id}
        </span>
      )
    },
    {
      key: "type_id",
      header: t("blogs.form_type"),
      render: (b) => (
        <Badge variant="secondary" className="bg-neutral-100 hover:bg-neutral-200 active:bg-neutral-200 dark:bg-white/10 dark:hover:bg-white/20 dark:active:bg-white/20 text-neutral-900 dark:text-neutral-100 border-none">
          {b.type?.[language === "en" ? "name_en" : "name_id"] || "-"}
        </Badge>
      )
    },
    {
      key: "category_id",
      header: t("blogs.form_category"),
      render: (b) => (
        <Badge variant="secondary" className="bg-neutral-100 hover:bg-neutral-200 active:bg-neutral-200 dark:bg-white/10 dark:hover:bg-white/20 dark:active:bg-white/20 text-neutral-900 dark:text-neutral-100 border-none">
          {b.category?.[language === "en" ? "name_en" : "name_id"] || "-"}
        </Badge>
      )
    },
    {
      key: "created_at",
      header: language === "en" ? "Date" : "Tanggal",
      render: (b) => (
        <span className="text-xs text-neutral-600 dark:text-neutral-400 whitespace-nowrap">
          {formatDate(b.created_at, language)}
        </span>
      )
    },
    {
      key: "views_count",
      header: t("blogs.views_likes"),
      render: (b) => (
        <div className="flex items-center gap-3 text-xs text-neutral-900 dark:text-neutral-100 font-medium whitespace-nowrap">
          <span className="flex items-center gap-1">
            <Eye className="h-3.5 w-3.5" />
            {b.views_count}
          </span>
          <span className="flex items-center gap-1">
            <Heart className="h-3.5 w-3.5" />
            {b.likes_count}
          </span>
        </div>
      )
    },
    {
      key: "is_published",
      header: t("common.status"),
      render: (b) => (
        <Badge variant={b.is_published ? "default" : "secondary"}>
          {b.is_published ? t("common.published") : t("common.draft")}
        </Badge>
      )
    },
  ];

  return (
    <>
      <PageHeader
        title={t("blogs.title")}
        icon={FileText}
        description={t("blogs.description")}
        breadcrumbs={[
          { label: t("dashboard.title"), href: "/dashboard" },
          { label: t("blogs.title"), href: "/dashboard/blogs/list" },
          { label: t("sidebar.List") },
        ]}
        actions={
          <Link href="/dashboard/blogs/add">
            <Button className="bg-neutral-900 hover:bg-neutral-800 active:bg-neutral-800 text-white dark:bg-white dark:hover:bg-neutral-200 dark:active:bg-neutral-200 dark:text-neutral-900 gap-1.5 cursor-pointer">
              <Plus className="h-4 w-4" /> {t("blogs.add_blog")}
            </Button>
          </Link>
        }
      />

      <DataTable
        data={items}
        columns={columns}
        loading={loading}
        error={isError}
        searchPlaceholder={t("blogs.search_placeholder")}
        filters={[
          {
            key: "is_published",
            label: t("common.status"),
            options: [
              { label: t("common.published"), value: true },
              { label: t("common.draft"), value: false },
            ],
          },
          {
            key: "type_id",
            label: t("blogs.form_type"),
            getLabel: (item) => item.type?.[language === "en" ? "name_en" : "name_id"] || "-",
          },
          {
            key: "category_id",
            label: t("blogs.form_category"),
            getLabel: (item) => item.category?.[language === "en" ? "name_en" : "name_id"] || "-",
          },
        ]}
        actions={(b) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 data-[state=open]:bg-neutral-100 dark:data-[state=open]:bg-white/10">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <Link href={`/dashboard/blogs/${b.id}/edit`}>
                <DropdownMenuItem className="cursor-pointer">
                  <Pencil className="mr-2 h-4 w-4" />
                  {t("common.edit")}
                </DropdownMenuItem>
              </Link>
              <DropdownMenuItem 
                variant="destructive"
                className="cursor-pointer"
                onClick={() => setDeleteId(b.id)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {t("common.delete")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      />

      <DeleteDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        onConfirm={handleDelete}
        loading={deleting}
        itemName={language === "en" ? "blog post" : "artikel blog"}
      />
    </>
  );
}
