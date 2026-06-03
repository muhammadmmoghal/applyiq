import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import FadeUp from "@/app/components/FadeUp";

export const metadata: Metadata = {
  title: "About — ApplyIQ",
  description:
    "Learn what ApplyIQ is, why it exists, and where it's heading.",
};

/* ── Data ───────────────────────────────────────────────────────── */

const cards = [
  {
    gradient:  "from-blue-500 to-indigo-600",
    shadow:    "shadow-blue-500/25",
    accentRgb: "59, 130, 246",
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <path d="M11 2L3 7.5v7L11 20l8-5.5v-7L11 2z"
              stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M3 7.5l8 5 8-5"
              stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: "Built for real job seekers",
    body:  "From first internship to senior role — ApplyIQ adapts to wherever you are in your career. No complexity, no bloat, just the tools you actually need.",
  },
  {
    gradient:  "from-violet-500 to-purple-700",
    shadow:    "shadow-violet-500/25",
    accentRgb: "139, 92, 246",
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <circle cx="11" cy="11" r="8.5" stroke="white" strokeWidth="1.6" />
        <path d="M11 6.5v5l3.5 2.5" stroke="white" strokeWidth="1.6"
              strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: "Saves time across every application",
    body:  "Log an application in seconds, not minutes. No steep learning curve, no spreadsheet maintenance — everything is structured for you from the start.",
  },
  {
    gradient:  "from-cyan-500 to-blue-600",
    shadow:    "shadow-cyan-500/25",
    accentRgb: "6, 182, 212",
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <path d="M4 16l4.5-6 4 3.5 4.5-5.5 3.5 4"
              stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="2" y="2" width="18" height="18" rx="3" stroke="white" strokeWidth="1.6" />
      </svg>
    ),
    title: "Turns scattered data into insights",
    body:  "See your response rate, interview pipeline, and offer count at a glance. Understand what's working and make every next application smarter than the last.",
  },
];

const features = [
  { text: "Track every application: company, role, date, and status", soon: false },
  { text: "View response rate, interview count, and offer stats in real time", soon: false },
  { text: "Organize by pipeline stage: Applied, Interview, Offer, Rejected", soon: false },
  { text: "Add notes, job links, and follow-up dates per application", soon: false },
  { text: "Auto-import applications from Gmail and job boards", soon: true },
  { text: "AI insights to surface patterns and optimize your strategy", soon: true },
];

/* ── Page ───────────────────────────────────────────────────────── */

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className="bg-[#050b1a] min-h-screen">

        {/* ── Hero ─────────────────────────────────────────────── */}
        <section className="relative overflow-hidden px-6 pt-36 pb-24">

          {/* Ambient glows */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[800px] h-[500px]
                            bg-blue-700/[0.08] rounded-full blur-[120px]" />
            <div className="absolute top-1/2 right-0 w-[400px] h-[400px]
                            bg-violet-700/[0.06] rounded-full blur-[100px]" />
          </div>

          <div className="relative max-w-3xl mx-auto text-center">
            <FadeUp>
              <div className="inline-flex items-center gap-2
                              bg-blue-500/[0.08] border border-blue-500/[0.15]
                              text-blue-400 px-4 py-1.5 rounded-full
                              text-xs font-semibold mb-6 backdrop-blur-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                About ApplyIQ
              </div>
            </FadeUp>

            <FadeUp delay={60}>
              <h1 className="text-5xl lg:text-6xl font-bold text-white mb-6"
                  style={{ lineHeight: 1.06 }}>
                Track smarter.<br />
                <span className="text-gradient-light">Land more offers.</span>
              </h1>
            </FadeUp>

            <FadeUp delay={130}>
              <p className="text-lg text-slate-400 leading-relaxed max-w-2xl mx-auto mb-10">
                ApplyIQ is a focused job application tracker that helps you stay organized,
                understand what&apos;s working, and make smarter decisions throughout your search —
                all from one clean dashboard.
              </p>
            </FadeUp>

            <FadeUp delay={200}>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2
                           bg-gradient-to-r from-blue-600 to-blue-500
                           hover:from-blue-500 hover:to-cyan-400
                           text-white px-7 py-3.5 rounded-xl text-sm font-semibold
                           transition-all duration-200
                           shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/40
                           hover:-translate-y-0.5"
              >
                Open Dashboard
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M3 7h8M8 4l3 3-3 3" stroke="white" strokeWidth="1.6"
                        strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            </FadeUp>
          </div>
        </section>

        {/* ── Main Split: Story + Cards ─────────────────────────── */}
        <section className="relative overflow-hidden px-6 py-24">

          {/* Ambient glows */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-0 left-0 w-[600px] h-[600px]
                            bg-blue-700/[0.06] rounded-full blur-[120px]" />
            <div className="absolute bottom-0 right-0 w-[500px] h-[500px]
                            bg-violet-700/[0.05] rounded-full blur-[100px]" />
          </div>

          {/* Separator */}
          <div className="absolute top-0 left-0 right-0 h-px
                          bg-gradient-to-r from-transparent via-white/[0.07] to-transparent
                          pointer-events-none" />

          <div className="relative max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">

              {/* Left: Story */}
              <FadeUp>
                <div className="inline-flex items-center gap-2
                                bg-violet-500/[0.08] border border-violet-500/[0.15]
                                text-violet-400 px-4 py-1.5 rounded-full
                                text-xs font-semibold mb-7 backdrop-blur-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
                  The Story
                </div>

                <h2 className="text-4xl font-bold text-white mb-6"
                    style={{ lineHeight: 1.08 }}>
                  Job searching is<br />
                  hard enough.<br />
                  <span className="text-gradient-light">Staying organized<br />shouldn&apos;t be.</span>
                </h2>

                <p className="text-slate-400 leading-[1.75] mb-5 text-[15px] max-w-[440px]">
                  ApplyIQ started from a simple frustration: keeping track of dozens of
                  applications across spreadsheets, sticky notes, and email threads is
                  exhausting — and it causes good opportunities to slip through the cracks.
                </p>
                <p className="text-slate-400 leading-[1.75] mb-10 text-[15px] max-w-[440px]">
                  We built ApplyIQ to give every job seeker a single, focused place to manage
                  their search — without the overhead of a complex tool.
                </p>

                <Link
                  href="/dashboard"
                  className="group inline-flex items-center gap-2.5
                             bg-gradient-to-r from-blue-600 to-blue-500
                             hover:from-blue-500 hover:to-cyan-400
                             text-white px-7 py-3.5 rounded-xl text-sm font-semibold
                             transition-all duration-200
                             shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/40
                             hover:-translate-y-0.5"
                >
                  Try it for free
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none"
                       className="transition-transform duration-200 group-hover:translate-x-0.5">
                    <path d="M3 7h8M8 4l3 3-3 3" stroke="white" strokeWidth="1.6"
                          strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Link>
              </FadeUp>

              {/* Right: Floating glass cards */}
              <div className="flex flex-col gap-4">
                {cards.map((c, i) => (
                  <FadeUp key={c.title} delay={i * 120}>
                    <div
                      className="group relative rounded-2xl p-6 flex gap-5
                                 border border-white/[0.07] hover:border-white/[0.14]
                                 overflow-hidden cursor-default
                                 hover:-translate-y-1.5
                                 shadow-[0_4px_24px_-6px_rgba(0,0,0,0.45)]
                                 transition-all duration-300"
                      style={{
                        background: "linear-gradient(145deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.015) 100%)",
                      }}
                    >
                      {/* Hover radial glow */}
                      <div
                        className="absolute inset-0 opacity-0 group-hover:opacity-100
                                   transition-opacity duration-500 pointer-events-none rounded-2xl"
                        style={{
                          background: `radial-gradient(ellipse at 10% 60%, rgba(${c.accentRgb}, 0.13), transparent 72%)`,
                        }}
                      />
                      {/* Top accent line */}
                      <div
                        className="absolute top-0 left-10 right-10 h-[1px] opacity-0
                                   group-hover:opacity-100 transition-opacity duration-300 rounded-full"
                        style={{
                          background: `linear-gradient(90deg, transparent, rgba(${c.accentRgb}, 0.55), transparent)`,
                        }}
                      />

                      {/* Icon */}
                      <div className={`relative w-12 h-12 rounded-xl bg-gradient-to-br ${c.gradient}
                                       flex items-center justify-center shrink-0
                                       shadow-lg ${c.shadow}
                                       transition-all duration-300
                                       group-hover:scale-[1.08] group-hover:-rotate-2`}>
                        {c.icon}
                      </div>

                      {/* Content */}
                      <div className="relative min-w-0">
                        <h3 className="text-[15px] font-semibold text-white mb-1.5 leading-snug">
                          {c.title}
                        </h3>
                        <p className="text-sm text-slate-400 leading-relaxed">{c.body}</p>
                      </div>
                    </div>
                  </FadeUp>
                ))}
              </div>

            </div>
          </div>
        </section>

        {/* ── Features checklist ───────────────────────────────── */}
        <section className="relative overflow-hidden px-6 py-24">

          <div className="absolute top-0 left-0 right-0 h-px
                          bg-gradient-to-r from-transparent via-white/[0.06] to-transparent
                          pointer-events-none" />

          <div className="max-w-4xl mx-auto">
            <FadeUp className="text-center mb-12">
              <div className="inline-flex items-center gap-2
                              bg-blue-500/[0.08] border border-blue-500/[0.15]
                              text-blue-400 px-4 py-1.5 rounded-full
                              text-xs font-semibold mb-5 backdrop-blur-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                Features
              </div>
              <h2 className="text-3xl font-bold text-white mb-3">
                Everything you need to stay ahead
              </h2>
              <p className="text-slate-400 text-sm max-w-md mx-auto leading-relaxed">
                Powerful capabilities available today — and more coming soon.
              </p>
            </FadeUp>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {features.map(({ text, soon }, i) => (
                <FadeUp key={text} delay={i * 55}>
                  <div className="group flex items-start gap-4
                                  bg-white/[0.03] border border-white/[0.07]
                                  hover:border-white/[0.12] rounded-xl px-5 py-4 h-full
                                  transition-all duration-200 hover:-translate-y-0.5"
                       style={{
                         background: "linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)",
                       }}>
                    {soon ? (
                      <span className="mt-0.5 w-5 h-5 rounded-full bg-amber-500/[0.12]
                                       text-amber-400 flex items-center justify-center shrink-0
                                       ring-1 ring-amber-500/[0.20]">
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                          <path d="M5 2v3.5L7 7" stroke="currentColor" strokeWidth="1.4"
                                strokeLinecap="round" strokeLinejoin="round" />
                          <circle cx="5" cy="5" r="4" stroke="currentColor" strokeWidth="1.2" />
                        </svg>
                      </span>
                    ) : (
                      <span className="mt-0.5 w-5 h-5 rounded-full bg-blue-500/[0.12]
                                       text-blue-400 flex items-center justify-center shrink-0
                                       ring-1 ring-blue-500/[0.20]">
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                          <path d="M2 5.5l2 2 4-4" stroke="currentColor" strokeWidth="1.4"
                                strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </span>
                    )}
                    <div>
                      <p className="text-sm text-slate-300 leading-snug">{text}</p>
                      {soon && (
                        <span className="text-[10px] font-semibold text-amber-500/80 uppercase tracking-wider">
                          Coming soon
                        </span>
                      )}
                    </div>
                  </div>
                </FadeUp>
              ))}
            </div>
          </div>
        </section>

        {/* ── Vision / CTA (replaces bright blue section) ──────── */}
        <section className="relative overflow-hidden px-6 py-28">

          <div className="absolute top-0 left-0 right-0 h-px
                          bg-gradient-to-r from-transparent via-white/[0.06] to-transparent
                          pointer-events-none" />

          {/* Ambient glow for this section */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                            w-[700px] h-[400px] bg-blue-700/[0.08] rounded-full blur-[100px]" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                            w-[400px] h-[300px] bg-violet-700/[0.06] rounded-full blur-[80px]" />
          </div>

          <FadeUp className="relative max-w-2xl mx-auto text-center">

            {/* Glow border card */}
            <div className="relative rounded-3xl p-12 border border-white/[0.08]
                            shadow-[0_0_80px_-20px_rgba(59,130,246,0.15)]"
                 style={{
                   background: "linear-gradient(145deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)",
                 }}>

              {/* Top accent */}
              <div className="absolute inset-x-0 top-0 h-px rounded-t-3xl
                              bg-gradient-to-r from-transparent via-blue-400/[0.40] to-transparent" />

              <div className="inline-flex items-center gap-2
                              bg-blue-500/[0.08] border border-blue-500/[0.15]
                              text-blue-400 px-4 py-1.5 rounded-full
                              text-xs font-semibold mb-8 backdrop-blur-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                Our Vision
              </div>

              <blockquote className="text-white text-2xl sm:text-[1.65rem] font-semibold
                                     leading-[1.35] mb-6 tracking-tight">
                &ldquo;ApplyIQ is evolving into an AI-powered platform that automatically
                tracks applications and surfaces intelligent insights to help you
                land offers faster.&rdquo;
              </blockquote>

              <p className="text-slate-500 text-sm leading-relaxed max-w-lg mx-auto mb-10">
                We&apos;re building toward a future where your job search runs itself —
                applications imported automatically, patterns surfaced instantly, and
                every decision backed by data.
              </p>

              <Link
                href="/dashboard"
                className="group inline-flex items-center gap-2.5
                           bg-gradient-to-r from-blue-600 to-blue-500
                           hover:from-blue-500 hover:to-cyan-400
                           text-white px-7 py-3.5 rounded-xl text-sm font-semibold
                           transition-all duration-200
                           shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/40
                           hover:-translate-y-0.5"
              >
                Start tracking today
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"
                     className="transition-transform duration-200 group-hover:translate-x-0.5">
                  <path d="M3 7h8M8 4l3 3-3 3" stroke="white" strokeWidth="1.6"
                        strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            </div>
          </FadeUp>

        </section>

      </main>
      <Footer />
    </>
  );
}
