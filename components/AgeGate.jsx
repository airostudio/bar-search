"use client";

// 18+ confirmation modal, shown the first time adult categories are enabled.
// The parent owns the open/remembered state (see app/page.jsx).
export default function AgeGate({ open, onConfirm, onCancel }) {
  if (!open) return null;

  return (
    <div className="gate-backdrop" role="dialog" aria-modal="true">
      <div className="gate">
        <h2>Adult content — 18+ only</h2>
        <p>
          You are about to include adult venues (gentlemen&apos;s clubs, hostess &amp; host
          bars, cabarets, adult lounges) in your search results. Please confirm you are of
          legal age in your jurisdiction.
        </p>
        <div className="row">
          <button className="btn" onClick={onConfirm}>I am 18 or older</button>
          <button className="btn secondary" onClick={onCancel}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
