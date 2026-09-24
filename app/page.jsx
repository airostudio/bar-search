import NavBar from "../components/NavBar";
import Wordmark from "../components/Wordmark";
import SplashScreen from "../components/SplashScreen";

export const metadata = {
  title: "myvibe.bar — Find your next favorite bar",
  description:
    "Search every bar, pub, and nightclub on the planet, get matched by vibe, and let bar owners keep their own specials and info up to date.",
};

const FEATURES = [
  {
    icon: "🌍",
    title: "Every country, one search",
    body: "Google Places-powered live search covers all 257 ISO countries and territories, plus a bundled demo dataset so the site works with no setup at all.",
  },
  {
    icon: "🎲",
    title: "\"Find me a better bar\"",
    body: "Not vibing with where you are? Pick a vibe — rooftop, dive, karaoke, whatever — and we'll show other bars nearby, a walking map from where you're standing, and a ride if you'd rather not walk.",
  },
  {
    icon: "🔥",
    title: "Real specials, from real owners",
    body: "Verified bar owners post their own happy hours and events directly, so what you see is current — not scraped, not guessed.",
  },
  {
    icon: "🗺️",
    title: "Maps & socials, one tap away",
    body: "Every result links straight into Google Maps, Instagram, Facebook, TikTok, and search engines — live results on each platform, not a stale cache.",
  },
];

const STEPS = [
  { n: "1", title: "Search or get matched", body: "Filter by country, city, category, or rating — or just tell us the vibe you're after." },
  { n: "2", title: "See the full picture", body: "Maps, ratings, hours, specials, and one-click links to every platform that matters." },
  { n: "3", title: "Not feeling it? Pivot", body: "Tap \"find me a better bar\" for geolocated alternatives, walking directions, and a ride option." },
];

export default function LandingPage() {
  return (
    <>
      <SplashScreen />
      <NavBar />

      <header className="hero">
        <div className="container">
          <div className="brand">
            <img src="/brand/myvibe-icon.png" alt="" width={44} height={44} className="brand-logo" />
            <Wordmark />
          </div>
          <p className="tagline" style={{ maxWidth: 560, fontSize: 18, marginTop: 12 }}>
            Find your next favorite bar. Or, if this one isn&apos;t working out — your next one after this one.
          </p>
          <div className="row controls" style={{ marginTop: 20 }}>
            <a href="/search" className="btn">Search bars near you</a>
            <a href="/owner/signup" className="btn secondary">Own a bar? Claim your listing</a>
          </div>
        </div>
      </header>

      <main>
        <section className="container" style={{ padding: "48px 0" }}>
          <h2 style={{ marginBottom: 18 }}>What we offer</h2>
          <div className="grid feature-grid">
            {FEATURES.map((f) => (
              <div key={f.title} className="panel feature-card">
                <div style={{ fontSize: 28 }}>{f.icon}</div>
                <h3 style={{ margin: "10px 0 6px" }}>{f.title}</h3>
                <p style={{ color: "var(--text-dim)", fontSize: 14 }}>{f.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="container" style={{ padding: "20px 0 48px" }}>
          <h2 style={{ marginBottom: 18 }}>How it works</h2>
          <div className="grid">
            {STEPS.map((s) => (
              <div key={s.n} className="panel">
                <div className="step-number">{s.n}</div>
                <h3 style={{ margin: "10px 0 6px" }}>{s.title}</h3>
                <p style={{ color: "var(--text-dim)", fontSize: 14 }}>{s.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="container" style={{ padding: "20px 0 48px" }}>
          <div className="panel" style={{ padding: 28 }}>
            <h2 style={{ marginBottom: 10 }}>How we work with bars on our platform</h2>
            <p style={{ color: "var(--text-dim)", maxWidth: 760, marginBottom: 14 }}>
              Every bar we know about comes from one of three places: live Google Places data, a submission
              from someone in the community, or the owner themselves. Owners can claim their listing for free —
              a claim is reviewed by our team before it goes live, so a verified badge actually means something —
              then post their own specials and correct their hours, phone, and description whenever they change.
              Nothing an owner submits overwrites public results until it&apos;s approved.
            </p>
            <div className="row controls">
              <a href="/owner/signup" className="btn">Claim your bar</a>
              <a href="/submit" className="btn secondary">Add a bar we&apos;re missing</a>
            </div>
          </div>
        </section>

        <section className="container" style={{ padding: "20px 0 60px" }}>
          <div className="panel" style={{ padding: 28, textAlign: "center" }}>
            <h2 style={{ marginBottom: 10 }}>Become a sponsor</h2>
            <p style={{ color: "var(--text-dim)", maxWidth: 560, margin: "0 auto 16px" }}>
              We&apos;re opening up a small number of sponsor spots for drinks brands, local tourism boards, and
              nightlife-adjacent products who want in front of people actively looking for a bar right now.
            </p>
            <a href="mailto:hello@myvibe.bar" className="btn secondary">Get in touch</a>
          </div>
        </section>
      </main>

      <footer>
        <div className="container">
          <span>myvibe.bar — venue data via Google Places API or bundled demo dataset.</span>
          <span>
            Social &amp; search-engine buttons open live results on each platform. Automated scraping of
            Instagram/Facebook violates their Terms of Service, so myvibe.bar links you to the source instead.
          </span>
          <span>Drink responsibly. Adult venues shown only after 18+ confirmation.</span>
        </div>
      </footer>
    </>
  );
}
