"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { Sparkles } from "lucide-react";

export default function AppHeader() {
  const pathname = usePathname();

  if (pathname?.startsWith("/exams/") || pathname === "/pricing") return null;

  return (
    <header
      className="app-header"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        background: "var(--page-bg, #F8F8F7)",
      }}
    >
      <div
        className="app-header-inner"
        style={{
          maxWidth: 960,
          margin: "0 auto",
          padding: "0 16px",
          height: 56,
          display: "grid",
          gridTemplateColumns: "1fr auto 1fr",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
            <div
              style={{
                width: 32,
                height: 32,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <img
                src="https://q648y7e0kt.ufs.sh/f/7bppoSdGjTuBTzuTUA7qD8isog5Jkr6pPfyeGQdAhlwzxN0V"
                alt="DrNote"
                style={{ width: 32, height: 32, objectFit: "contain" }}
              />
            </div>
            <span
              style={{
                fontSize: 17,
                fontWeight: 800,
                color: "#18181B",
                letterSpacing: "-0.02em",
              }}
            >
              DrNote
            </span>
          </Link>

          <div style={{ width: 1 }} />
        </div>

        <nav
          className="app-header-nav"
          style={{ display: "flex", alignItems: "center", gap: 10, justifySelf: "center" }}
        >
          <Link
            href="/"
            style={{
              fontSize: 16,
              fontWeight: 600,
              color: "#3F3F46",
              textDecoration: "none",
              padding: "6px 10px",
              borderRadius: 8,
              transition: "all 0.15s",
            }}
            className="nav-link"
          >
            Home
          </Link>
          <Link
            href="/library"
            style={{
              fontSize: 16,
              fontWeight: 600,
              color: "#3F3F46",
              textDecoration: "none",
              padding: "6px 10px",
              borderRadius: 8,
              transition: "all 0.15s",
            }}
            className="nav-link"
          >
            Library
          </Link>
        </nav>

        <div
          className="app-header-actions"
          style={{ display: "flex", alignItems: "center", gap: 7, justifySelf: "end" }}
        >
          <Link
            href="/pricing"
            className="btn-upgrade"
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: "#fff",
              textDecoration: "none",
              padding: "7px 16px",
              borderRadius: 100,
              background: "#18181B",
              display: "flex",
              alignItems: "center",
              gap: 5,
              border: "1.5px solid #18181B",
              transition: "all 0.15s",
              whiteSpace: "nowrap",
            }}
          >
            <Sparkles size={12} strokeWidth={2.4} />
            Upgrade
          </Link>
          <SignedOut>
            <SignInButton mode="modal">
              <button
                type="button"
                className="btn-gs"
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#3F3F46",
                  padding: "7px 16px",
                  borderRadius: 100,
                  background: "rgba(24,24,27,0.05)",
                  border: "1.5px solid rgba(24,24,27,0.12)",
                  transition: "all 0.15s",
                  cursor: "pointer",
                }}
              >
                Get Started
              </button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <UserButton />
          </SignedIn>
        </div>
      </div>
    </header>
  );
}
