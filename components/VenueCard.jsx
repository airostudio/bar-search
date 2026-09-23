"use client";

import { useState } from "react";
import NearbyFinder from "./NearbyFinder";

function Stars({ rating, count }) {
  if (!rating) return null;
  const full = Math.round(rating);
  return (
    <span className="stars" title={`${rating} / 5`}>
      {"★".repeat(full)}
      {"☆".repeat(5 - full)} {rating.toFixed(1)}
      {count ? <span className="price"> ({count.toLocaleString()})</span> : null}
    </span>
  );
}

export default function VenueCard({ venue, includeAdult }) {
  // Maps iframes are heavy, so each card loads its map on demand.
  const [showMap, setShowMap] = useState(false);
  const [finding, setFinding] = useState(false);

  const location = [venue.address || venue.city, venue.country].filter(Boolean).join(" · ");

  return (
    <article className="card">
      {showMap ? (
        <iframe
          className="map-frame"
          src={venue.mapsEmbedUrl}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title={`Map of ${venue.name}`}
        />
      ) : (
        <div className="map-placeholder" onClick={() => setShowMap(true)} role="button" tabIndex={0}
             onKeyDown={(e) => e.key === "Enter" && setShowMap(true)}>
          📍 Show map
        </div>
      )}

      <div className="card-body">
        <div className="card-title">
          <span>{venue.categoryIcon} {venue.name}</span>
          {venue.price ? <span className="price">{"$".repeat(venue.price)}</span> : null}
        </div>
        <div className={`card-cat${venue.adult ? " adult" : ""}`}>
          {venue.categoryLabel}
          {venue.adult ? " · 18+" : ""}
          {venue.openNow === true ? <span className="open-now"> · Open now</span> : null}
          {venue.source === "community" ? <span className="badge" style={{ marginLeft: 6 }}>Community</span> : null}
          {venue.claimed ? <span className="badge claimed" style={{ marginLeft: 6 }}>✓ Verified by owner</span> : null}
        </div>
        <div className="card-loc">{location}</div>
        {venue.hoursText ? <div className="card-loc">🕒 {venue.hoursText}</div> : null}
        <Stars rating={venue.rating} count={venue.ratingCount} />
        {venue.description ? <p className="card-desc">{venue.description}</p> : null}

        {venue.specials && venue.specials.length > 0 ? (
          <div className="specials">
            {venue.specials.map((s) => (
              <div key={s.id} className="special">
                <strong>🔥 {s.title}</strong>
                {s.description ? <span> — {s.description}</span> : null}
                {s.startsAt || s.endsAt ? (
                  <span className="special-dates">
                    {" "}({[s.startsAt, s.endsAt].filter(Boolean).join(" – ")})
                  </span>
                ) : null}
              </div>
            ))}
          </div>
        ) : null}

        <div className="links">
          <a className="link-pill maps" href={venue.mapsUrl} target="_blank" rel="noopener noreferrer">
            Google Maps
          </a>
          {venue.website ? (
            <a className="link-pill" href={venue.website} target="_blank" rel="noopener noreferrer">Website</a>
          ) : null}
          {venue.phone ? <a className="link-pill" href={`tel:${venue.phone}`}>{venue.phone}</a> : null}
          {venue.socials.map((s) => (
            <a key={s.id} className="link-pill" href={s.url} target="_blank" rel="noopener noreferrer">
              {s.label}
            </a>
          ))}
        </div>

        {finding ? (
          <NearbyFinder venue={venue} includeAdult={includeAdult} onClose={() => setFinding(false)} />
        ) : (
          <button className="btn secondary not-enjoying" type="button" onClick={() => setFinding(true)}>
            😕 Not enjoying this bar? Find me a better one
          </button>
        )}
      </div>
    </article>
  );
}
