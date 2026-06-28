import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Github, Menu, X, ArrowUpRight } from "lucide-react";
import { nav, profile } from "@/data/content";
import { cn } from "@/lib/utils";
import Magnetic from "./Magnetic";
import Logo from "./Logo";

const EASE = [0.22, 1, 0.36, 1] as const;

// Section ids tracked by the scroll-spy, derived from the nav hrefs.
const SECTION_IDS = nav.map((n) => n.href.replace(/^#/, ""));

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeId, setActiveId] = useState<string>("");
  const reduceMotion = useReducedMotion();
  const closeRef = useRef<HTMLButtonElement>(null);

  // Hysteresis: flip to scrolled past 24px, only flip back below 8px so the
  // header chrome doesn't flicker around the threshold.
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled((prev) => (prev ? y >= 8 : y > 24));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Scroll-spy: highlight the nav link for whichever section is centered.
  useEffect(() => {
    const sections = SECTION_IDS.map((id) => document.getElementById(id)).filter(
      (el): el is HTMLElement => el !== null
    );
    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActiveId(entry.target.id);
        }
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 }
    );

    sections.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // Mobile-menu robustness: lock scroll (Lenis + native), close on Escape,
  // focus the close button. Always restore on close/unmount.
  useEffect(() => {
    if (!open) return;

    window.__lenis?.stop();
    document.documentElement.classList.add("overflow-hidden");
    closeRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);

    return () => {
      document.removeEventListener("keydown", onKey);
      document.documentElement.classList.remove("overflow-hidden");
      window.__lenis?.start();
    };
  }, [open]);

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-[80] transition-all duration-500",
          scrolled ? "py-3" : "py-5"
        )}
      >
        <div className="container-px">
          <div
            className={cn(
              "flex items-center justify-between rounded-2xl px-4 py-2.5 transition-all duration-500",
              scrolled
                ? "glass-strong shadow-[0_18px_50px_-30px_rgba(0,0,0,0.9)]"
                : "border border-transparent bg-transparent"
            )}
          >
            <a href="#top" className="flex items-center gap-2.5" aria-label="Home">
              <Logo />
              <span className="font-display text-lg font-semibold tracking-tight">
                {profile.name}
                <span className="text-cyan">.</span>
              </span>
            </a>

            <nav className="hidden items-center gap-9 md:flex">
              {nav.map((n) => {
                const isActive = activeId === n.href.replace(/^#/, "");
                return (
                  <Magnetic key={n.href} strength={0.35}>
                    <a
                      href={n.href}
                      data-active={isActive ? "true" : undefined}
                      aria-current={isActive ? "page" : undefined}
                      className={cn(
                        "link-underline font-mono text-xs uppercase tracking-[0.2em] transition-colors hover:text-fog-bright",
                        isActive ? "text-fog-bright" : "text-fog"
                      )}
                    >
                      {n.label}
                    </a>
                  </Magnetic>
                );
              })}
            </nav>

            <div className="hidden items-center gap-5 md:flex">
              <Magnetic strength={0.4}>
                <a
                  href={profile.github}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="GitHub"
                  className="focus-ring inline-flex rounded-full p-1.5 text-fog transition-colors hover:text-fog-bright"
                >
                  <Github className="h-5 w-5" />
                </a>
              </Magnetic>
              <Magnetic strength={0.5}>
                <a href="#contact" className="btn-chip focus-ring">
                  <span className="h-1.5 w-1.5 animate-pulse-glow rounded-full bg-live" />
                  Available
                </a>
              </Magnetic>
            </div>

            <button
              className="text-fog-bright md:hidden"
              onClick={() => setOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[110] flex flex-col bg-ink/95 backdrop-blur-2xl"
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="container-px flex items-center justify-between py-5">
              <span className="font-display text-lg font-semibold">
                {profile.name}
                <span className="text-cyan">.</span>
              </span>
              <button
                ref={closeRef}
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="focus-ring rounded-full p-1 text-fog-bright"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <nav className="container-px flex flex-1 flex-col justify-center gap-3">
              {nav.map((n, i) => (
                <motion.a
                  key={n.href}
                  href={n.href}
                  onClick={() => setOpen(false)}
                  initial={reduceMotion ? false : { opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 20 }}
                  transition={{
                    delay: reduceMotion ? 0 : 0.12 + i * 0.07,
                    duration: 0.5,
                    ease: EASE,
                  }}
                  className="group flex items-center justify-between border-b border-white/5 py-4 font-display text-display-lg font-semibold text-fog-bright transition-colors hover:text-cyan"
                >
                  {n.label}
                  <ArrowUpRight className="h-7 w-7 -translate-x-2 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
                </motion.a>
              ))}
            </nav>

            <div className="container-px flex items-center justify-between py-8 label-meta">
              <span>{profile.location}</span>
              <span className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 animate-pulse-glow rounded-full bg-live" />
                Available for work
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
