import "./globals.css";

export const metadata = {
  title: "BarAtlas — Global Bar & Nightlife Search",
  description:
    "Search bars, pubs, nightclubs, hostess bars and gentlemen's clubs in every country, with maps and social lookups.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
