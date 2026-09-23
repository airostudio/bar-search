"use client";

import { useEffect, useState } from "react";
import NavBar from "../../../components/NavBar";
import OwnerVenuePanel from "../../../components/OwnerVenuePanel";

export default function OwnerDashboardPage() {
  const [authed, setAuthed] = useState(null); // null = checking, false = need login, true = in
  const [claims, setClaims] = useState([]);
  const [claimsLoading, setClaimsLoading] = useState(true);

  const [q, setQ] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [claimStatus, setClaimStatus] = useState({}); // venueId -> "claiming" | "claimed" | error string

  const loadClaims = async () => {
    setClaimsLoading(true);
    const res = await fetch("/api/owner/claims");
    if (res.status === 401) {
      setAuthed(false);
      return;
    }
    const data = await res.json();
    setClaims(data.claims || []);
    setAuthed(true);
    setClaimsLoading(false);
  };

  useEffect(() => { loadClaims(); }, []);

  const runSearch = async (e) => {
    e.preventDefault();
    if (!q.trim()) return;
    setSearching(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setSearchResults(data.results || []);
    } finally {
      setSearching(false);
    }
  };

  const claimVenue = async (venue) => {
    setClaimStatus((s) => ({ ...s, [venue.id]: "claiming" }));
    try {
      const res = await fetch("/api/owner/claims", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          venueId: venue.id,
          venueName: venue.name,
          venueCity: venue.city,
          venueCountryCode: venue.countryCode,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Claim failed.");
      setClaimStatus((s) => ({ ...s, [venue.id]: "claimed" }));
      loadClaims();
    } catch (err) {
      setClaimStatus((s) => ({ ...s, [venue.id]: err.message }));
    }
  };

  if (authed === null) {
    return (
      <>
        <NavBar />
        <main className="container"><p style={{ padding: "50px 0", color: "var(--text-dim)" }}>Loading…</p></main>
      </>
    );
  }

  if (!authed) {
    return (
      <>
        <NavBar />
        <main className="container">
          <div className="panel" style={{ maxWidth: 420, margin: "60px auto", textAlign: "center" }}>
            <p style={{ marginBottom: 12 }}>You need to log in to manage your venues.</p>
            <a href="/owner/login" className="btn">Log in</a>
          </div>
        </main>
      </>
    );
  }

  const approved = claims.filter((c) => c.status === "approved");
  const pending = claims.filter((c) => c.status !== "approved");

  return (
    <>
      <NavBar />
      <main className="container">
        <h2 style={{ margin: "26px 0 6px" }}>Your venues</h2>

        {claimsLoading ? <p className="empty small">Loading…</p> : null}

        {!claimsLoading && approved.length === 0 ? (
          <p className="empty small">No approved venues yet — claim one below.</p>
        ) : null}

        <div className="owner-venues" style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 24 }}>
          {approved.map((claim) => <OwnerVenuePanel key={claim.id} claim={claim} />)}
        </div>

        {pending.length > 0 ? (
          <>
            <h3>Pending claims</h3>
            <div className="row" style={{ flexWrap: "wrap", gap: 8, marginBottom: 24 }}>
              {pending.map((c) => (
                <span key={c.id} className="badge">
                  {c.venueName} — {c.status === "pending" ? "awaiting review" : "not approved"}
                </span>
              ))}
            </div>
          </>
        ) : null}

        <h2 style={{ margin: "10px 0 6px" }}>Claim a venue</h2>
        <p style={{ color: "var(--text-dim)", fontSize: 13.5, marginBottom: 12 }}>
          Search for your bar, then claim it. Claims are reviewed before they go live.
        </p>
        <form onSubmit={runSearch} className="row">
          <div className="field" style={{ flex: "1 1 260px" }}>
            <div className="input-icon">
              <span className="icon-glyph">🔍</span>
              <input type="text" placeholder="Search your venue by name…" value={q} onChange={(e) => setQ(e.target.value)} />
            </div>
          </div>
          <button className="btn" type="submit" disabled={searching}>{searching ? "Searching…" : "Search"}</button>
        </form>

        <div className="grid" style={{ marginTop: 16 }}>
          {searchResults.map((venue) => (
            <article key={venue.id} className="card">
              <div className="card-body">
                <div className="card-title"><span>{venue.categoryIcon} {venue.name}</span></div>
                <div className="card-loc">{[venue.city, venue.country].filter(Boolean).join(", ")}</div>
                <div className="row controls" style={{ marginTop: 8 }}>
                  {claimStatus[venue.id] === "claimed" ? (
                    <span style={{ color: "var(--positive)", fontSize: 13.5 }}>Claim submitted — awaiting review.</span>
                  ) : (
                    <button className="btn secondary" type="button" disabled={claimStatus[venue.id] === "claiming"}
                            onClick={() => claimVenue(venue)}>
                      {claimStatus[venue.id] === "claiming" ? "Claiming…" : "Claim this venue"}
                    </button>
                  )}
                  {claimStatus[venue.id] && claimStatus[venue.id] !== "claimed" && claimStatus[venue.id] !== "claiming" ? (
                    <span style={{ color: "var(--accent)", fontSize: 13 }}>{claimStatus[venue.id]}</span>
                  ) : null}
                </div>
              </div>
            </article>
          ))}
        </div>
      </main>
    </>
  );
}
