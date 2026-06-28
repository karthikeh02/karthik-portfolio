import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

/**
 * Custom cursor: a precise dot that tracks 1:1 and a softer ring that lags
 * behind on a spring. The ring swells over interactive elements. Only enabled
 * on devices with a fine pointer (desktop) — touch keeps the native behaviour.
 */
export default function Cursor() {
  const [enabled, setEnabled] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [down, setDown] = useState(false);

  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const ringX = useSpring(x, { stiffness: 320, damping: 28, mass: 0.5 });
  const ringY = useSpring(y, { stiffness: 320, damping: 28, mass: 0.5 });

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (!fine) return;
    setEnabled(true);
    document.body.classList.add("cursor-ready");

    const move = (e: MouseEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      const t = e.target as HTMLElement | null;
      setHovering(!!t?.closest('a, button, [data-cursor="hover"]'));
    };
    const dn = () => setDown(true);
    const up = () => setDown(false);

    window.addEventListener("mousemove", move);
    window.addEventListener("mousedown", dn);
    window.addEventListener("mouseup", up);
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mousedown", dn);
      window.removeEventListener("mouseup", up);
      document.body.classList.remove("cursor-ready");
    };
  }, [x, y]);

  if (!enabled) return null;

  return (
    <>
      <motion.div
        style={{ x, y }}
        className="pointer-events-none fixed left-0 top-0 z-[100]"
      >
        <div className="-translate-x-1/2 -translate-y-1/2 h-1.5 w-1.5 rounded-full bg-cyan" />
      </motion.div>

      <motion.div
        style={{ x: ringX, y: ringY }}
        className="pointer-events-none fixed left-0 top-0 z-[100] mix-blend-difference"
      >
        <motion.div
          className="-translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan/70"
          animate={{
            width: hovering ? 54 : 30,
            height: hovering ? 54 : 30,
            opacity: down ? 0.4 : hovering ? 1 : 0.55,
          }}
          transition={{ type: "spring", stiffness: 260, damping: 22 }}
        />
      </motion.div>
    </>
  );
}
