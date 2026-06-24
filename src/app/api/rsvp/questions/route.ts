import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const slug = new URL(req.url).searchParams.get("slug");

  const { data: event } = slug
    ? await supabase.from("events").select("id, cost_items, cost_note").eq("slug", slug).single()
    : await supabase.from("events").select("id, cost_items, cost_note").eq("status", "active").limit(1).single();

  if (!event) return NextResponse.json({ questions: [], event: null });

  const { data: rows } = await supabase
    .from("questions")
    .select("*")
    .eq("event_id", event.id)
    .order("order");

  const questions = (rows ?? []).map((q) => ({
    ...q,
    options: q.options ? JSON.parse(q.options) : null,
    required: !!q.required,
  }));

  const eventData = {
    cost_items: event.cost_items ? JSON.parse(event.cost_items) : null,
    cost_note: event.cost_note ?? null,
  };

  return NextResponse.json({ questions, event: eventData });
}
