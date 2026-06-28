import { useEffect, useRef, useState, type ElementType } from "react";
import { useInView, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

/** Default glyph pool — hex + symbols, on-brand "DECRYPTING" texture. */
const DEFAULT_CHARSET = "0123456789ABCDEF<>/{}#*";

/** Total decrypt time. Each character resolves left-to-right within this window. */
const DURATION = 760;

type ScrambleProps = {
  text: string;
  className?: string;
  /** Rendered tag. Default "span". */
  as?: ElementType;
  /** Glyph pool the scramble draws from while decrypting. */
  charset?: string;
  /** When to start: on first viewport entry, or immediately on mount. */
  trigger?: "view" | "mount";
};

/**
 * Text decrypt effect: characters start as random glyphs and resolve
 * left-to-right into the real string over ~760ms, driven by rAF.
 *
 * Accessibility: the true text is exposed via aria-label and the animating
 * glyphs are aria-hidden, so screen readers always read the real string.
 * Honours prefers-reduced-motion by rendering the final text immediately.
 */
export default function Scramble({
  text,
  className,
  as,
  charset = DEFAULT_CHARSET,
  trigger = "view",
}: ScrambleProps) {
  const Tag: ElementType = as ?? "span";
  const ref = useRef<HTMLSpanElement>(null);
  const reduceMotion = useReducedMotion();

  // useInView must run unconditionally; ignored when trigger === "mount".
  const inView = useInView(ref, { once: true, margin: "-12%" });

  // The glyph layer's current frame. Starts as the real text so the static
  // fallback (reduced motion / pre-trigger) reads correctly without animation.
  const [display, setDisplay] = useState(text);

  const rafRef = useRef<number | null>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    if (reduceMotion) {
      setDisplay(text);
      return;
    }

    const shouldRun = trigger === "mount" || inView;
    if (!shouldRun || startedRef.current) return;
    startedRef.current = true;

    const chars = [...text];
    const startedAt = performance.now();

    const tick = (now: number) => {
      const progress = Math.min((now - startedAt) / DURATION, 1);
      // How many characters have fully resolved so far (left-to-right).
      const resolved = progress * chars.length;

      const next = chars
        .map((ch, i) => {
          if (ch === " ") return " "; // spaces stay spaces
          if (i < resolved) return ch; // settled into the real character
          return charset[Math.floor(Math.random() * charset.length)];
        })
        .join("");

      setDisplay(next);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setDisplay(text); // guarantee final === text
        rafRef.current = null;
      }
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [text, charset, trigger, inView, reduceMotion]);

  return (
    <Tag ref={ref} aria-label={text} className={cn("font-mono", className)}>
      {/* Real text for layout sizing + a clean copy/paste fallback. */}
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">{display}</span>
    </Tag>
  );
}
