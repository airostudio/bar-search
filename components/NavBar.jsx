"use client";

import { useEffect, useState } from "react";
import ThemeToggle from "./ThemeToggle";
import Wordmark from "./Wordmark";

export default function NavBar() {
  const [email, setEmail] = useState(null); // null = checking, "" = logged out, string = logged in

  useEffect(() => {
    fetch("/api/owner/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setEmail(data?.email || ""))
      .catch(() => setEmail(""));
  }, []);

  const logout = async (e) => {
    e.preventDefault();
    await fetch("/api/owner/login", { method: "DELETE" });
    window.location.href = "/";
  };

  return (
    <nav className="navbar">
      <div className="container navbar-inner">
        <a href="/" className="navbar-brand">
          <img src="/brand/myvibe-icon.png" alt="" width={28} height={28} className="navbar-logo" />
          <Wordmark />
        </a>
        <div className="navbar-links">
          <a href="/search">Search</a>
          <a href="/submit">Add a venue</a>
          {email ? (
            <>
              <a href="/owner/dashboard">Dashboard</a>
              <a href="/" onClick={logout}>Log out</a>
            </>
          ) : (
            <a href="/owner/login">For bar owners</a>
          )}
          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
}
