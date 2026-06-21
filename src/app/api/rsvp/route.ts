import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function POST(req: NextRequest) {
  const { slug, name, status, answers } = await req.json();
  if (!name || !status) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  const db = getDb();
  const event = slug
    ? db.prepare("SELECT id FROM events WHERE slug = ?").get(slug) as { id: number } | undefined
    : db.prepare("SELECT id FROM events WHERE status = 'active' LIMIT 1").get() as { id: number } | undefined;

  if (!event) return NextResponse.json({ error: "No event found" }, { status: 404 });

  const result = db.prepare("INSERT INTO guests (event_id, name, status, responded_at) VALUES (?, ?, ?, datetime('now'))").run(event.id, name, status);
  const guestId = result.lastInsertRowid;

  if (answers && typeof answers === "object") {
    const stmt = db.prepare("INSERT INTO responses (guest_id, question_id, answer_value) VALUES (?, ?, ?)");
    for (const [questionId, value] of Object.entries(answers)) {
      stmt.run(guestId, parseInt(questionId), Array.isArray(value) ? JSON.stringify(value) : String(value));
    }
  }

  return NextResponse.json({ success: true, guestId });
}
