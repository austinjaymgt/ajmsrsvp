import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import NewEventForm from "./NewEventForm";

export const dynamic = "force-dynamic";

export default async function NewEventPage() {
  const authed = await isAuthenticated();
  if (!authed) redirect("/admin");
  return <NewEventForm />;
}
