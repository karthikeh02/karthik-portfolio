import { useEffect, useMemo, useRef, useState, type ElementType } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * One word in the kinetic line. Owns its own useTransform calls so the parent
 * never breaks the rules of hooks by calling hooks inside .map().
 * Rises from translateY 110% + opacity 0 and flips up via rotateX (~30deg -> 0),
 * scrubbed across its own [start,end] slot for a sequential left-to-right cascade.
 */
function Word({
  progress,
  start,
  end,
  className,
  children,
}: {
  progress: MotionValue<number>;
  start: number;
  end: number;
  className?: string;
  children: string;
}) {
  // The slice [start,end] IS the scrub window, so a linear map within it is correct.
  const y = useTransform(progress, [start, end], ["110%", "0%"]);
  const rotateX = useTransform(progress, [start, end], [30, 0]);
  const opacity = useTransform(progress, [start, end], [0, 1]);

  return (
    <span
      className="inline-flex overflow-hidden align-bottom"
      style={{ perspective: 600 }}
    >
      <motion.span
        style={{
          y,
          rotateX,
          opacity,
          transformOrigin: "bottom center",
          willChange: "transform",
        }}
        className={cn("inline-block", className)}
      >
        {children}
      </motion.span>
      {/* keep word spacing intact between masks */}
      <span aria-hidden className="inline-block">
        &nbsp;
      </span>
    </span>
  );
}

interface KineticTextProps {
  /** The line to reveal. Split into words on whitespace. */
  text: string;
  /** Wrapper tag — defaults to h2. */
  as?: ElementType;
  /** Classes applied to the wrapper heading. */
  className?: string;
  /** Classes applied to each animated word span. */
  wordClassName?: string;
}

/**
 * Scroll-SCRUBBED kinetic heading: words rise into place coupled to scroll
 * position (not a one-shot tween), staggered across the line. Honors
 * prefers-reduced-motion with a clean static render.
 */
export default function KineticText({
  text,
  as,
  className,
  wordClassName,
}: KineticTextProps) {
  const Tag = (as ?? "h2") as ElementType;
  const wrapperRef = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();

  // Gate the live per-word scroll binding to "near the viewport". When far
  // offscreen we render the words as plain finished spans, so the ~15 MotionValues
  // per heading aren't subscribed to scroll while they can't be seen. The scrub is
  // only perceptible within ~1 viewport of travel, so this is visually identical.
  const [active, setActive] = useState(false);

  const words = useMemo(() => text.split(/\s+/).filter(Boolean), [text]);

  // Word reveal spans roughly a full viewport of travel — beginning as the line
  // crests into the lower viewport and resolving near center. Scrubbed both ways.
  const { scrollYProgress } = useScroll({
    target: wrapperRef,
    offset: ["start 0.95", "center 0.55"],
  });

  // Pre-compute each word's overlapping sub-range so hooks stay out of the map.
  // Word starts are spread across the FULL 0..1 progress range so the cascade is
  // visibly sequential left-to-right and the last word lands near viewport center.
  const ranges = useMemo(() => {
    const total = Math.max(words.length, 1);
    const span = 1 / total;
    // ~0.4 of a slot of overlap so neighbours bleed into one another fluidly
    // without collapsing the sequence into a single snap.
    const overlap = span * 0.4;
    return words.map((_, i) => {
      // Distribute starts across [0,1): word i begins at i/total.
      const start = i * span;
      const end = Math.min(1, start + span + overlap);
      return { start, end };
    });
  }, [words]);

  // Observe the wrapper; flip `active` on when it is within ~1 viewport of the
  // fold. Skipped under reduced motion (we render static there anyway). If
  // IntersectionObserver is unavailable, fall back to always-active.
  useEffect(() => {
    if (reduceMotion) return;
    const el = wrapperRef.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setActive(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => setActive(entry.isIntersecting),
      { rootMargin: "100% 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [reduceMotion]);

  // Reduced motion: plain, readable, no scroll binding or loops.
  if (reduceMotion) {
    return (
      <Tag ref={wrapperRef} className={className}>
        {text}
      </Tag>
    );
  }

  return (
    <Tag ref={wrapperRef} className={className}>
      {/* Real text for screen readers; visual words are aria-hidden. */}
      <span className="sr-only">{text}</span>
      <span aria-hidden>
        {active
          ? words.map((word, i) => (
              <Word
                key={`${word}-${i}`}
                progress={scrollYProgress}
                start={ranges[i].start}
                end={ranges[i].end}
                className={wordClassName}
              >
                {word}
              </Word>
            ))
          : // Offscreen: the finished/lit heading as plain spans — no scroll
            // binding, no per-word MotionValues. Mirrors <Word>'s resolved state
            // (y 0%, rotateX 0, opacity 1) and word spacing for an identical read.
            words.map((word, i) => (
              <span
                key={`${word}-${i}`}
                className="inline-flex overflow-hidden align-bottom"
              >
                <span className={cn("inline-block", wordClassName)}>{word}</span>
                <span className="inline-block">&nbsp;</span>
              </span>
            ))}
      </span>
    </Tag>
  );
}
