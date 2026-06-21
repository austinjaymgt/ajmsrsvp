import { redirect, notFound } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import { getDb } from "@/lib/db";
import AdminDashboardClient from "../AdminDashboardClient";

export const dynamic = "force-dynamic";

type Event = { id: number; name: string; slug: string; start_date: string; end_date: string; location: string; hero_image_url: string | null; description: string };
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
  const db = getDb();
  const event = db.prepare("SELECT * FROM events WHERE id = ?").get(parseInt(id)) as Event | undefined;
  if (!event) notFound();

  const guests = db.prepare("SELECT * FROM guests WHERE event_id = ? ORDER BY responded_at DESC").all(event.id) as Guest[];
  const questions = db.prepare(`SELECT * FROM questions WHERE event_id = ? ORDER BY "order"`).all(event.id) as Question[];
  const itinerary = db.prepare(`SELECT * FROM itinerary_items WHERE event_id = ? ORDER BY "order"`).all(event.id) as ItineraryItem[];
  const photos = db.prepare(`SELECT * FROM photos WHERE event_id = ? ORDER BY "order"`).all(event.id) as Photo[];
  const infoBlocks = db.prepare(`SELECT * FROM info_blocks WHERE event_id = ? ORDER BY "order"`).all(event.id) as InfoBlock[];
  const responses = db.prepare("SELECT r.* FROM responses r JOIN guests g ON r.guest_id = g.id WHERE g.event_id = ?").all(event.id) as Response[];

  return (
    <AdminDashboardClient
      event={event}
      guests={guests}
      questions={questions.map((q) => ({ ...q, options: q.options ? JSON.parse(q.options) : null, required: !!q.required }))}
      itinerary={itinerary}
      photos={photos}
      infoBlocks={infoBlocks}
      responses={responses}
    />
  );
}
