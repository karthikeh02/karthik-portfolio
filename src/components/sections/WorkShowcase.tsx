import { useEffect, useRef, useState } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { projects, type Project } from "@/data/content";
import { cn } from "@/lib/utils";
import Reveal from "../Reveal";
import ProjectVisual from "../ProjectVisual";

const EASE = [0.22, 1, 0.36, 1] as const;

/* Status pill — copied from Work.tsx so this section stands alone. */
const STATUS_STYLES: Record<Project["status"], string> = {
  Live: "text-live border-live/40 bg-live/10",
  "In development": "text-cyan border-cyan/40 bg-cyan/10",
  Shipped: "text-violet-glow border-violet/40 bg-violet/10",
  Ongoing: "text-violet-glow border-violet/40 bg-violet/10",
};

function StatusBadge({ status }: { status: Project["status"] }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1 font-mono text-[0.65rem] uppercase tracking-[0.2em]",
        STATUS_STYLES[status],
      )}
    >
      {status === "Live" && (
        <span className="h-1.5 w-1.5 animate-pulse-glow rounded-full bg-live" />
      )}
      {status}
    </span>
  );
}

/** Outlined index glyph reused across both layouts. */
function IndexGlyph({ value }: { value: string }) {
  return (
    <span
      className="select-none font-display font-semibold leading-none text-transparent"
      style={{ WebkitTextStroke: "1px rgba(154,160,176,0.4)" }}
      aria-hidden
    >
      {value}
    </span>
  );
}

/* Total horizontal panels = 1 intro panel + one per project. */
const PANEL_COUNT = projects.length + 1;

export default function WorkShowcase() {
  const reduceMotion = useReducedMotion();
  // Mode is resolved on the client; default to the safe vertical layout for SSR/first paint.
  const [horizontal, setHorizontal] = useState(false);

  // Decide layout from viewport width + pointer type + reduced-motion.
  // Touch / coarse-pointer devices ALWAYS get the vertical stack (a pinned
  // horizontal scroll-jack is hostile on touch), regardless of width.
  useEffect(() => {
    const wide = window.matchMedia("(min-width: 1025px)");
    const coarse = window.matchMedia("(pointer: coarse)");
    const apply = () =>
      setHorizontal(wide.matches && !coarse.matches && !reduceMotion);
    apply();
    // rAF-coalesce the high-frequency resize stream into one apply per frame;
    // the matchMedia change listeners already cover the actual breakpoint flips.
    let raf = 0;
    const onResize = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        apply();
      });
    };
    wide.addEventListener("change", apply);
    coarse.addEventListener("change", apply);
    window.addEventListener("resize", onResize, { passive: true });
    return () => {
      if (raf) cancelAnimationFrame(raf);
      wide.removeEventListener("change", apply);
      coarse.removeEventListener("change", apply);
      window.removeEventListener("resize", onResize);
    };
  }, [reduceMotion]);

  return horizontal ? <HorizontalGallery /> : <VerticalStack />;
}

/* ------------------------------------------------------------------ */
/* Desktop: pinned horizontal-scroll gallery — the signature beat.    */
/* ------------------------------------------------------------------ */
function HorizontalGallery() {
  const outerRef = useRef<HTMLElement>(null);

  // Vertical scroll through the tall outer section drives horizontal travel.
  const { scrollYProgress } = useScroll({
    target: outerRef,
    offset: ["start start", "end end"],
  });

  // The outer section is (PANEL_COUNT + 0.6) tall, so the scrollable distance is
  // (PANEL_COUNT - 0.4) viewport-heights. Travel finishes once the last panel has
  // arrived — after (PANEL_COUNT - 1) viewport-heights — leaving a +0.6 hold tail.
  // Mapping x / counter / bar over [0, travelEnd] (NOT [0, 1]) makes all three
  // complete exactly as the final panel lands, then sit still through the hold.
  const travelEnd = (PANEL_COUNT - 1) / (PANEL_COUNT - 0.4);

  // Track holds PANEL_COUNT panels, each 100vw wide. Travel the extra width.
  const endPercent = -((PANEL_COUNT - 1) / PANEL_COUNT) * 100;
  // Bind x DIRECTLY to scroll (no spring) so panels scrub 1:1 with the rail —
  // Lenis already smooths the underlying scroll. useTransform can't emit a unit
  // string across a numeric range, so map numerically then format to a % string.
  const xPercent = useTransform(scrollYProgress, [0, travelEnd], [0, endPercent], {
    clamp: true,
  });
  const x = useTransform(xPercent, (v) => `${v}%`);

  // In-section progress bar — full at travelEnd, then held.
  const barScale = useTransform(scrollYProgress, [0, travelEnd], [0, 1], {
    clamp: true,
  });

  // Live "NN / NN" counter — clamps to [1, projects.length] across the travel.
  // Driven entirely off a MotionValue so the pinned scroll never triggers a
  // React re-render: Framer renders a MotionValue child as a text node.
  const currentMV = useTransform(scrollYProgress, (v) =>
    String(
      Math.min(
        projects.length,
        Math.max(1, Math.round((travelEnd > 0 ? v / travelEnd : 0) * (PANEL_COUNT - 1))),
      ),
    ).padStart(2, "0"),
  );

  // Keyboard access: the panels live in a horizontally-transformed track, so a
  // focused element in an off-screen panel is invisible. When focus lands inside
  // a panel, drive the (vertical) page scroll so that panel rides into view.
  const onFocusCapture = (e: React.FocusEvent<HTMLDivElement>) => {
    const panel = (e.target as HTMLElement).closest<HTMLElement>("[data-panel]");
    const section = outerRef.current;
    if (!panel || !section) return;
    const i = Number(panel.dataset.panel);
    if (!Number.isFinite(i)) return;
    const scrollable = section.offsetHeight - window.innerHeight;
    if (scrollable <= 0) return;
    const progress = ((i / (PANEL_COUNT - 1)) * travelEnd) || 0;
    const top = section.offsetTop + progress * scrollable;
    const lenis = window.__lenis;
    if (lenis) lenis.scrollTo(top, { immediate: false });
    else window.scrollTo({ top, behavior: "smooth" });
  };

  return (
    <section
      ref={outerRef}
      id="work"
      className="relative scroll-mt-24"
      style={{ height: `${(PANEL_COUNT + 0.6) * 100}vh` }}
    >
      {/* Pinned viewport */}
      <div
        onFocusCapture={onFocusCapture}
        className="sticky top-0 flex h-screen flex-col overflow-hidden"
      >
        {/* Horizontal track */}
        <motion.div
          data-cursor="drag"
          className="flex h-full flex-1"
          style={{ x, width: `${PANEL_COUNT * 100}vw` }}
        >
          <IntroPanel />
          {projects.map((p, i) => (
            <ProjectPanel key={p.index} project={p} panelIndex={i + 1} />
          ))}
        </motion.div>

        {/* In-section progress UI */}
        <div className="container-px pointer-events-none absolute inset-x-0 bottom-0 z-20 pb-7">
          <div className="flex items-end justify-between gap-6">
            <span className="font-mono text-xs uppercase tracking-[0.25em] text-fog-dim">
              <motion.span>{currentMV}</motion.span> /{" "}
              {String(projects.length).padStart(2, "0")}
            </span>
            <ScrollHint />
          </div>
          {/* Scrubbed progress rail */}
          <div className="mt-4 h-px w-full overflow-hidden bg-white/10">
            <motion.div
              className="h-full origin-left bg-gradient-to-r from-cyan to-violet-glow"
              style={{ scaleX: barScale }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

/* Intro panel — eyebrow + heading, matches Work.tsx voice. */
function IntroPanel() {
  return (
    <div
      data-panel="0"
      className="container-px flex h-full w-screen shrink-0 flex-col justify-center"
    >
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: EASE }}
        className="max-w-3xl"
      >
        <p className="eyebrow mb-4">Selected work</p>
        <h2 className="text-balance font-display font-semibold text-display-lg">
          Things I&apos;ve built that{" "}
          <span className="text-gradient-neon">run themselves</span>.
        </h2>
        <p className="mt-6 max-w-md text-pretty leading-relaxed text-fog">
          A short reel of systems that move money, keep secrets and stay awake —
          scroll sideways through each one.
        </p>
      </motion.div>
    </div>
  );
}

/* One full-viewport panel per project. */
function ProjectPanel({
  project,
  panelIndex,
}: {
  project: Project;
  panelIndex: number;
}) {
  return (
    <div
      data-panel={panelIndex}
      className="container-px flex h-full w-screen shrink-0 items-center"
    >
      <div className="grid w-full items-center gap-10 lg:grid-cols-2 lg:gap-16">
        {/* Visual */}
        {/* Panels live in a transformed track, where IntersectionObserver
            (whileInView) is unreliable — animate once on mount instead so a
            panel is never stuck invisible when you scroll sideways to it. */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, ease: EASE }}
          className="order-2 lg:order-1"
        >
          <ProjectVisual motif={project.motif} accent={project.accent} />
        </motion.div>

        {/* Text */}
        <div className="order-1 lg:order-2">
          <div className="mb-5 flex items-center gap-4">
            <IndexGlyph value={project.index} />
            <StatusBadge status={project.status} />
          </div>
          <h3 className="font-display text-4xl font-semibold tracking-tighter sm:text-5xl">
            {project.name}
          </h3>
          <p className="mt-3 text-xl text-cyan/90">{project.tagline}</p>
          <p className="mt-5 max-w-lg text-pretty leading-relaxed text-fog">
            {project.description}
          </p>
          {project.role && (
            <p className="mt-3 max-w-lg text-sm text-fog-dim">{project.role}</p>
          )}
          {project.longline && (
            <p className="mt-4 max-w-lg border-l-2 border-cyan/40 pl-4 text-sm italic leading-relaxed text-fog-dim">
              {project.longline}
            </p>
          )}
          <ul className="mt-7 flex flex-wrap gap-2.5">
            {project.highlights.map((h) => (
              <li
                key={h}
                className="rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-1.5 font-mono text-xs text-fog transition-colors hover:border-cyan/30 hover:text-fog-bright"
              >
                {h}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* The big outlined index sits low/behind, sized for the panel. */}
      <span
        className="pointer-events-none absolute bottom-6 right-[var(--container-pad,1.5rem)] -z-0 hidden font-display text-[22vw] font-semibold leading-none text-transparent opacity-[0.04] lg:block"
        style={{ WebkitTextStroke: "1px rgba(154,160,176,0.5)" }}
        aria-hidden
      >
        {project.index}
      </span>
    </div>
  );
}

/* Animated "scroll" hint — pauses cleanly under reduced motion (this whole
   branch only mounts when motion is allowed, but keep it self-contained). */
function ScrollHint() {
  return (
    <span className="flex items-center gap-3 font-mono text-[0.65rem] uppercase tracking-[0.25em] text-fog-dim">
      Scroll
      <span className="relative block h-px w-12 overflow-hidden bg-white/15">
        <motion.span
          className="absolute inset-y-0 left-0 w-4 bg-cyan"
          animate={{ x: ["-100%", "300%"] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        />
      </span>
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Mobile / reduced-motion: clean vertical stack (mirrors Work.tsx).  */
/* Never pins, never traps scroll.                                    */
/* ------------------------------------------------------------------ */
function VerticalStack() {
  return (
    <section id="work" className="section-y relative scroll-mt-24">
      <div className="container-px">
        <Reveal className="mb-16 sm:mb-24">
          <p className="eyebrow mb-4">Selected work</p>
          <h2 className="max-w-3xl text-balance font-display font-semibold text-display-lg">
            Things I&apos;ve built that{" "}
            <span className="text-gradient-neon">run themselves</span>.
          </h2>
        </Reveal>

        <div className="flex flex-col gap-28 sm:gap-40">
          {projects.map((p, i) => (
            <StackedRow key={p.index} project={p} flip={i % 2 === 1} />
          ))}
        </div>
      </div>
    </section>
  );
}

function StackedRow({ project, flip }: { project: Project; flip: boolean }) {
  return (
    <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
      {/* Visual */}
      <Reveal y={40} className={flip ? "lg:order-2" : "lg:order-1"}>
        <motion.div
          initial={{ scale: 0.96 }}
          whileInView={{ scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, ease: EASE }}
        >
          <ProjectVisual motif={project.motif} accent={project.accent} />
        </motion.div>
      </Reveal>

      {/* Text */}
      <div className={flip ? "lg:order-1" : "lg:order-2"}>
        <Reveal>
          <div className="mb-5 flex items-center gap-4">
            <span
              className="font-display text-5xl font-semibold text-transparent sm:text-6xl"
              style={{ WebkitTextStroke: "1px rgba(154,160,176,0.4)" }}
              aria-hidden
            >
              {project.index}
            </span>
            <StatusBadge status={project.status} />
          </div>
        </Reveal>

        <Reveal delay={0.05}>
          <h3 className="font-display text-4xl font-semibold tracking-tighter sm:text-5xl">
            {project.name}
          </h3>
        </Reveal>

        <Reveal delay={0.1}>
          <p className="mt-3 text-xl text-cyan/90">{project.tagline}</p>
        </Reveal>

        <Reveal delay={0.15}>
          <p className="mt-5 max-w-lg text-pretty leading-relaxed text-fog">
            {project.description}
          </p>
        </Reveal>

        {project.role && (
          <Reveal delay={0.17}>
            <p className="mt-3 max-w-lg text-sm text-fog-dim">{project.role}</p>
          </Reveal>
        )}

        {project.longline && (
          <Reveal delay={0.18}>
            <p className="mt-4 max-w-lg border-l-2 border-cyan/40 pl-4 text-sm italic leading-relaxed text-fog-dim">
              {project.longline}
            </p>
          </Reveal>
        )}

        <Reveal delay={0.2}>
          <ul className="mt-7 flex flex-wrap gap-2.5">
            {project.highlights.map((h) => (
              <li
                key={h}
                className="rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-1.5 font-mono text-xs text-fog transition-colors hover:border-cyan/30 hover:text-fog-bright"
              >
                {h}
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </div>
  );
}
