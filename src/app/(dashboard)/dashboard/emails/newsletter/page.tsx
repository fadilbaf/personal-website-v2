"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Newspaper,
  Users,
  UserCheck,
  UserX,
  Send,
  Download,
  Trash2,
  MoreHorizontal,
  CheckCircle2,
  Clock,
  Sparkles,
  Loader2,
  FileText,
  Search,
  Mail,
  Eye,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/dashboard/page-header";
import { DataTable, type Column } from "@/components/dashboard/data-table";
import { DeleteDialog } from "@/components/dashboard/delete-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { NewsletterService, type BroadcastPayload } from "@/src/services/newsletter.service";
import type {
  NewsletterSubscriber,
  NewsletterCampaign,
  SubscriberStatus,
  CampaignType,
} from "@/src/types/database";
import { useLanguage } from "@/context/language-context";

export default function NewsletterPage() {
  const { t, language } = useLanguage();
  const queryClient = useQueryClient();

  // Active Tab
  const [activeTab, setActiveTab] = useState<"subscribers" | "broadcast">("subscribers");

  // Subscribers Filtering & Search
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Delete State
  const [deleteItem, setDeleteItem] = useState<NewsletterSubscriber | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Broadcast Form State
  const [broadcastSubject, setBroadcastSubject] = useState("");
  const [broadcastType, setBroadcastType] = useState<CampaignType>("general");
  const [broadcastContent, setBroadcastContent] = useState("");
  const [testEmail, setTestEmail] = useState("");
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [isSendingBlast, setIsSendingBlast] = useState(false);
  const [isConfirmBlastOpen, setIsConfirmBlastOpen] = useState(false);

  // View Campaign Modal
  const [selectedCampaign, setSelectedCampaign] = useState<NewsletterCampaign | null>(null);
  const [isCampaignModalOpen, setIsCampaignModalOpen] = useState(false);

  // Queries
  const { data: subscribers = [], isLoading: isSubscribersLoading } = useQuery({
    queryKey: ["newsletter-subscribers"],
    queryFn: NewsletterService.getSubscribers,
    meta: { resource: "sidebar.Newsletter" },
  });

  const { data: campaigns = [], isLoading: isCampaignsLoading } = useQuery({
    queryKey: ["newsletter-campaigns"],
    queryFn: NewsletterService.getCampaigns,
  });

  // Derived metrics
  const activeCount = subscribers.filter((s) => s.status === "active").length;
  const unsubscribedCount = subscribers.filter((s) => s.status === "unsubscribed").length;
  const totalSubscribers = subscribers.length;

  // Filtered Subscribers
  const filteredSubscribers = subscribers.filter((sub) => {
    const matchesStatus =
      statusFilter === "all" || sub.status === statusFilter;
    return matchesStatus;
  });

  // Toggle subscriber status (active <-> unsubscribed)
  const handleToggleStatus = async (sub: NewsletterSubscriber) => {
    try {
      await NewsletterService.toggleStatus(sub.id, sub.status);
      toast.success(t("newsletter.status_updated"));
      queryClient.invalidateQueries({ queryKey: ["newsletter-subscribers"] });
    } catch {
      toast.error(t("common.failed"));
    }
  };

  // Delete subscriber
  const handleDeleteSubscriber = async () => {
    if (!deleteItem) return;
    setIsDeleting(true);
    try {
      await NewsletterService.deleteSubscriber(deleteItem.id);
      toast.success(t("newsletter.subscriber_deleted"));
      queryClient.invalidateQueries({ queryKey: ["newsletter-subscribers"] });
    } catch {
      toast.error(t("common.failed"));
    } finally {
      setIsDeleting(false);
      setDeleteItem(null);
    }
  };

  // Export subscribers to CSV
  const handleExportCSV = () => {
    if (subscribers.length === 0) {
      toast.info(t("newsletter.no_subscribers"));
      return;
    }

    const headers = ["Email", "Status", "Subscribed At", "Unsubscribed At"];
    const rows = subscribers.map((s) => [
      s.email,
      s.status,
      s.subscribed_at,
      s.unsubscribed_at || "",
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `newsletter_subscribers_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("CSV exported successfully");
  };

  // Send test broadcast email
  const handleSendTest = async () => {
    if (!broadcastSubject.trim() || !broadcastContent.trim()) {
      toast.error(t("common.required_field"));
      return;
    }

    setIsSendingTest(true);
    try {
      const payload: BroadcastPayload = {
        subject: broadcastSubject.trim(),
        contentHtml: broadcastContent.trim(),
        type: broadcastType,
        testOnly: true,
        testEmail: testEmail.trim() || undefined,
      };

      const result = await NewsletterService.sendBroadcast(payload);
      toast.success(t("newsletter.test_sent_success"), {
        description: result.message,
      });
    } catch (err: unknown) {
      toast.error("Failed to send test email", {
        description: err instanceof Error ? err.message : "Unexpected error.",
      });
    } finally {
      setIsSendingTest(false);
    }
  };

  // Send full blast to all active subscribers
  const handleSendBlast = async () => {
    if (!broadcastSubject.trim() || !broadcastContent.trim()) {
      toast.error(t("common.required_field"));
      return;
    }

    setIsSendingBlast(true);
    try {
      const payload: BroadcastPayload = {
        subject: broadcastSubject.trim(),
        contentHtml: broadcastContent.trim(),
        type: broadcastType,
        testOnly: false,
      };

      const result = await NewsletterService.sendBroadcast(payload);
      toast.success(t("newsletter.broadcast_success"), {
        description: result.message,
      });

      // Reset form
      setBroadcastSubject("");
      setBroadcastContent("");
      setIsConfirmBlastOpen(false);
      queryClient.invalidateQueries({ queryKey: ["newsletter-campaigns"] });
    } catch (err: unknown) {
      toast.error("Broadcast failed", {
        description: err instanceof Error ? err.message : "Failed to broadcast email.",
      });
    } finally {
      setIsSendingBlast(false);
    }
  };

  const subscriberColumns: Column<NewsletterSubscriber>[] = [
    {
      key: "status",
      header: t("common.status"),
      className: "w-32",
      render: (sub) => (
        <Badge
          variant="outline"
          className={`font-medium ${
            sub.status === "active"
              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
              : "bg-neutral-500/10 text-neutral-500 border-neutral-500/20"
          }`}
        >
          {sub.status === "active" ? (
            <UserCheck className="w-3 h-3 mr-1" />
          ) : (
            <UserX className="w-3 h-3 mr-1" />
          )}
          {sub.status === "active"
            ? t("newsletter.status_active")
            : t("newsletter.status_unsubscribed")}
        </Badge>
      ),
    },
    {
      key: "email",
      header: "Email",
      render: (sub) => (
        <span className="font-medium text-neutral-900 dark:text-white text-sm">
          {sub.email}
        </span>
      ),
    },
    {
      key: "subscribed_at",
      header: t("messages.received"),
      className: "w-44",
      render: (sub) => {
        const date = new Date(sub.subscribed_at);
        return (
          <span className="text-xs text-neutral-500 dark:text-neutral-400">
            {date.toLocaleDateString(language === "id" ? "id-ID" : "en-US", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </span>
        );
      },
    },
    {
      key: "id",
      header: t("common.actions"),
      className: "w-20 text-right",
      render: (sub) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem
              onClick={() => handleToggleStatus(sub)}
              className="cursor-pointer"
            >
              {sub.status === "active" ? (
                <>
                  <UserX className="h-4 w-4 mr-2" />
                  {t("newsletter.status_unsubscribed")}
                </>
              ) : (
                <>
                  <UserCheck className="h-4 w-4 mr-2" />
                  {t("newsletter.status_active")}
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuItem
              variant="destructive"
              onClick={() => setDeleteItem(sub)}
              className="cursor-pointer"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {t("newsletter.delete_subscriber")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title={t("newsletter.title")}
        icon={Newspaper}
        description={t("newsletter.description")}
        breadcrumbs={[
          { label: t("dashboard.title"), href: "/dashboard" },
          { label: t("sidebar.Emails"), href: "/dashboard/emails/newsletter" },
          { label: t("newsletter.title") },
        ]}
      />

      <div className="space-y-6">
        {/* Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="border-neutral-200/60 bg-white/80 backdrop-blur-sm dark:border-white/10 dark:bg-neutral-900/80">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                  {t("newsletter.total_subscribers")}
                </p>
                <h3 className="text-2xl font-bold text-neutral-900 dark:text-white mt-1">
                  {totalSubscribers}
                </h3>
              </div>
              <div className="p-2.5 bg-neutral-100 dark:bg-neutral-800 rounded-xl text-neutral-700 dark:text-neutral-300">
                <Users className="w-5 h-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-neutral-200/60 bg-white/80 backdrop-blur-sm dark:border-white/10 dark:bg-neutral-900/80">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                  {t("newsletter.active_subscribers")}
                </p>
                <h3 className="text-2xl font-bold text-neutral-900 dark:text-white mt-1">
                  {activeCount}
                </h3>
              </div>
              <div className="p-2.5 bg-emerald-500/10 rounded-xl text-emerald-600 dark:text-emerald-400">
                <UserCheck className="w-5 h-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-neutral-200/60 bg-white/80 backdrop-blur-sm dark:border-white/10 dark:bg-neutral-900/80">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                  {t("newsletter.unsubscribed")}
                </p>
                <h3 className="text-2xl font-bold text-neutral-900 dark:text-white mt-1">
                  {unsubscribedCount}
                </h3>
              </div>
              <div className="p-2.5 bg-neutral-100 dark:bg-neutral-800 rounded-xl text-neutral-500">
                <UserX className="w-5 h-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-neutral-200/60 bg-white/80 backdrop-blur-sm dark:border-white/10 dark:bg-neutral-900/80">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-sky-600 dark:text-sky-400">
                  {t("newsletter.campaign_history")}
                </p>
                <h3 className="text-2xl font-bold text-neutral-900 dark:text-white mt-1">
                  {campaigns.length}
                </h3>
              </div>
              <div className="p-2.5 bg-sky-500/10 rounded-xl text-sky-600 dark:text-sky-400">
                <Send className="w-5 h-5" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-2 p-1 bg-neutral-100 dark:bg-neutral-900 rounded-lg border border-neutral-200/60 dark:border-white/10 w-fit">
          <button
            onClick={() => setActiveTab("subscribers")}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-medium rounded-md transition-all cursor-pointer ${
              activeTab === "subscribers"
                ? "bg-white text-neutral-900 shadow-xs dark:bg-neutral-800 dark:text-white"
                : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
            }`}
          >
            <Users className="w-4 h-4" />
            {t("newsletter.tab_subscribers")} ({activeCount})
          </button>
          <button
            onClick={() => setActiveTab("broadcast")}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-medium rounded-md transition-all cursor-pointer ${
              activeTab === "broadcast"
                ? "bg-white text-neutral-900 shadow-xs dark:bg-neutral-800 dark:text-white"
                : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
            }`}
          >
            <Send className="w-4 h-4" />
            {t("newsletter.tab_broadcast")}
          </button>
        </div>

        {/* TAB 1: SUBSCRIBERS */}
        {activeTab === "subscribers" && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              {/* Status Filter */}
              <div className="flex items-center gap-1.5 p-1 bg-neutral-100 dark:bg-neutral-900 rounded-lg border border-neutral-200/60 dark:border-white/10 w-fit">
                {[
                  { id: "all", label: t("common.all") },
                  { id: "active", label: t("newsletter.status_active") },
                  { id: "unsubscribed", label: t("newsletter.status_unsubscribed") },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setStatusFilter(tab.id)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer ${
                      statusFilter === tab.id
                        ? "bg-white text-neutral-900 shadow-xs dark:bg-neutral-800 dark:text-white"
                        : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Actions & Search */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportCSV}
                  className="gap-1.5 h-9 text-xs cursor-pointer shrink-0"
                >
                  <Download className="h-4 w-4" />
                  {t("newsletter.export_csv")}
                </Button>
              </div>
            </div>

            <DataTable
              columns={subscriberColumns}
              data={filteredSubscribers}
              loading={isSubscribersLoading}
              searchPlaceholder={t("newsletter.search_subscribers")}
              pageSize={10}
            />
          </div>
        )}

        {/* TAB 2: BROADCAST CAMPAIGN */}
        {activeTab === "broadcast" && (
          <div className="space-y-8 animate-in fade-in duration-200">
            <Card className="border-neutral-200/60 bg-white/80 backdrop-blur-sm dark:border-white/10 dark:bg-neutral-900/80">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">
                      {t("newsletter.broadcast_title")}
                    </CardTitle>
                    <CardDescription className="text-xs mt-1">
                      {t("newsletter.broadcast_desc")}
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 font-medium">
                    <UserCheck className="w-3 h-3 mr-1" />
                    {activeCount} Active Recipient(s)
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2 space-y-1.5">
                    <Label className="text-xs">{t("newsletter.broadcast_subject")}</Label>
                    <Input
                      value={broadcastSubject}
                      onChange={(e) => setBroadcastSubject(e.target.value)}
                      placeholder="e.g. Exciting New Projects & Tech Insights"
                      className="h-10 text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">{t("newsletter.broadcast_type")}</Label>
                    <Select
                      value={broadcastType}
                      onValueChange={(val) => setBroadcastType(val as CampaignType)}
                    >
                      <SelectTrigger className="h-10 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">{t("newsletter.type_general")}</SelectItem>
                        <SelectItem value="blog">{t("newsletter.type_blog")}</SelectItem>
                        <SelectItem value="project">{t("newsletter.type_project")}</SelectItem>
                        <SelectItem value="achievement">{t("newsletter.type_achievement")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">{t("newsletter.broadcast_content")}</Label>
                  <Textarea
                    value={broadcastContent}
                    onChange={(e) => setBroadcastContent(e.target.value)}
                    placeholder="<p>Hello everyone,</p><p>I'm thrilled to share my latest updates...</p>"
                    rows={10}
                    className="font-mono text-sm leading-relaxed"
                  />
                  <p className="text-[11px] text-neutral-400">
                    Supports HTML markup (e.g. &lt;p&gt;, &lt;h2&gt;, &lt;ul&gt;, &lt;a href="..."&gt;, &lt;strong&gt;).
                  </p>
                </div>

                {/* Actions Row */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-4 border-t border-neutral-200 dark:border-white/10">
                  {/* Test Email Section */}
                  <div className="flex items-center gap-2 max-w-md">
                    <Input
                      type="email"
                      value={testEmail}
                      onChange={(e) => setTestEmail(e.target.value)}
                      placeholder="Optional test email (default: admin)"
                      className="h-9 text-xs"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleSendTest}
                      disabled={isSendingTest || !broadcastSubject.trim() || !broadcastContent.trim()}
                      className="h-9 text-xs whitespace-nowrap gap-1.5 cursor-pointer"
                    >
                      {isSendingTest ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Mail className="w-3.5 h-3.5" />
                      )}
                      {t("newsletter.send_test_btn")}
                    </Button>
                  </div>

                  {/* Blast Button */}
                  <Button
                    size="sm"
                    onClick={() => setIsConfirmBlastOpen(true)}
                    disabled={
                      activeCount === 0 ||
                      !broadcastSubject.trim() ||
                      !broadcastContent.trim() ||
                      isSendingBlast
                    }
                    className="bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200 gap-2 font-semibold h-10 px-5 cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    {t("newsletter.send_blast_btn")}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Past Campaigns Table */}
            <div className="space-y-3">
              <h3 className="text-base font-semibold text-neutral-900 dark:text-white">
                {t("newsletter.campaign_history")}
              </h3>
              <div className="rounded-xl border border-neutral-200/60 dark:border-white/10 overflow-hidden bg-white/80 dark:bg-neutral-900/80">
                {campaigns.length === 0 ? (
                  <div className="p-8 text-center text-xs text-neutral-500">
                    {t("newsletter.no_campaigns")}
                  </div>
                ) : (
                  <div className="divide-y divide-neutral-200/60 dark:divide-white/10">
                    {campaigns.map((camp) => (
                      <div
                        key={camp.id}
                        className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors"
                      >
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-sm text-neutral-900 dark:text-white truncate">
                              {camp.subject}
                            </span>
                            <Badge variant="secondary" className="text-[11px] uppercase">
                              {camp.type}
                            </Badge>
                          </div>
                          <p className="text-xs text-neutral-500">
                            {t("newsletter.sent_to_count", {
                              count: String(camp.sent_count),
                            })}{" "}
                            &bull;{" "}
                            {new Date(camp.created_at).toLocaleString(
                              language === "id" ? "id-ID" : "en-US",
                              { dateStyle: "medium", timeStyle: "short" }
                            )}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedCampaign(camp);
                            setIsCampaignModalOpen(true);
                          }}
                          className="text-xs gap-1.5 cursor-pointer shrink-0"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          View
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Blast Dialog */}
      <Dialog open={isConfirmBlastOpen} onOpenChange={setIsConfirmBlastOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold">
              Confirm Newsletter Blast
            </DialogTitle>
            <DialogDescription className="text-xs text-neutral-500 pt-1">
              {t("newsletter.send_blast_confirm", { count: String(activeCount) })}
            </DialogDescription>
          </DialogHeader>

          <div className="py-2 text-xs text-neutral-600 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-900 p-3 rounded-lg border border-neutral-200 dark:border-white/10">
            <p><strong>Subject:</strong> {broadcastSubject}</p>
            <p className="mt-1"><strong>Sender:</strong> newsletter@fadil.bafagih.id</p>
            <p className="mt-1"><strong>Recipients:</strong> {activeCount} active subscriber(s)</p>
          </div>

          <DialogFooter className="gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsConfirmBlastOpen(false)}
              disabled={isSendingBlast}
            >
              {t("common.cancel")}
            </Button>
            <Button
              size="sm"
              onClick={handleSendBlast}
              disabled={isSendingBlast}
              className="bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200 gap-1.5 cursor-pointer"
            >
              {isSendingBlast ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  {t("newsletter.sending_broadcast")}
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  Confirm & Send Blast
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Campaign Detail Modal */}
      <Dialog open={isCampaignModalOpen} onOpenChange={setIsCampaignModalOpen}>
        <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
          {selectedCampaign && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="uppercase text-[10px]">
                    {selectedCampaign.type}
                  </Badge>
                  <span className="text-xs text-neutral-400">
                    {new Date(selectedCampaign.created_at).toLocaleString()}
                  </span>
                </div>
                <DialogTitle className="text-base font-semibold pt-1">
                  {selectedCampaign.subject}
                </DialogTitle>
                <DialogDescription className="text-xs text-neutral-500">
                  Sent to {selectedCampaign.sent_count} subscriber(s)
                </DialogDescription>
              </DialogHeader>

              <div className="py-3">
                <Label className="text-xs uppercase text-neutral-400 tracking-wider block mb-2">
                  Email Content
                </Label>
                <div
                  className="bg-neutral-50 dark:bg-neutral-900 p-4 rounded-xl border border-neutral-200/60 dark:border-white/10 text-sm prose dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: selectedCampaign.content }}
                />
              </div>

              <DialogFooter>
                <Button
                  size="sm"
                  onClick={() => setIsCampaignModalOpen(false)}
                >
                  {t("common.back")}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <DeleteDialog
        open={!!deleteItem}
        onOpenChange={(open) => !open && setDeleteItem(null)}
        onConfirm={handleDeleteSubscriber}
        title={t("common.delete_title")}
        description={
          deleteItem
            ? t("newsletter.delete_warning", { email: deleteItem.email })
            : undefined
        }
        loading={isDeleting}
      />
    </>
  );
}
