import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { isAuthenticated } from "@/lib/auth";

export async function POST(req: NextRequest) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, slug, start_date, end_date, location, description, hero_image_url } = await req.json();
  if (!name || !slug) return NextResponse.json({ error: "Name and slug are required." }, { status: 400 });

  const db = getDb();

  const existing = db.prepare("SELECT id FROM events WHERE slug = ?").get(slug);
  if (existing) return NextResponse.json({ error: `Slug "${slug}" is already taken.` }, { status: 409 });

  const result = db.prepare(
    "INSERT INTO events (name, slug, start_date, end_date, location, description, hero_image_url, status) VALUES (?, ?, ?, ?, ?, ?, ?, 'active')"
  ).run(name, slug, start_date || null, end_date || null, location || null, description || null, hero_image_url || null);

  return NextResponse.json({ success: true, id: result.lastInsertRowid });
}
