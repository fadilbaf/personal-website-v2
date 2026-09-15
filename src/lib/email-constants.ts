/**
 * Standard sender profiles and default settings according to the email architecture.
 * Safe to import in both Client and Server components.
 */
export const EMAIL_SENDERS = {
  PERSONAL: process.env.EMAIL_SENDER_PERSONAL || "Fadil Bafagih <fadil@bafagih.id>",
  NOREPLY: process.env.EMAIL_SENDER_NOREPLY || "Fadil Bafagih <noreply@fadil.bafagih.id>",
  NEWSLETTER: process.env.EMAIL_SENDER_NEWSLETTER || "Fadil Bafagih Newsletter <newsletter@fadil.bafagih.id>",
} as const;

export const DEFAULT_ADMIN_EMAIL = "fadil@bafagih.id";
