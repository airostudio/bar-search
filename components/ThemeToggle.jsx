"use client";

import { useEffect, useState } from "react";

const THEME_KEY = "myvibebar.theme";

export default function ThemeToggle() {
  // null until mounted, so we render nothing until we know the real
  // value (set by the blocking script in layout.jsx) — avoids a
  // hydration mismatch and a flash of the wrong icon.
  const [theme, setTheme] = useState(null);

  useEffect(() => {
    setTheme(document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark");
  }, []);

  const toggle = () => {
    const next = theme === "light" ? "dark" : "light";
    if (next === "light") document.documentElement.setAttribute("data-theme", "light");
    else document.documentElement.removeAttribute("data-theme");
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch {
      // Private browsing / blocked storage — theme just won't persist.
    }
    setTheme(next);
  };

  if (!theme) return <span className="theme-toggle" aria-hidden="true" />;

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={toggle}
      aria-label={theme === "light" ? "Switch to night mode" : "Switch to day mode"}
      title={theme === "light" ? "Switch to night mode" : "Switch to day mode"}
    >
      {theme === "light" ? "☀️" : "🌙"}
    </button>
  );
}
