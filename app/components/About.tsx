"use client";

import Link from "next/link";
import { motion } from "motion/react";
import FadeUp from "@/app/components/FadeUp";

const pillars = [
  {
    gradient:    "from-blue-500 to-indigo-600",
    shadow:      "shadow-blue-500/25",
    accentRgb:   "59, 130, 246",
    borderHover: "hover:border-blue-500/[0.22]",
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <path d="M11 2L3 7.5v7L11 20l8-5.5v-7L11 2z"
              stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M3 7.5l8 5 8-5"
              stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M11 12.5V20" stroke="white" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    ),
    title: "Built for job seekers",
    body:  "Whether you're a student applying for your first internship or a professional exploring new opportunities, ApplyIQ adapts to your search.",
  },
  {
    gradient:    "from-violet-500 to-purple-700",
    shadow:      "shadow-violet-500/25",
    accentRgb:   "139, 92, 246",
    borderHover: "hover:border-violet-500/[0.22]",
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <circle cx="11" cy="11" r="8.5" stroke="white" strokeWidth="1.6" />
        <path d="M11 6.5v5l3.5 2.5" stroke="white" strokeWidth="1.6"
              strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: "Your time, respected",
    body:  "No bloated features, no steep learning curve. Log an application in seconds and move on — ApplyIQ stays out of your way until you need it.",
  },
  {
    gradient:    "from-cyan-500 to-blue-600",
    shadow:      "shadow-cyan-500/25",
    accentRgb:   "6, 182, 212",
    borderHover: "hover:border-cyan-500/[0.22]",
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <path d="M4 16l5-6 4 3.5 4.5-6 3.5 4.5"
              stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="2" y="3" width="18" height="16" rx="3" stroke="white" strokeWidth="1.6" />
      </svg>
    ),
    title: "Data that actually helps",
    body:  "See which companies respond, where applications stall, and how your success rate changes over time — so each new application is smarter than the last.",
  },
];

const cardEase = [0.21, 0.47, 0.32, 0.98] as const;

export default function About() {
  return (
    <section id="about" className="py-32 px-6 bg-[#050b1a] relative overflow-hidden">

      {/* ── Layered ambient glow system ──────────────────────────── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 left-1/4 w-[700px] h-[700px]
                        bg-blue-700/[0.08] rounded-full blur-[130px]" />
        <div className="absolute top-1/3 right-0 translate-x-1/3 w-[550px] h-[550px]
                        bg-violet-700/[0.07] rounded-full blur-[110px]" />
        <div className="absolute bottom-0 left-0 -translate-x-1/4 w-[450px] h-[450px]
                        bg-indigo-600/[0.05] rounded-full blur-[90px]" />
      </div>

      {/* ── Top separator ────────────────────────────────────────── */}
      <div className="absolute top-0 left-0 right-0 h-px
                      bg-gradient-to-r from-transparent via-white/[0.07] to-transparent
                      pointer-events-none" />

      <div className="relative max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">

          {/* ── Left: Story ── */}
          <FadeUp>
            {/* Section pill */}
            <div className="inline-flex items-center gap-2
                            bg-blue-500/[0.08] border border-blue-500/[0.15]
                            text-blue-400 px-4 py-1.5 rounded-full
                            text-xs font-semibold mb-7 backdrop-blur-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
              About ApplyIQ
            </div>

            <h2 className="text-4xl lg:text-[2.75rem] font-bold text-white mb-7"
                style={{ lineHeight: 1.08 }}>
              Job searching is<br />
              hard enough.<br />
              <span className="text-gradient-light">
                Staying organized<br />shouldn&apos;t be.
              </span>
            </h2>

            <p className="text-slate-400 leading-[1.75] mb-5 text-[15px] max-w-[440px]">
              ApplyIQ started from a simple frustration: keeping track of dozens of
              applications across spreadsheets, sticky notes, and email threads is
              exhausting — and it causes good opportunities to slip through the cracks.
            </p>
            <p className="text-slate-400 leading-[1.75] mb-10 text-[15px] max-w-[440px]">
              We built ApplyIQ to give every job seeker a single, focused place to manage
              their search. Log applications, track where each one stands, and use real
              data to refine your approach — all without the overhead of a complex tool.
            </p>

            <Link
              href="/dashboard"
              className="group inline-flex items-center gap-2.5
                         bg-gradient-to-r from-blue-600 to-blue-500
                         hover:from-blue-500 hover:to-cyan-400
                         text-white px-7 py-3.5 rounded-xl text-sm font-semibold
                         transition-all duration-200
                         shadow-lg shadow-blue-500/25
                         hover:shadow-xl hover:shadow-blue-500/40
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

          {/* ── Right: Floating feature cards ── */}
          <div className="flex flex-col gap-4">
            {pillars.map((p, i) => (
              <FadeUp key={p.title} delay={i * 130}>
                <motion.div
                  whileHover={{ y: -6, transition: { duration: 0.25, ease: cardEase } }}
                  className={`group relative rounded-2xl p-6 flex gap-5
                             border border-white/[0.07] ${p.borderHover}
                             overflow-hidden cursor-default
                             shadow-[0_4px_24px_-6px_rgba(0,0,0,0.45)]
                             transition-colors duration-300`}
                  style={{
                    background: "linear-gradient(145deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.015) 100%)",
                  }}
                >
                  {/* Hover radial glow */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100
                               transition-opacity duration-500 pointer-events-none rounded-2xl"
                    style={{
                      background: `radial-gradient(ellipse at 10% 60%, rgba(${p.accentRgb}, 0.13), transparent 72%)`,
                    }}
                  />

                  {/* Top accent micro-line */}
                  <div
                    className="absolute top-0 left-10 right-10 h-[1px] opacity-0
                               group-hover:opacity-100 transition-opacity duration-400 rounded-full"
                    style={{
                      background: `linear-gradient(90deg, transparent, rgba(${p.accentRgb}, 0.55), transparent)`,
                    }}
                  />

                  {/* Icon */}
                  <div
                    className={`relative w-12 h-12 rounded-xl bg-gradient-to-br ${p.gradient}
                               flex items-center justify-center shrink-0
                               shadow-lg ${p.shadow}
                               transition-all duration-300
                               group-hover:scale-[1.10] group-hover:-rotate-2`}
                  >
                    {p.icon}
                  </div>

                  {/* Content */}
                  <div className="relative min-w-0">
                    <h3 className="text-[15px] font-semibold text-white mb-1.5 leading-snug">
                      {p.title}
                    </h3>
                    <p className="text-sm text-slate-400 leading-relaxed">{p.body}</p>
                  </div>
                </motion.div>
              </FadeUp>
            ))}
          </div>

        </div>
      </div>

      {/* ── Transition fade to Footer (dark → slate-950) ─────────── */}
      <div className="absolute bottom-0 left-0 right-0 h-16
                      bg-gradient-to-b from-transparent to-slate-950 pointer-events-none" />
    </section>
  );
}
