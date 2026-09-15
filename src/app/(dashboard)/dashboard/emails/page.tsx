import { redirect } from "next/navigation";

export default function EmailsIndexPage() {
  redirect("/dashboard/emails/messages");
}
