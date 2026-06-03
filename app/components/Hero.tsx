"use client";

import Link from "next/link";
import { motion } from "motion/react";

const recentActivity = [
  { company: "Google",  role: "SWE Intern",      status: "Interview", color: "amber"   },
  { company: "Stripe",  role: "Product Manager", status: "Applied",   color: "blue"    },
  { company: "Airbnb",  role: "Data Analyst",    status: "Offer",     color: "emerald" },
];

const activityBadge: Record<string, string> = {
  amber:   "bg-amber-500/[0.12] text-amber-300 ring-1 ring-amber-500/20",
  blue:    "bg-blue-500/[0.12]  text-blue-300  ring-1 ring-blue-500/20",
  emerald: "bg-emerald-500/[0.12] text-emerald-300 ring-1 ring-emerald-500/20",
};

const activityDot: Record<string, string> = {
  amber:   "bg-amber-400",
  blue:    "bg-blue-400",
  emerald: "bg-emerald-400",
};

const ease = [0.21, 0.47, 0.32, 0.98] as const;

function fadeUp(delay: number) {
  return {
    initial: { opacity: 0, y: 18 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.65, delay, ease },
  };
}

export default function Hero() {
  return (
    <section className="relative overflow-hidden pt-24 pb-20 px-6 min-h-screen flex items-center bg-[#050b1a]">

      {/* ── Ambient background glows ─────────────────────────────── */}
      <div className="absolute -top-40 -left-32 w-[700px] h-[600px]
                      bg-blue-700/[0.08] rounded-full blur-[120px] pointer-events-none animate-glow" />
      <div className="absolute bottom-0 left-1/4 w-[500px] h-[400px]
                      bg-indigo-800/[0.07] rounded-full blur-[100px] pointer-events-none animate-glow"
           style={{ animationDelay: "3.5s" }} />

      {/* ── Top vignette for navbar readability ─────────────────── */}
      <div className="absolute top-0 left-0 right-0 h-28
                      bg-gradient-to-b from-black/30 to-transparent pointer-events-none" />

      {/* ── Content ─────────────────────────────────────────────── */}
      <div className="relative max-w-6xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">

          {/* Left: Copy */}
          <div>
            {/* Eyebrow */}
            <motion.div
              {...fadeUp(0)}
              className="inline-flex items-center gap-2
                         bg-blue-500/[0.08] border border-blue-400/[0.15]
                         text-blue-300 px-4 py-1.5 rounded-full text-xs font-semibold mb-7
                         backdrop-blur-sm"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 inline-block animate-pulse" />
              Smart Job Tracking · Free to Use
            </motion.div>

            {/* Headline */}
            <motion.h1
              {...fadeUp(0.08)}
              className="text-5xl lg:text-[3.6rem] font-extrabold text-white
                         leading-[1.07] tracking-[-0.02em] mb-5"
            >
              Track Every{" "}
              <span className="text-gradient">Application.</span>
              <br />
              Land More{" "}
              <span className="text-sky-400">Offers.</span>
            </motion.h1>

            {/* Subline */}
            <motion.p
              {...fadeUp(0.16)}
              className="text-[1.05rem] text-slate-400 mb-9 leading-[1.75] max-w-[440px] font-normal"
            >
              ApplyIQ helps you manage applications, track progress, and gain
              insights to improve your success rate — all in one place.
            </motion.p>

            {/* CTAs */}
            <motion.div {...fadeUp(0.24)} className="flex flex-wrap items-center gap-3.5">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2
                           bg-gradient-to-r from-blue-600 to-blue-500
                           hover:from-blue-500 hover:to-sky-500
                           text-white px-6 py-3 rounded-xl text-sm font-semibold
                           transition-all duration-200
                           shadow-[0_4px_24px_-4px_rgba(59,130,246,0.55)]
                           hover:shadow-[0_6px_32px_-4px_rgba(59,130,246,0.7)]
                           hover:-translate-y-0.5"
              >
                Start Tracking Free
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M3 7h8M8 4l3 3-3 3" stroke="white" strokeWidth="1.6"
                        strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2
                           bg-white/[0.06] hover:bg-white/[0.10]
                           border border-white/[0.10] hover:border-white/[0.20]
                           text-white/75 hover:text-white
                           px-6 py-3 rounded-xl text-sm font-semibold
                           transition-all duration-200 hover:-translate-y-0.5 backdrop-blur-sm"
              >
                View Dashboard
              </Link>
            </motion.div>

            {/* Trust line */}
            <motion.p
              {...fadeUp(0.32)}
              className="mt-6 text-xs text-slate-600 flex items-center gap-1.5 font-medium"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none"
                   className="text-blue-500/70 shrink-0">
                <path d="M2 6.5l2.5 2.5 5.5-5.5" stroke="currentColor" strokeWidth="1.5"
                      strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              No credit card required · Built for students &amp; job seekers
            </motion.p>
          </div>

          {/* ── Right: App preview card + orb as one aligned unit ── */}
          <div className="relative flex justify-center lg:justify-end">

            {/* Card wrapper — orb is centered on this same box */}
            <div className="relative w-full max-w-[420px]">

              {/* Orb: absolutely centered behind the card */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                              pointer-events-none hidden lg:block">
                <div className="relative">
                  {/* Outermost diffuse bloom */}
                  <div className="absolute inset-0 scale-[2.2] rounded-full opacity-20 blur-3xl animate-glow"
                       style={{
                         background: "radial-gradient(circle, rgba(99,102,241,0.8) 0%, rgba(59,130,246,0.4) 40%, transparent 70%)",
                       }} />

                  {/* Halo rings */}
                  <div className="absolute inset-0 scale-[1.62] rounded-full border border-blue-400/[0.07]" />
                  <div className="absolute inset-0 scale-[1.40] rounded-full border border-indigo-400/[0.09]" />
                  <div className="absolute inset-0 scale-[1.20] rounded-full border border-violet-400/[0.12]" />

                  {/* Sphere */}
                  <div
                    className="w-[400px] h-[400px] rounded-full relative overflow-hidden"
                    style={{
                      background:
                        "radial-gradient(circle at 37% 30%, #7c3aed 0%, #4338ca 20%, #1e3a8a 42%, #0d1e3a 60%, #050b1a 80%)",
                    }}
                  >
                    {/* Specular highlight */}
                    <div
                      className="absolute top-[5%] left-[10%] w-[42%] h-[35%] rounded-full blur-2xl"
                      style={{
                        background:
                          "radial-gradient(circle, rgba(221,214,254,0.45) 0%, rgba(196,181,253,0.15) 55%, transparent 80%)",
                      }}
                    />
                    {/* Edge shadow */}
                    <div
                      className="absolute inset-0 rounded-full"
                      style={{ boxShadow: "inset -50px 20px 80px rgba(0,0,0,0.75), inset 0 -40px 60px rgba(0,0,0,0.5)" }}
                    />
                  </div>

                  {/* Inner glow bleeding out */}
                  <div
                    className="absolute inset-0 scale-[1.06] rounded-full blur-2xl opacity-35 animate-glow"
                    style={{
                      background: "radial-gradient(circle, rgba(99,102,241,0.7) 0%, transparent 55%)",
                      animationDelay: "1.5s",
                    }}
                  />
                </div>
              </div>

              {/* Card glow */}
              <div className="absolute -inset-8 rounded-3xl pointer-events-none"
                   style={{
                     background: "radial-gradient(ellipse at center, rgba(99,102,241,0.12) 0%, transparent 70%)",
                   }} />

              {/* Dashboard card — sits on top of orb with z-10 */}
              <motion.div
                initial={{ opacity: 0, y: 40, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.85, delay: 0.18, ease }}
                className="relative z-10 w-full"
              >
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                  className="relative rounded-2xl overflow-hidden border border-white/[0.08]"
                  style={{
                    background: "linear-gradient(155deg, #0e1b32 0%, #080f1f 60%, #06091a 100%)",
                    boxShadow: "0 32px 80px -12px rgba(0,0,0,0.85), inset 0 1px 0 rgba(255,255,255,0.07)",
                  }}
                >
                  {/* Top edge highlight line */}
                  <div className="absolute inset-x-0 top-0 h-px
                                  bg-gradient-to-r from-transparent via-white/[0.18] to-transparent" />

                  {/* Window chrome */}
                  <div className="px-5 pt-4 pb-3.5 border-b border-white/[0.05] flex items-center gap-3">
                    <div className="flex gap-1.5 shrink-0">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]/65" />
                      <span className="w-2.5 h-2.5 rounded-full bg-[#febc2e]/65" />
                      <span className="w-2.5 h-2.5 rounded-full bg-[#28c840]/65" />
                    </div>
                    <span className="flex-1 text-center text-[11px] text-slate-500 font-medium tracking-tight">
                      ApplyIQ — Dashboard
                    </span>
                    <span className="shrink-0 flex items-center gap-1.5 text-[10px] text-emerald-400
                                     font-semibold bg-emerald-500/[0.10] px-2 py-0.5 rounded-full
                                     border border-emerald-500/20">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Live
                    </span>
                  </div>

                  {/* Dashboard content */}
                  <div className="p-5 space-y-4">

                    {/* Stats row */}
                    <div className="grid grid-cols-3 gap-2.5">
                      {[
                        { val: "42",  label: "Applied",    cls: "bg-blue-500/[0.08] border-blue-500/[0.14]",    text: "text-blue-300"    },
                        { val: "18%", label: "Response",   cls: "bg-emerald-500/[0.08] border-emerald-500/[0.14]", text: "text-emerald-300" },
                        { val: "6",   label: "Interviews", cls: "bg-violet-500/[0.08] border-violet-500/[0.14]",  text: "text-violet-300"  },
                      ].map(({ val, label, cls, text }) => (
                        <div key={label} className={`${cls} border rounded-xl p-3.5 text-center`}>
                          <div className={`text-xl font-bold tracking-tight ${text}`}>{val}</div>
                          <div className="text-[10px] text-slate-500 mt-0.5 font-medium">{label}</div>
                        </div>
                      ))}
                    </div>

                    {/* Pipeline */}
                    <div>
                      <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-widest mb-2.5">
                        Application Pipeline
                      </p>
                      <div className="flex items-center gap-1.5">
                        <div className="flex-1 bg-blue-500/[0.08] border border-blue-500/[0.14] text-blue-400 rounded-lg px-2 py-2.5 text-center">
                          <div className="text-[9px] font-bold uppercase tracking-wide">Applied</div>
                          <div className="text-sm font-bold mt-0.5">28</div>
                        </div>
                        <svg className="text-slate-700 shrink-0" width="10" height="10" viewBox="0 0 16 16" fill="none">
                          <path d="M4 8h8M9 5l3 3-3 3" stroke="currentColor" strokeWidth="1.5"
                                strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <div className="flex-1 bg-amber-500/[0.08] border border-amber-500/[0.14] text-amber-400 rounded-lg px-2 py-2.5 text-center">
                          <div className="text-[9px] font-bold uppercase tracking-wide">Interview</div>
                          <div className="text-sm font-bold mt-0.5">6</div>
                        </div>
                        <svg className="text-slate-700 shrink-0" width="10" height="10" viewBox="0 0 16 16" fill="none">
                          <path d="M4 8h8M9 5l3 3-3 3" stroke="currentColor" strokeWidth="1.5"
                                strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <div className="flex-1 bg-emerald-500/[0.08] border border-emerald-500/[0.14] text-emerald-400 rounded-lg px-2 py-2.5 text-center">
                          <div className="text-[9px] font-bold uppercase tracking-wide">Offer</div>
                          <div className="text-sm font-bold mt-0.5">2</div>
                        </div>
                      </div>
                    </div>

                    {/* Recent activity */}
                    <div className="pt-3.5 border-t border-white/[0.05]">
                      <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-widest mb-2.5">
                        Recent Activity
                      </p>
                      <div className="space-y-0.5">
                        {recentActivity.map(({ company, role, status, color }) => (
                          <div key={company}
                               className="flex items-center justify-between py-1.5 border-b border-white/[0.04] last:border-0">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${activityDot[color]}`} />
                              <span className="text-sm font-semibold text-slate-200 truncate">{company}</span>
                              <span className="text-xs text-slate-600 hidden sm:inline font-normal truncate">{role}</span>
                            </div>
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ml-2 ${activityBadge[color]}`}>
                              {status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                </motion.div>
              </motion.div>

            </div>
          </div>

        </div>
      </div>

      {/* ── Scroll to explore ───────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.9 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none"
      >
        <span className="text-[10px] text-slate-600 font-medium tracking-[0.18em] uppercase">
          Scroll to explore
        </span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-slate-600">
            <path d="M8 3v10M4 9l4 4 4-4" stroke="currentColor" strokeWidth="1.4"
                  strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </motion.div>
      </motion.div>

    </section>
  );
}
