"use client";

import { useState } from "react";
import { CATEGORIES } from "../lib/categories";

const ANY_VIBE = { id: "", label: "Surprise me", icon: "🎲" };

export default function NearbyFinder({ venue, includeAdult, onClose }) {
  const [vibe, setVibe] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState(null);

  const vibeOptions = [ANY_VIBE, ...CATEGORIES.filter((c) => includeAdult || !c.adult)];

  const find = async (vibeId) => {
    setVibe(vibeId);
    setLoading(true);
    setError("");
    try {
      const sp = new URLSearchParams();
      if (venue.lat != null && venue.lng != null) {
        sp.set("lat", venue.lat);
        sp.set("lng", venue.lng);
      }
      if (venue.city) sp.set("city", venue.city);
      if (venue.countryCode) sp.set("country", venue.countryCode);
      if (venue.id != null) sp.set("excludeId", String(venue.id));
      if (vibeId) sp.set("category", vibeId);
      if (includeAdult) sp.set("adult", "1");

      const res = await fetch(`/api/venues/nearby?${sp}`);
      if (!res.ok) throw new Error(`Search failed (${res.status})`);
      setData(await res.json());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="nearby-finder">
      <div className="nearby-header">
        <strong>What sort of vibe are you looking for?</strong>
        <button className="link-pill" type="button" onClick={onClose}>✕ Close</button>
      </div>

      <div className="chips">
        {vibeOptions.map((v) => (
          <button
            key={v.id || "any"}
            className={`chip${v.adult ? " adult" : ""}${vibe === v.id ? " on" : ""}`}
            type="button"
            onClick={() => find(v.id)}
          >
            {v.icon} {v.label}
          </button>
        ))}
      </div>

      {loading ? <p className="empty small">Finding nearby bars…</p> : null}
      {error ? <p className="empty small">{error}</p> : null}

      {!loading && data ? (
        data.areaMapEmbedUrl ? (
          <iframe
            className="map-frame"
            src={data.areaMapEmbedUrl}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Map of nearby bars"
          />
        ) : (
          <p className="empty small">No location on file for this venue, so no map to show.</p>
        )
      ) : null}

      {!loading && data && data.results.length === 0 ? (
        <p className="empty small">No other bars found nearby — try a different vibe.</p>
      ) : null}

      {!loading && data && data.results.length > 0 ? (
        <div className="nearby-results">
          {data.results.map((v) => (
            <a key={v.id} className="link-pill maps" href={v.mapsUrl} target="_blank" rel="noopener noreferrer">
              {v.categoryIcon} {v.name}{v.rating ? ` · ★${v.rating.toFixed(1)}` : ""}
            </a>
          ))}
        </div>
      ) : null}
    </div>
  );
}
