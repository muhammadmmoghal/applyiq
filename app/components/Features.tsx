import FadeUp from "@/app/components/FadeUp";

const features = [
  {
    iconBg:     "bg-gradient-to-br from-blue-500 to-blue-700",
    iconShadow: "shadow-[0_8px_24px_-4px_rgba(59,130,246,0.45)]",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="4" width="18" height="18" rx="3" stroke="white" strokeWidth="2" />
        <path d="M8 10h8M8 14h5" stroke="white" strokeWidth="2" strokeLinecap="round" />
        <path d="M8 7V4M16 7V4" stroke="white" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
    badge:      "Organize",
    badgeColor: "text-blue-400 bg-blue-500/[0.10] border border-blue-500/[0.20]",
    title:      "Application Tracking",
    description:
      "Log every application in one place — company, role, date applied, status, job link, and notes. Always know exactly where each opportunity stands.",
    soon:       false,
    accentColor: "rgba(59,130,246,0.3)",
    hoverBorder: "hover:border-blue-500/[0.25]",
    hoverGlow:   "hover:shadow-[0_20px_60px_-12px_rgba(59,130,246,0.18)]",
  },
  {
    iconBg:     "bg-gradient-to-br from-violet-500 to-violet-700",
    iconShadow: "shadow-[0_8px_24px_-4px_rgba(139,92,246,0.45)]",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M12 3C7 3 3 7 3 12s4 9 9 9 9-4 9-9" stroke="white" strokeWidth="2" strokeLinecap="round" />
        <path d="M17 2l-1 3 3 1-3 1-1 3-1-3-3-1 3-1-1-3z"
              fill="white" fillOpacity="0.3" stroke="white" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    ),
    badge:      "AI-Powered",
    badgeColor: "text-violet-400 bg-violet-500/[0.10] border border-violet-500/[0.20]",
    title:      "Smart Insights",
    description:
      "See your application-to-response and interview-to-offer conversion at a glance. Spot what's working and double down on strategies that get replies.",
    soon:       false,
    accentColor: "rgba(139,92,246,0.3)",
    hoverBorder: "hover:border-violet-500/[0.25]",
    hoverGlow:   "hover:shadow-[0_20px_60px_-12px_rgba(139,92,246,0.18)]",
  },
  {
    iconBg:     "bg-gradient-to-br from-cyan-500 to-blue-600",
    iconShadow: "shadow-[0_8px_24px_-4px_rgba(6,182,212,0.45)]",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M4 20V14M9 20V9M14 20V12M19 20V5" stroke="white" strokeWidth="2" strokeLinecap="round" />
        <path d="M4 10l5-4 5 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    badge:      "Analytics",
    badgeColor: "text-cyan-400 bg-cyan-500/[0.10] border border-cyan-500/[0.20]",
    title:      "Interview Pipeline",
    description:
      "Track every stage of your interview process. Set follow-up dates so you never let a promising role go cold and stay proactive with recruiters.",
    soon:       false,
    accentColor: "rgba(6,182,212,0.3)",
    hoverBorder: "hover:border-cyan-500/[0.25]",
    hoverGlow:   "hover:shadow-[0_20px_60px_-12px_rgba(6,182,212,0.18)]",
  },
  {
    iconBg:     "bg-gradient-to-br from-emerald-500 to-emerald-700",
    iconShadow: "shadow-[0_8px_24px_-4px_rgba(16,185,129,0.45)]",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
              stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    badge:      "Coming Soon",
    badgeColor: "text-emerald-400 bg-emerald-500/[0.10] border border-emerald-500/[0.20]",
    title:      "Offer Management",
    description:
      "Automatically import applications from Gmail and job boards. Get AI-powered suggestions on timing, targeting, and resume improvements.",
    soon:       true,
    accentColor: "rgba(16,185,129,0.3)",
    hoverBorder: "hover:border-emerald-500/[0.25]",
    hoverGlow:   "hover:shadow-[0_20px_60px_-12px_rgba(16,185,129,0.18)]",
  },
];

export default function Features() {
  return (
    <section id="features" className="bg-[#050b1a] pt-20 pb-32 px-6 relative">

      {/* Subtle top separator line */}
      <div className="absolute top-0 left-0 right-0 h-px
                      bg-gradient-to-r from-transparent via-blue-500/[0.15] to-transparent pointer-events-none" />

      {/* Ambient glow for section */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px]
                      bg-blue-700/[0.05] rounded-full blur-[80px] pointer-events-none" />

      <div className="relative max-w-6xl mx-auto">

        {/* Section header */}
        <FadeUp className="text-center mb-16">
          <div className="inline-flex items-center gap-2
                          bg-blue-500/[0.08] border border-blue-500/[0.15]
                          text-blue-400 px-4 py-1.5 rounded-full
                          text-xs font-semibold mb-5 backdrop-blur-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            Features
          </div>
          <h2 className="text-4xl font-extrabold text-white mb-4 tracking-tight">
            Everything you need to{" "}
            <span className="text-gradient-light">land your next role</span>
          </h2>
          <p className="text-slate-400 text-lg max-w-xl mx-auto leading-relaxed">
            ApplyIQ gives you the tools and insights to stay organized and
            strategic throughout your entire job search.
          </p>
        </FadeUp>

        {/* Feature cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((f, i) => (
            <FadeUp key={f.title} delay={i * 80}>
              <div
                className={`relative group rounded-2xl p-6 h-full flex flex-col overflow-hidden
                  border border-white/[0.06] transition-all duration-300 hover:-translate-y-2
                  ${f.hoverBorder} ${f.hoverGlow}`}
                style={{ background: "linear-gradient(145deg, rgba(255,255,255,0.035) 0%, rgba(255,255,255,0.01) 100%)" }}
              >
                {/* Top accent on hover */}
                <div
                  className="absolute top-0 left-0 right-0 h-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-t-2xl"
                  style={{ background: `linear-gradient(90deg, transparent, ${f.accentColor}, transparent)` }}
                />

                {/* Coming soon pill */}
                {f.soon && (
                  <span className="absolute top-4 right-4 text-[10px] font-bold text-emerald-400
                                   bg-emerald-500/[0.10] border border-emerald-500/[0.20]
                                   px-2 py-0.5 rounded-full uppercase tracking-wide">
                    Soon
                  </span>
                )}

                {/* Icon */}
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5
                                 ${f.iconBg} ${f.iconShadow}
                                 transition-transform duration-300 group-hover:scale-[1.07]`}>
                  {f.icon}
                </div>

                {/* Badge */}
                <div className={`inline-flex items-center self-start text-[10px] font-bold uppercase
                                 tracking-widest mb-3 px-2.5 py-0.5 rounded-full ${f.badgeColor}`}>
                  {f.badge}
                </div>

                {/* Title */}
                <h3 className="text-base font-bold text-white mb-2.5 leading-snug">{f.title}</h3>

                {/* Description */}
                <p className="text-slate-400 leading-relaxed text-sm flex-1">{f.description}</p>
              </div>
            </FadeUp>
          ))}
        </div>
      </div>

      {/* No transition needed — About section shares the same bg-[#050b1a] */}
    </section>
  );
}
