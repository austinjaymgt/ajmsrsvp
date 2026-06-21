"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const C = { dark: "#233036", navy: "#244357", blue: "#AAD7EF", border: "#c8dde9", textSecondary: "#4a6272", bg: "#FEFFFF" };
const sf = { fontFamily: "var(--font-playfair), Georgia, serif" };
const ss = { fontFamily: "var(--font-inter), system-ui, sans-serif" };

export default function AdminLoginForm() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/admin/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      router.push("/admin/dashboard");
    } else {
      setError("Incorrect password.");
    }
    setLoading(false);
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: C.bg, padding: "24px" }}>
      <div style={{ width: "100%", maxWidth: "380px" }}>
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <p style={{ fontSize: "10px", letterSpacing: "0.3em", textTransform: "uppercase", color: C.blue, ...ss, marginBottom: "10px", fontWeight: 600 }}>
            Austin Jay Management
          </p>
          <h1 style={{ fontSize: "2rem", fontWeight: 700, color: C.dark, ...sf, margin: 0, letterSpacing: "-0.01em" }}>Admin</h1>
        </div>
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            style={{ width: "100%", padding: "14px 16px", border: `1px solid ${C.border}`, background: "#FEFFFF", fontSize: "0.9375rem", color: C.dark, outline: "none", ...ss, marginBottom: "16px" }}
          />
          {error && <p style={{ color: "#b91c1c", fontSize: "0.875rem", ...ss, marginBottom: "12px" }}>{error}</p>}
          <button
            type="submit"
            disabled={loading || !password}
            style={{
              width: "100%", padding: "14px", background: C.dark, color: "#FEFFFF", border: "none",
              fontSize: "10px", letterSpacing: "0.15em", textTransform: "uppercase",
              cursor: loading || !password ? "default" : "pointer", opacity: loading || !password ? 0.6 : 1,
              ...ss, fontWeight: 700,
            }}
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
