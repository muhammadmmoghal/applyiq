"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { useAuth } from "@/app/context/AuthContext";

/* ── Icons ──────────────────────────────────────────────────────── */

function GoogleIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

function IconDashboard() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
      <rect x="1" y="1" width="5.5" height="5.5" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
      <rect x="8.5" y="1" width="5.5" height="5.5" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
      <rect x="1" y="8.5" width="5.5" height="5.5" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
      <rect x="8.5" y="8.5" width="5.5" height="5.5" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

function IconSignOut() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
      <path d="M5.5 13H3a1.5 1.5 0 01-1.5-1.5v-9A1.5 1.5 0 013 1h2.5"
            stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M10 10.5L13.5 7.5 10 4.5M13.5 7.5H5.5"
            stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ── Constants ──────────────────────────────────────────────────── */

const NAV_LINKS = [
  { href: "/#features", label: "Features"  },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/about",     label: "About"     },
] as const;

/* ── Component ──────────────────────────────────────────────────── */

export default function Navbar() {
  const { user, loading, signInWithGoogle, signOut } = useAuth();
  const router = useRouter();

  const [scrolled,        setScrolled]        = useState(false);
  const [dropdownOpen,    setDropdownOpen]    = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  /* scroll detection */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* close dropdown on outside click or Escape */
  useEffect(() => {
    if (!dropdownOpen) return;
    function onMouseDown(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setDropdownOpen(false);
    }
    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [dropdownOpen]);

  const displayName  = user?.user_metadata?.full_name as string | undefined;
  const displayEmail = user?.email ?? "";
  const initial      = (displayName ?? displayEmail)?.[0]?.toUpperCase() ?? "?";

  async function handleSignOut() {
    setShowLogoutModal(false);
    setDropdownOpen(false);
    await signOut();
    router.push("/");
  }

  return (
    <>
      {/* ── Nav ──────────────────────────────────────────────────── */}
      <motion.nav
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.21, 0.47, 0.32, 0.98] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-slate-950/90 backdrop-blur-xl border-b border-white/[0.06] shadow-[0_4px_32px_-8px_rgba(0,0,0,0.6)]"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-6xl mx-auto px-8 py-3.5 flex items-center justify-between gap-6">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group shrink-0">
            <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-blue-700 group-hover:from-blue-400 group-hover:to-blue-600 rounded-lg flex items-center justify-center
                            transition-all duration-200 shadow-sm shadow-blue-500/30">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 12L6 7L9 10L12 5" stroke="white" strokeWidth="2"
                      strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="text-xl font-bold text-white transition-colors duration-200">
              Apply<span className="text-blue-400">IQ</span>
            </span>
          </Link>

          {/* Nav links */}
          <div className="hidden md:flex items-center gap-0.5">
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={label}
                href={href}
                className="text-slate-400 hover:text-white text-sm font-medium
                           px-3.5 py-2 rounded-lg hover:bg-white/[0.06]
                           transition-all duration-200"
              >
                {label}
              </Link>
            ))}
          </div>

          {/* Auth area */}
          {loading ? (
            <div className="w-24 h-8 rounded-lg bg-white/10 animate-pulse shrink-0" />
          ) : user ? (

            /* ── User dropdown trigger ── */
            <div className="relative shrink-0" ref={dropdownRef}>

              {/* Mobile: avatar-only button */}
              <button
                onClick={() => setDropdownOpen((o) => !o)}
                className="sm:hidden w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-white text-xs font-bold
                           flex items-center justify-center shadow-sm shadow-blue-500/30 hover:from-blue-400 hover:to-blue-600
                           transition-all duration-200"
                aria-label="Account menu"
              >
                {initial}
              </button>

              {/* Desktop: chip button */}
              <button
                onClick={() => setDropdownOpen((o) => !o)}
                className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl
                            border transition-all duration-200
                            ${dropdownOpen
                              ? "bg-white/10 border-white/20 text-white"
                              : "bg-white/[0.06] border-white/10 hover:border-white/20 text-slate-300"
                            }`}
                aria-label="Account menu"
                aria-expanded={dropdownOpen}
              >
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-white text-[11px] font-bold
                                flex items-center justify-center shrink-0 shadow-sm shadow-blue-500/30">
                  {initial}
                </div>
                <span className="text-xs font-medium max-w-[130px] truncate">
                  {displayName ?? displayEmail}
                </span>
                <svg
                  width="11" height="11" viewBox="0 0 11 11" fill="none"
                  className={`shrink-0 transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`}
                >
                  <path d="M2 3.5l3.5 3.5 3.5-3.5" stroke="currentColor"
                        strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              {/* ── Dropdown panel ── */}
              {dropdownOpen && (
                <div className="dropdown-enter absolute right-0 top-full mt-2.5 w-64
                                bg-slate-900/95 backdrop-blur-xl rounded-2xl
                                shadow-2xl shadow-black/60
                                border border-white/[0.08] overflow-hidden z-10">

                  {/* User info header */}
                  <div className="px-4 py-4 flex items-center gap-3 border-b border-white/[0.08]">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-white text-sm font-bold
                                    flex items-center justify-center shrink-0 shadow-sm shadow-blue-500/30">
                      {initial}
                    </div>
                    <div className="min-w-0">
                      {displayName && (
                        <p className="text-sm font-semibold text-white truncate leading-snug">
                          {displayName}
                        </p>
                      )}
                      <p className={`text-xs truncate leading-snug ${displayName ? "text-slate-400" : "text-slate-300 font-medium"}`}>
                        {displayEmail}
                      </p>
                    </div>
                  </div>

                  {/* Menu items */}
                  <div className="p-1.5 space-y-0.5">
                    <Link
                      href="/dashboard"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium
                                 text-slate-400 hover:text-white hover:bg-white/[0.06]
                                 transition-all duration-150"
                    >
                      <IconDashboard />
                      Dashboard
                    </Link>

                    <button
                      onClick={() => { setDropdownOpen(false); setShowLogoutModal(true); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium
                                 text-slate-400 hover:text-red-400 hover:bg-red-500/10
                                 transition-all duration-150 text-left"
                    >
                      <IconSignOut />
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>

          ) : (

            /* ── Sign in button ── */
            <button
              onClick={() => signInWithGoogle()}
              className="shrink-0 inline-flex items-center gap-2
                         bg-gradient-to-r from-blue-600 to-blue-500
                         hover:from-blue-500 hover:to-cyan-400
                         text-white
                         px-4 py-2 rounded-xl text-sm font-semibold
                         transition-all duration-200
                         shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/40
                         hover:scale-[1.03]"
            >
              <GoogleIcon />
              Sign In
            </button>
          )}

        </div>
      </motion.nav>

      {/* ── Logout confirmation modal ─────────────────────────────── */}
      {showLogoutModal && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
          onClick={(e) => { if (e.target === e.currentTarget) setShowLogoutModal(false); }}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">

            {/* Icon */}
            <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none" className="text-red-500">
                <path d="M11 8.5v4.5M11 15.5v.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                <path d="M9.13 3.36L1.5 16.5A2 2 0 003.37 19.5H18.63a2 2 0 001.87-3L12.87 3.36a2 2 0 00-3.74 0z"
                      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>

            <h3 className="text-base font-bold text-gray-900 text-center mb-1.5">
              Sign out of ApplyIQ?
            </h3>
            <p className="text-sm text-gray-400 text-center mb-6 leading-relaxed">
              You&apos;ll need to sign back in to access your dashboard and applications.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 border border-gray-200 text-gray-600 hover:border-gray-300
                           hover:bg-gray-50 py-2.5 rounded-xl text-sm font-semibold
                           transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSignOut}
                className="flex-1 bg-red-500 hover:bg-red-600 active:bg-red-700 text-white
                           py-2.5 rounded-xl text-sm font-semibold transition-colors duration-200 shadow-sm"
              >
                Sign out
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
