import Image from "next/image";
import Link from "next/link";

const FOOTER_LINKS: { label: string; href: string }[] = [
  { label: "Privacy", href: "/privacy" },
  { label: "Terms",   href: "/terms" },
  { label: "Contact", href: "mailto:muhammadmmoghal@gmail.com" },
];

export default function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-white/[0.06]">

      <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-6">

        {/* Logo */}
        <div className="flex items-center">
          <Image
            src="/applyiq-logo-full.png"
            alt="ApplyIQ"
            width={110}
            height={33}
            className="h-8 w-auto object-contain"
          />
        </div>

        {/* Copyright */}
        <p className="text-sm text-slate-500 text-center">
          &copy; {new Date().getFullYear()} ApplyIQ &mdash; Built to help you land more offers.
        </p>

        {/* Links */}
        <div className="flex items-center gap-6">
          {FOOTER_LINKS.map(({ label, href }) => (
            <Link
              key={label}
              href={href}
              className="text-sm text-slate-500 hover:text-slate-200 transition-colors duration-200 font-medium"
            >
              {label}
            </Link>
          ))}
        </div>

      </div>
    </footer>
  );
}
