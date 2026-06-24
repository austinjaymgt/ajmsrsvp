import { redirect, notFound } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import { supabase } from "@/lib/db";
import AdminDashboardClient from "../AdminDashboardClient";

export const dynamic = "force-dynamic";

type CostItem = { label: string; amount: string };
type Event = { id: number; name: string; slug: string; start_date: string; end_date: string; location: string; hero_image_url: string | null; description: string; cost_items: CostItem[] | null; cost_note: string | null };
type Guest = { id: number; name: string; email: string | null; status: string; responded_at: string };
type Question = { id: number; type: string; label: string; options: string | null; order: number; required: number };
type ItineraryItem = { id: number; day_label: string; time: string | null; title: string; description: string | null; order: number };
type Photo = { id: number; url: string; caption: string | null; category: string; order: number };
type InfoBlock = { id: number; title: string; body: string; icon: string | null; order: number };
type Response = { guest_id: number; question_id: number; answer_value: string | null };

export default async function AdminEventPage({ params }: { params: Promise<{ id: string }> }) {
  const authed = await isAuthenticated();
  if (!authed) redirect("/admin");

  const { id } = await params;
  const { data: event } = await supabase.from("events").select("*").eq("id", parseInt(id)).single();
  if (!event) notFound();

  const [{ data: guestsData }, { data: questionsData }, { data: itineraryData }, { data: photosData }, { data: infoBlocksData }] = await Promise.all([
    supabase.from("guests").select("*").eq("event_id", event.id).order("responded_at", { ascending: false }),
    supabase.from("questions").select("*").eq("event_id", event.id).order("order"),
    supabase.from("itinerary_items").select("*").eq("event_id", event.id).order("order"),
    supabase.from("photos").select("*").eq("event_id", event.id).order("order"),
    supabase.from("info_blocks").select("*").eq("event_id", event.id).order("order"),
  ]);

  const guests = (guestsData ?? []) as Guest[];
  const questions = (questionsData ?? []) as Question[];
  const itinerary = (itineraryData ?? []) as ItineraryItem[];
  const photos = (photosData ?? []) as Photo[];
  const infoBlocks = (infoBlocksData ?? []) as InfoBlock[];

  const guestIds = guests.map((g) => g.id);
  const { data: responsesData } = guestIds.length
    ? await supabase.from("responses").select("*").in("guest_id", guestIds)
    : { data: [] };
  const responses = (responsesData ?? []) as Response[];

  return (
    <AdminDashboardClient
      event={{ ...event, cost_items: event.cost_items ? JSON.parse(event.cost_items as unknown as string) : null }}
      guests={guests}
      questions={questions.map((q) => ({ ...q, options: q.options ? JSON.parse(q.options) : null, required: !!q.required }))}
      itinerary={itinerary}
      photos={photos}
      infoBlocks={infoBlocks}
      responses={responses}
    />
  );
}
