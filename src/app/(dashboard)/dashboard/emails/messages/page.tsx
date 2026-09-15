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
  DropdownMenuSeparator,
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
        nextRead ? t("messages.mark_as_read") : t("messages.mark_as_unread")
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
    } catch (err: unknown) {
      toast.error(t("messages.reply_sent_failed"), {
        description: err instanceof Error ? err.message : "Failed to send email.",
      });
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

  // Solid B&W status badges matching other pages, unread has pulse
  const renderStatusBadge = (status: MessageStatus, is_read: boolean) => {
    if (status === "replied") {
      return (
        <Badge variant="default" className="font-medium">
          {t("messages.status_replied")}
        </Badge>
      );
    }
    if (!is_read) {
      return (
        <Badge variant="default" className="font-medium animate-pulse">
          {t("messages.status_unread")}
        </Badge>
      );
    }
    return (
      <Badge variant="secondary" className="font-medium">
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
      render: (msg) => {
        const date = new Date(msg.created_at);
        return (
          <span className="text-xs text-neutral-500 dark:text-neutral-400 whitespace-nowrap">
            {date.toLocaleDateString(language === "id" ? "id-ID" : "en-US", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}{" "}
            &bull;{" "}
            {date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </span>
        );
      },
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
                className="h-8 w-8 text-neutral-500 hover:text-neutral-900 dark:hover:text-white data-[state=open]:bg-neutral-100 dark:data-[state=open]:bg-white/10"
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
              <DropdownMenuSeparator />
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
        <DialogContent className="sm:max-w-xl max-h-[85vh] overflow-y-auto">
          {selectedMessage && (
            <>
              <DialogHeader className="space-y-2 border-b border-neutral-200 dark:border-white/10 pb-4 pr-10">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  {renderStatusBadge(
                    selectedMessage.status,
                    selectedMessage.is_read
                  )}
                  <span className="text-xs text-neutral-500 dark:text-neutral-400">
                    {new Date(selectedMessage.created_at).toLocaleString(
                      language === "id" ? "id-ID" : "en-US",
                      { dateStyle: "full", timeStyle: "short" }
                    )}
                  </span>
                </div>
                <DialogTitle className="text-lg font-semibold text-neutral-900 dark:text-white pt-1">
                  {selectedMessage.subject}
                </DialogTitle>
                <DialogDescription className="text-xs text-neutral-500 flex items-center gap-2 pt-1">
                  <User className="h-3.5 w-3.5 shrink-0" />
                  <span className="font-semibold text-neutral-900 dark:text-white">
                    {selectedMessage.name}
                  </span>
                  &bull;
                  <a
                    href={`mailto:${selectedMessage.email}`}
                    className="text-sky-500 hover:underline"
                  >
                    {selectedMessage.email}
                  </a>
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div>
                  <Label className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider block mb-2">
                    {t("messages.original_message")}
                  </Label>
                  <div className="bg-neutral-50 dark:bg-neutral-900/60 p-4 rounded-xl border border-neutral-200/60 dark:border-white/10 text-sm text-neutral-800 dark:text-neutral-200 whitespace-pre-wrap leading-relaxed">
                    {selectedMessage.message}
                  </div>
                </div>

                {selectedMessage.reply_content && (
                  <div className="pt-2">
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Reply className="h-3.5 w-3.5" />
                        {t("messages.reply_history")}
                      </Label>
                      {selectedMessage.replied_at && (
                        <span className="text-[11px] text-neutral-400">
                          {new Date(selectedMessage.replied_at).toLocaleString(
                            language === "id" ? "id-ID" : "en-US",
                            { dateStyle: "medium", timeStyle: "short" }
                          )}
                        </span>
                      )}
                    </div>
                    <div className="bg-neutral-50 dark:bg-neutral-900/60 p-4 rounded-xl border border-neutral-200/60 dark:border-white/10 text-sm text-neutral-800 dark:text-neutral-200 whitespace-pre-wrap leading-relaxed">
                      {selectedMessage.reply_content}
                    </div>
                  </div>
                )}
              </div>

              <DialogFooter className="gap-3 sm:gap-2 border-t border-neutral-200 dark:border-white/10 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsDetailOpen(false)}
                >
                  {t("common.close")}
                </Button>
                <Button
                  onClick={() => handleOpenReply(selectedMessage)}
                  className="bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
                >
                  <Reply className="h-4 w-4 mr-2" />
                  {t("messages.reply_message")}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Reply Modal */}
      <Dialog open={isReplyOpen} onOpenChange={setIsReplyOpen}>
        <DialogContent className="sm:max-w-xl">
          {replyMessage && (
            <>
              <DialogHeader className="pr-10">
                <DialogTitle className="flex items-center gap-2">
                  <Reply className="h-5 w-5 text-neutral-900 dark:text-white" />
                  {t("messages.reply_dialog_title", {
                    name: replyMessage.name,
                  })}
                </DialogTitle>
                <DialogDescription>
                  {t("messages.send_reply")} ({replyMessage.email})
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-2">
                <div className="space-y-1.5">
                  <Label htmlFor="replySubject">{t("messages.reply_subject")}</Label>
                  <Input
                    id="replySubject"
                    value={replySubject}
                    onChange={(e) => setReplySubject(e.target.value)}
                    placeholder="Re: Subject"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="replyBody">{t("messages.reply_content")}</Label>
                  <Textarea
                    id="replyBody"
                    value={replyBody}
                    onChange={(e) => setReplyBody(e.target.value)}
                    placeholder={t("messages.reply_content_placeholder")}
                    rows={6}
                  />
                </div>
              </div>

              <DialogFooter className="gap-3 sm:gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsReplyOpen(false)}
                  disabled={isSendingReply}
                >
                  {t("common.cancel")}
                </Button>
                <Button
                  type="button"
                  onClick={handleSendReply}
                  disabled={isSendingReply}
                  className="bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
                >
                  {isSendingReply ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {t("messages.sending_reply")}
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
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
