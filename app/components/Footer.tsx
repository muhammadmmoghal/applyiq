export default function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-white/[0.06]">

      <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-6">

        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg
                          flex items-center justify-center shadow-sm shadow-blue-500/30">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M3 12L6 7L9 10L12 5" stroke="white" strokeWidth="2"
                    strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <span className="text-base font-bold text-white">
            Apply<span className="text-blue-400">IQ</span>
          </span>
        </div>

        {/* Copyright */}
        <p className="text-sm text-slate-500 text-center">
          &copy; {new Date().getFullYear()} ApplyIQ &mdash; Built to help you land more offers.
        </p>

        {/* Links */}
        <div className="flex items-center gap-6">
          {["Privacy", "Terms", "Contact"].map((label) => (
            <a
              key={label}
              href="#"
              className="text-sm text-slate-500 hover:text-slate-200 transition-colors duration-200 font-medium"
            >
              {label}
            </a>
          ))}
        </div>

      </div>
    </footer>
  );
}
