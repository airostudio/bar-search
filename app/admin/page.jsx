"use client";

import { useCallback, useEffect, useState } from "react";
import { CATEGORY_BY_ID } from "../../lib/categories";
import { COUNTRY_NAME } from "../../lib/countries";

export default function AdminPage() {
  const [authed, setAuthed] = useState(null); // null = checking, false = need login, true = in
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [pending, setPending] = useState([]);
  const [persistent, setPersistent] = useState(true);
  const [busyId, setBusyId] = useState(null);

  const loadPending = useCallback(async () => {
    const res = await fetch("/api/venues/pending");
    if (res.status === 401) {
      setAuthed(false);
      return;
    }
    const data = await res.json();
    setPending(data.pending || []);
    setPersistent(data.persistent !== false);
    setAuthed(true);
  }, []);

  useEffect(() => { loadPending(); }, [loadPending]);

  const login = async (e) => {
    e.preventDefault();
    setLoginError("");
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setLoginError(data.error || "Login failed.");
      return;
    }
    setPassword("");
    loadPending();
  };

  const logout = async () => {
    await fetch("/api/admin/login", { method: "DELETE" });
    setAuthed(false);
  };

  const act = async (id, action) => {
    setBusyId(id);
    try {
      await fetch(`/api/venues/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      setPending((prev) => prev.filter((v) => v.id !== id));
    } finally {
      setBusyId(null);
    }
  };

  if (authed === null) {
    return <main className="container"><p style={{ padding: "50px 0", color: "var(--text-dim)" }}>Loading…</p></main>;
  }

  if (!authed) {
    return (
      <main className="container">
        <div className="panel" style={{ maxWidth: 380, margin: "70px auto" }}>
          <h2 style={{ marginBottom: 14 }}>Admin login</h2>
          <form onSubmit={login}>
            <div className="row">
              <div className="field">
                <label htmlFor="pw">Password</label>
                <input id="pw" type="password" autoFocus value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
            </div>
            {loginError ? <p style={{ color: "var(--accent)", fontSize: 13.5, marginTop: 10 }}>{loginError}</p> : null}
            <div className="row controls" style={{ marginTop: 14 }}>
              <button className="btn" type="submit">Log in</button>
            </div>
          </form>
        </div>
      </main>
    );
  }

  return (
    <main className="container">
      <div className="results-meta" style={{ marginTop: 30 }}>
        <h2>Pending venue submissions ({pending.length})</h2>
        <button className="btn secondary" onClick={logout} type="button">Log out</button>
      </div>

      {!persistent ? (
        <p style={{ color: "var(--gold)", fontSize: 13.5, marginBottom: 16 }}>
          No persistent storage configured — submissions live in memory only and will be lost on
          restart/redeploy. Set KV_REST_API_URL / KV_REST_API_TOKEN (see README) before relying on this.
        </p>
      ) : null}

      {pending.length === 0 ? (
        <p className="empty">No pending submissions.</p>
      ) : (
        <div className="grid">
          {pending.map((v) => {
            const cat = CATEGORY_BY_ID[v.category];
            return (
              <article key={v.id} className="card">
                <div className="card-body">
                  <div className="card-title"><span>{cat ? `${cat.icon} ` : ""}{v.name}</span></div>
                  <div className={`card-cat${cat?.adult ? " adult" : ""}`}>
                    {cat ? cat.label : v.category}{cat?.adult ? " · 18+" : ""}
                  </div>
                  <div className="card-loc">
                    {[v.address || v.city, COUNTRY_NAME[v.countryCode] || v.countryCode].filter(Boolean).join(" · ")}
                  </div>
                  {v.lat != null && v.lng != null ? (
                    <div className="card-loc">{v.lat}, {v.lng}</div>
                  ) : null}
                  {v.description ? <p className="card-desc">{v.description}</p> : null}
                  <div className="links">
                    <button className="btn" disabled={busyId === v.id} onClick={() => act(v.id, "approve")} type="button">
                      Approve
                    </button>
                    <button className="btn secondary" disabled={busyId === v.id} onClick={() => act(v.id, "reject")} type="button">
                      Reject
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </main>
  );
}
