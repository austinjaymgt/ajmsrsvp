import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { isAuthenticated } from "@/lib/auth";

export async function POST(req: NextRequest) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { eventId, type, label, options, required, order } = await req.json();
  const db = getDb();
  db.prepare("INSERT INTO questions (event_id, type, label, options, required, \"order\") VALUES (?, ?, ?, ?, ?, ?)").run(
    eventId, type, label, options ? JSON.stringify(options) : null, required ? 1 : 0, order
  );
  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  const db = getDb();
  db.prepare("DELETE FROM responses WHERE question_id = ?").run(parseInt(id));
  db.prepare("DELETE FROM questions WHERE id = ?").run(parseInt(id));
  return NextResponse.json({ success: true });
}
