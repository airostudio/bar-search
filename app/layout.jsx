import "./globals.css";

export const metadata = {
  title: "myvibe.bar — Global Bar & Nightlife Search",
  description:
    "Search bars, pubs, nightclubs, hostess bars and gentlemen's clubs in every country, with maps and social lookups.",
  icons: {
    icon: "/icon.png",
    apple: "/apple-icon.png",
  },
  openGraph: {
    title: "myvibe.bar — Global Bar & Nightlife Search",
    description: "Search bars, pubs, nightclubs, hostess bars and gentlemen's clubs in every country.",
    images: [{ url: "/brand/myvibe-logo-full.webp", width: 1362, height: 1142 }],
  },
};

// Runs before paint so a saved "light" preference doesn't flash dark first.
const THEME_INIT_SCRIPT = `
try {
  if (localStorage.getItem('myvibebar.theme') === 'light') {
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
