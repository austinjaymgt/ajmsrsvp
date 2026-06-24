import { redirect } from "next/navigation";
import Link from "next/link";
import { isAuthenticated } from "@/lib/auth";
import { supabase } from "@/lib/db";

export const dynamic = "force-dynamic";

type Event = { id: number; name: string; slug: string; start_date: string; end_date: string; location: string; status: string };
type Guest = { event_id: number; status: string };

const C = { dark: "#233036", navy: "#244357", blue: "#AAD7EF", blueLight: "#daeef9", bg: "#FEFFFF", border: "#c8dde9", textSecondary: "#4a6272" };
const sf = { fontFamily: "var(--font-playfair), Georgia, serif" };
const ss = { fontFamily: "var(--font-inter), system-ui, sans-serif" };

export default async function AdminDashboardPage() {
  const authed = await isAuthenticated();
  if (!authed) redirect("/admin");

  const { data: eventsData } = await supabase.from("events").select("*").order("start_date", { ascending: false });
  const events = (eventsData ?? []) as Event[];
  const { data: guestsData } = await supabase.from("guests").select("event_id, status");
  const allGuests = (guestsData ?? []) as Guest[];

  function guestCount(eventId: number, status?: string) {
    return allGuests.filter((g) => g.event_id === eventId && (status ? g.status === status : true)).length;
  }

  function formatDate(d: string) {
    return new Date(d + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }

  return (
    <div style={{ minHeight: "100vh", background: C.bg, ...ss }}>
      {/* Header */}
      <div style={{ background: C.dark, padding: "20px 32px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <p style={{ fontSize: "10px", letterSpacing: "0.25em", textTransform: "uppercase", color: C.blue, marginBottom: "4px", fontWeight: 600 }}>Austin Jay Management — Admin</p>
          <h1 style={{ ...sf, fontSize: "1.375rem", fontWeight: 700, margin: 0, color: C.bg, letterSpacing: "-0.01em" }}>Events</h1>
        </div>
        <a href="/api/admin/logout" style={{ background: "none", border: `1px solid rgba(170,215,239,0.3)`, color: C.bg, padding: "8px 20px", cursor: "pointer", fontSize: "10px", letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 500, textDecoration: "none" }}>
          Sign out
        </a>
      </div>

      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "40px 24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px" }}>
          <h2 style={{ ...sf, fontSize: "1.25rem", fontWeight: 700, margin: 0, color: C.dark }}>All Events</h2>
          <Link href="/admin/dashboard/new" style={{ background: C.dark, color: C.bg, padding: "10px 20px", fontSize: "10px", letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 700, textDecoration: "none", ...ss }}>
            + New Event
          </Link>
        </div>

        {events.length === 0 && (
          <div style={{ textAlign: "center", padding: "80px 0", color: C.textSecondary }}>
            <p style={{ fontSize: "1.25rem", ...sf, marginBottom: "8px" }}>No events yet.</p>
            <p style={{ ...ss, fontSize: "0.9375rem" }}>Create your first event to get started.</p>
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {events.map((event) => {
            const confirmed = guestCount(event.id, "confirmed");
            const total = guestCount(event.id);
            return (
              <div key={event.id} style={{ background: C.bg, border: `1px solid ${C.border}`, padding: "20px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                    <h3 style={{ ...sf, fontSize: "1.125rem", fontWeight: 700, margin: 0, color: C.dark }}>{event.name}</h3>
                    <span style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", padding: "3px 8px", background: event.status === "active" ? "#d4edda" : C.blueLight, color: event.status === "active" ? "#0f5132" : C.textSecondary }}>
                      {event.status}
                    </span>
                  </div>
                  <p style={{ color: C.textSecondary, fontSize: "13px", ...ss, margin: 0 }}>
                    {event.location} · {event.start_date ? formatDate(event.start_date) : "Dates TBD"}
                  </p>
                  <p style={{ color: C.blue, fontSize: "12px", ...ss, margin: "4px 0 0", fontWeight: 600 }}>
                    {confirmed} confirmed · {total} total RSVPs
                  </p>
                </div>
                <div style={{ display: "flex", gap: "10px" }}>
                  <Link href={`/events/${event.slug}/details`} target="_blank" style={{ fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase", textDecoration: "none", padding: "9px 16px", border: `1px solid ${C.border}`, color: C.textSecondary, ...ss, fontWeight: 500 }}>
                    View site ↗
                  </Link>
                  <Link href={`/admin/dashboard/${event.id}`} style={{ fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase", textDecoration: "none", padding: "9px 16px", background: C.dark, color: C.bg, ...ss, fontWeight: 700 }}>
                    Manage
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
