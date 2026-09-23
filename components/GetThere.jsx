"use client";

import { useEffect, useState } from "react";
import { walkingDirectionsEmbedUrl, walkingDirectionsUrl } from "../lib/links";
import { rideshareOptions } from "../lib/rideshare";

export default function GetThere({ venue, onBack }) {
  // 'locating' | 'granted' | 'denied' | 'unsupported'
  const [geoStatus, setGeoStatus] = useState("locating");
  const [origin, setOrigin] = useState(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setGeoStatus("unsupported");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setOrigin({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setGeoStatus("granted");
      },
      () => setGeoStatus("denied"),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }, []);

  const hasDest = venue.lat != null && venue.lng != null;
  const walkEmbedUrl = hasDest && origin
    ? walkingDirectionsEmbedUrl({ originLat: origin.lat, originLng: origin.lng, destLat: venue.lat, destLng: venue.lng })
    : null;
  const walkUrl = hasDest
    ? walkingDirectionsUrl({ originLat: origin?.lat, originLng: origin?.lng, destLat: venue.lat, destLng: venue.lng })
    : null;

  const rides = rideshareOptions({
    countryCode: venue.countryCode,
    country: venue.country,
    lat: venue.lat,
    lng: venue.lng,
    name: venue.name,
  });

  return (
    <div className="get-there">
      <div className="nearby-header">
        <strong>Getting to {venue.name}</strong>
        <button className="link-pill" type="button" onClick={onBack}>‹ Back</button>
      </div>

      {geoStatus === "locating" ? <p className="empty small">📍 Locating you…</p> : null}
      {geoStatus === "denied" ? (
        <p className="empty small">Couldn&apos;t get your location — showing the destination only.</p>
      ) : null}
      {geoStatus === "unsupported" ? (
        <p className="empty small">Your browser doesn&apos;t support location — showing the destination only.</p>
      ) : null}

      {walkEmbedUrl ? (
        <iframe
          className="map-frame"
          src={walkEmbedUrl}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title={`Walking directions to ${venue.name}`}
        />
      ) : hasDest ? (
        <iframe
          className="map-frame"
          src={venue.mapsEmbedUrl}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title={`Map of ${venue.name}`}
        />
      ) : null}

      <div className="nearby-results">
        {walkUrl ? (
          <a className="link-pill maps" href={walkUrl} target="_blank" rel="noopener noreferrer">
            🚶 Walking directions
          </a>
        ) : null}
        {rides.map((r) => (
          <a key={r.id} className={`link-pill ride ride-${r.id}`} href={r.url} target="_blank" rel="noopener noreferrer">
            🚗 {r.label}
          </a>
        ))}
      </div>
    </div>
  );
}
