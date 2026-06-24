import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/db";
import { isAuthenticated } from "@/lib/auth";

export async function POST(req: NextRequest) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { eventId, type, label, options, required, order } = await req.json();
  await supabase.from("questions").insert({
    event_id: eventId, type, label,
    options: options ? JSON.stringify(options) : null,
    required: required ? 1 : 0,
    order,
  });
  return NextResponse.json({ success: true });
}

export async function PATCH(req: NextRequest) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id, type, label, options, required } = await req.json();
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  const { error } = await supabase.from("questions").update({
    type, label,
    options: options ? JSON.stringify(options) : null,
    required: required ? 1 : 0,
  }).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  await supabase.from("responses").delete().eq("question_id", parseInt(id));
  await supabase.from("questions").delete().eq("id", parseInt(id));
  return NextResponse.json({ success: true });
}
