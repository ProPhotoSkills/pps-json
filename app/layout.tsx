import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Creative Safety | Kursübersicht",
  description: "15 Lektionen für professionelle Absicherung im kreativen Alltag.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="de">
      <body>{children}</body>
    </html>
  );
}
