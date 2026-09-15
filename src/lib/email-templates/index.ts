import { renderContactNotificationEmail } from "./contact-notification-email";
import { renderContactAutoReplyEmail } from "./contact-autoreply-email";
import { renderContactReplyEmail } from "./contact-reply-email";
import { renderNewsletterAdminNotificationEmail } from "./newsletter-admin-notification-email";
import { renderNewsletterWelcomeEmail } from "./newsletter-welcome-email";
import { renderNewsletterBroadcastEmail } from "./newsletter-broadcast-email";
import { EMAIL_SENDERS } from "@/src/lib/email-constants";

export {
  renderContactNotificationEmail,
  renderContactAutoReplyEmail,
  renderContactReplyEmail,
  renderNewsletterAdminNotificationEmail,
  renderNewsletterWelcomeEmail,
  renderNewsletterBroadcastEmail,
};

export type TemplateId =
  | "contact_notification"
  | "contact_autoreply"
  | "contact_reply"
  | "newsletter_admin_notification"
  | "newsletter_welcome"
  | "newsletter_broadcast";

export interface TemplateField {
  key: string;
  label: string;
  type: "text" | "textarea" | "select" | "number";
  options?: { label: string; value: string }[];
  defaultValue: any;
}

export interface AvailableVariable {
  key: string;
  label: string;
  description: string;
}

export interface EmailTemplateDefinition {
  id: TemplateId;
  name: string;
  category: "Contact" | "Newsletter";
  description: string;
  sender: string;
  defaultSubject: string;
  fields: TemplateField[];
  availableVariables: AvailableVariable[];
  supportsLocale: boolean;
  renderHtml: (params: Record<string, any>, locale?: "en" | "id") => string;
  getDefaultRawTemplate: (locale?: "en" | "id") => string;
}

export function htmlToPlainText(html: string): string {
  if (!html) return "";
  let text = html;

  // Remove <style> and <head> blocks
  text = text.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "");
  text = text.replace(/<head[^>]*>[\s\S]*?<\/head>/gi, "");

  // Convert links: <a href="url">text</a> -> text (url)
  text = text.replace(/<a\s+[^>]*href=["']([^"']*)["'][^>]*>([\s\S]*?)<\/a>/gi, (_, href, content) => {
    const cleanContent = content.replace(/<[^>]+>/g, "").trim();
    if (!cleanContent || cleanContent === href) return href;
    return `${cleanContent} (${href})`;
  });

  // Convert line breaks and paragraph/block separators
  text = text.replace(/<br\s*\/?>/gi, "\n");
  text = text.replace(/<\/p>/gi, "\n\n");
  text = text.replace(/<\/h[1-6]>/gi, "\n\n");
  text = text.replace(/<\/tr>/gi, "\n");
  text = text.replace(/<\/div>/gi, "\n");
  text = text.replace(/<\/li>/gi, "\n");
  text = text.replace(/<li[^>]*>/gi, "• ");

  // Strip all remaining HTML tags
  text = text.replace(/<[^>]+>/g, "");

  // Decode basic HTML entities
  text = text
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&bull;/g, "•");

  // Normalize excessive newlines and whitespace
  text = text.replace(/[ \t]+/g, " ");
  text = text.replace(/\n\s*\n\s*\n/g, "\n\n");
  return text.trim();
}

export const EMAIL_TEMPLATES: EmailTemplateDefinition[] = [
  {
    id: "contact_notification",
    name: "Contact Message — Admin Alert",
    category: "Contact",
    description: "Instant notification email delivered to the admin when a website visitor submits the contact form.",
    sender: EMAIL_SENDERS.NOREPLY,
    defaultSubject: "📬 New Contact Message: {{subject}}",
    supportsLocale: false,
    availableVariables: [
      { key: "name", label: "{{name}}", description: "Visitor full name" },
      { key: "email", label: "{{email}}", description: "Visitor email address" },
      { key: "subject", label: "{{subject}}", description: "Visitor subject" },
      { key: "message", label: "{{message}}", description: "Visitor message body" },
      { key: "receivedAt", label: "{{receivedAt}}", description: "Submission timestamp" },
    ],
    fields: [
      { key: "name", label: "Visitor Name", type: "text", defaultValue: "Sarah Jenkins" },
      { key: "email", label: "Visitor Email", type: "text", defaultValue: "sarah.jenkins@company.com" },
      { key: "subject", label: "Subject", type: "text", defaultValue: "Partnership & AI Project Inquiry" },
      {
        key: "message",
        label: "Message Content",
        type: "textarea",
        defaultValue:
          "Hi Fadil,\n\nI came across your portfolio and was really impressed with your Next.js and AI projects. We have an upcoming design engineering project and would love to collaborate.\n\nBest,\nSarah",
      },
      { key: "receivedAt", label: "Received Timestamp", type: "text", defaultValue: new Date().toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" }) },
    ],
    renderHtml: (params) =>
      renderContactNotificationEmail({
        name: params.name || "Sarah Jenkins",
        email: params.email || "sarah.jenkins@company.com",
        subject: params.subject || "Partnership & AI Project Inquiry",
        message: params.message || "Hello Fadil!",
        receivedAt: params.receivedAt || new Date().toLocaleString(),
      }),
    getDefaultRawTemplate: () =>
      renderContactNotificationEmail({
        name: "{{name}}",
        email: "{{email}}",
        subject: "{{subject}}",
        message: "{{message}}",
        receivedAt: "{{receivedAt}}",
      }),
  },
  {
    id: "contact_autoreply",
    name: "Contact Message — Visitor Auto-Reply",
    category: "Contact",
    description: "Automated instant confirmation email sent back to the visitor to confirm receipt of their inquiry.",
    sender: EMAIL_SENDERS.NOREPLY,
    defaultSubject: "Thank you for reaching out! — Fadil Bafagih",
    supportsLocale: true,
    availableVariables: [
      { key: "name", label: "{{name}}", description: "Visitor full name" },
      { key: "subject", label: "{{subject}}", description: "Inquiry subject" },
    ],
    fields: [
      { key: "name", label: "Visitor Name", type: "text", defaultValue: "Sarah Jenkins" },
      { key: "subject", label: "Original Subject", type: "text", defaultValue: "Partnership & AI Project Inquiry" },
    ],
    renderHtml: (params, locale = "en") =>
      renderContactAutoReplyEmail({
        name: params.name || "Sarah Jenkins",
        subject: params.subject || "Partnership & AI Project Inquiry",
        locale,
      }),
    getDefaultRawTemplate: (locale = "en") =>
      renderContactAutoReplyEmail({
        name: "{{name}}",
        subject: "{{subject}}",
        locale,
      }),
  },
  {
    id: "contact_reply",
    name: "Contact Message — Direct Reply",
    category: "Contact",
    description: "Direct personal response sent from admin to visitor from within the dashboard messages interface.",
    sender: EMAIL_SENDERS.PERSONAL,
    defaultSubject: "Re: {{originalSubject}}",
    supportsLocale: false,
    availableVariables: [
      { key: "recipientName", label: "{{recipientName}}", description: "Visitor recipient name" },
      { key: "subject", label: "{{subject}}", description: "Reply subject" },
      { key: "replyMessage", label: "{{replyMessage}}", description: "Admin reply body" },
      { key: "originalSubject", label: "{{originalSubject}}", description: "Original visitor subject" },
      { key: "originalMessage", label: "{{originalMessage}}", description: "Original visitor message" },
    ],
    fields: [
      { key: "recipientName", label: "Recipient Name", type: "text", defaultValue: "Sarah Jenkins" },
      { key: "subject", label: "Reply Subject", type: "text", defaultValue: "Re: Partnership & AI Project Inquiry" },
      {
        key: "replyMessage",
        label: "Reply Message",
        type: "textarea",
        defaultValue:
          "Hi Sarah,\n\nThank you for reaching out! I would love to learn more about the project and how we can work together.\n\nAre you available for a brief Google Meet call this Thursday around 2 PM GMT+7?\n\nLooking forward to speaking with you!",
      },
      { key: "originalSubject", label: "Original Subject", type: "text", defaultValue: "Partnership & AI Project Inquiry" },
      {
        key: "originalMessage",
        label: "Original Visitor Message",
        type: "textarea",
        defaultValue: "Hi Fadil, I came across your portfolio and was really impressed with your Next.js and AI projects.",
      },
    ],
    renderHtml: (params) =>
      renderContactReplyEmail({
        recipientName: params.recipientName || "Sarah Jenkins",
        subject: params.subject || "Re: Partnership & AI Project Inquiry",
        replyMessage: params.replyMessage || "Thank you for reaching out!",
        originalMessage: params.originalMessage,
        originalSubject: params.originalSubject,
      }),
    getDefaultRawTemplate: () =>
      renderContactReplyEmail({
        recipientName: "{{recipientName}}",
        subject: "{{subject}}",
        replyMessage: "{{replyMessage}}",
        originalMessage: "{{originalMessage}}",
        originalSubject: "{{originalSubject}}",
      }),
  },
  {
    id: "newsletter_welcome",
    name: "Newsletter — Welcome Email",
    category: "Newsletter",
    description: "Onboarding welcome email sent immediately to new newsletter subscribers.",
    sender: EMAIL_SENDERS.NOREPLY,
    defaultSubject: "Welcome to Fadil Bafagih's Newsletter! 🚀",
    supportsLocale: true,
    availableVariables: [
      { key: "email", label: "{{email}}", description: "Subscriber email address" },
    ],
    fields: [
      { key: "email", label: "Subscriber Email", type: "text", defaultValue: "subscriber@example.com" },
    ],
    renderHtml: (params, locale = "en") =>
      renderNewsletterWelcomeEmail({
        email: params.email || "subscriber@example.com",
        locale,
      }),
    getDefaultRawTemplate: (locale = "en") =>
      renderNewsletterWelcomeEmail({
        email: "{{email}}",
        locale,
      }),
  },
  {
    id: "newsletter_admin_notification",
    name: "Newsletter — Admin Alert",
    category: "Newsletter",
    description: "Notification sent to the admin when a new subscriber joins the newsletter list.",
    sender: EMAIL_SENDERS.NOREPLY,
    defaultSubject: "🎉 New Subscriber: {{email}}",
    supportsLocale: false,
    availableVariables: [
      { key: "email", label: "{{email}}", description: "New subscriber email" },
      { key: "totalSubscribers", label: "{{totalSubscribers}}", description: "Total active subscribers count" },
      { key: "subscribedAt", label: "{{subscribedAt}}", description: "Subscription timestamp" },
    ],
    fields: [
      { key: "email", label: "Subscriber Email", type: "text", defaultValue: "new_reader@domain.com" },
      { key: "totalSubscribers", label: "Total Subscribers", type: "number", defaultValue: 42 },
      { key: "subscribedAt", label: "Subscribed Timestamp", type: "text", defaultValue: new Date().toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" }) },
    ],
    renderHtml: (params) =>
      renderNewsletterAdminNotificationEmail({
        email: params.email || "new_reader@domain.com",
        totalSubscribers: Number(params.totalSubscribers) || 42,
        subscribedAt: params.subscribedAt || new Date().toLocaleString(),
      }),
    getDefaultRawTemplate: () =>
      renderNewsletterAdminNotificationEmail({
        email: "{{email}}",
        totalSubscribers: Number("{{totalSubscribers}}") || 42,
        subscribedAt: "{{subscribedAt}}",
      }),
  },
  {
    id: "newsletter_broadcast",
    name: "Newsletter — Broadcast Campaign",
    category: "Newsletter",
    description: "Standard broadcast layout for sending blog updates, project launches, or general newsletters to all subscribers.",
    sender: EMAIL_SENDERS.NEWSLETTER,
    defaultSubject: "🚀 {{subject}}",
    supportsLocale: false,
    availableVariables: [
      { key: "subject", label: "{{subject}}", description: "Broadcast campaign subject" },
      { key: "contentHtml", label: "{{contentHtml}}", description: "Broadcast main body HTML" },
      { key: "recipientEmail", label: "{{recipientEmail}}", description: "Subscriber recipient email" },
    ],
    fields: [
      { key: "subject", label: "Broadcast Subject", type: "text", defaultValue: "🚀 Next.js 15 Deep Dive & Full Stack Patterns" },
      {
        key: "type",
        label: "Update Type",
        type: "select",
        options: [
          { label: "Blog Article", value: "blog" },
          { label: "Project Launch", value: "project" },
          { label: "Achievement", value: "achievement" },
          { label: "General Update", value: "general" },
        ],
        defaultValue: "blog",
      },
      { key: "recipientEmail", label: "Recipient Placeholder", type: "text", defaultValue: "subscriber@example.com" },
      {
        key: "contentHtml",
        label: "Body Content (HTML allowed)",
        type: "textarea",
        defaultValue:
          "<p>Hello everyone! 👋</p><p>I'm thrilled to share my latest technical article exploring <strong>Next.js 15 architecture, React Server Components, and zero-latency caching</strong>.</p><p>We break down production benchmarks, edge deployment considerations, and practical lessons from building real-world enterprise apps.</p><p><a href=\"https://bafagih.id/blogs/nextjs-15-deep-dive\" style=\"display: inline-block; background-color: #38bdf8; color: #09090b; font-weight: 600; font-size: 13px; padding: 10px 20px; border-radius: 6px; text-decoration: none; margin-top: 12px;\">Read Full Story &rarr;</a></p>",
      },
    ],
    renderHtml: (params) =>
      renderNewsletterBroadcastEmail({
        subject: params.subject || "Newsletter Broadcast",
        type: (params.type as any) || "blog",
        recipientEmail: params.recipientEmail || "subscriber@example.com",
        contentHtml: params.contentHtml || "<p>Welcome to our update!</p>",
      }),
    getDefaultRawTemplate: () =>
      renderNewsletterBroadcastEmail({
        subject: "{{subject}}",
        type: "general",
        recipientEmail: "{{recipientEmail}}",
        contentHtml: "{{contentHtml}}",
      }),
  },
];
