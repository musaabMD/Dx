"use client";

import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { ChevronRight, Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

const LOGO_URL = "https://q648y7e0kt.ufs.sh/f/7bppoSdGjTuBsGmvNyR3mYU4jKNLJh5ZQuVOqsSP06Elv89c";

const NAV_LINKS = [
  { label: "Exams", href: "/exams" },
  { label: "Courses", href: "/course" },
  { label: "Affiliate", href: "/affiliate" },
  { label: "Features", href: "/features" },
  { label: "Pricing", href: "/pricing" },
];

function Logo() {
  return (
    <Link href="/" style={{ alignItems: "center", color: "#0F172A", display: "flex", gap: 7, textDecoration: "none" }}>
      <Image alt="" src={LOGO_URL} width={24} height={24} style={{ display: "block", height: 24, objectFit: "contain", width: 24 }} />
      <span style={{ color: "#0F172A", fontSize: 18, fontWeight: 900 }}>DrNote</span>
    </Link>
  );
}

export function PublicHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <nav className="public-header">
        <div
          className="public-header-inner"
          style={{
            background: "rgba(255,255,255,0.94)",
            border: "1px solid #E2E8F0",
            borderRadius: 14,
            boxShadow: "0 6px 18px rgba(15,23,42,0.07)",
          }}
        >
          <div className="public-header-logo-slot">
            <div style={{ alignItems: "center", display: "flex", height: 30, justifyContent: "center" }}>
              <Logo />
            </div>
          </div>
          <div className="nav-center">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="nav-link"
                style={{
                  fontSize: 13,
                  fontWeight: 800,
                  color: "#111827",
                  textDecoration: "none",
                }}
              >
                {link.label}
              </Link>
            ))}
          </div>
          <div className="public-header-actions">
            <button
              aria-expanded={menuOpen}
              aria-label="Open navigation menu"
              className="public-header-menu-button"
              onClick={() => setMenuOpen(true)}
              type="button"
            >
              <Menu aria-hidden="true" size={18} strokeWidth={2.3} />
            </button>
            <Show when="signed-out">
              <SignUpButton mode="modal">
                <button
                  className="public-header-signup"
                  style={{
                    alignItems: "center",
                    background: "#0F172A",
                    border: "1px solid #0F172A",
                    borderRadius: 12,
                    boxShadow: "0 8px 20px rgba(15,23,42,0.18)",
                    color: "#fff",
                    cursor: "pointer",
                    display: "inline-flex",
                    fontFamily: "inherit",
                    fontSize: 13,
                    fontWeight: 800,
                    gap: 6,
                    padding: "6px 10px",
                  }}
                  type="button"
                >
                  Get started <ChevronRight size={13} strokeWidth={2.5} />
                </button>
              </SignUpButton>
            </Show>
            <Show when="signed-in">
              <Link
                href="/dashboard"
                className="public-header-dashboard"
                style={{
                  alignItems: "center",
                  background: "#fff",
                  border: "1px solid #D1D5DB",
                  borderRadius: 12,
                  boxShadow: "0 2px 8px rgba(15,23,42,0.08)",
                  color: "#111827",
                  cursor: "pointer",
                  display: "inline-flex",
                  fontFamily: "inherit",
                  fontSize: 13,
                  fontWeight: 800,
                  gap: 6,
                  padding: "6px 10px",
                  textDecoration: "none",
                }}
              >
                Dashboard <ChevronRight size={13} fill="#9CA3AF" strokeWidth={2.5} />
              </Link>
              <UserButton />
            </Show>
          </div>
        </div>
      </nav>
      {menuOpen ? (
        <div className="public-mobile-menu" role="dialog" aria-modal="true">
          <button className="public-mobile-menu-backdrop" aria-label="Close navigation menu" onClick={() => setMenuOpen(false)} type="button" />
          <div className="public-mobile-menu-panel">
            <div className="public-mobile-menu-top">
              <Logo />
              <button aria-label="Close navigation menu" className="public-mobile-menu-close" onClick={() => setMenuOpen(false)} type="button">
                <X aria-hidden="true" size={18} strokeWidth={2.3} />
              </button>
            </div>
            <div className="public-mobile-menu-links">
              {NAV_LINKS.map((link) => (
                <Link key={link.label} href={link.href} onClick={() => setMenuOpen(false)}>
                  {link.label}
                </Link>
              ))}
            </div>
            <Show when="signed-out">
              <div className="public-mobile-menu-auth">
                <SignUpButton mode="modal">
                  <button type="button">Get started</button>
                </SignUpButton>
                <SignInButton mode="modal">
                  <button type="button">Sign in</button>
                </SignInButton>
              </div>
            </Show>
          </div>
        </div>
      ) : null}
    </>
  );
}

export function DashboardHeader() {
  return (
    <nav
      style={{
        background: "rgba(255,255,255,0.95)",
        position: "sticky",
        top: 0,
        zIndex: 50,
      }}
    >
      <div
        style={{
          alignItems: "center",
          display: "flex",
          height: 58,
          justifyContent: "space-between",
          margin: "0 auto",
          maxWidth: 1120,
          padding: "0 24px",
        }}
      >
        <Logo />
        <UserButton />
      </div>
    </nav>
  );
}
