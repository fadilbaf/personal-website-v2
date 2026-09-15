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
  Clock,
  User,
  Send,
  Loader2,
  CheckCircle2,
  Search,
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

  const [statusFilter, setStatusFilter] = useState<string>("all");

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
  const { data: messages = [], isLoading } = useQuery({
    queryKey: ["contact-messages"],
    queryFn: MessageService.getAll,
    meta: { resource: "sidebar.Messages" },
  });

  // Calculate unread count
  const unreadCount = messages.filter((m) => !m.is_read).length;

  // Filtered messages
  const filteredMessages = messages.filter((msg) => {
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "unread" && !msg.is_read) ||
      (statusFilter === "read" && msg.is_read && msg.status !== "replied") ||
      (statusFilter === "replied" && msg.status === "replied");

    return matchesStatus;
  });

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

  const renderStatusBadge = (status: MessageStatus, is_read: boolean) => {
    if (status === "replied") {
      return (
        <Badge
          variant="outline"
          className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 font-medium"
        >
          <CheckCircle2 className="w-3 h-3 mr-1" />
          {t("messages.status_replied")}
        </Badge>
      );
    }
    if (!is_read) {
      return (
        <Badge
          variant="outline"
          className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 font-medium animate-pulse"
        >
          <Mail className="w-3 h-3 mr-1" />
          {t("messages.status_unread")}
        </Badge>
      );
    }
    return (
      <Badge
        variant="outline"
        className="bg-neutral-500/10 text-neutral-600 dark:text-neutral-400 border-neutral-500/20 font-medium"
      >
        <MailOpen className="w-3 h-3 mr-1" />
        {t("messages.status_read")}
      </Badge>
    );
  };

  const columns: Column<ContactMessage>[] = [
    {
      key: "status",
      header: t("common.status"),
      className: "w-32",
      render: (msg) => renderStatusBadge(msg.status, msg.is_read),
    },
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
          className="flex flex-col max-w-[280px] cursor-pointer"
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
      className: "w-40",
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
      key: "id",
      header: t("common.actions"),
      className: "w-20 text-right",
      render: (msg) => (
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
                  <CheckCircle2 className="h-4 w-4 mr-2" />
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
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title={t("messages.title")}
        icon={Inbox}
        description={t("messages.description")}
        actions={
          unreadCount > 0 ? (
            <Badge
              variant="outline"
              className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 font-medium px-3 py-1 text-xs"
            >
              <Mail className="w-3.5 h-3.5 mr-1.5" />
              {t("messages.unread_count", { count: String(unreadCount) })}
            </Badge>
          ) : undefined
        }
        breadcrumbs={[
          { label: t("dashboard.title"), href: "/dashboard" },
          { label: t("sidebar.Emails"), href: "/dashboard/emails/messages" },
          { label: t("messages.title") },
        ]}
      />

      <div className="space-y-4">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-neutral-100 dark:bg-neutral-900 rounded-lg border border-neutral-200/60 dark:border-white/10 w-fit">
          {[
            { id: "all", label: t("common.all") },
            {
              id: "unread",
              label: `${t("messages.status_unread")}${
                unreadCount > 0 ? ` (${unreadCount})` : ""
              }`,
            },
            { id: "read", label: t("messages.status_read") },
            { id: "replied", label: t("messages.status_replied") },
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

        {/* Data Table */}
        <DataTable
          columns={columns}
          data={filteredMessages}
          loading={isLoading}
          searchPlaceholder={t("messages.search_placeholder")}
          pageSize={10}
        />
      </div>

      {/* Message Detail Modal */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="sm:max-w-xl max-h-[85vh] overflow-y-auto">
          {selectedMessage && (
            <>
              <DialogHeader className="space-y-2 border-b border-neutral-200 dark:border-white/10 pb-4">
                <div className="flex items-center justify-between gap-2">
                  {renderStatusBadge(
                    selectedMessage.status,
                    selectedMessage.is_read
                  )}
                  <span className="text-xs text-neutral-400">
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
                  <Label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider block mb-2">
                    {t("messages.original_message")}
                  </Label>
                  <div className="bg-neutral-50 dark:bg-neutral-900/60 p-4 rounded-xl border border-neutral-200/60 dark:border-white/10 text-sm text-neutral-800 dark:text-neutral-200 whitespace-pre-wrap leading-relaxed">
                    {selectedMessage.message}
                  </div>
                </div>

                {selectedMessage.reply_content && (
                  <div className="pt-2">
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        {t("messages.reply_history")}
                      </Label>
                      {selectedMessage.replied_at && (
                        <span className="text-[11px] text-neutral-400">
                          {t("messages.replied_at", {
                            date: new Date(
                              selectedMessage.replied_at
                            ).toLocaleString(
                              language === "id" ? "id-ID" : "en-US",
                              { dateStyle: "medium", timeStyle: "short" }
                            ),
                          })}
                        </span>
                      )}
                    </div>
                    <div className="bg-emerald-500/5 dark:bg-emerald-500/10 p-4 rounded-xl border border-emerald-500/20 text-sm text-neutral-800 dark:text-neutral-200 whitespace-pre-wrap leading-relaxed">
                      {selectedMessage.reply_content}
                    </div>
                  </div>
                )}
              </div>

              <DialogFooter className="flex flex-row items-center justify-between gap-2 border-t border-neutral-200 dark:border-white/10 pt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDeleteItem(selectedMessage)}
                  className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 cursor-pointer"
                >
                  <Trash2 className="h-4 w-4 mr-1.5" />
                  {t("common.delete")}
                </Button>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleToggleReadStatus(selectedMessage)}
                    className="cursor-pointer"
                  >
                    {selectedMessage.is_read ? (
                      <>
                        <Mail className="h-4 w-4 mr-1.5" />
                        {t("messages.mark_as_unread")}
                      </>
                    ) : (
                      <>
                        <MailOpen className="h-4 w-4 mr-1.5" />
                        {t("messages.mark_as_read")}
                      </>
                    )}
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleOpenReply(selectedMessage)}
                    className="bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200 gap-1.5 cursor-pointer"
                  >
                    <Reply className="h-4 w-4" />
                    {t("messages.reply_message")}
                  </Button>
                </div>
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
              <DialogHeader>
                <DialogTitle className="text-base font-semibold">
                  {t("messages.reply_dialog_title", { name: replyMessage.name })}
                </DialogTitle>
                <DialogDescription className="text-xs text-neutral-500">
                  From: <span className="font-medium text-neutral-700 dark:text-neutral-300">fadil@bafagih.id</span> &rarr; To:{" "}
                  <span className="font-medium text-neutral-700 dark:text-neutral-300">{replyMessage.email}</span>
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-2">
                <div className="space-y-1.5">
                  <Label className="text-xs">{t("messages.reply_subject")}</Label>
                  <Input
                    value={replySubject}
                    onChange={(e) => setReplySubject(e.target.value)}
                    placeholder="Re: Subject"
                    className="h-9 text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">{t("messages.reply_content")}</Label>
                  <Textarea
                    value={replyBody}
                    onChange={(e) => setReplyBody(e.target.value)}
                    placeholder={t("messages.reply_content_placeholder")}
                    rows={6}
                    className="resize-none text-sm"
                  />
                </div>
              </div>

              <DialogFooter className="gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsReplyOpen(false)}
                  disabled={isSendingReply}
                  className="cursor-pointer"
                >
                  {t("common.cancel")}
                </Button>
                <Button
                  size="sm"
                  onClick={handleSendReply}
                  disabled={isSendingReply || !replyBody.trim()}
                  className="bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200 gap-1.5 cursor-pointer"
                >
                  {isSendingReply ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {t("messages.sending_reply")}
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
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
        title={t("common.delete_title")}
        description={
          deleteItem
            ? t("messages.delete_warning", { name: deleteItem.name })
            : undefined
        }
        loading={isDeleting}
      />
    </>
  );
}
