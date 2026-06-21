import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { isAuthenticated } from "@/lib/auth";

export async function PUT(req: NextRequest) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id, name, start_date, end_date, location, hero_image_url, description } = await req.json();
  const db = getDb();
  db.prepare("UPDATE events SET name=?, start_date=?, end_date=?, location=?, hero_image_url=?, description=? WHERE id=?").run(
    name, start_date, end_date, location, hero_image_url || null, description, id
  );
  return NextResponse.json({ success: true });
}
