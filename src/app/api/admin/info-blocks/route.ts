import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/db";
import { isAuthenticated } from "@/lib/auth";

export async function POST(req: NextRequest) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { eventId, title, body, icon, order } = await req.json();
  await supabase.from("info_blocks").insert({
    event_id: eventId, title, body, icon: icon || null, order,
  });
  return NextResponse.json({ success: true });
}

export async function PUT(req: NextRequest) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id, title, body, icon } = await req.json();
  await supabase.from("info_blocks").update({ title, body, icon: icon || null }).eq("id", id);
  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  await supabase.from("info_blocks").delete().eq("id", parseInt(id));
  return NextResponse.json({ success: true });
}
