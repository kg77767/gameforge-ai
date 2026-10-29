import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "GameForge AI",
  description: "Generate AI games and save them to public or private libraries.",
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
