"use client";

import { useState } from "react";
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

export default function MessagesPage() {
  const { t, language } = useLanguage();
  const queryClient = useQueryClient();

  // Selected message for Detail Modal
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

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
            className={`text-sm truncate cursor-pointer hover:underline ${
              !msg.is_read
                ? "font-bold text-neutral-900 dark:text-white"
                : "font-medium text-neutral-800 dark:text-neutral-200"
            }`}
            onClick={() => handleOpenDetail(msg)}
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
        <div
          className="flex flex-col max-w-[320px] cursor-pointer"
          onClick={() => handleOpenDetail(msg)}
        >
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

      {/* Message Detail Modal */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="sm:max-w-xl max-h-[85vh] overflow-y-auto scrollbar-custom">
          {selectedMessage && (
            <>
              <DialogHeader className="space-y-1.5 pb-2 pr-10 sm:pr-12">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  {renderStatusBadge(
                    selectedMessage.status,
                    selectedMessage.is_read
                  )}
                  <span className="text-xs text-neutral-500 dark:text-neutral-400">
                    {formatDateTime(selectedMessage.created_at)}
                  </span>
                </div>
                <DialogTitle className="text-base font-semibold text-neutral-900 dark:text-white pt-1">
                  {selectedMessage.subject}
                </DialogTitle>
                <DialogDescription className="text-xs text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5 pt-0.5">
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
              </DialogHeader>

              <div className="space-y-4 py-2">
                <div>
                  <Label className="text-xs font-medium text-neutral-700 dark:text-neutral-300 block mb-1.5">
                    {t("messages.original_message")}
                  </Label>
                  <div className="bg-neutral-50 dark:bg-neutral-900/60 p-3.5 rounded-lg border border-neutral-200/80 dark:border-white/10 text-xs sm:text-sm text-neutral-800 dark:text-neutral-200 whitespace-pre-wrap leading-relaxed max-h-[220px] overflow-y-auto scrollbar-custom">
                    {selectedMessage.message}
                  </div>
                </div>

                {selectedMessage.reply_content && (
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <Label className="text-xs font-medium text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
                        <Reply className="h-3.5 w-3.5" />
                        {t("messages.reply_history")}
                      </Label>
                      {selectedMessage.replied_at && (
                        <span className="text-xs text-neutral-500 dark:text-neutral-400">
                          {formatDateTime(selectedMessage.replied_at)}
                        </span>
                      )}
                    </div>
                    <div className="bg-neutral-50 dark:bg-neutral-900/60 p-3.5 rounded-lg border border-neutral-200/80 dark:border-white/10 text-xs sm:text-sm text-neutral-800 dark:text-neutral-200 whitespace-pre-wrap leading-relaxed max-h-[220px] overflow-y-auto scrollbar-custom">
                      {selectedMessage.reply_content}
                    </div>
                  </div>
                )}
              </div>

              <DialogFooter className="flex items-center justify-end gap-2.5 pt-2">
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

      {/* Reply Modal */}
      <Dialog open={isReplyOpen} onOpenChange={setIsReplyOpen}>
        <DialogContent className="sm:max-w-xl max-h-[85vh] overflow-y-auto scrollbar-custom">
          {replyMessage && (
            <>
              <DialogHeader className="pr-10 sm:pr-12">
                <DialogTitle className="flex items-center gap-2 text-base font-semibold">
                  <Reply className="h-4 w-4 text-neutral-500" />
                  {t("messages.reply_dialog_title", {
                    name: replyMessage.name,
                  })}
                </DialogTitle>
                <DialogDescription className="text-xs text-neutral-500 dark:text-neutral-400">
                  {t("messages.send_reply")} ({replyMessage.email})
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-2">
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

                <div className="space-y-1.5">
                  <Label htmlFor="replyBody" className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                    {t("messages.reply_content")}
                  </Label>
                  <Textarea
                    id="replyBody"
                    value={replyBody}
                    onChange={(e) => setReplyBody(e.target.value)}
                    placeholder={t("messages.reply_content_placeholder")}
                    rows={6}
                    className="text-xs bg-white dark:bg-neutral-900 border-neutral-200/80 dark:border-white/10"
                  />
                </div>
              </div>

              <DialogFooter className="flex items-center justify-end gap-2.5 pt-2">
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
