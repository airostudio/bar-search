"use client";

import { useState } from "react";
import { CATEGORIES } from "../../lib/categories";
import { COUNTRIES } from "../../lib/countries";

const EMPTY = {
  name: "", category: "bar", countryCode: "", city: "", address: "",
  description: "", lat: "", lng: "", website_url: "",
};

export default function SubmitPage() {
  const [form, setForm] = useState(EMPTY);
  const [status, setStatus] = useState(null); // null | "sending" | "ok" | "error"
  const [error, setError] = useState("");

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setStatus("sending");
    setError("");
    try {
      const res = await fetch("/api/venues/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Submission failed.");
      setStatus("ok");
      setForm(EMPTY);
    } catch (err) {
      setStatus("error");
      setError(err.message);
    }
  };

  return (
    <main className="container">
      <div className="panel" style={{ maxWidth: 600, margin: "40px auto" }}>
        <h2 style={{ marginBottom: 6 }}>Add a venue</h2>
        <p style={{ color: "var(--text-dim)", fontSize: 13.5, marginBottom: 18 }}>
          Know a great bar, club, or lounge that&apos;s missing? Submit it below — a moderator
          reviews every submission before it appears in search results.
        </p>

        {status === "ok" ? (
          <p style={{ color: "#6fdc96" }}>Thanks! Your submission is pending review.</p>
        ) : (
          <form onSubmit={submit}>
            <div className="row">
              <div className="field">
                <label htmlFor="name">Venue name *</label>
                <input id="name" type="text" required maxLength={120} value={form.name} onChange={set("name")} />
              </div>
            </div>

            <div className="row">
              <div className="field">
                <label htmlFor="category">Category *</label>
                <select id="category" value={form.category} onChange={set("category")}>
                  {CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>{c.icon} {c.label}{c.adult ? " (18+)" : ""}</option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label htmlFor="countryCode">Country *</label>
                <select id="countryCode" required value={form.countryCode} onChange={set("countryCode")}>
                  <option value="">Select a country</option>
                  {COUNTRIES.map((c) => (
                    <option key={c.code} value={c.code}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label htmlFor="city">City *</label>
                <input id="city" type="text" required maxLength={80} value={form.city} onChange={set("city")} />
              </div>
            </div>

            <div className="row">
              <div className="field" style={{ flex: "2 1 260px" }}>
                <label htmlFor="address">Address (optional)</label>
                <input id="address" type="text" maxLength={200} value={form.address} onChange={set("address")} />
              </div>
              <div className="field">
                <label htmlFor="lat">Latitude (optional)</label>
                <input id="lat" type="text" inputMode="decimal" placeholder="e.g. 13.7563" value={form.lat} onChange={set("lat")} />
              </div>
              <div className="field">
                <label htmlFor="lng">Longitude (optional)</label>
                <input id="lng" type="text" inputMode="decimal" placeholder="e.g. 100.5018" value={form.lng} onChange={set("lng")} />
              </div>
            </div>

            <div className="row">
              <div className="field">
                <label htmlFor="description">Description (optional)</label>
                <input id="description" type="text" maxLength={400} value={form.description} onChange={set("description")} />
              </div>
            </div>

            {/* Honeypot — hidden from real users; bots tend to fill every field they see. */}
            <div style={{ position: "absolute", left: "-9999px" }} aria-hidden="true">
              <label htmlFor="website_url">Leave this field blank</label>
              <input id="website_url" type="text" tabIndex={-1} autoComplete="off" value={form.website_url} onChange={set("website_url")} />
            </div>

            {error ? <p style={{ color: "var(--accent)", fontSize: 13.5, marginTop: 10 }}>{error}</p> : null}

            <div className="row controls" style={{ marginTop: 16 }}>
              <button className="btn" type="submit" disabled={status === "sending"}>
                {status === "sending" ? "Submitting…" : "Submit for review"}
              </button>
            </div>
          </form>
        )}
      </div>
    </main>
  );
}
