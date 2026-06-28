import { ArrowUp } from "lucide-react";
import { profile } from "@/data/content";
import Logo from "../Logo";
import Reveal from "../Reveal";
import Parallax from "../effects/Parallax";

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="relative overflow-hidden border-t border-white/5 pb-10 pt-16">
      <div className="container-px">
        {/* Oversized wordmark — the closing flourish. */}
        <Reveal className="mb-10">
          <Parallax speed={0.4}>
            <span
              className="block select-none bg-clip-text font-display text-[clamp(4rem,18vw,15rem)] font-semibold leading-[0.8] tracking-tighter text-transparent"
              style={{
                WebkitTextStroke: "1.5px rgba(190,198,216,0.5)",
                backgroundImage:
                  "linear-gradient(180deg, rgba(34,211,238,0.10), rgba(139,92,246,0.05) 60%, transparent)",
              }}
              aria-hidden="true"
            >
              {profile.name.toUpperCase()}
            </span>
          </Parallax>
        </Reveal>

        <div className="flex flex-col items-center justify-between gap-6 border-t border-white/5 pt-8 sm:flex-row">
          <div className="flex items-center gap-2.5">
            <Logo className="h-6 w-6" />
            <span className="font-display text-base font-semibold">
              {profile.name}
              <span className="text-cyan">.</span>
            </span>
          </div>

          <p className="label-meta">
            © {year} {profile.name} — {profile.role}
          </p>

          <a
            href="#top"
            className="group inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-fog transition-colors hover:text-cyan"
          >
            <span className="link-underline">Back to top</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 transition-colors group-hover:border-cyan/40">
              <ArrowUp className="h-4 w-4 transition-transform group-hover:-translate-y-0.5" />
            </span>
          </a>
        </div>
      </div>
    </footer>
  );
}
