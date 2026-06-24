import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/db";

export async function POST(req: NextRequest) {
  const { slug, name, status, answers } = await req.json();
  if (!name || !status) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  const { data: event } = slug
    ? await supabase.from("events").select("id").eq("slug", slug).single()
    : await supabase.from("events").select("id").eq("status", "active").limit(1).single();

  if (!event) return NextResponse.json({ error: "No event found" }, { status: 404 });

  const { data: guest } = await supabase
    .from("guests")
    .insert({ event_id: event.id, name, status })
    .select("id")
    .single();

  if (!guest) return NextResponse.json({ error: "Failed to save RSVP" }, { status: 500 });

  if (answers && typeof answers === "object") {
    const rows = Object.entries(answers as Record<string, unknown>).map(([questionId, value]) => ({
      guest_id: guest.id,
      question_id: parseInt(questionId),
      answer_value: Array.isArray(value) ? JSON.stringify(value) : String(value),
    }));
    await supabase.from("responses").insert(rows);
  }

  return NextResponse.json({ success: true, guestId: guest.id });
}
