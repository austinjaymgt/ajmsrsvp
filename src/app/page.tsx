import { redirect } from "next/navigation";
import { supabase } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const { data } = await supabase
    .from("events")
    .select("slug")
    .eq("status", "active")
    .order("start_date", { ascending: true })
    .limit(1)
    .single();

  if (data?.slug) redirect(`/events/${data.slug}`);
  redirect("/events");
}
