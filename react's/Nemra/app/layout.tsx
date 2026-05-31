import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nemra - Stay Organized",
  description: "A beautiful task manager to boost your productivity",
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico' }
    ],
    apple: '/icon.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
