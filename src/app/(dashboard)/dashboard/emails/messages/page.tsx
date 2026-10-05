"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Inbox,
  Mail,
  MailOpen,
  Reply,
  Trash2,
  MoreHorizontal,
  User,
  Send,
  Loader2,
  Mails,
  Eye,
  Calendar,
  MessageSquare,
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
import { MessageService } from "@/src/services/message.service";
import type { ContactMessage, MessageStatus } from "@/src/types/database";
import { useLanguage } from "@/context/language-context";
import { renderContactNotificationEmail } from "@/src/lib/email-templates/contact-notification-email";
import { renderContactReplyEmail } from "@/src/lib/email-templates/contact-reply-email";

export default function MessagesPage() {
  const { t, language } = useLanguage();
  const queryClient = useQueryClient();

  // Selected message for Detail Modal
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [detailTab, setDetailTab] = useState<"message" | "reply">("message");

  // Selected message for Reply Modal
  const [replyMessage, setReplyMessage] = useState<ContactMessage | null>(null);
  const [replySubject, setReplySubject] = useState("");
  const [replyBody, setReplyBody] = useState("");
  const [isReplyOpen, setIsReplyOpen] = useState(false);
  const [isSendingReply, setIsSendingReply] = useState(false);

  // Delete State
  const [deleteItem, setDeleteItem] = useState<ContactMessage | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Queries
  const {
    data: messages = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["contact-messages"],
    queryFn: MessageService.getAll,
    meta: { resource: "sidebar.Messages" },
  });

  // Calculate statistics counts
  const totalCount = messages.length;
  const unreadCount = messages.filter((m) => !m.is_read).length;
  const readCount = messages.filter((m) => m.is_read && m.status !== "replied").length;
  const repliedCount = messages.filter((m) => m.status === "replied").length;

  const handleOpenDetail = async (msg: ContactMessage) => {
    setSelectedMessage(msg);
    setDetailTab("message");
    setIsDetailOpen(true);

    // Automatically mark as read when viewed if unread
    if (!msg.is_read) {
      try {
        await MessageService.toggleRead(msg.id, true);
        queryClient.invalidateQueries({ queryKey: ["contact-messages"] });
      } catch (err) {
        console.error("Error auto-marking message as read:", err);
      }
    }
  };

  const handleToggleReadStatus = async (msg: ContactMessage) => {
    try {
      const nextRead = !msg.is_read;
      await MessageService.toggleRead(msg.id, nextRead);
      toast.success(
        nextRead ? t("messages.mark_as_read_success") : t("messages.mark_as_unread_success")
      );
      queryClient.invalidateQueries({ queryKey: ["contact-messages"] });
    } catch {
      toast.error(t("common.failed"));
    }
  };

  const handleOpenReply = (msg: ContactMessage) => {
    setReplyMessage(msg);
    setReplySubject(
      msg.subject.startsWith("Re:") ? msg.subject : `Re: ${msg.subject}`
    );
    setReplyBody("");
    setIsReplyOpen(true);
    setIsDetailOpen(false);
  };

  const handleSendReply = async () => {
    if (!replyMessage || !replyBody.trim() || !replySubject.trim()) {
      toast.error(t("common.required_field"));
      return;
    }

    setIsSendingReply(true);
    try {
      await MessageService.reply({
        messageId: replyMessage.id,
        replySubject: replySubject.trim(),
        replyMessage: replyBody.trim(),
      });
      toast.success(t("messages.reply_sent_success"));
      setIsReplyOpen(false);
      queryClient.invalidateQueries({ queryKey: ["contact-messages"] });
    } catch {
      toast.error(t("messages.reply_sent_failed"));
    } finally {
      setIsSendingReply(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteItem) return;
    setIsDeleting(true);
    try {
      await MessageService.delete(deleteItem.id);
      toast.success(t("messages.deleted_success"));
      queryClient.invalidateQueries({ queryKey: ["contact-messages"] });
      if (selectedMessage?.id === deleteItem.id) {
        setIsDetailOpen(false);
      }
    } catch {
      toast.error(t("messages.deleted_failed"));
    } finally {
      setIsDeleting(false);
      setDeleteItem(null);
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

  // Helper to inject iframe scrollbar & transparent styles
  const injectIframeStyle = (rawHtml: string) => {
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

    if (rawHtml.includes("</head>")) {
      return rawHtml.replace("</head>", `${iframeScrollbarStyle}</head>`);
    } else if (rawHtml.includes("<body")) {
      return rawHtml.replace("<body", `${iframeScrollbarStyle}<body`);
    }
    return `${iframeScrollbarStyle}${rawHtml}`;
  };

  // Generated email HTML for selected message preview in Detail Modal
  const viewingDetailHtml = useMemo(() => {
    if (!selectedMessage) return "";

    if (detailTab === "reply" && selectedMessage.reply_content) {
      const raw = renderContactReplyEmail({
        recipientName: selectedMessage.name,
        subject: selectedMessage.subject.startsWith("Re:")
          ? selectedMessage.subject
          : `Re: ${selectedMessage.subject}`,
        replyMessage: selectedMessage.reply_content,
        originalMessage: selectedMessage.message,
        originalSubject: selectedMessage.subject,
      });
      return injectIframeStyle(raw);
    }

    const raw = renderContactNotificationEmail({
      name: selectedMessage.name,
      email: selectedMessage.email,
      subject: selectedMessage.subject,
      message: selectedMessage.message,
      receivedAt: formatDateTime(selectedMessage.created_at),
    });
    return injectIframeStyle(raw);
  }, [selectedMessage, detailTab, language]);

  // Generated email HTML for live preview in Reply Modal
  const generatedReplyHtml = useMemo(() => {
    if (!replyMessage) return "";
    const placeholderText =
      language === "id"
        ? "Ketik balasan Anda di kolom sebelah kiri..."
        : "Type your reply message on the left...";

    const raw = renderContactReplyEmail({
      recipientName: replyMessage.name,
      subject:
        replySubject ||
        (replyMessage.subject.startsWith("Re:")
          ? replyMessage.subject
          : `Re: ${replyMessage.subject}`),
      replyMessage: replyBody || placeholderText,
      originalMessage: replyMessage.message,
      originalSubject: replyMessage.subject,
    });
    return injectIframeStyle(raw);
  }, [replyMessage, replySubject, replyBody, language]);

  // Dynamic iframe height measurement for Detail Modal
  const detailIframeRef = useRef<HTMLIFrameElement>(null);
  const [detailIframeHeight, setDetailIframeHeight] = useState(500);

  const handleDetailIframeLoad = () => {
    if (detailIframeRef.current?.contentWindow) {
      const win = detailIframeRef.current.contentWindow;
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
          setDetailIframeHeight(height + 6);
        }
      }
    }
  };

  useEffect(() => {
    handleDetailIframeLoad();
    const t1 = setTimeout(handleDetailIframeLoad, 50);
    const t2 = setTimeout(handleDetailIframeLoad, 150);
    const t3 = setTimeout(handleDetailIframeLoad, 350);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [viewingDetailHtml, isDetailOpen, detailTab]);

  // Dynamic iframe height measurement for Reply Live Preview
  const replyIframeRef = useRef<HTMLIFrameElement>(null);
  const [replyIframeHeight, setReplyIframeHeight] = useState(500);

  const handleReplyIframeLoad = () => {
    if (replyIframeRef.current?.contentWindow) {
      const win = replyIframeRef.current.contentWindow;
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
          setReplyIframeHeight(height + 6);
        }
      }
    }
  };

  useEffect(() => {
    handleReplyIframeLoad();
    const t1 = setTimeout(handleReplyIframeLoad, 50);
    const t2 = setTimeout(handleReplyIframeLoad, 150);
    const t3 = setTimeout(handleReplyIframeLoad, 350);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [generatedReplyHtml, isReplyOpen]);

  // Status badges matching standard dashboard style
  const renderStatusBadge = (status: MessageStatus, is_read: boolean) => {
    if (status === "replied") {
      return (
        <Badge variant="secondary" className="rounded-full text-xs font-medium bg-neutral-100 hover:bg-neutral-200 text-neutral-900 dark:bg-white/10 dark:hover:bg-white/20 dark:text-neutral-100 border-none">
          {t("messages.status_replied")}
        </Badge>
      );
    }
    if (!is_read) {
      return (
        <Badge variant="default" className="rounded-full text-xs font-medium bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-white dark:hover:bg-neutral-200 dark:text-neutral-900 animate-pulse">
          {t("messages.status_unread")}
        </Badge>
      );
    }
    return (
      <Badge variant="secondary" className="rounded-full text-xs font-medium bg-neutral-100 hover:bg-neutral-200 text-neutral-600 dark:bg-white/10 dark:hover:bg-white/20 dark:text-neutral-400 border-none">
        {t("messages.status_read")}
      </Badge>
    );
  };

  // Columns: Sender -> Subject -> Received -> Status (next to Actions)
  const columns: Column<ContactMessage>[] = [
    {
      key: "name",
      header: t("messages.sender"),
      render: (msg) => (
        <div className="flex flex-col min-w-[160px]">
          <span
            className={`text-sm truncate ${
              !msg.is_read
                ? "font-bold text-neutral-900 dark:text-white"
                : "font-medium text-neutral-800 dark:text-neutral-200"
            }`}
          >
            {msg.name}
          </span>
          <span className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
            {msg.email}
          </span>
        </div>
      ),
    },
    {
      key: "subject",
      header: t("messages.subject"),
      render: (msg) => (
        <div className="flex flex-col max-w-[320px]">
          <span
            className={`text-sm truncate ${
              !msg.is_read
                ? "font-bold text-neutral-900 dark:text-white"
                : "text-neutral-700 dark:text-neutral-300"
            }`}
          >
            {msg.subject}
          </span>
          <span className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
            {msg.message}
          </span>
        </div>
      ),
    },
    {
      key: "created_at",
      header: t("messages.received"),
      className: "w-44",
      render: (msg) => (
        <span className="text-xs text-neutral-500 dark:text-neutral-400 whitespace-nowrap">
          {formatDateTime(msg.created_at)}
        </span>
      ),
    },
    {
      key: "status",
      header: t("common.status"),
      className: "w-32",
      render: (msg) => renderStatusBadge(msg.status, msg.is_read),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("messages.title")}
        icon={Inbox}
        description={t("messages.description")}
        breadcrumbs={[
          { label: t("dashboard.title"), href: "/dashboard" },
          { label: t("sidebar.Emails"), href: "/dashboard/emails/messages" },
          { label: t("messages.title") },
        ]}
      />

      {/* Metric Statistics Cards with hover and animated numbers */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <OverviewStatCard
          title={t("messages.total_messages")}
          value={totalCount}
          icon={Mails}
          loading={isLoading}
        />
        <OverviewStatCard
          title={t("messages.status_unread")}
          value={unreadCount}
          icon={Mail}
          loading={isLoading}
        />
        <OverviewStatCard
          title={t("messages.status_read")}
          value={readCount}
          icon={MailOpen}
          loading={isLoading}
        />
        <OverviewStatCard
          title={t("messages.status_replied")}
          value={repliedCount}
          icon={Reply}
          loading={isLoading}
        />
      </div>

      <DataTable
        columns={columns}
        data={messages}
        loading={isLoading}
        error={isError}
        searchPlaceholder={t("messages.search_placeholder")}
        pageSize={10}
        onRowClick={(msg) => handleOpenDetail(msg)}
        filters={[
          {
            key: "status",
            label: t("common.status"),
            options: [
              { label: t("messages.status_unread"), value: "unread" },
              { label: t("messages.status_read"), value: "read" },
              { label: t("messages.status_replied"), value: "replied" },
            ],
          },
        ]}
        actions={(msg) => (
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
                onClick={() => handleOpenDetail(msg)}
                className="cursor-pointer"
              >
                <MailOpen className="h-4 w-4 mr-2" />
                {t("messages.view_message")}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleOpenReply(msg)}
                className="cursor-pointer"
              >
                <Reply className="h-4 w-4 mr-2" />
                {t("messages.reply_message")}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleToggleReadStatus(msg)}
                className="cursor-pointer"
              >
                {msg.is_read ? (
                  <>
                    <Mail className="h-4 w-4 mr-2" />
                    {t("messages.mark_as_unread")}
                  </>
                ) : (
                  <>
                    <MailOpen className="h-4 w-4 mr-2" />
                    {t("messages.mark_as_read")}
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem
                variant="destructive"
                onClick={() => setDeleteItem(msg)}
                className="cursor-pointer"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {t("messages.delete_message")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      />

      {/* Message Detail Modal (Rendered Email Preview) */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="sm:max-w-[648px] max-h-[85vh] p-0 flex flex-col gap-0 overflow-hidden">
          {selectedMessage && (
            <>
              <DialogHeader className="p-5 sm:p-6 pr-14 sm:pr-16 pb-4 border-b border-neutral-200/80 dark:border-white/10 shrink-0 bg-white dark:bg-neutral-900 sticky top-0 z-10 space-y-2">
                {/* Row 1: Status Badge & Date Time aligned horizontally */}
                <div className="flex items-center justify-between gap-2">
                  {renderStatusBadge(
                    selectedMessage.status,
                    selectedMessage.is_read
                  )}
                  <span className="text-xs text-neutral-500 dark:text-neutral-400">
                    {formatDateTime(
                      detailTab === "reply" && selectedMessage.replied_at
                        ? selectedMessage.replied_at
                        : selectedMessage.created_at
                    )}
                  </span>
                </div>

                {/* Row 2: Tab Switcher (Original Message vs Reply History) */}
                {selectedMessage.reply_content && (
                  <div className="pt-0.5">
                    <div className="inline-flex items-center p-0.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 border border-neutral-200/80 dark:border-white/10 text-xs">
                      <button
                        type="button"
                        onClick={() => setDetailTab("message")}
                        className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                          detailTab === "message"
                            ? "bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs"
                            : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
                        }`}
                      >
                        {t("messages.original_message")}
                      </button>
                      <button
                        type="button"
                        onClick={() => setDetailTab("reply")}
                        className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                          detailTab === "reply"
                            ? "bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs"
                            : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
                        }`}
                      >
                        {t("messages.reply_history")}
                      </button>
                    </div>
                  </div>
                )}

                {/* Row 3: Subject & Sender Info */}
                <div>
                  <DialogTitle className="text-base sm:text-lg font-semibold text-neutral-900 dark:text-white truncate">
                    {selectedMessage.subject}
                  </DialogTitle>
                  <DialogDescription className="text-xs text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5 pt-1">
                    <User className="h-3.5 w-3.5 shrink-0" />
                    <span className="font-medium text-neutral-900 dark:text-white">
                      {selectedMessage.name}
                    </span>
                    &bull;
                    <a
                      href={`mailto:${selectedMessage.email}`}
                      className="text-neutral-600 dark:text-neutral-300 hover:underline font-mono text-xs"
                    >
                      {selectedMessage.email}
                    </a>
                  </DialogDescription>
                </div>
              </DialogHeader>

              {/* Direct email card display without outer container */}
              <div className="flex-1 overflow-y-auto px-4 sm:px-6 max-h-[calc(85vh-130px)] scrollbar-custom flex flex-col items-center">
                <div className="w-full max-w-[600px] py-6 sm:py-7">
                  <iframe
                    ref={detailIframeRef}
                    srcDoc={viewingDetailHtml}
                    onLoad={handleDetailIframeLoad}
                    title="Message Email Preview"
                    scrolling="no"
                    {...{ allowtransparency: "true" }}
                    style={{
                      height: `${detailIframeHeight}px`,
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
                  variant="outline"
                  size="sm"
                  onClick={() => setIsDetailOpen(false)}
                  className="h-9 px-4 text-xs font-medium cursor-pointer"
                >
                  {t("common.close")}
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleOpenReply(selectedMessage)}
                  className="h-9 px-4 text-xs gap-1.5 font-medium bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200 cursor-pointer"
                >
                  <Reply className="h-3.5 w-3.5 mr-1" />
                  {t("messages.reply_message")}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Reply Modal (2-Column: Form on Left, Live Preview on Right) */}
      <Dialog open={isReplyOpen} onOpenChange={setIsReplyOpen}>
        <DialogContent className="sm:max-w-5xl lg:max-w-6xl max-h-[85vh] p-0 flex flex-col gap-0 overflow-hidden">
          {replyMessage && (
            <>
              <DialogHeader className="p-5 sm:p-6 pr-14 sm:pr-16 pb-4 border-b border-neutral-200/80 dark:border-white/10 shrink-0 bg-white dark:bg-neutral-900 sticky top-0 z-10">
                <DialogTitle className="flex items-center gap-2 text-base font-semibold">
                  <Reply className="h-4 w-4 text-neutral-500" />
                  {t("messages.reply_dialog_title", {
                    name: replyMessage.name,
                  })}
                </DialogTitle>
                <DialogDescription className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                  {t("messages.send_reply")} ({replyMessage.email})
                </DialogDescription>
              </DialogHeader>

              <div className="flex-1 overflow-y-auto p-5 sm:p-6 max-h-[calc(85vh-130px)] scrollbar-custom">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Left Column: Input Form */}
                  <div className="lg:col-span-6 flex flex-col space-y-4">
                    {/* Recipient info box */}
                    <div className="p-3 rounded-lg bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200/80 dark:border-white/10 text-xs space-y-1">
                      <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-300">
                        <span className="font-semibold text-neutral-900 dark:text-white">To:</span>
                        <span>{replyMessage.name} &lt;{replyMessage.email}&gt;</span>
                      </div>
                      <div className="flex items-center gap-2 text-neutral-500 dark:text-neutral-400 truncate">
                        <span className="font-semibold text-neutral-700 dark:text-neutral-300">Subject Original:</span>
                        <span className="truncate italic">{replyMessage.subject}</span>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="replySubject" className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                        {t("messages.reply_subject")}
                      </Label>
                      <Input
                        id="replySubject"
                        value={replySubject}
                        onChange={(e) => setReplySubject(e.target.value)}
                        placeholder="Re: Subject"
                        className="h-9 text-xs bg-white dark:bg-neutral-900 border-neutral-200/80 dark:border-white/10"
                      />
                    </div>

                    <div className="space-y-1.5 pb-1">
                      <Label htmlFor="replyBody" className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                        {t("messages.reply_content")}
                      </Label>
                      <Textarea
                        id="replyBody"
                        value={replyBody}
                        onChange={(e) => setReplyBody(e.target.value)}
                        placeholder={t("messages.reply_content_placeholder")}
                        rows={8}
                        className="text-xs bg-white dark:bg-neutral-900 border-neutral-200/80 dark:border-white/10 min-h-[170px] resize-y scrollbar-custom"
                      />
                    </div>
                  </div>

                  {/* Right Column: Pure Live Preview (Matches Broadcast Campaign) */}
                  <div className="lg:col-span-6">
                    <div className="rounded-xl border border-neutral-200/60 bg-white/80 backdrop-blur-sm dark:border-white/10 dark:bg-neutral-900/80 overflow-hidden shadow-none flex flex-col">
                      <div className="py-2.5 px-4 border-b border-neutral-200/60 dark:border-white/10 bg-neutral-50/50 dark:bg-neutral-900/50 flex items-center gap-2">
                        <Eye className="w-4 h-4 text-neutral-500" />
                        <span className="text-xs sm:text-sm font-semibold text-neutral-900 dark:text-white">
                          {t("newsletter.live_preview") || "Live Preview"}
                        </span>
                      </div>
                      <div className="p-4 sm:p-5 bg-neutral-100/60 dark:bg-neutral-900/60 flex justify-center">
                        <div className="w-full max-w-[600px] flex justify-center">
                          <iframe
                            ref={replyIframeRef}
                            srcDoc={generatedReplyHtml}
                            onLoad={handleReplyIframeLoad}
                            title="Live Email Preview"
                            scrolling="no"
                            {...{ allowtransparency: "true" }}
                            style={{
                              height: `${replyIframeHeight}px`,
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
              </div>

              <DialogFooter className="p-4 px-5 sm:px-6 border-t border-neutral-200/80 dark:border-white/10 bg-white dark:bg-neutral-900 shrink-0 flex items-center justify-end gap-2 sticky bottom-0 z-10">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsReplyOpen(false)}
                  disabled={isSendingReply}
                  className="h-9 px-4 text-xs font-medium cursor-pointer"
                >
                  {t("common.cancel")}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={handleSendReply}
                  disabled={isSendingReply}
                  className="h-9 px-4 text-xs gap-1.5 font-medium bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200 cursor-pointer"
                >
                  {isSendingReply ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      {t("messages.sending_reply")}
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      {t("messages.send_reply")}
                    </>
                  )}
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
        onConfirm={handleDelete}
        loading={isDeleting}
        title={t("messages.delete_message")}
        description={t("messages.delete_warning", {
          name: deleteItem?.name || "",
        })}
      />
    </div>
  );
}
