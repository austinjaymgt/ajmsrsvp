import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { isAuthenticated } from "@/lib/auth";

export async function POST(req: NextRequest) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { eventId, day_label, time, title, description, order } = await req.json();
  const db = getDb();
  db.prepare("INSERT INTO itinerary_items (event_id, day_label, time, title, description, \"order\") VALUES (?, ?, ?, ?, ?, ?)").run(
    eventId, day_label, time || null, title, description || null, order
  );
  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  const db = getDb();
  db.prepare("DELETE FROM itinerary_items WHERE id = ?").run(parseInt(id));
  return NextResponse.json({ success: true });
}
