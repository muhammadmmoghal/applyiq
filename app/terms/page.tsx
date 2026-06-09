import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import FadeUp from "@/app/components/FadeUp";

export const metadata: Metadata = {
  title: "Terms of Service — ApplyIQ",
  description:
    "ApplyIQ Terms of Service: acceptable use, disclaimers, and your rights as a user.",
};

/* ── Section data ───────────────────────────────────────────────── */

const sections = [
  {
    id: "acceptance",
    badge: "Acceptance",
    badgeColor: "blue" as const,
    title: "Acceptance of Terms",
    items: [
      {
        icon: "check-circle",
        heading: "Agreement to these terms",
        body: "By accessing or using ApplyIQ, you agree to be bound by these Terms of Service. If you do not agree, please do not use the service.",
      },
    ],
  },
  {
    id: "service",
    badge: "Service",
    badgeColor: "violet" as const,
    title: "Service description",
    items: [
      {
        icon: "briefcase",
        heading: "Job application tracking",
        body: "ApplyIQ provides tools to save, organize, and manage job opportunities from supported platforms such as LinkedIn and Handshake.",
      },
      {
        icon: "layout",
        heading: "Dashboard and management",
        body: "Your saved applications are organized in a personal dashboard where you can track status, add notes, and monitor your pipeline.",
      },
    ],
  },
  {
    id: "accounts",
    badge: "Accounts",
    badgeColor: "cyan" as const,
    title: "User accounts",
    items: [
      {
        icon: "user",
        heading: "Account responsibility",
        body: "You are responsible for maintaining the confidentiality of your account and for all activity that occurs under it.",
      },
      {
        icon: "google",
        heading: "Sign-in via Google",
        body: "Accounts are created through Google Sign-In via Supabase Authentication. You agree to use only an account you are authorized to use.",
      },
    ],
  },
  {
    id: "content",
    badge: "User Content",
    badgeColor: "blue" as const,
    title: "User content",
    items: [
      {
        icon: "file",
        heading: "You own your data",
        body: "Users retain full ownership of all job application data, notes, and information saved within ApplyIQ.",
      },
      {
        icon: "lock",
        heading: "Limited license to operate",
        body: "By saving content to ApplyIQ, you grant us a limited license to store and display it solely for the purpose of providing the service to you.",
      },
    ],
  },
  {
    id: "acceptable-use",
    badge: "Acceptable Use",
    badgeColor: "violet" as const,
    title: "Acceptable use",
    items: [
      {
        icon: "shield",
        heading: "Legal and platform compliance",
        body: "You agree not to use ApplyIQ for unlawful purposes, or to abuse or misuse supported job platforms such as LinkedIn or Handshake.",
      },
      {
        icon: "no-entry",
        heading: "System integrity",
        body: "You agree not to attempt unauthorized access to ApplyIQ systems or data, or interfere with the operation or availability of the service in any way.",
      },
    ],
  },
  {
    id: "third-party",
    badge: "Third Parties",
    badgeColor: "cyan" as const,
    title: "Third-party services",
    items: [
      {
        icon: "server",
        heading: "Integrated services",
        body: "ApplyIQ integrates with LinkedIn, Handshake, Supabase, Google Authentication, and Vercel to deliver core functionality.",
      },
      {
        icon: "link",
        heading: "Third-party terms apply",
        body: "Use of those services is subject to their respective terms and policies. ApplyIQ is not responsible for the practices of any third-party service.",
      },
    ],
  },
  {
    id: "disclaimer",
    badge: "Disclaimer",
    badgeColor: "blue" as const,
    title: "Disclaimer",
    items: [
      {
        icon: "alert",
        heading: '"As is" basis',
        body: 'ApplyIQ is provided on an "as is" and "as available" basis without warranties of any kind, express or implied.',
      },
      {
        icon: "no-results",
        heading: "No employment guarantees",
        body: "ApplyIQ does not guarantee job placement, interview opportunities, or employment outcomes of any kind.",
      },
    ],
  },
  {
    id: "liability",
    badge: "Liability",
    badgeColor: "violet" as const,
    title: "Limitation of liability",
    items: [
      {
        icon: "shield-off",
        heading: "No consequential damages",
        body: "ApplyIQ shall not be liable for indirect, incidental, special, or consequential damages arising from your use of, or inability to use, the service.",
      },
    ],
  },
  {
    id: "changes",
    badge: "Updates",
    badgeColor: "cyan" as const,
    title: "Changes to terms",
    items: [
      {
        icon: "refresh",
        heading: "Periodic updates",
        body: "These Terms may be updated periodically. The revision date at the top of this page will reflect the most recent changes.",
      },
      {
        icon: "check-circle",
        heading: "Continued use as acceptance",
        body: "Your continued use of ApplyIQ after any updates to these Terms constitutes your acceptance of the revised Terms.",
      },
    ],
  },
];

/* ── Icons ──────────────────────────────────────────────────────── */

const ICON_PATHS: Record<string, React.ReactNode> = {
  "check-circle": (
    <>
      <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.6" />
      <path d="M6.5 10.5l2.5 2.5 4.5-5" stroke="currentColor" strokeWidth="1.6"
            strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  briefcase: (
    <>
      <rect x="3" y="7" width="14" height="11" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8 7V5a2 2 0 012-2h0a2 2 0 012 2v2" stroke="currentColor" strokeWidth="1.6"
            strokeLinecap="round" />
    </>
  ),
  layout: (
    <>
      <rect x="2" y="2" width="7" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
      <rect x="11" y="2" width="7" height="4" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
      <rect x="11" y="9" width="7" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
      <rect x="2" y="13" width="7" height="5" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
    </>
  ),
  user: (
    <path d="M10 10a3.5 3.5 0 100-7 3.5 3.5 0 000 7zM3 18c0-3.866 3.134-7 7-7s7 3.134 7 7"
          stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  ),
  google: (
    <>
      <path d="M18 10.2c0-.7-.06-1.4-.18-2.07H10v3.91h4.46a3.8 3.8 0 01-1.65 2.5v2.07h2.67C16.93 15.03 18 12.8 18 10.2z"
            fill="currentColor" opacity=".8" />
      <path d="M10 18c2.16 0 3.98-.72 5.3-1.94l-2.67-2.07a5.1 5.1 0 01-2.63.74c-2.02 0-3.74-1.36-4.35-3.2H2.9v2.13A7.99 7.99 0 0010 18z"
            fill="currentColor" opacity=".6" />
      <path d="M5.65 11.53A4.84 4.84 0 015.4 10c0-.53.1-1.05.25-1.53V6.34H2.9A8.02 8.02 0 002 10c0 1.3.31 2.52.9 3.6l2.75-2.07z"
            fill="currentColor" opacity=".4" />
      <path d="M10 5.27c1.17 0 2.22.4 3.05 1.2l2.28-2.28A7.95 7.95 0 0010 2C7.26 2 4.84 3.48 3.45 5.7l2.2 2.77A4.77 4.77 0 0110 5.27z"
            fill="currentColor" opacity=".9" />
    </>
  ),
  file: (
    <>
      <path d="M4 3h8l4 4v11a1 1 0 01-1 1H4a1 1 0 01-1-1V4a1 1 0 011-1z"
            stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M12 3v4h4" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M7 10h6M7 13h4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </>
  ),
  lock: (
    <>
      <rect x="5" y="9" width="10" height="9" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8 9V6a3 3 0 116 0v3" stroke="currentColor" strokeWidth="1.6"
            strokeLinecap="round" />
    </>
  ),
  shield: (
    <path d="M10 2L3 5v5c0 4.5 3 8 7 9 4-1 7-4.5 7-9V5L10 2z"
          stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
  ),
  "no-entry": (
    <>
      <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.6" />
      <path d="M6.5 10h7" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
    </>
  ),
  server: (
    <>
      <rect x="3" y="4" width="14" height="5" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
      <rect x="3" y="11" width="14" height="5" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="6.5" cy="6.5" r="1" fill="currentColor" />
      <circle cx="6.5" cy="13.5" r="1" fill="currentColor" />
    </>
  ),
  link: (
    <>
      <path d="M8.5 12.5a4.243 4.243 0 006 0l2-2a4.243 4.243 0 00-6-6l-1 1"
            stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M11.5 7.5a4.243 4.243 0 00-6 0l-2 2a4.243 4.243 0 006 6l1-1"
            stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </>
  ),
  alert: (
    <>
      <path d="M10 2.5L2 17.5h16L10 2.5z" stroke="currentColor" strokeWidth="1.6"
            strokeLinejoin="round" />
      <path d="M10 9v4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <circle cx="10" cy="15" r="0.8" fill="currentColor" />
    </>
  ),
  "no-results": (
    <>
      <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.6" />
      <path d="M7.5 7.5l5 5M12.5 7.5l-5 5" stroke="currentColor" strokeWidth="1.6"
            strokeLinecap="round" />
    </>
  ),
  "shield-off": (
    <>
      <path d="M3 3l14 14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M10 2l7 3v5c0 2.7-1.1 5.1-3 6.8M6.7 16.3A8.8 8.8 0 013 10V5l4-1.4"
            stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"
            strokeLinejoin="round" />
    </>
  ),
  refresh: (
    <>
      <path d="M16.5 9A6.5 6.5 0 006 5.5L4.5 4" stroke="currentColor" strokeWidth="1.6"
            strokeLinecap="round" />
      <path d="M3.5 11A6.5 6.5 0 0014 14.5L15.5 16" stroke="currentColor" strokeWidth="1.6"
            strokeLinecap="round" />
      <path d="M3.5 7v-3h3" stroke="currentColor" strokeWidth="1.6"
            strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16.5 13v3h-3" stroke="currentColor" strokeWidth="1.6"
            strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
};

const BADGE_STYLES = {
  blue:   { wrap: "bg-blue-500/[0.08] border-blue-500/[0.15] text-blue-400",       dot: "bg-blue-400"   },
  violet: { wrap: "bg-violet-500/[0.08] border-violet-500/[0.15] text-violet-400", dot: "bg-violet-400" },
  cyan:   { wrap: "bg-cyan-500/[0.08] border-cyan-500/[0.15] text-cyan-400",       dot: "bg-cyan-400"   },
};

const ACCENT_RGB = { blue: "59,130,246", violet: "139,92,246", cyan: "6,182,212" };

function TermsIcon({ name }: { name: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" className="shrink-0">
      {ICON_PATHS[name]}
    </svg>
  );
}

/* ── Page ───────────────────────────────────────────────────────── */

export default function TermsPage() {
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
                Terms of Service
              </div>
            </FadeUp>

            <FadeUp delay={60}>
              <h1 className="text-5xl lg:text-6xl font-bold text-white mb-6"
                  style={{ lineHeight: 1.06 }}>
                Simple rules,{" "}
                <span className="text-gradient-light">fair service.</span>
              </h1>
            </FadeUp>

            <FadeUp delay={130}>
              <p className="text-lg text-slate-400 leading-relaxed max-w-2xl mx-auto mb-6">
                These terms govern your use of ApplyIQ. They are written to be
                straightforward — no legal maze, just clear expectations on both sides.
              </p>
            </FadeUp>

            <FadeUp delay={180}>
              <p className="text-xs text-slate-600">
                Last updated: June 2026 &mdash; applies to applyiq-pi.vercel.app and the ApplyIQ Chrome extension
              </p>
            </FadeUp>
          </div>
        </section>

        {/* ── Terms sections ───────────────────────────────────── */}
        <section className="relative px-6 pb-24">
          <div className="absolute top-0 left-0 right-0 h-px
                          bg-gradient-to-r from-transparent via-white/[0.06] to-transparent
                          pointer-events-none" />

          <div className="relative max-w-3xl mx-auto space-y-6">
            {sections.map((s, si) => {
              const badge  = BADGE_STYLES[s.badgeColor];
              const accent = ACCENT_RGB[s.badgeColor];
              return (
                <FadeUp key={s.id} delay={si * 55}>
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
                            className="mt-0.5 w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                            style={{
                              background: `rgba(${accent}, 0.10)`,
                              color: `rgb(${accent})`,
                              boxShadow: `0 0 0 1px rgba(${accent}, 0.18)`,
                            }}
                          >
                            <TermsIcon name={item.icon} />
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
            <FadeUp delay={sections.length * 55}>
              <div
                className="relative rounded-2xl border border-white/[0.07] p-7 text-center"
                style={{
                  background: "linear-gradient(145deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.015) 100%)",
                }}
              >
                <div className="absolute inset-x-0 top-0 h-px rounded-t-2xl
                                bg-gradient-to-r from-transparent via-blue-400/[0.30] to-transparent
                                pointer-events-none" />
                <h2 className="text-lg font-bold text-white mb-2">Questions about these terms?</h2>
                <p className="text-sm text-slate-400 leading-relaxed mb-5 max-w-md mx-auto">
                  If you have any questions about these Terms of Service, reach out directly.
                </p>
                <a
                  href="mailto:minimoghal123@gmail.com"
                  className="inline-flex items-center gap-2
                             bg-gradient-to-r from-blue-600 to-blue-500
                             hover:from-blue-500 hover:to-cyan-400
                             text-white px-6 py-2.5 rounded-xl text-sm font-semibold
                             transition-all duration-200
                             shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/40
                             hover:-translate-y-0.5"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <rect x="1" y="3" width="12" height="8" rx="1.5" stroke="white" strokeWidth="1.4" />
                    <path d="M1 4l6 4 6-4" stroke="white" strokeWidth="1.4" strokeLinecap="round" />
                  </svg>
                  minimoghal123@gmail.com
                </a>
              </div>
            </FadeUp>

            {/* ── Footer links ─────────────────────────────────── */}
            <FadeUp delay={(sections.length + 1) * 55}>
              <div className="flex items-center justify-center gap-6 pt-4">
                <Link
                  href="/privacy"
                  className="inline-flex items-center gap-2 text-sm text-slate-500
                             hover:text-slate-300 transition-colors duration-200"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M7 1L3 4v4c0 3 2 5 4 5s4-2 4-5V4L7 1z"
                          stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
                  </svg>
                  Privacy Policy
                </Link>
                <span className="text-slate-700">·</span>
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
