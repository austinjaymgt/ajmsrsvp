import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

type RawQuestion = { id: number; type: string; label: string; options: string | null; order: number; required: number };

export async function GET(req: NextRequest) {
  const slug = new URL(req.url).searchParams.get("slug");
  const db = getDb();

  const event = slug
    ? db.prepare("SELECT id FROM events WHERE slug = ?").get(slug) as { id: number } | undefined
    : db.prepare("SELECT id FROM events WHERE status = 'active' LIMIT 1").get() as { id: number } | undefined;

  if (!event) return NextResponse.json({ questions: [] });

  const rows = db.prepare(`SELECT * FROM questions WHERE event_id = ? ORDER BY "order"`).all(event.id) as RawQuestion[];
  const questions = rows.map((q) => ({ ...q, options: q.options ? JSON.parse(q.options) : null, required: !!q.required }));
  return NextResponse.json({ questions });
}
