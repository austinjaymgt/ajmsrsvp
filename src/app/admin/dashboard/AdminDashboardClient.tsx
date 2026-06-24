"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type CostItem = { label: string; amount: string };
type Event = { id: number; name: string; slug: string; start_date: string; end_date: string; location: string; hero_image_url: string | null; description: string; cost_items: CostItem[] | null; cost_note: string | null };
type Guest = { id: number; name: string; email: string | null; status: string; responded_at: string };
type Question = { id: number; type: string; label: string; options: string[] | null; order: number; required: boolean };
type ItineraryItem = { id: number; day_label: string; time: string | null; title: string; description: string | null; order: number };
type Photo = { id: number; url: string; caption: string | null; category: string; order: number };
type InfoBlock = { id: number; title: string; body: string; icon: string | null; order: number };
type Response = { guest_id: number; question_id: number; answer_value: string | null };

const C = { dark: "#233036", navy: "#244357", blue: "#AAD7EF", blueLight: "#daeef9", bg: "#FEFFFF", border: "#c8dde9", textSecondary: "#4a6272" };
const ss = { fontFamily: "var(--font-inter), system-ui, sans-serif" };
const sf = { fontFamily: "var(--font-playfair), Georgia, serif" };

const navItems = ["Guests", "Questions", "Itinerary", "Photos", "Info Blocks", "Cost", "Event Settings"];

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, { bg: string; color: string }> = {
    confirmed: { bg: "#d4edda", color: "#0f5132" },
    maybe: { bg: "#fff3cd", color: "#856404" },
    declined: { bg: "#f8d7da", color: "#842029" },
    pending: { bg: C.blueLight, color: C.textSecondary },
  };
  const c = colors[status] ?? colors.pending;
  return (
    <span style={{ ...ss, fontSize: "11px", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", padding: "3px 10px", borderRadius: "2px", background: c.bg, color: c.color }}>
      {status}
    </span>
  );
}

function ActionBtn({ label, onClick, disabled = false }: { label: string; onClick: () => void; disabled?: boolean }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{ background: disabled ? C.border : C.dark, color: disabled ? C.textSecondary : C.bg, border: "none", padding: "10px 20px", cursor: disabled ? "default" : "pointer", fontSize: "10px", letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 600, ...ss, opacity: disabled ? 0.6 : 1 }}>
      {label}
    </button>
  );
}

function InputField({ label, value, onChange, type = "input", rows = 3 }: { label: string; value: string; onChange: (v: string) => void; type?: "input" | "textarea" | "select"; rows?: number }) {
  const baseStyle: React.CSSProperties = { width: "100%", padding: "10px 12px", border: `1px solid ${C.border}`, background: C.blueLight, fontSize: "14px", color: C.dark, ...ss, outline: "none" };
  return (
    <label style={{ display: "block", marginBottom: "14px" }}>
      <span style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.12em", color: C.textSecondary, display: "block", marginBottom: "6px", fontWeight: 600, ...ss }}>{label}</span>
      {type === "textarea"
        ? <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={rows} style={{ ...baseStyle, resize: "vertical" }} />
        : <input value={value} onChange={(e) => onChange(e.target.value)} style={baseStyle} />}
    </label>
  );
}

export default function AdminDashboardClient({ event, guests, questions, itinerary, photos, infoBlocks, responses }: {
  event: Event; guests: Guest[]; questions: Question[]; itinerary: ItineraryItem[]; photos: Photo[]; infoBlocks: InfoBlock[]; responses: Response[];
}) {
  const [tab, setTab] = useState("Guests");
  const router = useRouter();

  const confirmed = guests.filter((g) => g.status === "confirmed").length;
  const maybe = guests.filter((g) => g.status === "maybe").length;
  const declined = guests.filter((g) => g.status === "declined").length;
  const pending = guests.filter((g) => g.status === "pending").length;

  async function logout() {
    await fetch("/api/admin/auth", { method: "DELETE" });
    router.push("/admin");
  }

  function getAnswer(guestId: number, questionId: number) {
    const r = responses.find((r) => r.guest_id === guestId && r.question_id === questionId);
    if (!r?.answer_value) return "—";
    try {
      const parsed = JSON.parse(r.answer_value);
      if (Array.isArray(parsed)) return parsed.join(", ");
      return r.answer_value;
    } catch { return r.answer_value; }
  }

  function exportCSV() {
    const headers = ["Name", "Email", "Status", "Responded At", ...questions.map((q) => q.label)];
    const rows = guests.map((g) => [g.name, g.email ?? "", g.status, g.responded_at, ...questions.map((q) => getAnswer(g.id, q.id))]);
    const csv = [headers, ...rows].map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "guests.csv"; a.click();
  }

  return (
    <div style={{ minHeight: "100vh", background: C.bg, ...ss }}>
      {/* Header */}
      <div style={{ background: C.dark, color: C.bg, padding: "20px 32px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <a href="/admin/dashboard" style={{ fontSize: "10px", letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(170,215,239,0.7)", textDecoration: "none", fontWeight: 500, display: "block", marginBottom: "6px" }}>← All Events</a>
          <h1 style={{ ...sf, fontSize: "1.375rem", fontWeight: 700, margin: 0, color: C.bg, letterSpacing: "-0.01em" }}>{event.name}</h1>
        </div>
        <button onClick={logout} style={{ background: "none", border: `1px solid rgba(170,215,239,0.3)`, color: C.bg, padding: "8px 20px", cursor: "pointer", fontSize: "10px", letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 500 }}>
          Sign out
        </button>
      </div>

      {/* Stats bar */}
      <div style={{ background: C.blueLight, borderBottom: `1px solid ${C.border}`, padding: "20px 32px", display: "flex", gap: "40px", flexWrap: "wrap" }}>
        {[
          { label: "Confirmed", count: confirmed, color: "#0f5132" },
          { label: "Maybe", count: maybe, color: "#856404" },
          { label: "Declined", count: declined, color: "#842029" },
          { label: "Pending", count: pending, color: C.textSecondary },
          { label: "Total RSVPs", count: guests.length, color: C.dark },
        ].map(({ label, count, color }) => (
          <div key={label}>
            <div style={{ fontSize: "2rem", fontWeight: 700, color, ...sf, letterSpacing: "-0.02em" }}>{count}</div>
            <div style={{ fontSize: "10px", color: C.textSecondary, textTransform: "uppercase", letterSpacing: "0.12em", fontWeight: 600 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Nav tabs */}
      <div style={{ background: C.bg, borderBottom: `1px solid ${C.border}`, padding: "0 32px", display: "flex" }}>
        {navItems.map((item) => (
          <button key={item} onClick={() => setTab(item)} style={{
            padding: "16px 18px", background: "none", border: "none",
            borderBottom: `2px solid ${tab === item ? C.dark : "transparent"}`,
            color: tab === item ? C.dark : C.textSecondary,
            cursor: "pointer", fontSize: "12px", fontWeight: tab === item ? 700 : 400, letterSpacing: "0.02em",
          }}>
            {item}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ padding: "32px" }}>

        {tab === "Guests" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h2 style={{ ...sf, fontSize: "1.375rem", fontWeight: 700, margin: 0 }}>Guest List</h2>
              <ActionBtn label="Export CSV" onClick={exportCSV} />
            </div>
            <div style={{ background: C.bg, border: `1px solid ${C.border}`, overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${C.border}`, background: C.blueLight }}>
                    {["Name", "Email", "Status", "Responded", ...questions.map((q) => q.label.length > 28 ? q.label.slice(0, 28) + "…" : q.label)].map((h) => (
                      <th key={h} style={{ textAlign: "left", padding: "12px 16px", color: C.textSecondary, fontWeight: 700, textTransform: "uppercase", fontSize: "10px", letterSpacing: "0.12em" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {guests.length === 0 && (
                    <tr><td colSpan={4 + questions.length} style={{ padding: "40px 16px", textAlign: "center", color: C.textSecondary }}>No guests yet.</td></tr>
                  )}
                  {guests.map((g) => (
                    <tr key={g.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                      <td style={{ padding: "14px 16px", color: C.dark, fontWeight: 600 }}>{g.name}</td>
                      <td style={{ padding: "14px 16px" }}>
                        {g.email
                          ? <span onClick={() => navigator.clipboard.writeText(g.email!)} title="Click to copy" style={{ color: C.navy, cursor: "pointer", fontFamily: "monospace", fontSize: "12px", textDecoration: "underline dotted" }}>{g.email}</span>
                          : <span style={{ color: C.border }}>—</span>}
                      </td>
                      <td style={{ padding: "14px 16px" }}><StatusBadge status={g.status} /></td>
                      <td style={{ padding: "14px 16px", color: C.textSecondary }}>{g.responded_at ? new Date(g.responded_at).toLocaleDateString() : "—"}</td>
                      {questions.map((q) => (
                        <td key={q.id} style={{ padding: "14px 16px", color: C.textSecondary, maxWidth: "200px" }}>{getAnswer(g.id, q.id)}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === "Questions" && <QuestionEditor eventId={event.id} questions={questions} onRefresh={() => router.refresh()} />}
        {tab === "Itinerary" && <ItineraryEditor eventId={event.id} items={itinerary} onRefresh={() => router.refresh()} />}
        {tab === "Photos" && <PhotoEditor eventId={event.id} photos={photos} onRefresh={() => router.refresh()} />}
        {tab === "Info Blocks" && <InfoBlockEditor eventId={event.id} blocks={infoBlocks} onRefresh={() => router.refresh()} />}
        {tab === "Cost" && <CostEditor event={event} onRefresh={() => router.refresh()} />}
        {tab === "Event Settings" && <EventSettingsEditor event={event} onRefresh={() => router.refresh()} />}
      </div>
    </div>
  );
}

// ── Question Editor ──────────────────────────────────────────────

function QuestionForm({ initial, onSave, onCancel, title }: {
  initial: { type: string; label: string; options: string; required: boolean };
  onSave: (f: { type: string; label: string; options: string; required: boolean }) => Promise<void>;
  onCancel: () => void;
  title: string;
}) {
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handle() {
    setSaving(true); setError("");
    try { await onSave(form); } catch (e) { setError(String(e)); } finally { setSaving(false); }
  }

  return (
    <div style={{ marginTop: "24px", background: C.blueLight, border: `1px solid ${C.border}`, padding: "24px" }}>
      <h3 style={{ ...sf, fontSize: "1.125rem", fontWeight: 700, marginBottom: "20px" }}>{title}</h3>
      <label style={{ display: "block", marginBottom: "14px" }}>
        <span style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.12em", color: C.textSecondary, display: "block", marginBottom: "6px", fontWeight: 600, ...ss }}>Type</span>
        <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} style={{ width: "100%", padding: "10px 12px", border: `1px solid ${C.border}`, background: C.bg, ...ss }}>
          <option value="single_line">Single line text</option>
          <option value="text">Long text</option>
          <option value="select">Single select</option>
          <option value="multiselect">Multi-select</option>
        </select>
      </label>
      <InputField label="Question label" value={form.label} onChange={(v) => setForm({ ...form, label: v })} />
      {(form.type === "select" || form.type === "multiselect") && (
        <InputField label="Options (one per line)" value={form.options} onChange={(v) => setForm({ ...form, options: v })} type="textarea" />
      )}
      <label style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px", cursor: "pointer" }}>
        <input type="checkbox" checked={form.required} onChange={(e) => setForm({ ...form, required: e.target.checked })} />
        <span style={{ fontSize: "14px", color: C.dark, ...ss }}>Required</span>
      </label>
      {error && <p style={{ color: "#b91c1c", fontSize: "13px", marginBottom: "12px" }}>{error}</p>}
      <div style={{ display: "flex", gap: "12px" }}>
        <ActionBtn label={saving ? "Saving…" : "Save"} onClick={handle} disabled={!form.label || saving} />
        <button onClick={onCancel} style={{ background: "none", border: `1px solid ${C.border}`, padding: "10px 24px", cursor: "pointer", fontSize: "11px", color: C.textSecondary, ...ss }}>Cancel</button>
      </div>
    </div>
  );
}

function QuestionEditor({ eventId, questions, onRefresh }: { eventId: number; questions: Question[]; onRefresh: () => void }) {
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  function toDbType(type: string) {
    if (type === "single_line") return "text";
    return type;
  }

  async function addQuestion(form: { type: string; label: string; options: string; required: boolean }) {
    const hasOptions = form.type === "select" || form.type === "multiselect";
    const options = hasOptions ? form.options.split("\n").map((s) => s.trim()).filter(Boolean) : null;
    const res = await fetch("/api/admin/questions", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eventId, type: toDbType(form.type), label: form.label, options, required: form.required, order: questions.length }),
    });
    if (!res.ok) { const d = await res.json(); throw new Error(d.error ?? "Failed to save"); }
    setAdding(false);
    onRefresh();
  }

  async function updateQuestion(id: number, form: { type: string; label: string; options: string; required: boolean }) {
    const hasOptions = form.type === "select" || form.type === "multiselect";
    const options = hasOptions ? form.options.split("\n").map((s) => s.trim()).filter(Boolean) : null;
    const res = await fetch("/api/admin/questions", {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, type: toDbType(form.type), label: form.label, options, required: form.required }),
    });
    if (!res.ok) { const d = await res.json(); throw new Error(d.error ?? "Failed to save"); }
    setEditingId(null);
    onRefresh();
  }

  async function deleteQuestion(id: number) {
    if (!confirm("Delete this question?")) return;
    await fetch(`/api/admin/questions?id=${id}`, { method: "DELETE" });
    onRefresh();
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h2 style={{ ...sf, fontSize: "1.375rem", fontWeight: 700, margin: 0 }}>RSVP Questions</h2>
        <ActionBtn label="+ Add Question" onClick={() => { setAdding(true); setEditingId(null); }} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {questions.map((q) => (
          <div key={q.id}>
            <div style={{ background: C.bg, border: `1px solid ${C.border}`, padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ fontWeight: 600, color: C.dark, marginBottom: "4px" }}>{q.label}</div>
                <div style={{ fontSize: "12px", color: C.textSecondary }}>
                  {q.type} · {q.required ? "required" : "optional"}{q.options && ` · ${q.options.join(", ")}`}
                </div>
              </div>
              <div style={{ display: "flex", gap: "12px" }}>
                <button onClick={() => setEditingId(editingId === q.id ? null : q.id)} style={{ background: "none", border: "none", color: C.navy, cursor: "pointer", fontSize: "12px", fontWeight: 600 }}>Edit</button>
                <button onClick={() => deleteQuestion(q.id)} style={{ background: "none", border: "none", color: "#b91c1c", cursor: "pointer", fontSize: "12px", fontWeight: 600 }}>Delete</button>
              </div>
            </div>
            {editingId === q.id && (
              <QuestionForm
                title="Edit Question"
                initial={{ type: q.type, label: q.label, options: q.options ? q.options.join("\n") : "", required: q.required }}
                onSave={(f) => updateQuestion(q.id, f)}
                onCancel={() => setEditingId(null)}
              />
            )}
          </div>
        ))}
        {questions.length === 0 && <p style={{ color: C.textSecondary, fontSize: "14px" }}>No questions yet.</p>}
      </div>
      {adding && (
        <QuestionForm
          title="New Question"
          initial={{ type: "single_line", label: "", options: "", required: true }}
          onSave={addQuestion}
          onCancel={() => setAdding(false)}
        />
      )}
    </div>
  );
}

// ── Itinerary Editor ─────────────────────────────────────────────

function ItineraryEditor({ eventId, items, onRefresh }: { eventId: number; items: ItineraryItem[]; onRefresh: () => void }) {
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ day_label: "", time: "", title: "", description: "" });

  async function addItem() {
    await fetch("/api/admin/itinerary", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, eventId, order: items.length }),
    });
    setAdding(false); setForm({ day_label: "", time: "", title: "", description: "" }); onRefresh();
  }

  async function deleteItem(id: number) {
    if (!confirm("Delete this item?")) return;
    await fetch(`/api/admin/itinerary?id=${id}`, { method: "DELETE" }); onRefresh();
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h2 style={{ ...sf, fontSize: "1.375rem", fontWeight: 700, margin: 0 }}>Itinerary</h2>
        <ActionBtn label="+ Add Item" onClick={() => setAdding(true)} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {items.map((item) => (
          <div key={item.id} style={{ background: C.bg, border: `1px solid ${C.border}`, padding: "14px 20px", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.12em", color: C.blue, marginBottom: "4px", fontWeight: 700 }}>{item.day_label}{item.time && ` · ${item.time}`}</div>
              <div style={{ fontWeight: 600, color: C.dark }}>{item.title}</div>
              {item.description && <div style={{ fontSize: "13px", color: C.textSecondary, marginTop: "2px" }}>{item.description}</div>}
            </div>
            <button onClick={() => deleteItem(item.id)} style={{ background: "none", border: "none", color: "#b91c1c", cursor: "pointer", fontSize: "12px", fontWeight: 600 }}>Delete</button>
          </div>
        ))}
        {items.length === 0 && <p style={{ color: C.textSecondary, fontSize: "14px" }}>No itinerary items yet.</p>}
      </div>
      {adding && (
        <div style={{ marginTop: "24px", background: C.blueLight, border: `1px solid ${C.border}`, padding: "24px" }}>
          <h3 style={{ ...sf, fontSize: "1.125rem", fontWeight: 700, marginBottom: "20px" }}>New Item</h3>
          <InputField label="Day (e.g. Friday, Oct 9)" value={form.day_label} onChange={(v) => setForm({ ...form, day_label: v })} />
          <InputField label="Time (optional)" value={form.time} onChange={(v) => setForm({ ...form, time: v })} />
          <InputField label="Title" value={form.title} onChange={(v) => setForm({ ...form, title: v })} />
          <InputField label="Description (optional)" value={form.description} onChange={(v) => setForm({ ...form, description: v })} />
          <div style={{ display: "flex", gap: "12px" }}>
            <ActionBtn label="Save" onClick={addItem} disabled={!form.day_label || !form.title} />
            <button onClick={() => setAdding(false)} style={{ background: "none", border: `1px solid ${C.border}`, padding: "10px 24px", cursor: "pointer", fontSize: "11px", color: C.textSecondary, ...ss }}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Photo Editor ─────────────────────────────────────────────────

function PhotoEditor({ eventId, photos, onRefresh }: { eventId: number; photos: Photo[]; onRefresh: () => void }) {
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ url: "", caption: "", category: "accommodation" });

  async function addPhoto() {
    await fetch("/api/admin/photos", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, eventId, order: photos.length }),
    });
    setAdding(false); setForm({ url: "", caption: "", category: "accommodation" }); onRefresh();
  }

  async function deletePhoto(id: number) {
    if (!confirm("Delete this photo?")) return;
    await fetch(`/api/admin/photos?id=${id}`, { method: "DELETE" }); onRefresh();
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h2 style={{ ...sf, fontSize: "1.375rem", fontWeight: 700, margin: 0 }}>Photos</h2>
        <ActionBtn label="+ Add Photo" onClick={() => setAdding(true)} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "12px", marginBottom: "24px" }}>
        {photos.map((p) => (
          <div key={p.id} style={{ background: C.bg, border: `1px solid ${C.border}`, overflow: "hidden" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.url} alt={p.caption ?? ""} style={{ width: "100%", height: "140px", objectFit: "cover", display: "block" }} />
            <div style={{ padding: "10px 12px" }}>
              <div style={{ fontSize: "12px", color: C.textSecondary, marginBottom: "4px" }}>{p.caption || <em>No caption</em>}</div>
              <div style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.1em", color: C.navy, fontWeight: 600 }}>{p.category}</div>
              <button onClick={() => deletePhoto(p.id)} style={{ marginTop: "8px", background: "none", border: "none", color: "#b91c1c", cursor: "pointer", fontSize: "11px", padding: 0, fontWeight: 600 }}>Delete</button>
            </div>
          </div>
        ))}
        {photos.length === 0 && <p style={{ color: C.textSecondary, fontSize: "14px" }}>No photos yet.</p>}
      </div>
      {adding && (
        <div style={{ background: C.blueLight, border: `1px solid ${C.border}`, padding: "24px" }}>
          <h3 style={{ ...sf, fontSize: "1.125rem", fontWeight: 700, marginBottom: "20px" }}>Add Photo</h3>
          <InputField label="Image URL" value={form.url} onChange={(v) => setForm({ ...form, url: v })} />
          <InputField label="Caption (optional)" value={form.caption} onChange={(v) => setForm({ ...form, caption: v })} />
          <label style={{ display: "block", marginBottom: "20px" }}>
            <span style={{ fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.12em", color: C.textSecondary, display: "block", marginBottom: "6px", fontWeight: 600, ...ss }}>Category</span>
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} style={{ width: "100%", padding: "10px 12px", border: `1px solid ${C.border}`, background: C.bg, ...ss }}>
              <option value="accommodation">Accommodation</option>
              <option value="location">Location</option>
              <option value="past_trips">Past trips</option>
            </select>
          </label>
          <div style={{ display: "flex", gap: "12px" }}>
            <ActionBtn label="Save" onClick={addPhoto} disabled={!form.url} />
            <button onClick={() => setAdding(false)} style={{ background: "none", border: `1px solid ${C.border}`, padding: "10px 24px", cursor: "pointer", fontSize: "11px", color: C.textSecondary, ...ss }}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Info Block Editor ─────────────────────────────────────────────

function InfoBlockEditor({ eventId, blocks, onRefresh }: { eventId: number; blocks: InfoBlock[]; onRefresh: () => void }) {
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ title: "", body: "", icon: "" });

  async function addBlock() {
    await fetch("/api/admin/info-blocks", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, eventId, order: blocks.length }),
    });
    setAdding(false); setForm({ title: "", body: "", icon: "" }); onRefresh();
  }

  async function deleteBlock(id: number) {
    if (!confirm("Delete this block?")) return;
    await fetch(`/api/admin/info-blocks?id=${id}`, { method: "DELETE" }); onRefresh();
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h2 style={{ ...sf, fontSize: "1.375rem", fontWeight: 700, margin: 0 }}>Info Blocks</h2>
        <ActionBtn label="+ Add Block" onClick={() => setAdding(true)} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "12px" }}>
        {blocks.map((b) => (
          <div key={b.id} style={{ background: C.bg, border: `1px solid ${C.border}`, padding: "20px" }}>
            {b.icon && <div style={{ fontSize: "1.5rem", marginBottom: "8px" }}>{b.icon}</div>}
            <div style={{ fontWeight: 700, marginBottom: "6px", color: C.dark, ...ss }}>{b.title}</div>
            <div style={{ fontSize: "13px", color: C.textSecondary, lineHeight: 1.6, ...ss }}>{b.body}</div>
            <button onClick={() => deleteBlock(b.id)} style={{ marginTop: "12px", background: "none", border: "none", color: "#b91c1c", cursor: "pointer", fontSize: "11px", padding: 0, fontWeight: 600 }}>Delete</button>
          </div>
        ))}
        {blocks.length === 0 && <p style={{ color: C.textSecondary, fontSize: "14px" }}>No info blocks yet.</p>}
      </div>
      {adding && (
        <div style={{ marginTop: "24px", background: C.blueLight, border: `1px solid ${C.border}`, padding: "24px" }}>
          <h3 style={{ ...sf, fontSize: "1.125rem", fontWeight: 700, marginBottom: "20px" }}>New Info Block</h3>
          <InputField label="Icon (emoji, optional)" value={form.icon} onChange={(v) => setForm({ ...form, icon: v })} />
          <InputField label="Title" value={form.title} onChange={(v) => setForm({ ...form, title: v })} />
          <InputField label="Body text" value={form.body} onChange={(v) => setForm({ ...form, body: v })} type="textarea" />
          <div style={{ display: "flex", gap: "12px" }}>
            <ActionBtn label="Save" onClick={addBlock} disabled={!form.title || !form.body} />
            <button onClick={() => setAdding(false)} style={{ background: "none", border: `1px solid ${C.border}`, padding: "10px 24px", cursor: "pointer", fontSize: "11px", color: C.textSecondary, ...ss }}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Cost Editor ───────────────────────────────────────────────────

function CostEditor({ event, onRefresh }: { event: Event; onRefresh: () => void }) {
  const [costItems, setCostItems] = useState<CostItem[]>(event.cost_items ?? []);
  const [note, setNote] = useState(event.cost_note ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function save() {
    setSaving(true);
    await fetch("/api/admin/event", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: event.id, name: event.name, start_date: event.start_date, end_date: event.end_date, location: event.location, hero_image_url: event.hero_image_url, description: event.description, cost_items: costItems.length > 0 ? costItems : null, cost_note: note }) });
    setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 3000); onRefresh();
  }

  function addItem() { setCostItems((prev) => [...prev, { label: "", amount: "" }]); }
  function updateItem(i: number, field: "label" | "amount", val: string) {
    setCostItems((prev) => prev.map((item, idx) => idx === i ? { ...item, [field]: val } : item));
  }
  function removeItem(i: number) { setCostItems((prev) => prev.filter((_, idx) => idx !== i)); }

  const inputStyle: React.CSSProperties = { padding: "8px 10px", border: `1px solid ${C.border}`, background: C.blueLight, fontSize: "13px", color: C.dark, outline: "none", ...ss };

  return (
    <div style={{ maxWidth: "560px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <h2 style={{ ...sf, fontSize: "1.375rem", fontWeight: 700, margin: 0 }}>Cost Breakdown</h2>
        <ActionBtn label="+ Add Line" onClick={addItem} />
      </div>
      {costItems.length === 0 && <p style={{ color: C.textSecondary, fontSize: "14px", marginBottom: "24px" }}>No cost items — the cost step will be hidden from guests.</p>}
      <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "24px" }}>
        {costItems.map((item, i) => (
          <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 120px auto", gap: "8px", alignItems: "center" }}>
            <input value={item.label} onChange={(e) => updateItem(i, "label", e.target.value)} placeholder="Label (e.g. Airbnb share)" style={{ ...inputStyle, width: "100%" }} />
            <input value={item.amount} onChange={(e) => updateItem(i, "amount", e.target.value)} placeholder="~$200" style={{ ...inputStyle, width: "100%" }} />
            <button onClick={() => removeItem(i)} style={{ background: "none", border: "none", color: "#b91c1c", cursor: "pointer", fontSize: "18px", lineHeight: 1 }}>×</button>
          </div>
        ))}
      </div>
      <InputField label="Note (shown below breakdown)" value={note} onChange={setNote} />
      <button onClick={save} disabled={saving} style={{ background: saving ? C.border : C.dark, color: saving ? C.textSecondary : C.bg, border: "none", padding: "12px 32px", cursor: "pointer", fontSize: "10px", letterSpacing: "0.15em", textTransform: "uppercase", fontWeight: 700, ...ss }}>
        {saving ? "Saving…" : saved ? "Saved ✓" : "Save Changes"}
      </button>
    </div>
  );
}

// ── Event Settings Editor ─────────────────────────────────────────

function EventSettingsEditor({ event, onRefresh }: { event: Event; onRefresh: () => void }) {
  const [form, setForm] = useState({ name: event.name, start_date: event.start_date ?? "", end_date: event.end_date ?? "", location: event.location ?? "", hero_image_url: event.hero_image_url ?? "", description: event.description ?? "" });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function save() {
    setSaving(true);
    await fetch("/api/admin/event", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: event.id, ...form, cost_items: event.cost_items, cost_note: event.cost_note }) });
    setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 3000); onRefresh();
  }

  const fields: { key: keyof typeof form; label: string; type?: "input" | "textarea" }[] = [
    { key: "name", label: "Event Name" },
    { key: "start_date", label: "Start Date (YYYY-MM-DD)" },
    { key: "end_date", label: "End Date (YYYY-MM-DD)" },
    { key: "location", label: "Location" },
    { key: "hero_image_url", label: "Hero Image URL" },
    { key: "description", label: "Description", type: "textarea" },
  ];

  return (
    <div style={{ maxWidth: "560px" }}>
      <h2 style={{ ...sf, fontSize: "1.375rem", fontWeight: 700, marginBottom: "24px" }}>Event Settings</h2>
      {fields.map(({ key, label, type }) => (
        <InputField key={key} label={label} value={form[key]} onChange={(v) => setForm({ ...form, [key]: v })} type={type} />
      ))}
      <button onClick={save} disabled={saving} style={{ background: saving ? C.border : C.dark, color: saving ? C.textSecondary : C.bg, border: "none", padding: "12px 32px", cursor: "pointer", fontSize: "10px", letterSpacing: "0.15em", textTransform: "uppercase", fontWeight: 700, ...ss }}>
        {saving ? "Saving…" : saved ? "Saved ✓" : "Save Changes"}
      </button>
    </div>
  );
}
