import "./globals.css";

export const metadata = {
  title: "Technical Reading Companion",
  description: "A calm companion for studying difficult books.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}