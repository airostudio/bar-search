"use client";

import { useState } from "react";
import NavBar from "../../../components/NavBar";

export default function OwnerSignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/owner/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Sign-up failed.");
      window.location.href = "/owner/dashboard";
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  return (
    <>
      <NavBar />
      <main className="container">
        <div className="panel" style={{ maxWidth: 380, margin: "60px auto" }}>
          <h2 style={{ marginBottom: 6 }}>Claim your bar</h2>
          <p style={{ color: "var(--text-dim)", fontSize: 13.5, marginBottom: 18 }}>
            Create a free account, then claim your venue to post specials and keep your info accurate.
            Claims are reviewed before they go live.
          </p>
          <form onSubmit={submit}>
            <div className="row">
              <div className="field">
                <label htmlFor="email">Email</label>
                <input id="email" type="email" required autoFocus value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
            </div>
            <div className="row" style={{ marginTop: 10 }}>
              <div className="field">
                <label htmlFor="password">Password (8+ characters)</label>
                <input id="password" type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
            </div>
            {error ? <p style={{ color: "var(--accent)", fontSize: 13.5, marginTop: 10 }}>{error}</p> : null}
            <div className="row controls" style={{ marginTop: 14 }}>
              <button className="btn" type="submit" disabled={busy}>{busy ? "Creating account…" : "Sign up"}</button>
            </div>
          </form>
          <p style={{ fontSize: 13.5, marginTop: 16 }}>
            Already have an account? <a href="/owner/login" className="link-pill maps">Log in</a>
          </p>
        </div>
      </main>
    </>
  );
}
