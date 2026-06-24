import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/db";
import { isAuthenticated } from "@/lib/auth";

export async function POST(req: NextRequest) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, slug, start_date, end_date, location, description, hero_image_url } = await req.json();
  if (!name || !slug) return NextResponse.json({ error: "Name and slug are required." }, { status: 400 });

  const { data: existing } = await supabase.from("events").select("id").eq("slug", slug).maybeSingle();
  if (existing) return NextResponse.json({ error: `Slug "${slug}" is already taken.` }, { status: 409 });

  const { data } = await supabase
    .from("events")
    .insert({ name, slug, start_date: start_date || null, end_date: end_date || null, location: location || null, description: description || null, hero_image_url: hero_image_url || null, status: "active" })
    .select("id")
    .single();

  return NextResponse.json({ success: true, id: data?.id });
}
