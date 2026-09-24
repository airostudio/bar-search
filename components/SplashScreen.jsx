"use client";

import { useEffect, useState } from "react";
import Wordmark from "./Wordmark";

const SPLASH_KEY = "myvibebar.splash.shown";
const SHIMMER_MS = 1100;
const FADE_MS = 400;

export default function SplashScreen() {
  // Renders immediately on first paint (server and client agree on
  // "visible", so there's no flash of the page underneath before this
  // mounts) — the session check below only shortens repeat visits.
  const [phase, setPhase] = useState("visible");

  useEffect(() => {
    let seenThisSession = false;
    try {
      seenThisSession = sessionStorage.getItem(SPLASH_KEY) === "1";
    } catch {
      // Private browsing / blocked storage — just show it every time.
    }

    if (seenThisSession) {
      setPhase("gone");
      return;
    }

    const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const holdMs = reduceMotion ? 250 : SHIMMER_MS;

    const t1 = setTimeout(() => setPhase("leaving"), holdMs);
    const t2 = setTimeout(() => {
      setPhase("gone");
      try {
        sessionStorage.setItem(SPLASH_KEY, "1");
      } catch {
        // Nothing we can do — it'll just show again next time.
      }
    }, holdMs + FADE_MS);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  if (phase === "gone") return null;

  return (
    <div className={`splash${phase === "leaving" ? " splash-leaving" : ""}`} aria-hidden={phase === "leaving"}>
      <div className="splash-inner">
        <h1 className="splash-question">What&apos;s your vibe?</h1>
        <div className="splash-brand">
          <img src="/brand/myvibe-icon.png" alt="" width={36} height={36} className="splash-logo" />
          <Wordmark />
        </div>
      </div>
    </div>
  );
}
