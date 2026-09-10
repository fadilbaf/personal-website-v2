"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Loader2,
  Save,
  User,
  Plus,
  Pencil,
  Trash2,
  X,
  MoreHorizontal,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { ImageUpload } from "@/components/dashboard/image-upload";
import { PdfViewerModal } from "@/components/dashboard/pdf-viewer-modal";
import { AboutService } from "@/src/services/about.service";
import { BadgeService } from "@/src/services/badge.service";
import { RoleService } from "@/src/services/role.service";
import { StorageService } from "@/src/services/storage.service";
import { STORAGE_PATHS } from "@/src/lib/constants";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useLanguage } from "@/context/language-context";
import { cn } from "@/src/app/lib/utils";
import { DataTable, type Column } from "@/components/dashboard/data-table";
import { DeleteDialog } from "@/components/dashboard/delete-dialog";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
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
import type { Role, Badge as HeroBadge } from "@/src/types/database";

const aboutSchema = z.object({
  description_id: z.string().nullable().optional(),
  description_en: z.string().nullable().optional(),
  bio_id: z.string().nullable().optional(),
  bio_en: z.string().nullable().optional(),
  quotes_id: z.string().nullable().optional(),
  quotes_en: z.string().nullable().optional(),
  years_of_experience: z.coerce.number().min(0).optional(),
});

type AboutForm = z.infer<typeof aboutSchema>;

export default function AboutPage() {
  const { t, language } = useLanguage();
  const queryClient = useQueryClient();

  // Tab State: "general" | "badges" | "roles"
  const [activeTab, setActiveTab] = useState<"general" | "badges" | "roles">("general");

  // --- About / General Info States & Queries ---
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [viewPdfUrl, setViewPdfUrl] = useState<string | null>(null);

  const { data: about, isLoading: isAboutLoading } = useQuery({
    queryKey: ["about"],
    queryFn: AboutService.get,
    meta: { resource: "sidebar.About" },
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting, isDirty },
  } = useForm<AboutForm>({
    resolver: zodResolver(aboutSchema) as any,
  });

  useEffect(() => {
    if (about) {
      reset(about as unknown as AboutForm);
    }
  }, [about, reset]);

  const onSubmit = async (data: AboutForm) => {
    if (!about) return;
    try {
      let cv_url = about.cv_url;
      if (cvFile) {
        const originalBaseName = cvFile.name.replace(/\.[^/.]+$/, "") || "CV";
        const result = await StorageService.uploadPdf(
          STORAGE_PATHS.DOCUMENTS,
          cvFile,
          originalBaseName
        );
        cv_url = result.publicUrl;
      }
      await AboutService.update(about.id, { ...data, cv_url });
      toast.success(t("about.saved_success"));
      queryClient.invalidateQueries({ queryKey: ["about"] });
      reset(data);
      setCvFile(null);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : t("about.saved_failed");
      toast.error(t("about.saved_failed"), { description: message });
    }
  };

  const onInvalid = (errors: any) => {
    console.error("Form Validation Errors:", errors);
    toast.error(t("common.failed"), {
      description: t("common.required_field"),
    });
  };

  // --- Badges States & Queries ---
  const { data: badges = [], isLoading: isBadgesLoading, isError: isBadgesError } = useQuery({
    queryKey: ["badges"],
    queryFn: BadgeService.getAll,
    meta: { resource: "badges.title" },
  });

  // Badges modal states
  const [isBadgeModalOpen, setIsBadgeModalOpen] = useState(false);
  const [isBadgeSubmitting, setIsBadgeSubmitting] = useState(false);
  const [editingBadge, setEditingBadge] = useState<HeroBadge | null>(null);

  // Badges form state
  const [badgeFormData, setBadgeFormData] = useState({
    name_id: "",
    name_en: "",
    is_active: true,
  });

  // Badges delete state
  const [deleteBadgeId, setDeleteBadgeId] = useState<string | null>(null);
  const [isBadgeDeleting, setIsBadgeDeleting] = useState(false);

  const openAddBadgeModal = () => {
    setEditingBadge(null);
    setBadgeFormData({ name_id: "", name_en: "", is_active: true });
    setIsBadgeModalOpen(true);
  };

  const openEditBadgeModal = (badge: HeroBadge) => {
    setEditingBadge(badge);
    setBadgeFormData({
      name_id: badge.name_id,
      name_en: badge.name_en,
      is_active: badge.is_active,
    });
    setIsBadgeModalOpen(true);
  };

  const handleBadgeModalSubmit = async () => {
    if (!badgeFormData.name_id.trim() || !badgeFormData.name_en.trim()) {
      toast.error(t("skills.fill_all_fields"));
      return;
    }

    setIsBadgeSubmitting(true);
    try {
      if (editingBadge) {
        await BadgeService.update(editingBadge.id, badgeFormData);
        toast.success(t("badges.saved_success"));
      } else {
        await BadgeService.create(badgeFormData);
        toast.success(t("badges.saved_success"));
      }
      setIsBadgeModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ["badges"] });
    } catch {
      toast.error(t("badges.saved_failed"));
    } finally {
      setIsBadgeSubmitting(false);
    }
  };

  const handleBadgeDelete = async () => {
    if (!deleteBadgeId) return;
    setIsBadgeDeleting(true);
    try {
      await BadgeService.delete(deleteBadgeId);
      toast.success(t("badges.deleted_success"));
      queryClient.invalidateQueries({ queryKey: ["badges"] });
    } catch {
      toast.error(t("badges.deleted_failed"));
    } finally {
      setIsBadgeDeleting(false);
      setDeleteBadgeId(null);
    }
  };

  const badgeColumns: Column<HeroBadge>[] = [
    {
      key: "name_en",
      header: t("badges.name_en"),
      className: "font-medium",
    },
    {
      key: "name_id",
      header: t("badges.name_id"),
      render: (badge) => <Badge variant="secondary">{badge.name_id}</Badge>,
    },
    {
      key: "is_active",
      header: t("badges.status"),
      render: (badge) => (
        <Badge variant={badge.is_active ? "default" : "secondary"}>
          {badge.is_active ? t("badges.active") : t("badges.inactive")}
        </Badge>
      ),
    },
  ];

  // --- Roles States & Queries ---
  const { data: roles = [], isLoading: isRolesLoading, isError: isRolesError } = useQuery({
    queryKey: ["roles"],
    queryFn: RoleService.getAll,
    meta: { resource: "roles.title" },
  });

  // Roles modal states
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isRoleSubmitting, setIsRoleSubmitting] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);

  // Roles form state
  const [roleFormData, setRoleFormData] = useState({
    role_id: "",
    role_en: "",
    is_active: true,
  });

  // Roles delete state
  const [deleteRoleId, setDeleteRoleId] = useState<string | null>(null);
  const [isRoleDeleting, setIsRoleDeleting] = useState(false);

  const openAddRoleModal = () => {
    setEditingRole(null);
    setRoleFormData({ role_id: "", role_en: "", is_active: true });
    setIsRoleModalOpen(true);
  };

  const openEditRoleModal = (role: Role) => {
    setEditingRole(role);
    setRoleFormData({
      role_id: role.role_id,
      role_en: role.role_en,
      is_active: role.is_active,
    });
    setIsRoleModalOpen(true);
  };

  const handleRoleModalSubmit = async () => {
    if (!roleFormData.role_id.trim() || !roleFormData.role_en.trim()) {
      toast.error(t("skills.fill_all_fields"));
      return;
    }

    setIsRoleSubmitting(true);
    try {
      if (editingRole) {
        await RoleService.update(editingRole.id, roleFormData);
        toast.success(t("roles.saved_success"));
      } else {
        await RoleService.create(roleFormData);
        toast.success(t("roles.saved_success"));
      }
      setIsRoleModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ["roles"] });
    } catch {
      toast.error(t("roles.saved_failed"));
    } finally {
      setIsRoleSubmitting(false);
    }
  };

  const handleRoleDelete = async () => {
    if (!deleteRoleId) return;
    setIsRoleDeleting(true);
    try {
      await RoleService.delete(deleteRoleId);
      toast.success(t("roles.deleted_success"));
      queryClient.invalidateQueries({ queryKey: ["roles"] });
    } catch {
      toast.error(t("roles.deleted_failed"));
    } finally {
      setIsRoleDeleting(false);
      setDeleteRoleId(null);
    }
  };

  const roleColumns: Column<Role>[] = [
    {
      key: "role_en",
      header: t("roles.role_en"),
      className: "font-medium",
    },
    {
      key: "role_id",
      header: t("roles.role_id"),
      render: (role) => <Badge variant="secondary">{role.role_id}</Badge>,
    },
    {
      key: "is_active",
      header: t("roles.status"),
      render: (role) => (
        <Badge variant={role.is_active ? "default" : "secondary"}>
          {role.is_active ? t("roles.active") : t("roles.inactive")}
        </Badge>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title={t("about.title")}
        description={
          activeTab === "general"
            ? t("about.description")
            : activeTab === "badges"
            ? t("badges.description")
            : t("roles.description")
        }
        icon={User}
        breadcrumbs={[
          { label: t("dashboard.title"), href: "/dashboard" },
          { label: t("sidebar.About") },
        ]}
        actions={
          activeTab === "badges" ? (
            <Button
              onClick={openAddBadgeModal}
              className="bg-neutral-900 hover:bg-neutral-800 active:bg-neutral-800 text-white dark:bg-white dark:hover:bg-neutral-200 dark:active:bg-neutral-200 dark:text-neutral-900 gap-1.5 cursor-pointer"
            >
              <Plus className="h-4 w-4" /> {t("badges.add_badge")}
            </Button>
          ) : activeTab === "roles" ? (
            <Button
              onClick={openAddRoleModal}
              className="bg-neutral-900 hover:bg-neutral-800 active:bg-neutral-800 text-white dark:bg-white dark:hover:bg-neutral-200 dark:active:bg-neutral-200 dark:text-neutral-900 gap-1.5 cursor-pointer"
            >
              <Plus className="h-4 w-4" /> {t("roles.add_role")}
            </Button>
          ) : undefined
        }
      />

      {/* Tabs Control */}
      <div className="flex gap-2 border-b border-neutral-200 dark:border-white/10 pb-px mb-6">
        <button
          onClick={() => setActiveTab("general")}
          className={cn(
            "pb-3 px-4 text-sm font-medium border-b-2 transition-all cursor-pointer outline-none focus:outline-none",
            activeTab === "general"
              ? "border-neutral-900 text-neutral-900 dark:border-white dark:text-white"
              : "border-transparent text-neutral-500 hover:text-neutral-900 active:text-neutral-900 dark:hover:text-white dark:active:text-white"
          )}
        >
          {t("about.title")}
        </button>
        <button
          onClick={() => setActiveTab("badges")}
          className={cn(
            "pb-3 px-4 text-sm font-medium border-b-2 transition-all cursor-pointer outline-none focus:outline-none",
            activeTab === "badges"
              ? "border-neutral-900 text-neutral-900 dark:border-white dark:text-white"
              : "border-transparent text-neutral-500 hover:text-neutral-900 active:text-neutral-900 dark:hover:text-white dark:active:text-white"
          )}
        >
          {t("badges.title")}
        </button>
        <button
          onClick={() => setActiveTab("roles")}
          className={cn(
            "pb-3 px-4 text-sm font-medium border-b-2 transition-all cursor-pointer outline-none focus:outline-none",
            activeTab === "roles"
              ? "border-neutral-900 text-neutral-900 dark:border-white dark:text-white"
              : "border-transparent text-neutral-500 hover:text-neutral-900 active:text-neutral-900 dark:hover:text-white dark:active:text-white"
          )}
        >
          {t("roles.title")}
        </button>
      </div>

      {activeTab === "general" && (
        <Card className="border-neutral-200/60 bg-white/80 backdrop-blur-sm dark:border-white/10 dark:bg-neutral-900/80">
          <CardContent className="p-6">
            <form
              onSubmit={handleSubmit(onSubmit, onInvalid)}
              className="space-y-6"
            >
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>{t("about.bio")} (ID)</Label>
                  {isAboutLoading ? (
                    <Skeleton className="h-20 w-full" />
                  ) : (
                    <Textarea
                      {...register("bio_id")}
                      rows={3}
                      placeholder="Short bio in Indonesian"
                    />
                  )}
                </div>
                <div className="space-y-2">
                  <Label>{t("about.bio")} (EN)</Label>
                  {isAboutLoading ? (
                    <Skeleton className="h-20 w-full" />
                  ) : (
                    <Textarea
                      {...register("bio_en")}
                      rows={3}
                      placeholder="Short bio in English"
                    />
                  )}
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>{t("about.desc")} (ID)</Label>
                  {isAboutLoading ? (
                    <Skeleton className="h-24 w-full" />
                  ) : (
                    <Textarea
                      {...register("description_id")}
                      rows={4}
                      placeholder="Full description in Indonesian"
                    />
                  )}
                </div>
                <div className="space-y-2">
                  <Label>{t("about.desc")} (EN)</Label>
                  {isAboutLoading ? (
                    <Skeleton className="h-24 w-full" />
                  ) : (
                    <Textarea
                      {...register("description_en")}
                      rows={4}
                      placeholder="Full description in English"
                    />
                  )}
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>{t("about.quotes")} (ID)</Label>
                  {isAboutLoading ? (
                    <Skeleton className="h-10 w-full" />
                  ) : (
                    <Input
                      {...register("quotes_id")}
                      placeholder="Motivational quote in Indonesian"
                    />
                  )}
                </div>
                <div className="space-y-2">
                  <Label>{t("about.quotes")} (EN)</Label>
                  {isAboutLoading ? (
                    <Skeleton className="h-10 w-full" />
                  ) : (
                    <Input
                      {...register("quotes_en")}
                      placeholder="Motivational quote in English"
                    />
                  )}
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>{t("about.experience")}</Label>
                  {isAboutLoading ? (
                    <Skeleton className="h-10 w-full" />
                  ) : (
                    <Input type="number" {...register("years_of_experience")} />
                  )}
                </div>
                <div className="space-y-2">
                  <Label>{t("about.cv")}</Label>
                  {isAboutLoading ? (
                    <Skeleton className="h-32 w-full" />
                  ) : (
                    <ImageUpload
                      accept="pdf"
                      value={about?.cv_url || undefined}
                      onChange={(file) => setCvFile(file)}
                      onViewPdf={(url) => setViewPdfUrl(url)}
                    />
                  )}
                </div>
              </div>

              <div className="flex justify-end">
                {isAboutLoading ? (
                  <Skeleton className="h-10 w-32" />
                ) : (
                  <Button
                    type="submit"
                    disabled={isSubmitting || (!isDirty && !cvFile)}
                    className="bg-neutral-900 text-white hover:bg-neutral-800 active:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200 dark:active:bg-neutral-200 gap-1.5 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        {t("common.saving")}
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        {t("common.save_changes")}
                      </>
                    )}
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {activeTab === "badges" && (
        <DataTable
          data={badges}
          columns={badgeColumns}
          loading={isBadgesLoading}
          error={isBadgesError}
          searchPlaceholder={t("badges.search_placeholder")}
          filters={[
            {
              key: "is_active",
              label: t("badges.status"),
              options: [
                { label: t("badges.active"), value: true },
                { label: t("badges.inactive"), value: false },
              ],
            },
          ]}
          actions={(badge) => (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 data-[state=open]:bg-neutral-100 dark:data-[state=open]:bg-white/10"
                >
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => openEditBadgeModal(badge)}
                >
                  <Pencil className="mr-2 h-4 w-4" />
                  {t("common.edit")}
                </DropdownMenuItem>
                <DropdownMenuItem
                  variant="destructive"
                  className="cursor-pointer"
                  onClick={() => setDeleteBadgeId(badge.id)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  {t("common.delete")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        />
      )}

      {activeTab === "roles" && (
        <DataTable
          data={roles}
          columns={roleColumns}
          loading={isRolesLoading}
          error={isRolesError}
          searchPlaceholder={t("roles.search_placeholder")}
          filters={[
            {
              key: "is_active",
              label: t("roles.status"),
              options: [
                { label: t("roles.active"), value: true },
                { label: t("roles.inactive"), value: false },
              ],
            },
          ]}
          actions={(role) => (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 data-[state=open]:bg-neutral-100 dark:data-[state=open]:bg-white/10"
                >
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => openEditRoleModal(role)}
                >
                  <Pencil className="mr-2 h-4 w-4" />
                  {t("common.edit")}
                </DropdownMenuItem>
                <DropdownMenuItem
                  variant="destructive"
                  className="cursor-pointer"
                  onClick={() => setDeleteRoleId(role.id)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  {t("common.delete")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        />
      )}

      {/* Badges Add/Edit Dialog Modal */}
      <Dialog open={isBadgeModalOpen} onOpenChange={setIsBadgeModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {editingBadge ? t("badges.edit_badge") : t("badges.add_badge")}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>{t("badges.form_name_en")}</Label>
              <Input
                placeholder="e.g., Available for Freelance"
                value={badgeFormData.name_en}
                onChange={(e) =>
                  setBadgeFormData({ ...badgeFormData, name_en: e.target.value })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label>{t("badges.form_name_id")}</Label>
              <Input
                placeholder="e.g., Tersedia untuk Freelance"
                value={badgeFormData.name_id}
                onChange={(e) =>
                  setBadgeFormData({ ...badgeFormData, name_id: e.target.value })
                }
              />
            </div>
            <div className="flex items-center gap-3 pt-2">
              <Switch
                checked={badgeFormData.is_active}
                onCheckedChange={(v) =>
                  setBadgeFormData({ ...badgeFormData, is_active: v })
                }
              />
              <Label>{t("badges.form_active")}</Label>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsBadgeModalOpen(false)}
              className="gap-1.5 cursor-pointer"
            >
              <X className="h-4 w-4" /> {t("common.cancel")}
            </Button>
            <Button
              onClick={handleBadgeModalSubmit}
              disabled={
                isBadgeSubmitting ||
                (editingBadge
                  ? badgeFormData.name_id.trim() === editingBadge.name_id &&
                    badgeFormData.name_en.trim() === editingBadge.name_en &&
                    badgeFormData.is_active === editingBadge.is_active
                  : !badgeFormData.name_id.trim() || !badgeFormData.name_en.trim())
              }
              className="bg-neutral-900 hover:bg-neutral-800 active:bg-neutral-800 text-white dark:bg-white dark:hover:bg-neutral-200 dark:active:bg-neutral-200 dark:text-neutral-900 gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isBadgeSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> {t("common.saving")}
                </>
              ) : editingBadge ? (
                <>
                  <Save className="h-4 w-4" /> {t("common.save_changes")}
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" /> {t("badges.add_badge")}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Badges Delete Confirmation Dialog */}
      <DeleteDialog
        open={!!deleteBadgeId}
        onOpenChange={() => setDeleteBadgeId(null)}
        onConfirm={handleBadgeDelete}
        loading={isBadgeDeleting}
        itemName={language === "en" ? "badge" : "lencana"}
      />

      {/* Roles Add/Edit Dialog Modal */}
      <Dialog open={isRoleModalOpen} onOpenChange={setIsRoleModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {editingRole ? t("roles.edit_role") : t("roles.add_role")}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>{t("roles.form_role_en")}</Label>
              <Input
                placeholder="e.g., Full-Stack Developer"
                value={roleFormData.role_en}
                onChange={(e) =>
                  setRoleFormData({ ...roleFormData, role_en: e.target.value })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label>{t("roles.form_role_id")}</Label>
              <Input
                placeholder="e.g., Pengembang Full-Stack"
                value={roleFormData.role_id}
                onChange={(e) =>
                  setRoleFormData({ ...roleFormData, role_id: e.target.value })
                }
              />
            </div>
            <div className="flex items-center gap-3 pt-2">
              <Switch
                checked={roleFormData.is_active}
                onCheckedChange={(v) =>
                  setRoleFormData({ ...roleFormData, is_active: v })
                }
              />
              <Label>{t("roles.form_active")}</Label>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsRoleModalOpen(false)}
              className="gap-1.5 cursor-pointer"
            >
              <X className="h-4 w-4" /> {t("common.cancel")}
            </Button>
            <Button
              onClick={handleRoleModalSubmit}
              disabled={
                isRoleSubmitting ||
                (editingRole
                  ? roleFormData.role_id.trim() === editingRole.role_id &&
                    roleFormData.role_en.trim() === editingRole.role_en &&
                    roleFormData.is_active === editingRole.is_active
                  : !roleFormData.role_id.trim() || !roleFormData.role_en.trim())
              }
              className="bg-neutral-900 hover:bg-neutral-800 active:bg-neutral-800 text-white dark:bg-white dark:hover:bg-neutral-200 dark:active:bg-neutral-200 dark:text-neutral-900 gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isRoleSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> {t("common.saving")}
                </>
              ) : editingRole ? (
                <>
                  <Save className="h-4 w-4" /> {t("common.save_changes")}
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" /> {t("roles.add_role")}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Roles Delete Confirmation Dialog */}
      <DeleteDialog
        open={!!deleteRoleId}
        onOpenChange={() => setDeleteRoleId(null)}
        onConfirm={handleRoleDelete}
        loading={isRoleDeleting}
        itemName={language === "en" ? "role" : "peran profesional"}
      />

      {/* PDF CV Modal viewer */}
      {viewPdfUrl && (
        <PdfViewerModal
          isOpen={!!viewPdfUrl}
          onClose={() => setViewPdfUrl(null)}
          pdfUrl={viewPdfUrl}
        />
      )}
    </>
  );
}
