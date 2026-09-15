import { createClient } from "./supabase/client";
import type {
  NewsletterSubscriber,
  NewsletterCampaign,
  SubscriberStatus,
  CampaignType,
} from "@/src/types/database";

export interface BroadcastPayload {
  subject: string;
  contentHtml: string;
  type: CampaignType;
  testOnly?: boolean;
  testEmail?: string;
}

export const NewsletterService = {
  /**
   * Fetches all subscribers.
   */
  async getSubscribers(): Promise<NewsletterSubscriber[]> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("newsletter_subscribers")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("NewsletterService.getSubscribers error:", error);
      throw error;
    }
    return (data || []) as NewsletterSubscriber[];
  },

  /**
   * Toggles a subscriber status between active and unsubscribed.
   */
  async toggleStatus(
    id: string,
    currentStatus: SubscriberStatus
  ): Promise<NewsletterSubscriber> {
    const supabase = createClient();
    const newStatus: SubscriberStatus =
      currentStatus === "active" ? "unsubscribed" : "active";
    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from("newsletter_subscribers")
      .update({
        status: newStatus,
        unsubscribed_at: newStatus === "unsubscribed" ? now : null,
        updated_at: now,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("NewsletterService.toggleStatus error:", error);
      throw error;
    }
    return data as NewsletterSubscriber;
  },

  /**
   * Deletes a subscriber permanently.
   */
  async deleteSubscriber(id: string): Promise<void> {
    const supabase = createClient();
    const { error } = await supabase
      .from("newsletter_subscribers")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("NewsletterService.deleteSubscriber error:", error);
      throw error;
    }
  },

  /**
   * Fetches past broadcast campaigns.
   */
  async getCampaigns(): Promise<NewsletterCampaign[]> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("newsletter_campaigns")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("NewsletterService.getCampaigns error:", error);
      throw error;
    }
    return (data || []) as NewsletterCampaign[];
  },

  /**
   * Dispatches broadcast or test email via API.
   */
  async sendBroadcast(payload: BroadcastPayload): Promise<{
    success: boolean;
    message: string;
    sentCount?: number;
    totalSubscribers?: number;
    campaign?: NewsletterCampaign;
    testMode?: boolean;
    error?: string;
  }> {
    const res = await fetch("/api/newsletter/broadcast", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const result = await res.json();
    if (!res.ok || !result.success) {
      throw new Error(result.error || "Failed to send broadcast.");
    }
    return result;
  },
};
