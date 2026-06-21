"use client";

import { useState, use } from "react";
import { useRouter } from "next/navigation";

const C = { dark: "#233036", navy: "#244357", blue: "#AAD7EF", blueLight: "#daeef9", bg: "#FEFFFF", border: "#c8dde9", textSecondary: "#4a6272" };
const sf = { fontFamily: "var(--font-playfair), Georgia, serif" };
const ss = { fontFamily: "var(--font-inter), system-ui, sans-serif" };

type Question = { id: number; type: "text" | "select" | "multiselect"; label: string; options: string[] | null; required: boolean };
type FlowStep =
  | { kind: "intro" }
  | { kind: "name" }
  | { kind: "attending" }
  | { kind: "question"; question: Question; index: number; total: number }
  | { kind: "cost" }
  | { kind: "done" };

function ProgressDots({ current, total }: { current: number; total: number }) {
  return (
    <div style={{ display: "flex", gap: "6px", justifyContent: "center" }}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} style={{ width: "6px", height: "6px", borderRadius: "50%", background: i <= current ? C.dark : C.border, transition: "background 0.3s" }} />
      ))}
    </div>
  );
}

export default function RSVPPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const router = useRouter();
  const [stepIndex, setStepIndex] = useState(0);
  const [name, setName] = useState("");
  const [attending, setAttending] = useState<"confirmed" | "maybe" | "declined" | null>(null);
  const [answers, setAnswers] = useState<Record<number, string | string[]>>({});
  const [questions, setQuestions] = useState<Question[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (questions === null) {
    fetch(`/api/rsvp/questions?slug=${slug}`)
      .then((r) => r.json())
      .then((data) => setQuestions(data.questions ?? []));
    setQuestions([]);
  }

  const activeQuestions = attending === "declined" ? [] : (questions ?? []);
  const steps: FlowStep[] = [
    { kind: "intro" },
    { kind: "name" },
    { kind: "attending" },
    ...activeQuestions.map((q, i) => ({ kind: "question" as const, question: q, index: i, total: activeQuestions.length })),
    { kind: "cost" },
    { kind: "done" },
  ];
  const step = steps[stepIndex];

  function next() { if (stepIndex < steps.length - 1) setStepIndex((s) => s + 1); }
  function back() { if (stepIndex > 0) setStepIndex((s) => s - 1); }

  async function submit() {
    setLoading(true);
    try {
      const res = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, name, status: attending, answers }),
      });
      if (res.ok) {
        setSubmitted(true);
        router.push(`/events/${slug}/rsvp/done?name=${encodeURIComponent(name)}`);
      }
    } finally { setLoading(false); }
  }

  const card = (content: React.ReactNode, showBack = false) => (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px", background: C.bg }}>
      <div style={{ width: "100%", maxWidth: "520px", background: C.bg, border: `1px solid ${C.border}`, padding: "56px 48px", position: "relative" }}>
        <div style={{ position: "absolute", top: "20px", left: 0, right: 0, display: "flex", justifyContent: "center" }}>
          <ProgressDots current={stepIndex} total={steps.length} />
        </div>
        {content}
        {showBack && stepIndex > 0 && (
          <button onClick={back} style={{ marginTop: "24px", background: "none", border: "none", color: C.textSecondary, fontSize: "13px", cursor: "pointer", textDecoration: "underline", ...ss }}>← Back</button>
        )}
      </div>
    </div>
  );

  const primaryBtn = (label: string, onClick: () => void, disabled = false, fullWidth = false) => (
    <button onClick={onClick} disabled={disabled} style={{ padding: "14px 32px", border: "none", cursor: disabled ? "default" : "pointer", fontSize: "10px", letterSpacing: "0.15em", textTransform: "uppercase", fontWeight: 700, ...ss, background: disabled ? C.border : C.dark, color: disabled ? C.textSecondary : C.bg, opacity: disabled ? 0.6 : 1, width: fullWidth ? "100%" : "auto" }}>
      {label}
    </button>
  );

  if (step.kind === "intro") return card(
    <div style={{ textAlign: "center", paddingTop: "20px" }}>
      <p style={{ fontSize: "10px", letterSpacing: "0.3em", textTransform: "uppercase", color: C.blue, ...ss, marginBottom: "24px", fontWeight: 600 }}>Austin Jay Management presents</p>
      <h1 style={{ fontSize: "2.25rem", fontWeight: 700, color: C.dark, ...sf, marginBottom: "12px", letterSpacing: "-0.01em" }}>RSVP</h1>
      <p style={{ color: C.textSecondary, marginBottom: "40px", ...ss, lineHeight: 1.65, fontSize: "0.9375rem" }}>Let&apos;s get you locked in. This will take about 2 minutes.</p>
      {primaryBtn("Let's go", next, false, true)}
    </div>
  );

  if (step.kind === "name") return card(
    <div style={{ paddingTop: "20px" }}>
      <label style={{ display: "block", fontSize: "1.625rem", fontWeight: 700, color: C.dark, ...sf, marginBottom: "32px", lineHeight: 1.3 }}>First, what&apos;s your name?</label>
      <input autoFocus value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && name.trim() && next()} placeholder="Your name"
        style={{ width: "100%", border: "none", borderBottom: `2px solid ${C.dark}`, padding: "12px 0", fontSize: "1.25rem", background: "transparent", color: C.dark, outline: "none", ...sf }} />
      <div style={{ marginTop: "32px" }}>{primaryBtn("Continue", next, !name.trim())}</div>
    </div>, true
  );

  if (step.kind === "attending") {
    const choices = [
      { label: "I'm in", value: "confirmed" as const, emoji: "🎉" },
      { label: "Maybe", value: "maybe" as const, emoji: "🤔" },
      { label: "Can't make it", value: "declined" as const, emoji: "😢" },
    ];
    return card(
      <div style={{ paddingTop: "20px" }}>
        <h2 style={{ fontSize: "1.625rem", fontWeight: 700, color: C.dark, ...sf, marginBottom: "8px" }}>Hey {name.split(" ")[0]} 👋</h2>
        <p style={{ color: C.textSecondary, marginBottom: "32px", ...ss, fontSize: "0.9375rem" }}>Will you be joining us?</p>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {choices.map((c) => (
            <button key={c.value} onClick={() => { setAttending(c.value); next(); }}
              style={{ display: "flex", alignItems: "center", gap: "14px", padding: "15px 18px", border: `1px solid ${attending === c.value ? C.dark : C.border}`, background: attending === c.value ? C.dark : C.bg, color: attending === c.value ? C.bg : C.dark, cursor: "pointer", textAlign: "left", fontSize: "0.9375rem", ...ss, fontWeight: attending === c.value ? 600 : 400, transition: "all 0.15s" }}>
              <span style={{ fontSize: "1.125rem" }}>{c.emoji}</span>
              <span>{c.label}</span>
            </button>
          ))}
        </div>
      </div>, true
    );
  }

  if (step.kind === "question") {
    const q = step.question;
    const currentAnswer = answers[q.id];
    const setAnswer = (val: string | string[]) => setAnswers((a) => ({ ...a, [q.id]: val }));
    const canContinue = !q.required || (Array.isArray(currentAnswer) ? currentAnswer.length > 0 : !!currentAnswer);

    return card(
      <div style={{ paddingTop: "20px" }}>
        <p style={{ fontSize: "10px", letterSpacing: "0.2em", textTransform: "uppercase", color: C.blue, ...ss, marginBottom: "20px", fontWeight: 600 }}>Question {step.index + 1} of {step.total}</p>
        <h2 style={{ fontSize: "1.5rem", fontWeight: 700, color: C.dark, ...sf, marginBottom: "32px", lineHeight: 1.35 }}>{q.label}</h2>

        {q.type === "text" && <>
          <textarea autoFocus value={(currentAnswer as string) ?? ""} onChange={(e) => setAnswer(e.target.value)} placeholder="Your answer..." rows={3}
            style={{ width: "100%", border: `1px solid ${C.border}`, padding: "12px 14px", fontSize: "0.9375rem", background: C.blueLight, color: C.dark, outline: "none", resize: "vertical", ...ss }} />
          <div style={{ marginTop: "20px" }}>{primaryBtn("Continue", next, !canContinue)}</div>
        </>}

        {q.type === "select" && q.options && (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {q.options.map((opt) => (
              <button key={opt} onClick={() => { setAnswer(opt); setTimeout(next, 250); }}
                style={{ padding: "14px 16px", border: `1px solid ${currentAnswer === opt ? C.dark : C.border}`, background: currentAnswer === opt ? C.dark : C.bg, color: currentAnswer === opt ? C.bg : C.dark, cursor: "pointer", textAlign: "left", fontSize: "0.9375rem", ...ss, fontWeight: currentAnswer === opt ? 600 : 400, transition: "all 0.15s" }}>
                {opt}
              </button>
            ))}
          </div>
        )}

        {q.type === "multiselect" && q.options && <>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "24px" }}>
            {q.options.map((opt) => {
              const selected = Array.isArray(currentAnswer) && currentAnswer.includes(opt);
              return (
                <button key={opt} onClick={() => { const arr = Array.isArray(currentAnswer) ? [...currentAnswer] : []; setAnswer(selected ? arr.filter((a) => a !== opt) : [...arr, opt]); }}
                  style={{ padding: "14px 16px", border: `1px solid ${selected ? C.dark : C.border}`, background: selected ? C.dark : C.bg, color: selected ? C.bg : C.dark, cursor: "pointer", textAlign: "left", fontSize: "0.9375rem", ...ss, fontWeight: selected ? 600 : 400, transition: "all 0.15s" }}>
                  {opt}
                </button>
              );
            })}
          </div>
          {primaryBtn("Continue", next, !canContinue)}
        </>}
      </div>, true
    );
  }

  if (step.kind === "cost") return card(
    <div style={{ paddingTop: "20px" }}>
      <h2 style={{ fontSize: "1.625rem", fontWeight: 700, color: C.dark, ...sf, marginBottom: "8px" }}>What to expect cost-wise</h2>
      <p style={{ color: C.textSecondary, marginBottom: "32px", ...ss, fontSize: "0.875rem" }}>Here&apos;s a rough breakdown. We&apos;ll collect after the trip.</p>
      <div style={{ borderTop: `1px solid ${C.border}` }}>
        {[["Airbnb (your share)", "~$200"], ["Group dinners", "~$100"], ["Group activities", "~$50"]].map(([label, value]) => (
          <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "14px 0", borderBottom: `1px solid ${C.border}`, ...ss, fontSize: "0.9375rem" }}>
            <span style={{ color: C.dark }}>{label}</span>
            <span style={{ color: C.textSecondary }}>{value}</span>
          </div>
        ))}
        <div style={{ display: "flex", justifyContent: "space-between", padding: "16px 0", ...ss, fontWeight: 700 }}>
          <span style={{ color: C.dark }}>Estimated total</span>
          <span style={{ color: C.dark }}>~$350</span>
        </div>
      </div>
      <p style={{ color: C.textSecondary, fontSize: "0.8125rem", marginTop: "8px", ...ss, lineHeight: 1.6 }}>Payment collection coming soon. Details before the trip.</p>
      <div style={{ marginTop: "32px" }}>{primaryBtn("Looks good — submit", next, false, true)}</div>
    </div>, true
  );

  if (step.kind === "done") return card(
    <div style={{ textAlign: "center", paddingTop: "20px" }}>
      <div style={{ fontSize: "2rem", marginBottom: "16px" }}>🎉</div>
      <h2 style={{ fontSize: "1.875rem", fontWeight: 700, color: C.dark, ...sf, marginBottom: "12px" }}>You&apos;re in, {name.split(" ")[0]}!</h2>
      <p style={{ color: C.textSecondary, marginBottom: "32px", ...ss, lineHeight: 1.65, fontSize: "0.9375rem" }}>
        {attending === "confirmed" ? "We're so excited to see you. Details and updates are coming — check your inbox."
          : attending === "maybe" ? "Totally get it. We'll check back in closer to the date."
          : "Sorry you can't make it. We'll miss you!"}
      </p>
      {!submitted && (
        <button onClick={submit} disabled={loading} style={{ background: C.dark, color: C.bg, border: "none", padding: "14px 32px", fontSize: "10px", letterSpacing: "0.15em", textTransform: "uppercase", cursor: loading ? "default" : "pointer", ...ss, fontWeight: 700, width: "100%", opacity: loading ? 0.6 : 1 }}>
          {loading ? "Saving..." : "Confirm RSVP"}
        </button>
      )}
    </div>
  );

  return null;
}
