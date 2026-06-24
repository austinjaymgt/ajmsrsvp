import Link from "next/link";
import { supabase } from "@/lib/db";

export const dynamic = "force-dynamic";

type Event = { id: number; name: string; slug: string; start_date: string; end_date: string; location: string; hero_image_url: string | null; description: string };

const C = { dark: "#233036", navy: "#244357", blue: "#AAD7EF", blueLight: "#daeef9", bg: "#FEFFFF", border: "#c8dde9", textSecondary: "#4a6272" };
const sf = { fontFamily: "var(--font-playfair), Georgia, serif" };
const ss = { fontFamily: "var(--font-inter), system-ui, sans-serif" };

function formatDateRange(start: string, end: string) {
  const s = new Date(start + "T00:00:00");
  const e = new Date(end + "T00:00:00");
  const mo = (d: Date) => d.toLocaleDateString("en-US", { month: "long" });
  const da = (d: Date) => d.toLocaleDateString("en-US", { day: "numeric" });
  const yr = (d: Date) => d.getFullYear();
  if (mo(s) === mo(e)) return `${mo(s)} ${da(s)}–${da(e)}, ${yr(s)}`;
  return `${mo(s)} ${da(s)} – ${mo(e)} ${da(e)}, ${yr(s)}`;
}

export default async function HomePage() {
  const { data } = await supabase.from("events").select("*").eq("status", "active").order("start_date", { ascending: true });
  const events = (data ?? []) as Event[];

  // Single event — hero landing
  if (events.length === 1) {
    const event = events[0];
    return (
      <main style={{
        minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        background: event.hero_image_url
          ? `linear-gradient(rgba(35,48,54,0.6), rgba(35,48,54,0.6)), url('${event.hero_image_url}') center/cover no-repeat`
          : `linear-gradient(135deg, ${C.dark} 0%, ${C.navy} 60%, #1a2a35 100%)`,
      }}>
        <div style={{ textAlign: "center", padding: "0 24px", maxWidth: "680px" }}>
          <p style={{ fontSize: "10px", letterSpacing: "0.3em", textTransform: "uppercase", color: C.blue, ...ss, marginBottom: "28px", fontWeight: 500 }}>
            Austin Jay Management — Events
          </p>
          <h1 style={{ fontSize: "clamp(2.75rem, 8vw, 5.5rem)", fontWeight: 700, color: C.bg, ...sf, lineHeight: 1.05, marginBottom: "20px", letterSpacing: "-0.01em" }}>
            {event.name}
          </h1>
          <p style={{ fontSize: "1rem", color: "rgba(254,255,255,0.7)", ...ss, marginBottom: "6px", letterSpacing: "0.03em" }}>
            {event.location}
          </p>
          {event.start_date && (
            <p style={{ fontSize: "0.875rem", color: "rgba(170,215,239,0.8)", ...ss, marginBottom: "60px", letterSpacing: "0.05em" }}>
              {formatDateRange(event.start_date, event.end_date)}
            </p>
          )}
          <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href={`/events/${event.slug}/details`} style={{ display: "inline-block", padding: "15px 36px", fontSize: "11px", letterSpacing: "0.15em", textTransform: "uppercase", textDecoration: "none", background: "transparent", border: "1px solid rgba(170,215,239,0.5)", color: C.bg, ...ss, fontWeight: 500 }}>
              See the weekend
            </Link>
            <Link href={`/events/${event.slug}/rsvp`} style={{ display: "inline-block", padding: "15px 36px", fontSize: "11px", letterSpacing: "0.15em", textTransform: "uppercase", textDecoration: "none", background: C.blue, border: `1px solid ${C.blue}`, color: C.dark, ...ss, fontWeight: 700 }}>
              RSVP now
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // Multiple events — index grid
  return (
    <div style={{ minHeight: "100vh", background: C.bg }}>
      <div style={{ background: C.dark, padding: "32px 40px" }}>
        <p style={{ fontSize: "10px", letterSpacing: "0.3em", textTransform: "uppercase", color: C.blue, ...ss, marginBottom: "8px", fontWeight: 500 }}>
          Austin Jay Management
        </p>
        <h1 style={{ fontSize: "2rem", fontWeight: 700, color: C.bg, ...sf, margin: 0, letterSpacing: "-0.01em" }}>
          Upcoming Events
        </h1>
      </div>

      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "60px 24px" }}>
        {events.length === 0 && (
          <p style={{ color: C.textSecondary, textAlign: "center", ...ss }}>No upcoming events yet.</p>
        )}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "24px" }}>
          {events.map((event) => (
            <div key={event.id} style={{ background: C.bg, border: `1px solid ${C.border}`, overflow: "hidden" }}>
              {event.hero_image_url
                ? <div style={{ height: "180px", background: `linear-gradient(rgba(35,48,54,0.3), rgba(35,48,54,0.3)), url('${event.hero_image_url}') center/cover` }} />
                : <div style={{ height: "180px", background: `linear-gradient(135deg, ${C.dark}, ${C.navy})` }} />
              }
              <div style={{ padding: "24px" }}>
                <p style={{ fontSize: "10px", letterSpacing: "0.15em", textTransform: "uppercase", color: C.blue, ...ss, marginBottom: "8px", fontWeight: 600 }}>
                  {event.start_date ? formatDateRange(event.start_date, event.end_date) : "Dates TBD"}
                </p>
                <h2 style={{ fontSize: "1.375rem", fontWeight: 700, color: C.dark, ...sf, marginBottom: "6px", letterSpacing: "-0.01em" }}>
                  {event.name}
                </h2>
                <p style={{ fontSize: "0.875rem", color: C.textSecondary, ...ss, marginBottom: "20px" }}>
                  {event.location}
                </p>
                <div style={{ display: "flex", gap: "12px" }}>
                  <Link href={`/events/${event.slug}/details`} style={{ fontSize: "10px", letterSpacing: "0.12em", textTransform: "uppercase", textDecoration: "none", padding: "10px 20px", background: C.dark, color: C.bg, ...ss, fontWeight: 700 }}>
                    Details
                  </Link>
                  <Link href={`/events/${event.slug}/rsvp`} style={{ fontSize: "10px", letterSpacing: "0.12em", textTransform: "uppercase", textDecoration: "none", padding: "10px 20px", background: C.blueLight, color: C.dark, ...ss, fontWeight: 600 }}>
                    RSVP
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
