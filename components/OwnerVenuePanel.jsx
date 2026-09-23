"use client";

import { useEffect, useState } from "react";

export default function OwnerVenuePanel({ claim }) {
  const [specials, setSpecials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [newSpecial, setNewSpecial] = useState({ title: "", description: "", startsAt: "", endsAt: "" });
  const [addingSpecial, setAddingSpecial] = useState(false);

  const [info, setInfo] = useState({ description: "", phone: "", website: "", hoursText: "" });
  const [savingInfo, setSavingInfo] = useState(false);
  const [infoSaved, setInfoSaved] = useState(false);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const [specialsRes, overrideRes] = await Promise.all([
        fetch(`/api/owner/specials?venueId=${encodeURIComponent(claim.venueId)}`),
        fetch(`/api/owner/overrides?venueId=${encodeURIComponent(claim.venueId)}`),
      ]);
      const specialsData = await specialsRes.json();
      const overrideData = await overrideRes.json();
      if (!specialsRes.ok) throw new Error(specialsData.error || "Failed to load specials.");
      setSpecials(specialsData.specials || []);
      if (overrideRes.ok && overrideData.override) {
        setInfo({
          description: overrideData.override.description || "",
          phone: overrideData.override.phone || "",
          website: overrideData.override.website || "",
          hoursText: overrideData.override.hoursText || "",
        });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [claim.venueId]);

  const addSpecial = async (e) => {
    e.preventDefault();
    if (!newSpecial.title.trim()) return;
    setAddingSpecial(true);
    setError("");
    try {
      const res = await fetch("/api/owner/specials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ venueId: claim.venueId, ...newSpecial }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Failed to add special.");
      setNewSpecial({ title: "", description: "", startsAt: "", endsAt: "" });
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setAddingSpecial(false);
    }
  };

  const removeSpecial = async (id) => {
    setSpecials((prev) => prev.filter((s) => s.id !== id));
    await fetch(`/api/owner/specials/${id}`, { method: "DELETE" });
  };

  const saveInfo = async (e) => {
    e.preventDefault();
    setSavingInfo(true);
    setInfoSaved(false);
    setError("");
    try {
      const res = await fetch("/api/owner/overrides", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ venueId: claim.venueId, ...info }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Failed to save.");
      setInfoSaved(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingInfo(false);
    }
  };

  return (
    <div className="panel owner-venue-panel">
      <h3>{claim.venueName}</h3>
      <p style={{ color: "var(--text-dim)", fontSize: 13, marginBottom: 12 }}>
        {[claim.venueCity, claim.venueCountryCode].filter(Boolean).join(", ")}
      </p>

      {loading ? <p className="empty small">Loading…</p> : null}
      {error ? <p className="empty small">{error}</p> : null}

      {!loading ? (
        <>
          <h4>Specials</h4>
          {specials.length === 0 ? <p className="empty small">No specials posted yet.</p> : null}
          <div className="owner-specials-list">
            {specials.map((s) => (
              <div key={s.id} className="special">
                <strong>{s.title}</strong>
                {s.description ? <span> — {s.description}</span> : null}
                {s.startsAt || s.endsAt ? (
                  <span className="special-dates"> ({[s.startsAt, s.endsAt].filter(Boolean).join(" – ")})</span>
                ) : null}
                <button type="button" className="link-pill" style={{ marginLeft: 8 }} onClick={() => removeSpecial(s.id)}>
                  Remove
                </button>
              </div>
            ))}
          </div>

          <form onSubmit={addSpecial} className="row" style={{ marginTop: 10 }}>
            <div className="field" style={{ flex: "1 1 160px" }}>
              <label>Title</label>
              <input type="text" maxLength={120} placeholder="Happy hour 5-7pm"
                     value={newSpecial.title} onChange={(e) => setNewSpecial((s) => ({ ...s, title: e.target.value }))} />
            </div>
            <div className="field" style={{ flex: "2 1 220px" }}>
              <label>Description (optional)</label>
              <input type="text" maxLength={300} placeholder="Half-price cocktails"
                     value={newSpecial.description} onChange={(e) => setNewSpecial((s) => ({ ...s, description: e.target.value }))} />
            </div>
            <div className="field" style={{ flex: "0 1 140px" }}>
              <label>From (optional)</label>
              <input type="date" value={newSpecial.startsAt} onChange={(e) => setNewSpecial((s) => ({ ...s, startsAt: e.target.value }))} />
            </div>
            <div className="field" style={{ flex: "0 1 140px" }}>
              <label>Until (optional)</label>
              <input type="date" value={newSpecial.endsAt} onChange={(e) => setNewSpecial((s) => ({ ...s, endsAt: e.target.value }))} />
            </div>
            <div className="row controls" style={{ marginTop: 4 }}>
              <button className="btn secondary" type="submit" disabled={addingSpecial}>
                {addingSpecial ? "Adding…" : "+ Add special"}
              </button>
            </div>
          </form>

          <h4 style={{ marginTop: 18 }}>Venue info</h4>
          <form onSubmit={saveInfo}>
            <div className="row">
              <div className="field">
                <label>Description</label>
                <input type="text" maxLength={400} value={info.description}
                       onChange={(e) => setInfo((i) => ({ ...i, description: e.target.value }))} />
              </div>
            </div>
            <div className="row" style={{ marginTop: 10 }}>
              <div className="field">
                <label>Phone</label>
                <input type="text" maxLength={40} value={info.phone}
                       onChange={(e) => setInfo((i) => ({ ...i, phone: e.target.value }))} />
              </div>
              <div className="field">
                <label>Website</label>
                <input type="text" maxLength={200} value={info.website}
                       onChange={(e) => setInfo((i) => ({ ...i, website: e.target.value }))} />
              </div>
              <div className="field">
                <label>Hours</label>
                <input type="text" maxLength={200} placeholder="Mon–Sat 4pm–2am" value={info.hoursText}
                       onChange={(e) => setInfo((i) => ({ ...i, hoursText: e.target.value }))} />
              </div>
            </div>
            <div className="row controls" style={{ marginTop: 10 }}>
              <button className="btn" type="submit" disabled={savingInfo}>{savingInfo ? "Saving…" : "Save info"}</button>
              {infoSaved ? <span style={{ color: "#6fdc96", fontSize: 13.5 }}>Saved.</span> : null}
            </div>
          </form>
        </>
      ) : null}
    </div>
  );
}
