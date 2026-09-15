import { redirect } from "next/navigation";

export default function LegacyNewsletterPage() {
  redirect("/dashboard/emails/newsletter");
}
