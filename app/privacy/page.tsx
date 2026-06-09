import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import FadeUp from "@/app/components/FadeUp";

export const metadata: Metadata = {
  title: "Privacy Policy — ApplyIQ",
  description:
    "ApplyIQ privacy policy: what data we collect, how we use it, and your rights.",
};

/* ── Section data ───────────────────────────────────────────────── */

const sections = [
  {
    id: "what-we-collect",
    badge: "Data Collection",
    badgeColor: "blue" as const,
    title: "What we collect",
    items: [
      {
        icon: "user",
        heading: "Account information",
        body: "When you sign in with Google, ApplyIQ receives your email address and display name via Supabase Authentication. No password is stored by ApplyIQ.",
      },
      {
        icon: "briefcase",
        heading: "Job application data",
        body: "Details you choose to save: company name, role title, job URL, source platform, application status, optional notes, and optional follow-up dates.",
      },
    ],
  },
  {
    id: "how-we-use",
    badge: "Data Use",
    badgeColor: "violet" as const,
    title: "How we use your data",
    items: [
      {
        icon: "chart",
        heading: "Application tracking",
        body: "Your saved applications are displayed on your personal dashboard so you can monitor status, deadlines, and pipeline stage.",
      },
      {
        icon: "lock",
        heading: "Nothing else",
        body: "ApplyIQ does not use your data for advertising, profiling, or any purpose beyond providing the application tracking service you signed up for.",
      },
    ],
  },
  {
    id: "what-we-dont",
    badge: "What We Don't Collect",
    badgeColor: "cyan" as const,
    title: "What we never collect",
    items: [
      {
        icon: "shield",
        heading: "Sensitive personal data",
        body: "ApplyIQ does not collect passwords, payment information, health or medical information, precise location, or government ID numbers.",
      },
      {
        icon: "eye-off",
        heading: "Browsing activity",
        body: "The Chrome extension only reads the current page when you click Save. It does not track your browsing history or any pages you do not explicitly save.",
      },
    ],
  },
  {
    id: "data-sharing",
    badge: "Third Parties",
    badgeColor: "blue" as const,
    title: "Data sharing",
    items: [
      {
        icon: "no-sell",
        heading: "We do not sell your data",
        body: "ApplyIQ does not sell, rent, or trade user data to any third party, ever.",
      },
      {
        icon: "server",
        heading: "Service providers",
        body: "Your data is stored and processed by Supabase (database and authentication) and hosted on Vercel. These providers are used solely to operate ApplyIQ and are bound by their own privacy policies.",
      },
    ],
  },
  {
    id: "extension-storage",
    badge: "Chrome Extension",
    badgeColor: "violet" as const,
    title: "Chrome extension storage",
    items: [
      {
        icon: "chrome",
        heading: "What is stored locally",
        body: "The ApplyIQ extension uses chrome.storage.local to keep you signed in between browser sessions. Only your session token is stored — no browsing data.",
      },
      {
        icon: "trash",
        heading: "Clearing extension data",
        body: "You can clear extension storage at any time by removing the extension from Chrome or clearing site data for ApplyIQ in your browser settings.",
      },
    ],
  },
  {
    id: "your-rights",
    badge: "Your Rights",
    badgeColor: "cyan" as const,
    title: "Your rights & data deletion",
    items: [
      {
        icon: "delete",
        heading: "Delete applications",
        body: "You can delete individual saved applications directly from the dashboard at any time.",
      },
      {
        icon: "account",
        heading: "Delete your account",
        body: "To request full deletion of your account and all associated data, email us at muhammadmmoghal@gmail.com. We will process your request within 30 days.",
      },
    ],
  },
];

/* ── Icon components ────────────────────────────────────────────── */

const ICON_PATHS: Record<string, React.ReactNode> = {
  user: <path d="M11 7a3 3 0 100 6 3 3 0 000-6zM4 19c0-3.866 3.134-7 7-7s7 3.134 7 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />,
  briefcase: <><rect x="3" y="7" width="14" height="11" rx="2" stroke="currentColor" strokeWidth="1.6"/><path d="M8 7V5a2 2 0 012-2h0a2 2 0 012 2v2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></>,
  chart: <path d="M3 16l4.5-6 4 3.5 4.5-5.5 3.5 4M2 2v16h18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />,
  lock: <><rect x="5" y="9" width="10" height="9" rx="2" stroke="currentColor" strokeWidth="1.6"/><path d="M8 9V6a3 3 0 116 0v3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></>,
  shield: <path d="M10 2L3 5v5c0 4.5 3 8 7 9 4-1 7-4.5 7-9V5L10 2z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />,
  "eye-off": <><path d="M3 3l14 14M10.5 6.1A5 5 0 0115 10.5M7.3 7.3A5 5 0 005 11c0 2.8 2.2 5 5 5a5 5 0 003.7-1.7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/><path d="M2 11s3-6 8-6M18 11s-3 6-8 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></>,
  "no-sell": <><circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.6"/><path d="M4.5 4.5l11 11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></>,
  server: <><rect x="3" y="4" width="14" height="5" rx="1.5" stroke="currentColor" strokeWidth="1.6"/><rect x="3" y="11" width="14" height="5" rx="1.5" stroke="currentColor" strokeWidth="1.6"/><circle cx="6.5" cy="6.5" r="1" fill="currentColor"/><circle cx="6.5" cy="13.5" r="1" fill="currentColor"/></>,
  chrome: <><circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.6"/><circle cx="10" cy="10" r="3" stroke="currentColor" strokeWidth="1.6"/><path d="M10 7h8M5.6 12.5L1.5 5.5M14.4 12.5l-4.4 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></>,
  trash: <><path d="M4 6h12M7 6V4h6v2M5 6l1 11h8l1-11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></>,
  delete: <><circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.6"/><path d="M7 10h6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></>,
  account: <><path d="M10 10a3.5 3.5 0 100-7 3.5 3.5 0 000 7z" stroke="currentColor" strokeWidth="1.6"/><path d="M3 18c0-3.866 3.134-7 7-7s7 3.134 7 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></>,
};

const BADGE_STYLES = {
  blue:   { wrap: "bg-blue-500/[0.08] border-blue-500/[0.15] text-blue-400",   dot: "bg-blue-400"   },
  violet: { wrap: "bg-violet-500/[0.08] border-violet-500/[0.15] text-violet-400", dot: "bg-violet-400" },
  cyan:   { wrap: "bg-cyan-500/[0.08] border-cyan-500/[0.15] text-cyan-400",   dot: "bg-cyan-400"   },
};

const ACCENT_RGB = { blue: "59,130,246", violet: "139,92,246", cyan: "6,182,212" };

function PolicyIcon({ name }: { name: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" className="shrink-0">
      {ICON_PATHS[name]}
    </svg>
  );
}

/* ── Page ───────────────────────────────────────────────────────── */

export default function PrivacyPage() {
  return (
    <>
      <Navbar />
      <main className="bg-[#050b1a] min-h-screen">

        {/* ── Hero ─────────────────────────────────────────────── */}
        <section className="relative overflow-hidden px-6 pt-36 pb-20">
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[700px] h-[450px]
                            bg-blue-700/[0.07] rounded-full blur-[120px]" />
            <div className="absolute top-1/2 right-0 w-[350px] h-[350px]
                            bg-violet-700/[0.05] rounded-full blur-[100px]" />
          </div>

          <div className="relative max-w-3xl mx-auto text-center">
            <FadeUp>
              <div className="inline-flex items-center gap-2
                              bg-blue-500/[0.08] border border-blue-500/[0.15]
                              text-blue-400 px-4 py-1.5 rounded-full
                              text-xs font-semibold mb-6 backdrop-blur-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                Privacy Policy
              </div>
            </FadeUp>

            <FadeUp delay={60}>
              <h1 className="text-5xl lg:text-6xl font-bold text-white mb-6"
                  style={{ lineHeight: 1.06 }}>
                Your data,{" "}
                <span className="text-gradient-light">your control.</span>
              </h1>
            </FadeUp>

            <FadeUp delay={130}>
              <p className="text-lg text-slate-400 leading-relaxed max-w-2xl mx-auto mb-6">
                ApplyIQ is built on the principle that your job search data belongs to you.
                Here is exactly what we collect, why, and what we never do with it.
              </p>
            </FadeUp>

            <FadeUp delay={180}>
              <p className="text-xs text-slate-600">
                Last updated: June 2025 &mdash; applies to applyiq-pi.vercel.app and the ApplyIQ Chrome extension
              </p>
            </FadeUp>
          </div>
        </section>

        {/* ── Policy sections ──────────────────────────────────── */}
        <section className="relative px-6 pb-24">
          <div className="absolute top-0 left-0 right-0 h-px
                          bg-gradient-to-r from-transparent via-white/[0.06] to-transparent
                          pointer-events-none" />

          <div className="relative max-w-3xl mx-auto space-y-6">
            {sections.map((s, si) => {
              const badge  = BADGE_STYLES[s.badgeColor];
              const accent = ACCENT_RGB[s.badgeColor];
              return (
                <FadeUp key={s.id} delay={si * 60}>
                  <div
                    id={s.id}
                    className="rounded-2xl border border-white/[0.07] overflow-hidden"
                    style={{
                      background: "linear-gradient(145deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.015) 100%)",
                    }}
                  >
                    {/* Section header */}
                    <div className="px-7 pt-7 pb-5 border-b border-white/[0.05]">
                      <div className={`inline-flex items-center gap-2 border px-3 py-1 rounded-full
                                      text-xs font-semibold mb-4 backdrop-blur-sm ${badge.wrap}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                        {s.badge}
                      </div>
                      <h2 className="text-xl font-bold text-white">{s.title}</h2>
                    </div>

                    {/* Items */}
                    <div className="divide-y divide-white/[0.04]">
                      {s.items.map((item) => (
                        <div key={item.heading}
                             className="group px-7 py-5 flex gap-4 hover:bg-white/[0.02] transition-colors duration-200">
                          <div
                            className="mt-0.5 w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-opacity duration-200"
                            style={{
                              background: `rgba(${accent}, 0.10)`,
                              color: `rgb(${accent})`,
                              boxShadow: `0 0 0 1px rgba(${accent}, 0.18)`,
                            }}
                          >
                            <PolicyIcon name={item.icon} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-[14px] font-semibold text-white mb-1.5 leading-snug">
                              {item.heading}
                            </p>
                            <p className="text-sm text-slate-400 leading-relaxed">
                              {item.body}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </FadeUp>
              );
            })}

            {/* ── Contact card ─────────────────────────────────── */}
            <FadeUp delay={sections.length * 60}>
              <div
                className="rounded-2xl border border-white/[0.07] p-7 text-center"
                style={{
                  background: "linear-gradient(145deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.015) 100%)",
                }}
              >
                <div className="absolute inset-x-0 top-0 h-px rounded-t-2xl
                                bg-gradient-to-r from-transparent via-blue-400/[0.30] to-transparent
                                pointer-events-none" />
                <h2 className="text-lg font-bold text-white mb-2">Questions or requests?</h2>
                <p className="text-sm text-slate-400 leading-relaxed mb-5 max-w-md mx-auto">
                  For privacy questions, data deletion requests, or anything else, reach out directly.
                </p>
                <a
                  href="mailto:muhammadmmoghal@gmail.com"
                  className="inline-flex items-center gap-2
                             bg-gradient-to-r from-blue-600 to-blue-500
                             hover:from-blue-500 hover:to-cyan-400
                             text-white px-6 py-2.5 rounded-xl text-sm font-semibold
                             transition-all duration-200
                             shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/40
                             hover:-translate-y-0.5"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <rect x="1" y="3" width="12" height="8" rx="1.5" stroke="white" strokeWidth="1.4"/>
                    <path d="M1 4l6 4 6-4" stroke="white" strokeWidth="1.4" strokeLinecap="round"/>
                  </svg>
                  muhammadmmoghal@gmail.com
                </a>
              </div>
            </FadeUp>

            {/* ── Back link ────────────────────────────────────── */}
            <FadeUp delay={(sections.length + 1) * 60}>
              <div className="text-center pt-4">
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 text-sm text-slate-500
                             hover:text-slate-300 transition-colors duration-200"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M11 7H3M6 4L3 7l3 3" stroke="currentColor" strokeWidth="1.5"
                          strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Back to ApplyIQ
                </Link>
              </div>
            </FadeUp>
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}
