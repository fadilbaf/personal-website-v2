import { createClient } from "./supabase/client";
import type { ContactMessage, MessageStatus } from "@/src/types/database";

export const MessageService = {
  /**
   * Fetches all contact messages from Supabase.
   */
  async getAll(): Promise<ContactMessage[]> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("contact_messages")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("MessageService.getAll error:", error);
      throw error;
    }
    return (data || []) as ContactMessage[];
  },

  /**
   * Returns the count of unread messages.
   */
  async getUnreadCount(): Promise<number> {
    const supabase = createClient();
    const { count, error } = await supabase
      .from("contact_messages")
      .select("*", { count: "exact", head: true })
      .eq("is_read", false);

    if (error) {
      console.error("MessageService.getUnreadCount error:", error);
      return 0;
    }
    return count || 0;
  },

  /**
   * Marks a message as read or unread.
   */
  async toggleRead(id: string, is_read: boolean): Promise<ContactMessage> {
    const supabase = createClient();
    const newStatus: MessageStatus = is_read ? "read" : "unread";
    const { data, error } = await supabase
      .from("contact_messages")
      .update({
        is_read,
        status: newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("MessageService.toggleRead error:", error);
      throw error;
    }
    return data as ContactMessage;
  },

  /**
   * Updates message status (unread, read, replied, archived).
   */
  async updateStatus(id: string, status: MessageStatus): Promise<ContactMessage> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("contact_messages")
      .update({
        status,
        is_read: status !== "unread",
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("MessageService.updateStatus error:", error);
      throw error;
    }
    return data as ContactMessage;
  },

  /**
   * Sends direct reply via the API endpoint.
   */
  async reply(payload: {
    messageId: string;
    replySubject: string;
    replyMessage: string;
  }): Promise<{ success: boolean; data?: ContactMessage; error?: string }> {
    const res = await fetch("/api/contact/reply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const result = await res.json();
    if (!res.ok || !result.success) {
      throw new Error(result.error || "Failed to send reply");
    }
    return result;
  },

  /**
   * Deletes a contact message.
   */
  async delete(id: string): Promise<void> {
    const supabase = createClient();
    const { error } = await supabase
      .from("contact_messages")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("MessageService.delete error:", error);
      throw error;
    }
  },
};
