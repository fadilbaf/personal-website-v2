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
    defaultSubject: "New Contact Message: {{subject}}",
    supportsLocale: false,
    availableVariables: [
      { key: "name", label: "{{name}}", description: "Visitor full name" },
      { key: "email", label: "{{email}}", description: "Visitor email address" },
      { key: "subject", label: "{{subject}}", description: "Visitor subject" },
      { key: "message", label: "{{message}}", description: "Visitor message body" },
      { key: "receivedAt", label: "{{receivedAt}}", description: "Submission timestamp" },
    ],
    fields: [
      { key: "name", label: "Visitor Name", type: "text", defaultValue: "Aliya Kherid" },
      { key: "email", label: "Visitor Email", type: "text", defaultValue: "aliyakherid@gmail.com" },
      { key: "subject", label: "Subject", type: "text", defaultValue: "Collaboration — Wedding Planner & Digital Invitation Project" },
      {
        key: "message",
        label: "Message Content",
        type: "textarea",
        defaultValue:
          "Hi Fadil,\n\nI'm interested in collaborating on the development of an interactive wedding planner & digital invitation platform for our clients.\n\nWould you have some time available this week to discuss the project concept, scope, and timeline?\n\nBest regards,\nAliya Kherid",
      },
      { key: "receivedAt", label: "Received Timestamp", type: "text", defaultValue: "Oct 2, 2026, 12:40 AM" },
    ],
    renderHtml: (params) =>
      renderContactNotificationEmail({
        name: params.name || "Aliya Kherid",
        email: params.email || "aliyakherid@gmail.com",
        subject: params.subject || "Collaboration — Wedding Planner & Digital Invitation Project",
        message: params.message || "Hi Fadil,\n\nI'm interested in collaborating with you!",
        receivedAt: params.receivedAt || "Oct 2, 2026, 12:40 AM",
        adminName: params.adminName,
        adminEmail: params.adminEmail,
        adminWebsite: params.adminWebsite,
        instagramUrl: params.instagramUrl,
        githubUrl: params.githubUrl,
        linkedinUrl: params.linkedinUrl,
        tiktokUrl: params.tiktokUrl,
      }),
    getDefaultRawTemplate: () =>
      renderContactNotificationEmail({
        name: "{{name}}",
        email: "{{email}}",
        subject: "{{subject}}",
        message: "{{message}}",
        receivedAt: "{{receivedAt}}",
        adminName: "{{adminName}}",
        adminEmail: "{{adminEmail}}",
        adminWebsite: "{{adminWebsite}}",
        instagramUrl: "{{instagramUrl}}",
        githubUrl: "{{githubUrl}}",
        linkedinUrl: "{{linkedinUrl}}",
        tiktokUrl: "{{tiktokUrl}}",
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
      { key: "name", label: "Visitor Name", type: "text", defaultValue: "Aliya Kherid" },
      { key: "subject", label: "Original Subject", type: "text", defaultValue: "Collaboration — Wedding Planner & Digital Invitation Project" },
    ],
    renderHtml: (params, locale = "en") =>
      renderContactAutoReplyEmail({
        name: params.name || "Aliya Kherid",
        subject: params.subject || "Collaboration — Wedding Planner & Digital Invitation Project",
        locale,
        adminName: params.adminName,
        adminEmail: params.adminEmail,
        adminWebsite: params.adminWebsite,
        instagramUrl: params.instagramUrl,
        githubUrl: params.githubUrl,
        linkedinUrl: params.linkedinUrl,
        tiktokUrl: params.tiktokUrl,
      }),
    getDefaultRawTemplate: (locale = "en") =>
      renderContactAutoReplyEmail({
        name: "{{name}}",
        subject: "{{subject}}",
        locale,
        adminName: "{{adminName}}",
        adminEmail: "{{adminEmail}}",
        adminWebsite: "{{adminWebsite}}",
        instagramUrl: "{{instagramUrl}}",
        githubUrl: "{{githubUrl}}",
        linkedinUrl: "{{linkedinUrl}}",
        tiktokUrl: "{{tiktokUrl}}",
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
      { key: "recipientName", label: "Recipient Name", type: "text", defaultValue: "Aliya Kherid" },
      { key: "subject", label: "Reply Subject", type: "text", defaultValue: "Re: Collaboration — Wedding Planner & Digital Invitation Project" },
      {
        key: "replyMessage",
        label: "Reply Message",
        type: "textarea",
        defaultValue:
          "Thank you so much for reaching out! The wedding planner & digital invitation platform sounds exciting, and I'd love to help bring this project to life.\n\nCould we schedule a quick Google Meet call tomorrow or the day after to go over the feature requirements, design direction, and timeline?",
      },
      { key: "originalSubject", label: "Original Subject", type: "text", defaultValue: "Collaboration — Wedding Planner & Digital Invitation Project" },
      {
        key: "originalMessage",
        label: "Original Visitor Message",
        type: "textarea",
        defaultValue:
          "Hi Fadil,\n\nI'm interested in collaborating on the development of an interactive wedding planner & digital invitation platform for our clients.\n\nWould you have some time available this week to discuss the project concept, scope, and timeline?\n\nBest regards,\nAliya Kherid",
      },
    ],
    renderHtml: (params) =>
      renderContactReplyEmail({
        recipientName: params.recipientName || "Aliya Kherid",
        subject: params.subject || "Re: Collaboration — Wedding Planner & Digital Invitation Project",
        replyMessage: params.replyMessage || "Thank you for reaching out!",
        originalMessage: params.originalMessage,
        originalSubject: params.originalSubject,
        adminName: params.adminName,
        adminEmail: params.adminEmail,
        adminWebsite: params.adminWebsite,
        instagramUrl: params.instagramUrl,
        githubUrl: params.githubUrl,
        linkedinUrl: params.linkedinUrl,
        tiktokUrl: params.tiktokUrl,
      }),
    getDefaultRawTemplate: () =>
      renderContactReplyEmail({
        recipientName: "{{recipientName}}",
        subject: "{{subject}}",
        replyMessage: "{{replyMessage}}",
        originalMessage: "{{originalMessage}}",
        originalSubject: "{{originalSubject}}",
        adminName: "{{adminName}}",
        adminEmail: "{{adminEmail}}",
        adminWebsite: "{{adminWebsite}}",
        instagramUrl: "{{instagramUrl}}",
        githubUrl: "{{githubUrl}}",
        linkedinUrl: "{{linkedinUrl}}",
        tiktokUrl: "{{tiktokUrl}}",
      }),
  },
  {
    id: "newsletter_welcome",
    name: "Newsletter — Welcome Email",
    category: "Newsletter",
    description: "Onboarding welcome email sent immediately to new newsletter subscribers.",
    sender: EMAIL_SENDERS.NOREPLY,
    defaultSubject: "Welcome to Fadil Bafagih's Newsletter!",
    supportsLocale: true,
    availableVariables: [
      { key: "email", label: "{{email}}", description: "Subscriber email address" },
    ],
    fields: [
      { key: "email", label: "Subscriber Email", type: "text", defaultValue: "aliyakherid@gmail.com" },
    ],
    renderHtml: (params, locale = "en") =>
      renderNewsletterWelcomeEmail({
        email: params.email || "aliyakherid@gmail.com",
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
    defaultSubject: "New Subscriber: {{email}}",
    supportsLocale: false,
    availableVariables: [
      { key: "email", label: "{{email}}", description: "New subscriber email" },
      { key: "totalSubscribers", label: "{{totalSubscribers}}", description: "Total active subscribers count" },
      { key: "subscribedAt", label: "{{subscribedAt}}", description: "Subscription timestamp" },
    ],
    fields: [
      { key: "email", label: "Subscriber Email", type: "text", defaultValue: "aliyakherid@gmail.com" },
      { key: "totalSubscribers", label: "Total Subscribers", type: "number", defaultValue: 18 },
      { key: "subscribedAt", label: "Subscribed Timestamp", type: "text", defaultValue: "Oct 2, 2026, 12:40 AM" },
    ],
    renderHtml: (params) =>
      renderNewsletterAdminNotificationEmail({
        email: params.email || "aliyakherid@gmail.com",
        totalSubscribers: Number(params.totalSubscribers) || 18,
        subscribedAt: params.subscribedAt || "Oct 2, 2026, 12:40 AM",
      }),
    getDefaultRawTemplate: () =>
      renderNewsletterAdminNotificationEmail({
        email: "{{email}}",
        totalSubscribers: Number("{{totalSubscribers}}") || 18,
        subscribedAt: "{{subscribedAt}}",
      }),
  },
  {
    id: "newsletter_broadcast",
    name: "Newsletter — Broadcast Campaign",
    category: "Newsletter",
    description: "Standard broadcast layout for sending blog updates, project launches, or general newsletters to all subscribers.",
    sender: EMAIL_SENDERS.NEWSLETTER,
    defaultSubject: "{{subject}}",
    supportsLocale: false,
    availableVariables: [
      { key: "subject", label: "{{subject}}", description: "Broadcast campaign subject" },
      { key: "contentHtml", label: "{{contentHtml}}", description: "Broadcast main body HTML" },
      { key: "recipientEmail", label: "{{recipientEmail}}", description: "Subscriber recipient email" },
    ],
    fields: [
      { key: "subject", label: "Broadcast Subject", type: "text", defaultValue: "Introducing Pixture — A Modern Photography & Visual Showcase Platform" },
      {
        key: "type",
        label: "Campaign Type",
        type: "select",
        options: [
          { label: "Newsletter", value: "newsletter" },
          { label: "Blog Article", value: "blog" },
          { label: "Project Launch", value: "project" },
          { label: "Achievement", value: "achievement" },
          { label: "Information", value: "information" },
          { label: "Promotion", value: "promotion" },
        ],
        defaultValue: "project",
      },
      { key: "recipientEmail", label: "Recipient Placeholder", type: "text", defaultValue: "aliyakherid@gmail.com" },
      {
        key: "contentHtml",
        label: "Body Content (HTML allowed)",
        type: "textarea",
        defaultValue:
          `<p style="margin: 0 0 16px; font-size: 15px; line-height: 1.7; color: #d4d4d8;">\n  Hey everyone! 👋\n</p>\n<p style="margin: 0 0 16px; font-size: 15px; line-height: 1.7; color: #d4d4d8;">\n  I'm thrilled to announce the launch of my latest project: <strong>Pixture</strong> — a modern visual curation and photography showcase platform built for high performance and seamless interactive experiences.\n</p>\n<p style="margin: 0 0 16px; font-size: 15px; line-height: 1.7; color: #d4d4d8;">\n  The platform is built using a modern technology stack with adaptive image optimization, dynamic masonry layouts, and lightning-fast cloud delivery.\n</p>\n<div style="margin: 28px 0 16px; text-align: left;">\n  <a href="https://bafagih.id/projects/pixture" target="_blank" rel="noopener noreferrer" style="display: inline-block; background-color: #ffffff; color: #09090b; font-weight: 600; font-size: 14px; padding: 12px 24px; border-radius: 8px; text-decoration: none; box-shadow: 0 4px 14px rgba(255,255,255,0.12);">\n    Explore Pixture &rarr;\n  </a>\n</div>`,
      },
    ],
    renderHtml: (params) =>
      renderNewsletterBroadcastEmail({
        subject: params.subject || "Introducing Pixture — A Modern Photography & Visual Showcase Platform",
        type: (params.type as any) || "project",
        recipientEmail: params.recipientEmail || "aliyakherid@gmail.com",
        contentHtml:
          params.contentHtml ||
          `<p style="margin: 0 0 16px; font-size: 15px; line-height: 1.7; color: #d4d4d8;">Hey everyone! 👋</p><p style="margin: 0 0 16px; font-size: 15px; line-height: 1.7; color: #d4d4d8;">I'm thrilled to announce the launch of my latest project: <strong>Pixture</strong>.</p>`,
      }),
    getDefaultRawTemplate: () =>
      renderNewsletterBroadcastEmail({
        subject: "{{subject}}",
        type: "project",
        recipientEmail: "{{recipientEmail}}",
        contentHtml: "{{contentHtml}}",
      }),
  },
];
