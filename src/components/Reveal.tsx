import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";

const EASE = [0.22, 1, 0.36, 1] as const;

type Variant = "rise" | "clip" | "blur" | "slide-left" | "slide-right";

/** Fade-and-rise on scroll into view. Fires once. */
export default function Reveal({
  children,
  delay = 0,
  y = 28,
  className,
  variant = "rise",
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  variant?: Variant;
}) {
  const reduceMotion = useReducedMotion();

  // Never leave content stuck hidden for reduced-motion users.
  if (reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  const initial =
    variant === "clip"
      ? { opacity: 0, clipPath: "inset(0 0 100% 0)" }
      : variant === "blur"
        ? { opacity: 0, filter: "blur(8px)" }
        : variant === "slide-left"
          ? { opacity: 0, x: 48 }
          : variant === "slide-right"
            ? { opacity: 0, x: -48 }
            : { opacity: 0, y };

  const whileInView =
    variant === "clip"
      ? { opacity: 1, clipPath: "inset(0 0 0% 0)" }
      : variant === "blur"
        ? { opacity: 1, filter: "blur(0px)" }
        : variant === "slide-left" || variant === "slide-right"
          ? { opacity: 1, x: 0 }
          : { opacity: 1, y: 0 };

  return (
    <motion.div
      className={className}
      initial={initial}
      whileInView={whileInView}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.8, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}
