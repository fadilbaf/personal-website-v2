"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Newspaper,
  Users,
  UserCheck,
  UserX,
  Send,
  Trash2,
  MoreHorizontal,
  Eye,
  History,
  Loader2,
  SlidersHorizontal,
  Plus,
  Search,
  Save,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/dashboard/page-header";
import { DataTable, type Column } from "@/components/dashboard/data-table";
import { DeleteDialog } from "@/components/dashboard/delete-dialog";
import { OverviewStatCard } from "@/components/dashboard/charts/overview-stat-card";
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
  CampaignType,
} from "@/src/types/database";
import { useLanguage } from "@/context/language-context";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { renderNewsletterBroadcastEmail } from "@/src/lib/email-templates/newsletter-broadcast-email";

/**
 * Converts plain text paragraphs and optional action button into email-ready HTML.
 */
function formatBroadcastContentToHtml(
  rawText: string,
  buttonText?: string,
  buttonUrl?: string
): string {
  if (!rawText.trim()) return "";

  // 1. Escape raw HTML brackets
  const escaped = rawText
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // 2. Split into paragraphs by double newlines
  const paragraphs = escaped
    .split(/\n\s*\n/)
    .map((para) => {
      const trimmed = para.trim();
      if (!trimmed) return "";
      const withBr = trimmed.replace(/\n/g, "<br/>");
      return `<p style="margin: 0 0 16px; font-size: 15px; line-height: 1.7; color: #3f3f46;">${withBr}</p>`;
    })
    .filter(Boolean)
    .join("");

  // 3. Append CTA button if both buttonText and buttonUrl are provided
  let buttonHtml = "";
  if (buttonText?.trim() && buttonUrl?.trim()) {
    const safeUrl = buttonUrl.trim();
    const safeText = buttonText
      .trim()
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
    buttonHtml = `
      <div style="margin: 28px 0 16px; text-align: left;">
        <a href="${safeUrl}" target="_blank" rel="noopener noreferrer" style="display: inline-block; background-color: #09090b; color: #ffffff !important; font-weight: 600; font-size: 14px; padding: 12px 24px; border-radius: 8px; text-decoration: none; box-shadow: 0 2px 6px rgba(0,0,0,0.08);">
          ${safeText} &rarr;
        </a>
      </div>
    `;
  }

  return paragraphs + buttonHtml;
}

export default function NewsletterPage() {
  const { t, language } = useLanguage();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const queryClient = useQueryClient();

  // Active Tab
  const [activeTab, setActiveTab] = useState<"subscribers" | "broadcast" | "history">("subscribers");

  // Delete State
  const [deleteItem, setDeleteItem] = useState<NewsletterSubscriber | null>(null);
  const [deleteCampaignItem, setDeleteCampaignItem] = useState<NewsletterCampaign | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Broadcast Form State
  const [broadcastSubject, setBroadcastSubject] = useState("");
  const [broadcastType, setBroadcastType] = useState<CampaignType>("newsletter");
  const [broadcastContent, setBroadcastContent] = useState("");
  const [buttonText, setButtonText] = useState("");
  const [buttonUrl, setButtonUrl] = useState("");
  const [isSendingBlast, setIsSendingBlast] = useState(false);
  const [isConfirmBlastOpen, setIsConfirmBlastOpen] = useState(false);

  // Committed Recipient Configuration State
  const [isRecipientModalOpen, setIsRecipientModalOpen] = useState(false);
  const [customRecipients, setCustomRecipients] = useState<string[]>([]);
  const [selectedRecipientEmails, setSelectedRecipientEmails] = useState<string[] | null>(null);

  // Draft / Staging state for the configuration modal
  const [draftCustomRecipients, setDraftCustomRecipients] = useState<string[]>([]);
  const [draftSelectedEmails, setDraftSelectedEmails] = useState<string[]>([]);
  const [recipientSearch, setRecipientSearch] = useState("");
  const [newRecipientInput, setNewRecipientInput] = useState("");

  // View Campaign & Recipients Modals
  const [selectedCampaign, setSelectedCampaign] = useState<NewsletterCampaign | null>(null);
  const [isCampaignModalOpen, setIsCampaignModalOpen] = useState(false);
  const [isRecipientsViewModalOpen, setIsRecipientsViewModalOpen] = useState(false);

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
  const totalCampaigns = campaigns.length;

  // Active subscriber emails list
  const activeSubscriberEmails = useMemo(
    () => subscribers.filter((s) => s.status === "active").map((s) => s.email.toLowerCase()),
    [subscribers]
  );

  // Committed selected recipient emails (default to active subscribers + custom recipients)
  const effectiveSelectedEmails = useMemo(() => {
    if (selectedRecipientEmails !== null) {
      return selectedRecipientEmails;
    }
    return [
      ...activeSubscriberEmails,
      ...customRecipients.map((e) => e.toLowerCase()),
    ];
  }, [selectedRecipientEmails, activeSubscriberEmails, customRecipients]);

  // Open recipient modal and clone committed state to draft
  const handleOpenRecipientModal = () => {
    setDraftCustomRecipients([...customRecipients]);
    setDraftSelectedEmails([...effectiveSelectedEmails]);
    setRecipientSearch("");
    setNewRecipientInput("");
    setIsRecipientModalOpen(true);
  };

  // Available options inside modal from draft state
  const allDraftRecipientOptions = useMemo(() => {
    const list: { email: string; type: "active" | "unsubscribed" | "custom"; id?: string }[] = [];
    
    // 1. Custom recipients (draft)
    draftCustomRecipients.forEach((email) => {
      list.push({ email: email.toLowerCase(), type: "custom" });
    });

    // 2. Subscribers
    subscribers.forEach((sub) => {
      if (!list.some((item) => item.email === sub.email.toLowerCase())) {
        list.push({
          email: sub.email.toLowerCase(),
          type: sub.status === "active" ? "active" : "unsubscribed",
          id: sub.id,
        });
      }
    });

    return list;
  }, [subscribers, draftCustomRecipients]);

  // Filtered recipient list for search in modal (draft)
  const filteredDraftRecipientOptions = useMemo(() => {
    if (!recipientSearch.trim()) return allDraftRecipientOptions;
    const q = recipientSearch.toLowerCase().trim();
    return allDraftRecipientOptions.filter((opt) => opt.email.includes(q));
  }, [allDraftRecipientOptions, recipientSearch]);

  // Toggle single recipient checkbox in draft
  const toggleDraftRecipient = (email: string) => {
    const lower = email.toLowerCase();
    setDraftSelectedEmails((prev) =>
      prev.includes(lower) ? prev.filter((e) => e !== lower) : [...prev, lower]
    );
  };

  // Select all recipients in draft
  const handleSelectAllDraftRecipients = () => {
    setDraftSelectedEmails(allDraftRecipientOptions.map((opt) => opt.email));
  };

  // Deselect all recipients in draft
  const handleDeselectAllDraftRecipients = () => {
    setDraftSelectedEmails([]);
  };

  // Add custom non-subscriber email to draft
  const handleAddDraftCustomRecipient = () => {
    const trimmed = newRecipientInput.trim().toLowerCase();
    if (!trimmed) return;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) {
      toast.error(t("newsletter.invalid_email"));
      return;
    }

    if (
      draftCustomRecipients.some((e) => e.toLowerCase() === trimmed) ||
      subscribers.some((s) => s.email.toLowerCase() === trimmed)
    ) {
      toast.error(t("newsletter.duplicate_email"));
      return;
    }

    setDraftCustomRecipients((prev) => [...prev, trimmed]);
    setDraftSelectedEmails((prev) => [...prev, trimmed]);
    setNewRecipientInput("");
    toast.success(t("newsletter.recipient_added"));
  };

  // Remove custom email from draft
  const handleRemoveDraftCustomRecipient = (email: string) => {
    const lower = email.toLowerCase();
    setDraftCustomRecipients((prev) => prev.filter((e) => e.toLowerCase() !== lower));
    setDraftSelectedEmails((prev) => prev.filter((e) => e !== lower));
  };

  // Check if draft configuration has unsaved changes compared to committed state
  const isRecipientConfigDirty = useMemo(() => {
    if (draftCustomRecipients.length !== customRecipients.length) return true;
    const sortedDraftCustom = [...draftCustomRecipients].sort();
    const sortedCommittedCustom = [...customRecipients].sort();
    if (sortedDraftCustom.some((e, i) => e !== sortedCommittedCustom[i])) return true;

    if (draftSelectedEmails.length !== effectiveSelectedEmails.length) return true;
    const sortedDraftSelected = [...draftSelectedEmails].sort();
    const sortedEffectiveSelected = [...effectiveSelectedEmails].sort();
    return sortedDraftSelected.some((e, i) => e !== sortedEffectiveSelected[i]);
  }, [draftCustomRecipients, customRecipients, draftSelectedEmails, effectiveSelectedEmails]);

  // Save draft selections into committed state
  const handleSaveRecipientConfig = () => {
    setCustomRecipients([...draftCustomRecipients]);
    setSelectedRecipientEmails([...draftSelectedEmails]);
    setIsRecipientModalOpen(false);
    toast.success(t("newsletter.recipients_saved"));
  };

  // Generated email HTML for broadcast and live preview
  const generatedEmailHtml = useMemo(() => {
    const scrollbarColor = isDark
      ? "rgba(255, 255, 255, 0.85) transparent"
      : "rgba(0, 0, 0, 0.8) transparent";
    const thumbColor = isDark
      ? "rgba(255, 255, 255, 0.8)"
      : "rgba(0, 0, 0, 0.85)";
    const thumbHoverColor = isDark
      ? "#ffffff"
      : "#000000";

    const iframeScrollbarStyle = `<style>
      :root, html, body {
        margin: 0 !important;
        padding: 0 !important;
        background-color: transparent !important;
        background: transparent !important;
        color-scheme: light !important;
        overflow: hidden !important;
        box-sizing: border-box !important;
      }
      * {
        box-sizing: border-box !important;
      }
      ::-webkit-scrollbar {
        display: none !important;
        width: 0 !important;
        height: 0 !important;
      }
    </style>`;

    const formattedContent = formatBroadcastContentToHtml(
      broadcastContent,
      buttonText,
      buttonUrl
    );
    const raw = renderNewsletterBroadcastEmail({
      subject: broadcastSubject || (language === "id" ? "Subjek Broadcast Email" : "Broadcast Email Subject"),
      contentHtml:
        formattedContent ||
        `<p style="margin: 0 0 16px; font-size: 15px; line-height: 1.7; color: #a1a1aa; font-style: italic;">${
          language === "id"
            ? "Tulis pesan Anda pada form di sebelah kiri untuk melihat pratinjau langsung di sini..."
            : "Write your message on the left form to see the live preview here..."
        }</p>`,
      type: broadcastType,
      recipientEmail: "subscriber@example.com",
    });

    if (raw.includes("</head>")) {
      return raw.replace("</head>", `${iframeScrollbarStyle}</head>`);
    } else if (raw.includes("<body")) {
      return raw.replace("<body", `${iframeScrollbarStyle}<body`);
    }
    return `${iframeScrollbarStyle}${raw}`;
  }, [broadcastSubject, broadcastContent, buttonText, buttonUrl, broadcastType, language]);

  // Generated email HTML for selected campaign preview in View Message modal
  const viewingCampaignHtml = useMemo(() => {
    if (!selectedCampaign) return "";

    const iframeScrollbarStyle = `<style>
      :root, html, body {
        margin: 0 !important;
        padding: 0 !important;
        background-color: transparent !important;
        background: transparent !important;
        color-scheme: light !important;
        overflow: hidden !important;
        box-sizing: border-box !important;
      }
      * {
        box-sizing: border-box !important;
      }
      ::-webkit-scrollbar {
        display: none !important;
        width: 0 !important;
        height: 0 !important;
      }
    </style>`;

    const rawContent = selectedCampaign.content || "";
    const isFullHtml =
      rawContent.includes("<!DOCTYPE") ||
      rawContent.includes("<html") ||
      rawContent.includes("<body");

    const raw = isFullHtml
      ? rawContent
      : renderNewsletterBroadcastEmail({
          subject: selectedCampaign.subject,
          contentHtml: rawContent,
          type: selectedCampaign.type,
          recipientEmail: "subscriber@example.com",
        });

    if (raw.includes("</head>")) {
      return raw.replace("</head>", `${iframeScrollbarStyle}</head>`);
    } else if (raw.includes("<body")) {
      return raw.replace("<body", `${iframeScrollbarStyle}<body`);
    }
    return `${iframeScrollbarStyle}${raw}`;
  }, [selectedCampaign]);

  // Dynamic iframe height measurement for Live Preview in Broadcast Tab
  const broadcastIframeRef = useRef<HTMLIFrameElement>(null);
  const [broadcastIframeHeight, setBroadcastIframeHeight] = useState(480);

  const handleBroadcastIframeLoad = () => {
    if (broadcastIframeRef.current?.contentWindow) {
      const win = broadcastIframeRef.current.contentWindow;
      const doc = win.document;
      if (!doc || !doc.body) return;

      if (doc.documentElement) {
        doc.documentElement.style.backgroundColor = "transparent";
        doc.documentElement.style.colorScheme = "light";
      }
      if (doc.body) {
        doc.body.style.backgroundColor = "transparent";
        doc.body.style.colorScheme = "light";
      }

      const card =
        (doc.body?.firstElementChild as HTMLElement) ||
        doc.querySelector('table[style*="max-width: 600px"]') ||
        doc.querySelector("table") ||
        doc.body;

      if (card) {
        const height = Math.ceil(
          (card.getBoundingClientRect ? card.getBoundingClientRect().height : 0) ||
          card.offsetHeight ||
          card.scrollHeight ||
          doc.body.scrollHeight ||
          0
        );
        if (height > 0) {
          setBroadcastIframeHeight(height + 6); // +6px prevents bottom border cutoff
        }
      }
    }
  };

  useEffect(() => {
    handleBroadcastIframeLoad();
    const t1 = setTimeout(handleBroadcastIframeLoad, 50);
    const t2 = setTimeout(handleBroadcastIframeLoad, 150);
    const t3 = setTimeout(handleBroadcastIframeLoad, 350);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [generatedEmailHtml]);

  // Modal iframe ref for Sent Broadcast Email Preview
  const modalIframeRef = useRef<HTMLIFrameElement>(null);
  const [modalIframeHeight, setModalIframeHeight] = useState(500);

  const handleModalIframeLoad = () => {
    if (modalIframeRef.current?.contentWindow) {
      const win = modalIframeRef.current.contentWindow;
      const doc = win.document;
      if (!doc || !doc.body) return;

      if (doc.documentElement) {
        doc.documentElement.style.backgroundColor = "transparent";
        doc.documentElement.style.colorScheme = "light";
      }
      if (doc.body) {
        doc.body.style.backgroundColor = "transparent";
        doc.body.style.colorScheme = "light";
      }

      const card =
        (doc.body?.firstElementChild as HTMLElement) ||
        doc.querySelector('table[style*="max-width: 600px"]') ||
        doc.querySelector("table") ||
        doc.body;

      if (card) {
        const height = Math.ceil(
          (card.getBoundingClientRect ? card.getBoundingClientRect().height : 0) ||
          card.offsetHeight ||
          card.scrollHeight ||
          doc.body.scrollHeight ||
          0
        );
        if (height > 0) {
          setModalIframeHeight(height + 6);
        }
      }
    }
  };

  useEffect(() => {
    if (isCampaignModalOpen) {
      handleModalIframeLoad();
      const t1 = setTimeout(handleModalIframeLoad, 50);
      const t2 = setTimeout(handleModalIframeLoad, 150);
      const t3 = setTimeout(handleModalIframeLoad, 350);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
      };
    }
  }, [isCampaignModalOpen, viewingCampaignHtml]);

  // Toggle subscriber status
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

  // Delete campaign history
  const handleDeleteCampaign = async () => {
    if (!deleteCampaignItem) return;
    setIsDeleting(true);
    try {
      await NewsletterService.deleteCampaign(deleteCampaignItem.id);
      toast.success(t("newsletter.campaign_deleted"));
      queryClient.invalidateQueries({ queryKey: ["newsletter-campaigns"] });
    } catch {
      toast.error(t("common.failed"));
    } finally {
      setIsDeleting(false);
      setDeleteCampaignItem(null);
    }
  };

  // Send full blast to selected recipients
  const handleSendBlast = async () => {
    if (!broadcastSubject.trim() || !broadcastContent.trim()) {
      toast.error(t("common.required_field"));
      return;
    }

    if (effectiveSelectedEmails.length === 0) {
      toast.error(
        language === "id"
          ? "Silakan pilih minimal 1 penerima broadcast."
          : "Please select at least 1 recipient."
      );
      return;
    }

    const formattedContent = formatBroadcastContentToHtml(
      broadcastContent,
      buttonText,
      buttonUrl
    );

    setIsSendingBlast(true);
    try {
      const payload: BroadcastPayload = {
        subject: broadcastSubject.trim(),
        contentHtml: formattedContent,
        type: broadcastType,
        testOnly: false,
        recipients: effectiveSelectedEmails,
      };

      await NewsletterService.sendBroadcast(payload);
      toast.success(t("newsletter.broadcast_success"));

      // Reset form
      setBroadcastSubject("");
      setBroadcastContent("");
      setButtonText("");
      setButtonUrl("");
      setSelectedRecipientEmails(null);
      setCustomRecipients([]);
      setIsConfirmBlastOpen(false);
      setActiveTab("history");
      queryClient.invalidateQueries({ queryKey: ["newsletter-campaigns"] });
    } catch {
      toast.error(t("common.failed"));
    } finally {
      setIsSendingBlast(false);
    }
  };

  // Format date time helper consistent across table and modals
  const formatDateTime = (dateStr?: string | null) => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "-";
    return `${date.toLocaleDateString(language === "id" ? "id-ID" : "en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })} • ${date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  };

  // Subscriber columns
  const subscriberColumns: Column<NewsletterSubscriber>[] = [
    {
      key: "email",
      header: "Email",
      render: (sub) => (
        <span className="font-medium text-neutral-900 dark:text-white text-xs sm:text-sm">
          {sub.email}
        </span>
      ),
    },
    {
      key: "subscribed_at",
      header: t("messages.received"),
      className: "w-44",
      render: (sub) => (
        <span className="text-xs text-neutral-500 dark:text-neutral-400 whitespace-nowrap">
          {formatDateTime(sub.subscribed_at)}
        </span>
      ),
    },
    {
      key: "status",
      header: t("common.status"),
      className: "w-32",
      render: (sub) => (
        <Badge
          variant={sub.status === "active" ? "default" : "secondary"}
          className={cn(
            "rounded-full text-xs font-medium",
            sub.status === "active"
              ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
              : "bg-neutral-100 hover:bg-neutral-200 text-neutral-900 dark:bg-white/10 dark:hover:bg-white/20 dark:text-neutral-100 border-none"
          )}
        >
          {sub.status === "active"
            ? t("newsletter.status_active")
            : t("newsletter.status_unsubscribed")}
        </Badge>
      ),
    },
  ];

  // Campaign History columns
  const campaignColumns: Column<NewsletterCampaign>[] = [
    {
      key: "subject",
      header: t("messages.subject"),
      render: (camp) => (
        <div className="space-y-0.5">
          <p className="font-medium text-xs sm:text-sm text-neutral-900 dark:text-white">
            {camp.subject}
          </p>
          <p className="text-xs text-neutral-500 line-clamp-1">
            {camp.content.replace(/<[^>]*>?/gm, "").slice(0, 80)}...
          </p>
        </div>
      ),
    },
    {
      key: "type",
      header: t("newsletter.broadcast_type"),
      className: "w-36",
      render: (camp) => (
        <Badge
          variant="secondary"
          className="rounded-full text-xs font-medium bg-neutral-100 hover:bg-neutral-200 text-neutral-900 dark:bg-white/10 dark:hover:bg-white/20 dark:text-neutral-100 border-none"
        >
          {t(`newsletter.type_${camp.type}`) || camp.type}
        </Badge>
      ),
    },
    {
      key: "sent_count",
      header: t("newsletter.total_subscribers"),
      className: "w-36",
      render: (camp) => (
        <span className="text-xs text-neutral-600 dark:text-neutral-300 font-medium">
          {camp.sent_count} {camp.sent_count === 1 ? "subscriber" : "subscribers"}
        </span>
      ),
    },
    {
      key: "created_at",
      header: t("messages.received"),
      className: "w-44",
      render: (camp) => (
        <span className="text-xs text-neutral-500 dark:text-neutral-400 whitespace-nowrap">
          {formatDateTime(camp.sent_at || camp.created_at)}
        </span>
      ),
    },
  ];

  const campaignTypeOptions = [
    { value: "newsletter", label: t("newsletter.type_newsletter") },
    { value: "blog", label: t("newsletter.type_blog") },
    { value: "project", label: t("newsletter.type_project") },
    { value: "achievement", label: t("newsletter.type_achievement") },
    { value: "information", label: t("newsletter.type_information") },
    { value: "promotion", label: t("newsletter.type_promotion") },
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
          <OverviewStatCard
            title={t("newsletter.total_subscribers")}
            value={totalSubscribers}
            icon={Users}
          />
          <OverviewStatCard
            title={t("newsletter.active_subscribers")}
            value={activeCount}
            icon={UserCheck}
          />
          <OverviewStatCard
            title={t("newsletter.unsubscribed")}
            value={unsubscribedCount}
            icon={UserX}
          />
          <OverviewStatCard
            title={t("newsletter.campaign_history")}
            value={totalCampaigns}
            icon={Send}
          />
        </div>

        {/* Tab Selector */}
        <div className="max-w-full w-full sm:w-fit overflow-x-auto scrollbar-none flex items-center gap-1.5 p-1 bg-neutral-100 dark:bg-neutral-900 rounded-lg border border-neutral-200/60 dark:border-white/10">
          <button
            type="button"
            onClick={(e) => {
              e.currentTarget.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
              setActiveTab("subscribers");
            }}
            className={cn(
              "flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer whitespace-nowrap shrink-0",
              activeTab === "subscribers"
                ? "bg-white text-neutral-900 shadow-xs dark:bg-neutral-800 dark:text-white"
                : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
            )}
          >
            <Users className="w-4 h-4 shrink-0" />
            {t("newsletter.tab_subscribers")}
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.currentTarget.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
              setActiveTab("broadcast");
            }}
            className={cn(
              "flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer whitespace-nowrap shrink-0",
              activeTab === "broadcast"
                ? "bg-white text-neutral-900 shadow-xs dark:bg-neutral-800 dark:text-white"
                : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
            )}
          >
            <Send className="w-4 h-4 shrink-0" />
            {t("newsletter.tab_broadcast")}
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.currentTarget.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
              setActiveTab("history");
            }}
            className={cn(
              "flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer whitespace-nowrap shrink-0",
              activeTab === "history"
                ? "bg-white text-neutral-900 shadow-xs dark:bg-neutral-800 dark:text-white"
                : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
            )}
          >
            <History className="w-4 h-4 shrink-0" />
            {t("newsletter.campaign_history")}
          </button>
        </div>

        {/* TAB 1: SUBSCRIBERS */}
        {activeTab === "subscribers" && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <DataTable
              columns={subscriberColumns}
              data={subscribers}
              loading={isSubscribersLoading}
              searchPlaceholder={t("newsletter.search_subscribers")}
              pageSize={10}
              filters={[
                {
                  key: "status",
                  label: t("common.status"),
                  options: [
                    { label: t("newsletter.status_active"), value: "active" },
                    { label: t("newsletter.status_unsubscribed"), value: "unsubscribed" },
                  ],
                },
              ]}
              actions={(sub) => (
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
              )}
            />
          </div>
        )}

        {/* TAB 2: BROADCAST CAMPAIGN (2-Column Side-by-Side) */}
        {activeTab === "broadcast" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-in fade-in duration-200">
            {/* Left Column: Form Composer (6 cols) */}
            <div className="lg:col-span-6 space-y-4">
              <div className="rounded-xl border border-neutral-200/60 bg-white/80 backdrop-blur-sm dark:border-white/10 dark:bg-neutral-900/80 shadow-none overflow-hidden">
                <div className="pt-6 px-6 pb-2">
                  <h3 className="text-base sm:text-lg font-semibold text-neutral-900 dark:text-white">
                    {t("newsletter.broadcast_title")}
                  </h3>
                  <p className="text-xs sm:text-sm text-neutral-500 mt-1">
                    {t("newsletter.broadcast_desc")}
                  </p>
                </div>
                <div className="space-y-5 p-6 pt-3">
                  {/* Row 1: Subject & Type */}
                  <div className="grid sm:grid-cols-3 gap-4">
                    <div className="sm:col-span-2 space-y-2">
                      <Label className="text-sm font-medium">{t("newsletter.broadcast_subject")}</Label>
                      <Input
                        value={broadcastSubject}
                        onChange={(e) => setBroadcastSubject(e.target.value)}
                        placeholder={
                          language === "id"
                            ? "Contoh: Update Proyek Terbaru & Tips Teknologi"
                            : "e.g. Exciting New Projects & Tech Insights"
                        }
                        className="h-9 text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">{t("newsletter.broadcast_type")}</Label>
                      <Select
                        value={broadcastType}
                        onValueChange={(val) => setBroadcastType(val as CampaignType)}
                      >
                        <SelectTrigger className="h-9 text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {campaignTypeOptions.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value} className="text-sm">
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Row 2: Message Content (Plain Text) */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">{t("newsletter.broadcast_content")}</Label>
                    <Textarea
                      value={broadcastContent}
                      onChange={(e) => setBroadcastContent(e.target.value)}
                      placeholder={
                        language === "id"
                          ? "Tulis pesan broadcast di sini..."
                          : "Write your broadcast message here..."
                      }
                      rows={8}
                      className="text-sm leading-relaxed"
                    />
                  </div>

                  {/* Row 3: Action Button (Clean 2-Column Fields) */}
                  <div className="grid sm:grid-cols-2 gap-4 pt-1">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">
                        {t("newsletter.button_text")}{" "}
                        <span className="text-neutral-400 font-normal text-xs">
                          ({t("common.optional")})
                        </span>
                      </Label>
                      <Input
                        value={buttonText}
                        onChange={(e) => setButtonText(e.target.value)}
                        placeholder={t("newsletter.button_text_placeholder")}
                        className="h-9 text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">
                        {t("newsletter.button_url")}{" "}
                        <span className="text-neutral-400 font-normal text-xs">
                          ({t("common.optional")})
                        </span>
                      </Label>
                      <Input
                        type="url"
                        value={buttonUrl}
                        onChange={(e) => setButtonUrl(e.target.value)}
                        placeholder={t("newsletter.button_url_placeholder")}
                        className="h-9 text-sm font-mono"
                      />
                    </div>
                  </div>

                  {/* Action Row: Recipients Setting & Send Blast Button */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleOpenRecipientModal}
                      className="h-9 px-3.5 text-sm gap-2 font-medium cursor-pointer justify-between sm:justify-start"
                    >
                      <Users className="w-4 h-4 text-neutral-500" />
                      <span>
                        {t("newsletter.recipients_label")} ({effectiveSelectedEmails.length})
                      </span>
                    </Button>

                    <Button
                      size="sm"
                      onClick={() => setIsConfirmBlastOpen(true)}
                      disabled={
                        effectiveSelectedEmails.length === 0 ||
                        !broadcastSubject.trim() ||
                        !broadcastContent.trim() ||
                        isSendingBlast
                      }
                      className="gap-2 font-semibold h-9 px-5 text-sm cursor-pointer w-full sm:w-auto"
                    >
                      <Send className="w-4 h-4" />
                      {t("newsletter.send_blast_btn")}
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Pure Live Preview (6 cols) */}
            <div className="lg:col-span-6 lg:sticky lg:top-20 space-y-4">
              <div className="rounded-xl border border-neutral-200/60 bg-white/80 backdrop-blur-sm dark:border-white/10 dark:bg-neutral-900/80 overflow-hidden shadow-none">
                <div className="py-3 px-4 border-b border-neutral-200/60 dark:border-white/10 bg-neutral-50/50 dark:bg-neutral-900/50 flex items-center gap-2">
                  <Eye className="w-4 h-4 text-neutral-500" />
                  <span className="text-sm font-semibold text-neutral-900 dark:text-white">
                    {t("newsletter.live_preview")}
                  </span>
                </div>
                <div className="p-4 sm:p-5 bg-neutral-100/60 dark:bg-neutral-900/60 flex justify-center">
                  <div className="w-full max-w-[600px] flex justify-center">
                    <iframe
                      ref={broadcastIframeRef}
                      srcDoc={generatedEmailHtml}
                      onLoad={handleBroadcastIframeLoad}
                      title="Live Email Preview"
                      scrolling="no"
                      {...{ allowtransparency: "true" }}
                      style={{
                        height: `${broadcastIframeHeight}px`,
                        backgroundColor: "transparent",
                        colorScheme: "light",
                      }}
                      className="w-full border-0 bg-transparent block overflow-hidden transition-[height] duration-150"
                      sandbox="allow-same-origin"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: CAMPAIGN HISTORY */}
        {activeTab === "history" && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <DataTable
              columns={campaignColumns}
              data={campaigns}
              loading={isCampaignsLoading}
              onRowClick={(camp) => {
                setSelectedCampaign(camp);
                setIsCampaignModalOpen(true);
              }}
              searchPlaceholder={
                language === "id"
                  ? "Cari riwayat broadcast berdasarkan subjek..."
                  : "Search broadcast history..."
              }
              pageSize={10}
              filters={[
                {
                  key: "type",
                  label: t("newsletter.broadcast_type"),
                  options: campaignTypeOptions,
                },
              ]}
              actions={(camp) => (
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
                  <DropdownMenuContent align="end" className="w-44">
                    <DropdownMenuItem
                      onClick={() => {
                        setSelectedCampaign(camp);
                        setIsCampaignModalOpen(true);
                      }}
                      className="cursor-pointer"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      {t("messages.view_message") || (language === "id" ? "Lihat Pesan" : "View Message")}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        setSelectedCampaign(camp);
                        setIsRecipientsViewModalOpen(true);
                      }}
                      className="cursor-pointer"
                    >
                      <Users className="h-4 w-4 mr-2" />
                      {t("newsletter.view_recipients") || (language === "id" ? "Lihat Penerima" : "View Recipients")}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      variant="destructive"
                      onClick={() => setDeleteCampaignItem(camp)}
                      className="cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      {t("newsletter.delete_campaign") || (language === "id" ? "Hapus Broadcast" : "Delete Campaign")}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            />
          </div>
        )}
      </div>

      {/* Recipient Configuration Modal */}
      <Dialog open={isRecipientModalOpen} onOpenChange={setIsRecipientModalOpen}>
        <DialogContent className="sm:max-w-lg max-h-[85vh] p-0 flex flex-col gap-0 overflow-hidden">
          <DialogHeader className="p-5 sm:p-6 pr-14 sm:pr-16 pb-4 border-b border-neutral-200/80 dark:border-white/10 shrink-0 bg-white dark:bg-neutral-900 sticky top-0 z-10 space-y-1">
            <DialogTitle className="text-base font-semibold flex items-center gap-2">
              <Users className="w-4 h-4" />
              {t("newsletter.recipients_modal_title")}
            </DialogTitle>
            <DialogDescription className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              {t("newsletter.recipients_modal_desc")}
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 max-h-[calc(85vh-130px)] scrollbar-custom flex flex-col min-h-0">
            {/* Add Custom Email Bar */}
            <div className="flex items-center gap-2">
              <Input
                type="email"
                placeholder={t("newsletter.add_recipient_placeholder")}
                value={newRecipientInput}
                onChange={(e) => setNewRecipientInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddDraftCustomRecipient();
                  }
                }}
                className="h-9 text-xs sm:text-sm flex-1"
              />
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={handleAddDraftCustomRecipient}
                className="h-9 text-xs px-3.5 gap-1.5 shrink-0 cursor-pointer font-medium bg-neutral-100 hover:bg-neutral-200 text-neutral-900 dark:bg-white/10 dark:hover:bg-white/20 dark:text-neutral-100 border-none"
              >
                <Plus className="w-3.5 h-3.5" />
                {t("newsletter.add_recipient_btn")}
              </Button>
            </div>

            {/* Search Input Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400 pointer-events-none" />
              <Input
                placeholder={t("newsletter.search_recipients")}
                value={recipientSearch}
                onChange={(e) => setRecipientSearch(e.target.value)}
                className="h-9 pl-9 text-xs sm:text-sm w-full"
              />
            </div>

            {/* Counter and Select All Bar */}
            <div className="flex items-center justify-between px-0.5 text-xs text-neutral-500">
              <span className="font-medium">
                {t("newsletter.selected_recipients_count", {
                  count: String(draftSelectedEmails.length),
                  total: String(allDraftRecipientOptions.length),
                })}
              </span>
              <label className="flex items-center gap-2 cursor-pointer select-none font-medium text-neutral-700 dark:text-neutral-300">
                <span>{language === "id" ? "Pilih Semua" : "Select All"}</span>
                <input
                  type="checkbox"
                  checked={
                    allDraftRecipientOptions.length > 0 &&
                    draftSelectedEmails.length === allDraftRecipientOptions.length
                  }
                  onChange={(e) => {
                    if (e.target.checked) {
                      handleSelectAllDraftRecipients();
                    } else {
                      handleDeselectAllDraftRecipients();
                    }
                  }}
                  className="h-4 w-4 rounded border-neutral-300 dark:border-white/20 text-neutral-900 accent-neutral-900 dark:accent-white cursor-pointer"
                />
              </label>
            </div>

            {/* Clean Single Container Recipient List */}
            <div className="flex-1 overflow-y-auto max-h-[300px] rounded-lg border border-neutral-200/80 dark:border-white/10 divide-y divide-neutral-100 dark:divide-white/5 bg-white dark:bg-neutral-900/40 scrollbar-custom">
              {filteredDraftRecipientOptions.length === 0 ? (
                <div className="py-10 text-center text-xs text-neutral-400">
                  {t("newsletter.no_recipients_found")}
                </div>
              ) : (
                filteredDraftRecipientOptions.map((opt) => {
                  const isChecked = draftSelectedEmails.includes(opt.email);
                  return (
                    <div
                      key={opt.email}
                      onClick={() => toggleDraftRecipient(opt.email)}
                      className={cn(
                        "flex items-center justify-between px-3.5 py-2.5 text-xs sm:text-sm transition-colors cursor-pointer select-none",
                        isChecked
                          ? "bg-neutral-50/80 dark:bg-white/4"
                          : "hover:bg-neutral-50/50 dark:hover:bg-white/2"
                      )}
                    >
                      {/* Left: Checkbox + Email */}
                      <div className="flex items-center gap-3 min-w-0 pr-3">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}} // Handled by parent div onClick
                          className="h-4 w-4 rounded border-neutral-300 dark:border-white/20 text-neutral-900 accent-neutral-900 dark:accent-white cursor-pointer pointer-events-none shrink-0"
                        />
                        <span
                          className={cn(
                            "truncate font-medium",
                            isChecked
                              ? "text-neutral-900 dark:text-neutral-100"
                              : "text-neutral-500 dark:text-neutral-400"
                          )}
                        >
                          {opt.email}
                        </span>
                      </div>

                      {/* Right: Custom Non-Subscriber Badge & Delete Button */}
                      {opt.type === "custom" && (
                        <div
                          className="flex items-center gap-1.5 shrink-0"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Badge
                            variant="secondary"
                            className="rounded-full text-[11px] font-normal px-2 py-0 h-5 bg-neutral-100 dark:bg-white/10 text-neutral-600 dark:text-neutral-300 border-none"
                          >
                            {t("newsletter.recipient_custom")}
                          </Badge>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveDraftCustomRecipient(opt.email)}
                            className="h-6 w-6 text-neutral-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-md cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <DialogFooter className="p-4 px-5 sm:px-6 border-t border-neutral-200/80 dark:border-white/10 bg-white dark:bg-neutral-900 shrink-0 flex items-center justify-end gap-2 sticky bottom-0 z-10">
            <Button
              type="button"
              size="sm"
              onClick={handleSaveRecipientConfig}
              disabled={!isRecipientConfigDirty}
              className="cursor-pointer font-medium text-xs px-5 h-9 gap-1.5 bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-white dark:hover:bg-neutral-200 dark:text-neutral-900 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Save className="w-3.5 h-3.5" />
              {t("common.save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Blast Dialog */}
      <Dialog open={isConfirmBlastOpen} onOpenChange={setIsConfirmBlastOpen}>
        <DialogContent className="sm:max-w-md max-h-[85vh] p-0 flex flex-col gap-0 overflow-hidden">
          <DialogHeader className="p-5 sm:p-6 pr-14 sm:pr-16 pb-4 border-b border-neutral-200/80 dark:border-white/10 shrink-0 bg-white dark:bg-neutral-900 sticky top-0 z-10">
            <DialogTitle className="text-base font-semibold">
              {language === "id" ? "Konfirmasi Kirim Broadcast" : "Confirm Newsletter Blast"}
            </DialogTitle>
            <DialogDescription className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              {t("newsletter.send_blast_confirm", { count: String(effectiveSelectedEmails.length) })}
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 max-h-[calc(85vh-130px)] scrollbar-custom">
            <div className="text-xs text-neutral-700 dark:text-neutral-300 bg-neutral-50 dark:bg-neutral-900/60 p-3.5 rounded-lg border border-neutral-200/80 dark:border-white/10 space-y-1.5">
              <p><strong>Subject:</strong> {broadcastSubject}</p>
              <p><strong>Type:</strong> <span>{t(`newsletter.type_${broadcastType}`) || broadcastType}</span></p>
              <p><strong>Recipients:</strong> {effectiveSelectedEmails.length} selected recipient(s)</p>
              {buttonText && buttonUrl && (
                <p><strong>Action Button:</strong> {buttonText} ({buttonUrl})</p>
              )}
            </div>
          </div>

          <DialogFooter className="p-4 px-5 sm:px-6 border-t border-neutral-200/80 dark:border-white/10 bg-white dark:bg-neutral-900 shrink-0 flex items-center justify-end gap-2 sticky bottom-0 z-10">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsConfirmBlastOpen(false)}
              disabled={isSendingBlast}
              className="h-9 text-xs font-medium cursor-pointer"
            >
              {t("common.cancel")}
            </Button>
            <Button
              size="sm"
              onClick={handleSendBlast}
              disabled={isSendingBlast}
              className="h-9 text-xs gap-1.5 font-medium bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-white dark:hover:bg-neutral-200 dark:text-neutral-900 cursor-pointer"
            >
              {isSendingBlast ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  {t("newsletter.sending_broadcast")}
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  {language === "id" ? "Kirim Sekarang" : "Confirm & Send Blast"}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Campaign Message Detail Modal */}
      <Dialog open={isCampaignModalOpen} onOpenChange={setIsCampaignModalOpen}>
        <DialogContent className="sm:max-w-[648px] max-h-[85vh] p-0 flex flex-col gap-0 overflow-hidden">
          {selectedCampaign && (
            <>
              <DialogHeader className="p-5 sm:p-6 pr-14 sm:pr-16 pb-4 border-b border-neutral-200/80 dark:border-white/10 shrink-0 bg-white dark:bg-neutral-900 sticky top-0 z-10 space-y-1">
                <div className="flex items-center gap-2 flex-wrap mb-0.5">
                  <Badge
                    variant="secondary"
                    className="rounded-full text-xs font-medium bg-neutral-100 hover:bg-neutral-200 text-neutral-900 dark:bg-white/10 dark:hover:bg-white/20 dark:text-neutral-100 border-none"
                  >
                    {t(`newsletter.type_${selectedCampaign.type}`) || selectedCampaign.type}
                  </Badge>
                  <span className="text-xs text-neutral-400">
                    {formatDateTime(selectedCampaign.sent_at || selectedCampaign.created_at)}
                  </span>
                </div>
                <DialogTitle className="text-base sm:text-lg font-semibold truncate">
                  {selectedCampaign.subject}
                </DialogTitle>
                <DialogDescription className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                  {t("newsletter.sent_to_count", { count: String(selectedCampaign.sent_count) })}
                </DialogDescription>
              </DialogHeader>

              {/* Direct email card display without outer container */}
              <div className="flex-1 overflow-y-auto px-4 sm:px-6 max-h-[calc(85vh-130px)] scrollbar-custom flex flex-col items-center">
                <div className="w-full max-w-[600px] py-6 sm:py-7">
                  <iframe
                    ref={modalIframeRef}
                    srcDoc={viewingCampaignHtml}
                    onLoad={handleModalIframeLoad}
                    title="Sent Broadcast Email Preview"
                    scrolling="no"
                    {...{ allowtransparency: "true" }}
                    style={{
                      height: `${modalIframeHeight}px`,
                      backgroundColor: "transparent",
                      colorScheme: "light",
                    }}
                    className="w-full border-0 bg-transparent block overflow-hidden transition-[height] duration-150"
                    sandbox="allow-same-origin"
                  />
                </div>
              </div>

              <DialogFooter className="p-4 px-5 sm:px-6 border-t border-neutral-200/80 dark:border-white/10 bg-white dark:bg-neutral-900 shrink-0 flex items-center justify-end gap-2 sticky bottom-0 z-10">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsCampaignModalOpen(false)}
                  className="cursor-pointer text-xs px-5 h-9"
                >
                  {t("common.close")}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Campaign Recipients Detail Modal */}
      <Dialog
        open={isRecipientsViewModalOpen}
        onOpenChange={(open) => {
          setIsRecipientsViewModalOpen(open);
          if (!open) setRecipientSearch("");
        }}
      >
        <DialogContent className="sm:max-w-lg max-h-[85vh] p-0 flex flex-col gap-0 overflow-hidden">
          {selectedCampaign && (
            <>
              <DialogHeader className="p-5 sm:p-6 pr-14 sm:pr-16 pb-4 border-b border-neutral-200/80 dark:border-white/10 shrink-0 bg-white dark:bg-neutral-900 sticky top-0 z-10 space-y-1">
                <div className="flex items-center gap-2 flex-wrap mb-0.5">
                  <Badge
                    variant="secondary"
                    className="rounded-full text-xs font-medium bg-neutral-100 hover:bg-neutral-200 text-neutral-900 dark:bg-white/10 dark:hover:bg-white/20 dark:text-neutral-100 border-none"
                  >
                    {t(`newsletter.type_${selectedCampaign.type}`) || selectedCampaign.type}
                  </Badge>
                  <span className="text-xs text-neutral-400">
                    {formatDateTime(selectedCampaign.sent_at || selectedCampaign.created_at)}
                  </span>
                </div>
                <DialogTitle className="text-base sm:text-lg font-semibold truncate">
                  {selectedCampaign.subject}
                </DialogTitle>
                <DialogDescription className="text-xs text-neutral-500 mt-0.5">
                  {selectedCampaign.sent_count} {selectedCampaign.sent_count === 1 ? "subscriber" : "subscribers"}
                </DialogDescription>
              </DialogHeader>

              <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-3 max-h-[calc(85vh-130px)] scrollbar-custom flex flex-col min-h-0">
                {/* Search Bar */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400 pointer-events-none" />
                  <Input
                    placeholder={
                      language === "id"
                        ? "Cari email penerima..."
                        : "Search recipient email..."
                    }
                    value={recipientSearch}
                    onChange={(e) => setRecipientSearch(e.target.value)}
                    className="h-9 pl-9 text-xs sm:text-sm w-full"
                  />
                </div>

                {/* Recipient Email List */}
                {selectedCampaign.recipients && selectedCampaign.recipients.length > 0 ? (
                  <div className="flex-1 overflow-y-auto max-h-[300px] rounded-lg border border-neutral-200/80 dark:border-white/10 divide-y divide-neutral-100 dark:divide-white/5 bg-white dark:bg-neutral-900/40 scrollbar-custom">
                    {selectedCampaign.recipients
                      .filter((email) =>
                        !recipientSearch.trim() ||
                        email
                          .toLowerCase()
                          .includes(recipientSearch.toLowerCase().trim())
                      )
                      .map((email) => (
                        <div
                          key={email}
                          className="flex items-center justify-between px-3.5 py-2.5 text-xs sm:text-sm hover:bg-neutral-50/50 dark:hover:bg-white/2 transition-colors"
                        >
                          <span className="font-medium text-neutral-900 dark:text-neutral-100 truncate pr-3">
                            {email}
                          </span>
                          <Badge
                            variant="secondary"
                            className="rounded-full text-[11px] font-medium px-2.5 py-0.5 bg-neutral-100 dark:bg-white/10 text-neutral-800 dark:text-neutral-200 border-none shrink-0"
                          >
                            Delivered
                          </Badge>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="py-8 text-center text-xs text-neutral-400 bg-neutral-50/50 dark:bg-neutral-900/40 rounded-lg border border-dashed border-neutral-200 dark:border-white/10 px-4">
                    {language === "id"
                      ? "Rincian list email tersimpan untuk broadcast yang dikirim setelah pembaruan database."
                      : "Detailed email list is recorded for broadcasts dispatched after database update."}
                  </div>
                )}
              </div>

              <DialogFooter className="p-4 px-5 sm:px-6 border-t border-neutral-200/80 dark:border-white/10 bg-white dark:bg-neutral-900 shrink-0 flex items-center justify-end gap-2 sticky bottom-0 z-10">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setIsRecipientsViewModalOpen(false);
                    setRecipientSearch("");
                  }}
                  className="cursor-pointer text-xs px-5 h-9"
                >
                  {t("common.close")}
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

      {/* Delete Campaign History Dialog */}
      <DeleteDialog
        open={!!deleteCampaignItem}
        onOpenChange={(open) => !open && setDeleteCampaignItem(null)}
        onConfirm={handleDeleteCampaign}
        title={t("common.delete_title")}
        description={
          deleteCampaignItem
            ? t("newsletter.delete_campaign_warning", { subject: deleteCampaignItem.subject })
            : undefined
        }
        loading={isDeleting}
      />
    </>
  );
}
