import "./globals.css";

export const metadata = {
  title: "Findah.bar — Global Bar & Nightlife Search",
  description:
    "Search bars, pubs, nightclubs, hostess bars and gentlemen's clubs in every country, with maps and social lookups.",
};

// Runs before paint so a saved "light" preference doesn't flash dark first.
const THEME_INIT_SCRIPT = `
try {
  if (localStorage.getItem('findahbar.theme') === 'light') {
    document.documentElement.setAttribute('data-theme', 'light');
  }
} catch (e) {}
`;

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
