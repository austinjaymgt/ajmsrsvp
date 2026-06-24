import Link from "next/link";

const C = { dark: "#233036", blue: "#AAD7EF", border: "#c8dde9", textSecondary: "#4a6272", bg: "#FEFFFF" };

export default async function RSVPDonePage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ name?: string }> }) {
  const { slug } = await params;
  const { name = "Friend" } = await searchParams;
  const first = name.split(" ")[0];

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px", background: C.bg, textAlign: "center" }}>
      <div style={{ maxWidth: "480px" }}>
        <div style={{ fontSize: "2.5rem", marginBottom: "24px" }}>🎉</div>
        <h1 style={{ fontSize: "2.5rem", fontWeight: 700, color: C.dark, fontFamily: "var(--font-playfair), Georgia, serif", marginBottom: "16px", letterSpacing: "-0.01em" }}>
          You&apos;re noted, {first}!
        </h1>
        <p style={{ color: C.textSecondary, lineHeight: 1.7, fontFamily: "var(--font-inter), system-ui, sans-serif", fontSize: "0.9375rem", marginBottom: "48px" }}>
          Your RSVP is locked in. We&apos;ll be in touch closer to the date with all the details.
        </p>
        <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
          <Link href={`/events/${slug}/details`} style={{ display: "inline-block", padding: "16px 36px", fontSize: "10px", letterSpacing: "0.15em", textTransform: "uppercase", textDecoration: "none", background: C.dark, color: C.bg, fontFamily: "var(--font-inter), system-ui, sans-serif", fontWeight: 700 }}>
            See the weekend
          </Link>
          <Link href="/" style={{ display: "inline-block", padding: "16px 36px", fontSize: "10px", letterSpacing: "0.15em", textTransform: "uppercase", textDecoration: "none", background: "transparent", border: `1px solid ${C.border}`, color: C.textSecondary, fontFamily: "var(--font-inter), system-ui, sans-serif" }}>
            All events
          </Link>
        </div>
      </div>
    </div>
  );
}
