import { useRef, useState, type ReactNode } from "react";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * Pointer-reactive 3D tilt wrapper for cards. The pointer position inside the
 * element maps to rotateX/rotateY (center = flat, edges = +/- `max` degrees),
 * springing back to flat on leave. An optional glare follows the cursor as a
 * soft white radial highlight. No-ops to a plain wrapper on coarse pointers
 * (touch) or when the user prefers reduced motion. Wraps any .glass card.
 */
export default function TiltCard({
  children,
  className,
  max = 9,
  glare = true,
}: {
  children: ReactNode;
  className?: string;
  /** Maximum tilt at the edges, in degrees. */
  max?: number;
  /** Pointer-following highlight overlay. */
  glare?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();

  // Coarse pointers (touch) get no tilt — resolved once on mount, never updated.
  const [interactive] = useState(
    () =>
      typeof window !== "undefined" &&
      !window.matchMedia("(pointer: coarse)").matches,
  );

  const enabled = interactive && !reduceMotion;

  // Normalised pointer position within the element (0..1 on each axis).
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);

  // Map position -> rotation; top/left tilt toward the cursor for a natural feel.
  const rotateX = useSpring(useTransform(py, [0, 1], [max, -max]), {
    stiffness: 220,
    damping: 18,
    mass: 0.5,
  });
  const rotateY = useSpring(useTransform(px, [0, 1], [-max, max]), {
    stiffness: 220,
    damping: 18,
    mass: 0.5,
  });

  // Glare follows the raw pointer position; opacity rises while hovered.
  const glareX = useTransform(px, (v) => `${v * 100}%`);
  const glareY = useTransform(py, (v) => `${v * 100}%`);
  const glareOpacity = useSpring(useMotionValue(0), {
    stiffness: 200,
    damping: 24,
  });
  const glareBackground = useMotionTemplate`radial-gradient(circle at ${glareX} ${glareY}, rgba(255,255,255,0.22), transparent 55%)`;

  // Plain pass-through when tilt is disabled — no transform, no listeners.
  if (!enabled) {
    return <div className={className}>{children}</div>;
  }

  const onMove = (e: React.PointerEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    px.set((e.clientX - r.left) / r.width);
    py.set((e.clientY - r.top) / r.height);
  };
  const onEnter = () => glareOpacity.set(1);
  const onLeave = () => {
    px.set(0.5);
    py.set(0.5);
    glareOpacity.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onPointerMove={onMove}
      onPointerEnter={onEnter}
      onPointerLeave={onLeave}
      style={{
        rotateX,
        rotateY,
        transformPerspective: 900,
        transformStyle: "preserve-3d",
      }}
      className={cn("relative", className)}
    >
      {children}
      {glare && (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[inherit] mix-blend-soft-light"
          style={{ background: glareBackground, opacity: glareOpacity }}
        />
      )}
    </motion.div>
  );
}
