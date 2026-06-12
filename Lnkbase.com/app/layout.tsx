import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Linkbase Agent Maker",
  description: "Build reusable text AI agents and deploy them as APIs, widgets, or pages."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="topbar">
          <Link href="/dashboard" className="brand">
            <span className="mark">L</span>
            <span>Linkbase</span>
          </Link>
          <nav className="actions">
            <Link className="button" href="/dashboard">
              Dashboard
            </Link>
            <Link className="button primary" href="/agents/new">
              New Agent
            </Link>
          </nav>
        </header>
        {children}
      </body>
    </html>
  );
}
