"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { COUNTRIES } from "../lib/countries";
import { CATEGORIES } from "../lib/categories";
import AgeGate from "../components/AgeGate";
import VenueCard from "../components/VenueCard";

const AGE_KEY = "baratlas.age.confirmed";

export default function Home() {
  const [q, setQ] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [selectedCats, setSelectedCats] = useState([]);
  const [includeAdult, setIncludeAdult] = useState(false);
  const [minRating, setMinRating] = useState(0);
  const [sort, setSort] = useState("rating");

  const [gateOpen, setGateOpen] = useState(false);
  const [results, setResults] = useState([]);
  const [source, setSource] = useState("demo");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const abortRef = useRef(null);

  const runSearch = useCallback(async (params) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(true);
    setError("");
    try {
      const sp = new URLSearchParams();
      if (params.q) sp.set("q", params.q);
      if (params.country) sp.set("country", params.country);
      if (params.city) sp.set("city", params.city);
      if (params.selectedCats.length) sp.set("categories", params.selectedCats.join(","));
      if (params.includeAdult) sp.set("adult", "1");
      if (params.minRating) sp.set("minRating", String(params.minRating));
      sp.set("sort", params.sort);

      const res = await fetch(`/api/search?${sp}`, { signal: controller.signal });
      if (!res.ok) throw new Error(`Search failed (${res.status})`);
      const data = await res.json();
      setResults(data.results);
      setSource(data.source);
    } catch (err) {
      if (err.name !== "AbortError") setError(err.message);
    } finally {
      if (abortRef.current === controller) setLoading(false);
    }
  }, []);

  // Initial load + re-run when filters change (text inputs debounced).
  useEffect(() => {
    const t = setTimeout(() => {
      runSearch({ q, country, city, selectedCats, includeAdult, minRating, sort });
    }, 300);
    return () => clearTimeout(t);
  }, [q, country, city, selectedCats, includeAdult, minRating, sort, runSearch]);

  const requestAdult = () => {
    if (localStorage.getItem(AGE_KEY) === "1") setIncludeAdult(true);
    else setGateOpen(true);
  };

  const toggleCategory = (cat) => {
    const on = selectedCats.includes(cat.id);
    if (!on && cat.adult && !includeAdult) requestAdult();
    setSelectedCats((prev) => (on ? prev.filter((c) => c !== cat.id) : [...prev, cat.id]));
  };

  const confirmAge = () => {
    localStorage.setItem(AGE_KEY, "1");
    setGateOpen(false);
    setIncludeAdult(true);
  };

  const cancelAge = () => {
    setGateOpen(false);
    setIncludeAdult(false);
    setSelectedCats((prev) => prev.filter((id) => !CATEGORIES.find((c) => c.id === id && c.adult)));
  };

  const reset = () => {
    setQ(""); setCountry(""); setCity(""); setSelectedCats([]);
    setMinRating(0); setSort("rating");
  };

  return (
    <>
      <AgeGate open={gateOpen} onConfirm={confirmAge} onCancel={cancelAge} />

      <header className="hero">
        <div className="container">
          <div className="brand">Bar<em>Atlas</em> 🌍</div>
          <p className="tagline">
            Search bars, pubs, nightclubs, karaoke, hostess bars and gentlemen&apos;s clubs in
            every country — with maps, ratings, and one-click social lookups.
          </p>
          <a href="/submit" className="link-pill maps" style={{ display: "inline-block", marginTop: 10 }}>
            + Add a venue we&apos;re missing
          </a>

          <div className="panel">
            <div className="row">
              <div className="field" style={{ flex: "2 1 260px" }}>
                <label htmlFor="q">Search</label>
                <input id="q" type="text" placeholder="Name, vibe, keyword…"
                       value={q} onChange={(e) => setQ(e.target.value)} />
              </div>
              <div className="field">
                <label htmlFor="country">Country ({COUNTRIES.length})</label>
                <select id="country" value={country} onChange={(e) => setCountry(e.target.value)}>
                  <option value="">All countries</option>
                  {COUNTRIES.map((c) => (
                    <option key={c.code} value={c.code}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label htmlFor="city">City</label>
                <input id="city" type="text" placeholder="Any city"
                       value={city} onChange={(e) => setCity(e.target.value)} />
              </div>
              <div className="field" style={{ flex: "0 1 150px" }}>
                <label htmlFor="minRating">Min rating</label>
                <select id="minRating" value={minRating}
                        onChange={(e) => setMinRating(parseFloat(e.target.value))}>
                  <option value={0}>Any</option>
                  <option value={3}>3.0+</option>
                  <option value={3.5}>3.5+</option>
                  <option value={4}>4.0+</option>
                  <option value={4.5}>4.5+</option>
                </select>
              </div>
              <div className="field" style={{ flex: "0 1 150px" }}>
                <label htmlFor="sort">Sort by</label>
                <select id="sort" value={sort} onChange={(e) => setSort(e.target.value)}>
                  <option value="rating">Rating</option>
                  <option value="name">Name</option>
                </select>
              </div>
            </div>

            <div className="row">
              <div className="chips">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    className={`chip${cat.adult ? " adult" : ""}${selectedCats.includes(cat.id) ? " on" : ""}`}
                    onClick={() => toggleCategory(cat)}
                    type="button"
                  >
                    {cat.icon} {cat.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="row controls">
              <label className="toggle">
                <input
                  type="checkbox"
                  checked={includeAdult}
                  onChange={(e) => (e.target.checked ? requestAdult() : setIncludeAdult(false))}
                />
                Include adult venues (18+)
              </label>
              <button className="btn secondary" type="button" onClick={reset}>Reset filters</button>
            </div>
          </div>
        </div>
      </header>

      <main className="container">
        <div className="results-meta">
          <span>
            {loading ? "Searching…" : `${results.length} venue${results.length === 1 ? "" : "s"} found`}
            {error ? ` — ${error}` : ""}
          </span>
          <span className={`badge ${source}`}>
            {source === "live" ? "Live data · Google Places" : "Demo data — add a Places API key for live worldwide results"}
          </span>
        </div>

        {results.length === 0 && !loading ? (
          <div className="empty">
            <p>No venues match your filters.</p>
            <p>Try clearing the city, choosing another country, or enabling more categories.</p>
          </div>
        ) : (
          <div className="grid">
            {results.map((venue) => <VenueCard key={venue.id} venue={venue} />)}
          </div>
        )}
      </main>

      <footer>
        <div className="container">
          <span>BarAtlas — venue data via Google Places API or bundled demo dataset.</span>
          <span>
            Social &amp; search-engine buttons open live results on each platform. Automated scraping of
            Instagram/Facebook violates their Terms of Service, so BarAtlas links you to the source instead.
          </span>
          <span>Drink responsibly. Adult venues shown only after 18+ confirmation.</span>
        </div>
      </footer>
    </>
  );
}
