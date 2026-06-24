import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const slug = new URL(req.url).searchParams.get("slug");

  const { data: event } = slug
    ? await supabase.from("events").select("id").eq("slug", slug).single()
    : await supabase.from("events").select("id").eq("status", "active").limit(1).single();

  if (!event) return NextResponse.json({ questions: [] });

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

  return NextResponse.json({ questions });
}
