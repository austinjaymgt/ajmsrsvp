import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/db";
import { isAuthenticated } from "@/lib/auth";

export async function PUT(req: NextRequest) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id, name, start_date, end_date, location, hero_image_url, description, cost_items, cost_note } = await req.json();
  await supabase.from("events").update({
    name, start_date, end_date, location, hero_image_url: hero_image_url || null, description,
    cost_items: cost_items ? JSON.stringify(cost_items) : null,
    cost_note: cost_note || null,
  }).eq("id", id);
  return NextResponse.json({ success: true });
}
