import { useRef } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { manifesto } from "@/data/content";
import { cn } from "@/lib/utils";

/**
 * A pinned, scroll-SCRUBBED statement — the signature "scroll-as-narrative"
 * beat. While the section is pinned, each word of the lead lights up from a dim
 * outline (low opacity + offset + blur) to full brightness, locked to scroll
 * position. The closing punch holds dim until the lead is fully lit, then
 * resolves last into the neon gradient with a brief scale/glow pulse.
 *
 * Reduced motion keeps the SAME large pinned-style layout with everything
 * pre-lit — only the scrub is dropped. Touch/mobile gets the full scrubbed
 * flow now too (the per-word reveal is cheap: opacity + y + a static shadow).
 */

const leadWords = manifesto.lead.split(" ");
const fullText = `${manifesto.lead} ${manifesto.punch}`;

// Spread the per-word reveal across ~0.9 of scroll progress; the lead occupies
// the first ~0.62 of that window, leaving room for the punch to resolve last.
const SPREAD = 0.9;
const LEAD_END = 0.62 * SPREAD;
const PUNCH_START = LEAD_END + 0.04;
const PUNCH_END = SPREAD;

function LeadWord({
  children,
  progress,
  start,
  end,
}: {
  children: string;
  progress: MotionValue<number>;
  start: number;
  end: number;
}) {
  // Floor the dim state at 0.14 — never fully invisible, just unlit.
  const opacity = useTransform(progress, [start, end], [0.14, 1]);
  const y = useTransform(progress, [start, end], ["0.35em", "0em"]);
  return (
    <motion.span
      style={{
        opacity,
        y,
        // Static soft accent glow — a cheap paint that rides with opacity,
        // replacing the per-frame Gaussian blur filter.
        textShadow: "0 0 18px rgba(139,92,246,0.35)",
        willChange: "opacity, transform",
      }}
      className="inline-block text-fog-bright"
    >
      {children}&nbsp;
    </motion.span>
  );
}

function Punch({ progress }: { progress: MotionValue<number> }) {
  // Resolve last: dim hold, then opacity + a brief scale/glow pulse that
  // overshoots and settles. The pulse peaks just before the window closes.
  const opacity = useTransform(progress, [PUNCH_START, PUNCH_END], [0.14, 1]);
  const y = useTransform(progress, [PUNCH_START, PUNCH_END], ["0.35em", "0em"]);
  const scale = useTransform(
    progress,
    [PUNCH_START, PUNCH_END - 0.04, PUNCH_END],
    [0.985, 1.035, 1],
  );
  return (
    <motion.span
      style={{ opacity, y, willChange: "opacity, transform" }}
      className="inline-block"
    >
      <motion.span
        style={{
          scale,
          // Static settled neon glow — replaces the per-frame animated
          // drop-shadow filter. text-shadow is a cheap paint, not a raster.
          textShadow: "0 0 14px rgba(34,211,238,0.3)",
          willChange: "transform",
        }}
        className="inline-block origin-left text-gradient-neon"
      >
        {manifesto.punch}
      </motion.span>
    </motion.span>
  );
}

export default function Manifesto() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  const statementClass =
    "container-px relative max-w-5xl text-balance font-display text-display-xl font-semibold";

  if (reduce) {
    // Same large pinned-style layout, everything pre-lit — only the scrub drops.
    return (
      <section className="relative section-y">
        <div
          className="pointer-events-none absolute left-1/2 top-1/2 h-[440px] w-[60vw] max-w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(139,92,246,0.12), transparent 70%)",
          }}
        />
        <h2 className={statementClass}>
          <span className="text-fog-bright">{manifesto.lead} </span>
          <span className="text-gradient-neon">{manifesto.punch}</span>
        </h2>
      </section>
    );
  }

  const total = leadWords.length;
  return (
    <section ref={ref} className="relative" style={{ height: "190vh" }}>
      <div className="sticky top-0 flex h-screen items-center overflow-hidden">
        {/* atmosphere — responsive violet bloom (pre-baked radial gradient,
            no per-frame blur raster) */}
        <div
          className="pointer-events-none absolute left-1/2 top-1/2 h-[440px] w-[60vw] max-w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(139,92,246,0.12), transparent 70%)",
          }}
        />
        <h2 className={cn(statementClass, "leading-[1.05]")}>
          {/* Full statement for assistive tech; spans below are decorative. */}
          <span className="sr-only">{fullText}</span>
          <span aria-hidden="true">
            {leadWords.map((w, i) => {
              const start = (i / total) * LEAD_END;
              const end = ((i + 1) / total) * LEAD_END;
              return (
                <LeadWord
                  key={i}
                  progress={scrollYProgress}
                  start={start}
                  end={end}
                >
                  {w}
                </LeadWord>
              );
            })}
            <Punch progress={scrollYProgress} />
          </span>
        </h2>
      </div>
    </section>
  );
}
