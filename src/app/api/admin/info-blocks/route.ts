import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { isAuthenticated } from "@/lib/auth";

export async function POST(req: NextRequest) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { eventId, title, body, icon, order } = await req.json();
  const db = getDb();
  db.prepare("INSERT INTO info_blocks (event_id, title, body, icon, \"order\") VALUES (?, ?, ?, ?, ?)").run(
    eventId, title, body, icon || null, order
  );
  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  const db = getDb();
  db.prepare("DELETE FROM info_blocks WHERE id = ?").run(parseInt(id));
  return NextResponse.json({ success: true });
}
