import Link from "next/link";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

type Event = { id: number; name: string; start_date: string; end_date: string; location: string; description: string; hero_image_url: string | null };
type ItineraryItem = { id: number; day_label: string; time: string | null; title: string; description: string | null; order: number };
type Photo = { id: number; url: string; caption: string | null; category: string };
type InfoBlock = { id: number; title: string; body: string; icon: string | null };
type Guest = { status: string };

const C = {
  dark: "#233036",
  navy: "#244357",
  blue: "#AAD7EF",
  blueLight: "#daeef9",
  bg: "#FEFFFF",
  border: "#c8dde9",
  textSecondary: "#4a6272",
};

const sf = { fontFamily: "var(--font-playfair), Georgia, serif" };
const ss = { fontFamily: "var(--font-inter), system-ui, sans-serif" };

function formatDate(d: string) {
  return new Date(d + "T00:00:00").toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

export default function DetailsPage() {
  const db = getDb();
  const event = db.prepare("SELECT * FROM events WHERE status = 'active' LIMIT 1").get() as Event | undefined;
  if (!event) return <div style={{ padding: 40 }}>No event found.</div>;

  const itinerary = db.prepare(`SELECT * FROM itinerary_items WHERE event_id = ? ORDER BY "order"`).all(event.id) as ItineraryItem[];
  const photos = db.prepare(`SELECT * FROM photos WHERE event_id = ? ORDER BY "order"`).all(event.id) as Photo[];
  const infoBlocks = db.prepare(`SELECT * FROM info_blocks WHERE event_id = ? ORDER BY "order"`).all(event.id) as InfoBlock[];
  const guests = db.prepare("SELECT status FROM guests WHERE event_id = ?").all(event.id) as Guest[];

  const totalInvited = 8;
  const confirmed = guests.filter((g) => g.status === "confirmed").length;

  const days: Record<string, ItineraryItem[]> = {};
  for (const item of itinerary) {
    if (!days[item.day_label]) days[item.day_label] = [];
    days[item.day_label].push(item);
  }

  const accommodationPhotos = photos.filter((p) => p.category === "accommodation");

  return (
    <div style={{ background: C.bg, minHeight: "100vh" }}>
      {/* Nav */}
      <nav
        style={{
          position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
          display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "18px 40px",
          background: "rgba(254,255,255,0.94)",
          backdropFilter: "blur(12px)",
          borderBottom: `1px solid ${C.border}`,
        }}
      >
        <Link href="/" style={{ textDecoration: "none", color: C.dark, fontSize: "12px", letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 500, ...ss }}>
          ← Home
        </Link>
        <span style={{ fontSize: "11px", color: C.textSecondary, letterSpacing: "0.15em", textTransform: "uppercase", fontWeight: 500, ...ss }}>
          Austin Jay Management
        </span>
        <Link href="/rsvp" style={{
          textDecoration: "none", fontSize: "10px", letterSpacing: "0.15em", textTransform: "uppercase",
          padding: "10px 24px", background: C.dark, color: "#FEFFFF", fontWeight: 600, ...ss,
        }}>
          RSVP
        </Link>
      </nav>

      {/* Hero */}
      <section style={{
        minHeight: "55vh", display: "flex", alignItems: "center", justifyContent: "center",
        background: event.hero_image_url
          ? `linear-gradient(rgba(35,48,54,0.55), rgba(35,48,54,0.55)), url('${event.hero_image_url}') center/cover`
          : `linear-gradient(135deg, ${C.dark} 0%, ${C.navy} 100%)`,
        textAlign: "center", padding: "120px 24px 80px",
      }}>
        <div>
          <p style={{ fontSize: "10px", letterSpacing: "0.3em", textTransform: "uppercase", color: C.blue, ...ss, marginBottom: "16px", fontWeight: 500 }}>
            Austin Jay Management — Events
          </p>
          <h1 style={{ fontSize: "clamp(2.5rem, 6vw, 4.5rem)", fontWeight: 700, color: "#FEFFFF", ...sf, marginBottom: "14px", letterSpacing: "-0.01em" }}>
            {event.name}
          </h1>
          <p style={{ fontSize: "0.9375rem", color: "rgba(254,255,255,0.65)", ...ss, letterSpacing: "0.05em" }}>
            {event.location} &nbsp;·&nbsp; {formatDate(event.start_date)} – {formatDate(event.end_date)}
          </p>
        </div>
      </section>

      {/* Description */}
      {event.description && (
        <section style={{ maxWidth: "620px", margin: "0 auto", padding: "72px 24px 0" }}>
          <p style={{ fontSize: "1.2rem", lineHeight: 1.8, color: C.dark, textAlign: "center", ...sf }}>
            {event.description}
          </p>
        </section>
      )}

      {/* Accommodation Photos */}
      {accommodationPhotos.length > 0 && (
        <section style={{ padding: "72px 24px 0", maxWidth: "1100px", margin: "0 auto" }}>
          <h2 style={{ fontSize: "1.875rem", fontWeight: 700, color: C.dark, textAlign: "center", marginBottom: "8px", ...sf }}>
            The Stay
          </h2>
          <p style={{ textAlign: "center", color: C.textSecondary, marginBottom: "40px", ...ss, fontSize: "0.9375rem" }}>
            Your home for the weekend.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "12px" }}>
            {accommodationPhotos.map((p) => (
              <div key={p.id} style={{ position: "relative", aspectRatio: "4/3", overflow: "hidden", background: C.blueLight }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.url} alt={p.caption ?? ""} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                {p.caption && (
                  <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "8px 12px", background: "rgba(35,48,54,0.7)", color: "#FEFFFF", fontSize: "12px", ...ss }}>
                    {p.caption}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Itinerary */}
      {Object.keys(days).length > 0 && (
        <section style={{ padding: "72px 24px 0", maxWidth: "760px", margin: "0 auto" }}>
          <h2 style={{ fontSize: "1.875rem", fontWeight: 700, color: C.dark, textAlign: "center", marginBottom: "8px", ...sf }}>
            The Weekend
          </h2>
          <p style={{ textAlign: "center", color: C.textSecondary, marginBottom: "48px", ...ss, fontSize: "0.9375rem" }}>
            A loose plan. Subject to good vibes.
          </p>
          {Object.entries(days).map(([day, items]) => (
            <div key={day} style={{ marginBottom: "48px" }}>
              <h3 style={{
                fontSize: "10px", letterSpacing: "0.2em", textTransform: "uppercase", color: C.navy,
                fontWeight: 700, ...ss, marginBottom: "20px", paddingBottom: "12px", borderBottom: `2px solid ${C.blue}`,
              }}>
                {day}
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                {items.map((item) => (
                  <div key={item.id} style={{ display: "flex", gap: "24px" }}>
                    <div style={{ width: "100px", flexShrink: 0, color: C.blue, fontSize: "12px", ...ss, paddingTop: "2px", fontWeight: 600, letterSpacing: "0.03em" }}>
                      {item.time ?? ""}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, color: C.dark, marginBottom: "4px", ...ss, fontSize: "0.9375rem" }}>{item.title}</div>
                      {item.description && (
                        <div style={{ color: C.textSecondary, fontSize: "0.875rem", lineHeight: 1.65, ...ss }}>{item.description}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </section>
      )}

      {/* Good to Know */}
      {infoBlocks.length > 0 && (
        <section style={{ padding: "72px 24px 0", maxWidth: "900px", margin: "0 auto" }}>
          <h2 style={{ fontSize: "1.875rem", fontWeight: 700, color: C.dark, textAlign: "center", marginBottom: "8px", ...sf }}>
            Good to Know
          </h2>
          <p style={{ textAlign: "center", color: C.textSecondary, marginBottom: "40px", ...ss, fontSize: "0.9375rem" }}>
            Everything you need before you pack.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "16px" }}>
            {infoBlocks.map((block) => (
              <div key={block.id} style={{ background: C.blueLight, border: `1px solid ${C.border}`, padding: "28px", borderRadius: "2px" }}>
                {block.icon && <div style={{ fontSize: "22px", marginBottom: "12px" }}>{block.icon}</div>}
                <h4 style={{ fontWeight: 700, color: C.dark, marginBottom: "10px", fontSize: "0.9375rem", ...ss }}>{block.title}</h4>
                <p style={{ color: C.textSecondary, fontSize: "0.875rem", lineHeight: 1.65, ...ss, margin: 0 }}>{block.body}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Headcount */}
      <section style={{ padding: "72px 24px 0", textAlign: "center" }}>
        <div style={{ display: "inline-block", background: C.dark, padding: "40px 64px", borderRadius: "2px" }}>
          <p style={{ fontSize: "3rem", fontWeight: 700, color: C.blue, ...sf, margin: 0, letterSpacing: "-0.02em" }}>
            {confirmed} of {totalInvited}
          </p>
          <p style={{ color: "rgba(254,255,255,0.6)", fontSize: "0.875rem", ...ss, marginTop: "8px", marginBottom: 0, letterSpacing: "0.05em", textTransform: "uppercase" }}>
            confirmed for the weekend
          </p>
        </div>
      </section>

      {/* RSVP CTA */}
      <section style={{ padding: "80px 24px 100px", textAlign: "center" }}>
        <h2 style={{ fontSize: "2.25rem", fontWeight: 700, color: C.dark, marginBottom: "16px", ...sf }}>You in?</h2>
        <p style={{ color: C.textSecondary, marginBottom: "32px", ...ss, fontSize: "1rem" }}>
          Takes about 2 minutes to lock in your spot.
        </p>
        <Link href="/rsvp" style={{
          display: "inline-block", padding: "18px 48px", fontSize: "11px", letterSpacing: "0.15em",
          textTransform: "uppercase", textDecoration: "none", background: C.dark, color: "#FEFFFF",
          fontWeight: 600, ...ss,
        }}>
          RSVP now
        </Link>
      </section>
    </div>
  );
}
