"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Menu, X } from "lucide-react";
import ButtonSignin from "./ButtonSignin";

const links = [
  { href: "/", label: "Home" },
  { href: "/pricing", label: "Pricing" },
  { href: "/#faq", label: "FAQ" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/self-assessment", label: "Self Exam" },
];

function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2" title="DrNote homepage">
      <span
        className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#58CC02] text-xl font-extrabold text-white"
        style={{ boxShadow: "0 4px 0 #46A302" }}
      >
        D
      </span>
      <span className="text-xl font-extrabold tracking-tight text-[#3C3C3C]">
        DrNote.co
      </span>
    </Link>
  );
}

const signInStyle =
  "min-h-0 h-auto rounded-2xl border-0 bg-[#58CC02] px-5 py-2.5 text-xs font-extrabold uppercase tracking-wide text-white hover:brightness-105";

const Header = () => {
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setIsOpen(false);
  }, [searchParams]);

  return (
    <header className="sticky top-0 z-40 border-b-2 border-[#E5E5E5] bg-white/95 text-[#3C3C3C] backdrop-blur">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4" aria-label="Global">
        <Logo />

        <div className="hidden items-center gap-6 text-sm font-bold text-[#777] md:flex">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="transition-colors hover:text-[#58CC02]">
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden md:block" style={{ filter: "drop-shadow(0 4px 0 #46A302)" }}>
          <ButtonSignin extraStyle={signInStyle} />
        </div>

        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border-2 border-[#E5E5E5] bg-white text-[#3C3C3C] md:hidden"
          onClick={() => setIsOpen(true)}
          aria-label="Open main menu"
        >
          <Menu className="h-5 w-5" strokeWidth={3} />
        </button>
      </nav>

      {isOpen ? (
        <div className="fixed inset-0 z-50 bg-black/20 md:hidden">
          <div className="ml-auto h-full w-full max-w-sm border-l-2 border-[#E5E5E5] bg-white p-4 shadow-xl">
            <div className="flex items-center justify-between">
              <Logo />
              <button
                type="button"
                className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border-2 border-[#E5E5E5]"
                onClick={() => setIsOpen(false)}
                aria-label="Close menu"
              >
                <X className="h-5 w-5" strokeWidth={3} />
              </button>
            </div>

            <div className="mt-8 space-y-3">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center justify-between rounded-2xl border-2 border-[#E5E5E5] bg-white px-4 py-3 text-sm font-extrabold text-[#3C3C3C]"
                >
                  {link.label}
                  <ChevronRight className="h-4 w-4 text-[#58CC02]" strokeWidth={3} />
                </Link>
              ))}
            </div>

            <div className="mt-6" style={{ filter: "drop-shadow(0 4px 0 #46A302)" }}>
              <ButtonSignin extraStyle={`${signInStyle} w-full justify-center`} />
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
};

export default Header;
