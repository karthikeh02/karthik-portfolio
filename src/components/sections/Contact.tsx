import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Copy, Check, Github, Linkedin, ArrowUpRight } from "lucide-react";
import { contact, profile } from "@/data/content";
import Reveal from "../Reveal";
import Magnetic from "../Magnetic";
import Scramble from "../effects/Scramble";

const EASE = [0.22, 1, 0.36, 1] as const;

const SOCIAL_ICONS: Record<string, typeof Github> = {
  GitHub: Github,
  LinkedIn: Linkedin,
};

export default function Contact() {
  const [copied, setCopied] = useState(false);
  const reduceMotion = useReducedMotion();

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(contact.email);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard blocked — the mailto link still works */
    }
  };

  return (
    <section
      className="section-y relative scroll-mt-24 overflow-hidden border-t border-white/5"
    >
      {/* atmosphere */}
      <div className="pointer-events-none absolute inset-0 bg-grid-fade [background-size:64px_64px] opacity-30 [mask-image:radial-gradient(ellipse_60%_60%_at_50%_60%,black,transparent)]" />
      <div
        className="pointer-events-none absolute left-1/2 top-1/3 h-[420px] w-[680px] -translate-x-1/2 rounded-full"
        style={{ background: "radial-gradient(ellipse at center, rgba(34,211,238,0.10), transparent 70%)" }}
      />

      <div className="container-px relative">
        <Reveal className="mx-auto max-w-4xl text-center">
          <Scramble as="p" text={contact.eyebrow} className="eyebrow mb-6" />
          <h2 className="text-balance font-display text-display-xl font-semibold">
            Got something{" "}
            <span className="text-gradient-neon">onchain</span> in mind?
          </h2>
          <p className="mx-auto mt-7 max-w-xl text-balance text-lg leading-relaxed text-fog">
            {contact.body}
          </p>
          <p className="label-meta mx-auto mt-5">{contact.availability}</p>
        </Reveal>

        {/* Email */}
        <Reveal delay={0.1} className="mt-12 flex justify-center">
          <div className="flex flex-col items-center gap-4 sm:flex-row">
            <Magnetic strength={0.3}>
              <a
                href={`mailto:${contact.email}`}
                className="btn-primary focus-ring group text-lg"
              >
                {contact.email}
                <ArrowUpRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>
            </Magnetic>
            <button
              onClick={copy}
              className="btn-chip focus-ring"
              aria-label="Copy email address"
            >
              <AnimatePresence mode="wait" initial={false}>
                {copied ? (
                  <motion.span
                    key="copied"
                    className="inline-flex items-center gap-2"
                    initial={reduceMotion ? false : { opacity: 0, scale: 0.6 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={reduceMotion ? undefined : { opacity: 0, scale: 0.6 }}
                    transition={{ duration: 0.22, ease: EASE }}
                  >
                    <Check className="h-4 w-4 text-live" /> Copied
                  </motion.span>
                ) : (
                  <motion.span
                    key="copy"
                    className="inline-flex items-center gap-2"
                    initial={reduceMotion ? false : { opacity: 0, scale: 0.6 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={reduceMotion ? undefined : { opacity: 0, scale: 0.6 }}
                    transition={{ duration: 0.22, ease: EASE }}
                  >
                    <Copy className="h-4 w-4" /> Copy
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </div>
        </Reveal>

        {/* Socials */}
        <Reveal delay={0.2} className="mt-14 flex flex-wrap items-center justify-center gap-4">
          {contact.socials.map((s) => {
            const Icon = SOCIAL_ICONS[s.label];
            return (
              <Magnetic key={s.label} strength={0.4}>
                <a
                  href={s.href}
                  target="_blank"
                  rel="noreferrer"
                  className="group flex items-center gap-3 rounded-2xl glass px-6 py-4 ring-hover focus-ring"
                >
                  {Icon && <Icon className="h-5 w-5 text-fog group-hover:text-cyan transition-colors" />}
                  <span className="text-left">
                    <span className="block text-sm font-medium text-fog-bright">
                      {s.label}
                    </span>
                    <span className="block font-mono text-xs text-fog-dim transition-transform group-hover:translate-x-0.5">
                      {s.handle}
                    </span>
                  </span>
                </a>
              </Magnetic>
            );
          })}
        </Reveal>

        <Reveal delay={0.3} className="mt-16 flex justify-center">
          <span className="inline-flex items-center gap-2.5 rounded-full border border-white/10 px-4 py-2 font-mono text-xs uppercase tracking-[0.2em] text-fog-dim">
            <motion.span
              className="h-1.5 w-1.5 rounded-full bg-live"
              animate={reduceMotion ? undefined : { opacity: [1, 0.3, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            {profile.available
              ? "Open to new projects"
              : "Currently at capacity"}
            <span className="text-fog-dim">·</span>
            {profile.location}
          </span>
        </Reveal>
      </div>
    </section>
  );
}
