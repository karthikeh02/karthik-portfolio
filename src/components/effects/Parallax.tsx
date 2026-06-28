import { useRef, type ReactNode } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";

/**
 * Scroll-linked vertical parallax. Drifts its child as the element passes
 * through the viewport (positive `speed` = lifts up on scroll-down). Adds depth
 * to otherwise-flat sections. No-op under reduced motion.
 */
export default function Parallax({
  children,
  speed = 0.25,
  className,
}: {
  children: ReactNode;
  speed?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const range = 80 * speed;
  const y = useTransform(scrollYProgress, [0, 1], [range, -range]);

  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div ref={ref} style={{ y }} className={className}>
      {children}
    </motion.div>
  );
}
