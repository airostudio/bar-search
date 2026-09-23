"use client";

import { useState } from "react";
import NavBar from "../../../components/NavBar";

export default function OwnerLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/owner/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Login failed.");
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
          <h2 style={{ marginBottom: 6 }}>Bar owner login</h2>
          <p style={{ color: "var(--text-dim)", fontSize: 13.5, marginBottom: 18 }}>
            Manage your venue&apos;s specials and info.
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
                <label htmlFor="password">Password</label>
                <input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
            </div>
            {error ? <p style={{ color: "var(--accent)", fontSize: 13.5, marginTop: 10 }}>{error}</p> : null}
            <div className="row controls" style={{ marginTop: 14 }}>
              <button className="btn" type="submit" disabled={busy}>{busy ? "Logging in…" : "Log in"}</button>
            </div>
          </form>
          <p style={{ fontSize: 13.5, marginTop: 16 }}>
            Don&apos;t have an account? <a href="/owner/signup" className="link-pill maps">Sign up</a>
          </p>
        </div>
      </main>
    </>
  );
}
