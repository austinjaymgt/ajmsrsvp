"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const C = { dark: "#233036", navy: "#244357", blue: "#AAD7EF", blueLight: "#daeef9", bg: "#FEFFFF", border: "#c8dde9", textSecondary: "#4a6272" };
const sf = { fontFamily: "var(--font-playfair), Georgia, serif" };
const ss = { fontFamily: "var(--font-inter), system-ui, sans-serif" };

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export default function NewEventForm() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", slug: "", start_date: "", end_date: "", location: "", description: "", hero_image_url: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [slugManual, setSlugManual] = useState(false);

  function setName(name: string) {
    setForm((f) => ({ ...f, name, slug: slugManual ? f.slug : slugify(name) }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/admin/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        const { id } = await res.json();
        router.push(`/admin/dashboard/${id}`);
      } else {
        const { error } = await res.json();
        setError(error ?? "Something went wrong.");
      }
    } finally {
      setSaving(false);
    }
  }

  const inputStyle: React.CSSProperties = { width: "100%", padding: "10px 12px", border: `1px solid ${C.border}`, background: C.blueLight, fontSize: "14px", color: C.dark, outline: "none", ...ss };
  const labelStyle: React.CSSProperties = { display: "block", marginBottom: "16px" };
  const labelTextStyle: React.CSSProperties = { fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.12em", color: C.textSecondary, display: "block", marginBottom: "6px", fontWeight: 600, ...ss };

  return (
    <div style={{ minHeight: "100vh", background: C.bg, ...ss }}>
      {/* Header */}
      <div style={{ background: C.dark, padding: "20px 32px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <a href="/admin/dashboard" style={{ fontSize: "10px", letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(170,215,239,0.7)", textDecoration: "none", fontWeight: 500, display: "block", marginBottom: "6px" }}>← All Events</a>
          <h1 style={{ ...sf, fontSize: "1.375rem", fontWeight: 700, margin: 0, color: C.bg, letterSpacing: "-0.01em" }}>New Event</h1>
        </div>
      </div>

      <div style={{ maxWidth: "560px", margin: "0 auto", padding: "48px 24px" }}>
        <form onSubmit={handleSubmit}>
          <label style={labelStyle}>
            <span style={labelTextStyle}>Event Name *</span>
            <input required value={form.name} onChange={(e) => setName(e.target.value)} style={inputStyle} placeholder="Homecoming 2027" />
          </label>

          <label style={labelStyle}>
            <span style={labelTextStyle}>
              URL Slug *{" "}
              <span style={{ color: C.textSecondary, fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>
                — will be /events/<strong>{form.slug || "your-slug"}</strong>
              </span>
            </span>
            <input
              required
              value={form.slug}
              onChange={(e) => { setSlugManual(true); setForm((f) => ({ ...f, slug: slugify(e.target.value) })); }}
              style={inputStyle}
              placeholder="homecoming-2027"
            />
          </label>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
            <label>
              <span style={labelTextStyle}>Start Date</span>
              <input type="date" value={form.start_date} onChange={(e) => setForm((f) => ({ ...f, start_date: e.target.value }))} style={inputStyle} />
            </label>
            <label>
              <span style={labelTextStyle}>End Date</span>
              <input type="date" value={form.end_date} onChange={(e) => setForm((f) => ({ ...f, end_date: e.target.value }))} style={inputStyle} />
            </label>
          </div>

          <label style={labelStyle}>
            <span style={labelTextStyle}>Location</span>
            <input value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} style={inputStyle} placeholder="City, State" />
          </label>

          <label style={labelStyle}>
            <span style={labelTextStyle}>Hero Image URL</span>
            <input value={form.hero_image_url} onChange={(e) => setForm((f) => ({ ...f, hero_image_url: e.target.value }))} style={inputStyle} placeholder="https://..." />
          </label>

          <label style={labelStyle}>
            <span style={labelTextStyle}>Description</span>
            <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={3} style={{ ...inputStyle, resize: "vertical" }} placeholder="A short description shown on the details page." />
          </label>

          {error && <p style={{ color: "#b91c1c", fontSize: "0.875rem", marginBottom: "16px" }}>{error}</p>}

          <div style={{ display: "flex", gap: "12px" }}>
            <button type="submit" disabled={saving || !form.name || !form.slug} style={{ background: saving || !form.name || !form.slug ? C.border : C.dark, color: saving || !form.name || !form.slug ? C.textSecondary : C.bg, border: "none", padding: "12px 32px", cursor: "pointer", fontSize: "10px", letterSpacing: "0.15em", textTransform: "uppercase", fontWeight: 700, opacity: saving ? 0.7 : 1 }}>
              {saving ? "Creating…" : "Create Event"}
            </button>
            <a href="/admin/dashboard" style={{ padding: "12px 24px", border: `1px solid ${C.border}`, color: C.textSecondary, fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase", textDecoration: "none", display: "inline-flex", alignItems: "center" }}>
              Cancel
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}
