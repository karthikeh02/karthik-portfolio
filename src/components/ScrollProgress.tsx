import { motion, useScroll, useSpring } from "framer-motion";

/** Thin neon progress bar pinned to the very top of the viewport. */
export default function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    mass: 0.3,
  });

  return (
    <motion.div
      style={{ scaleX }}
      className="fixed left-0 top-0 z-[95] h-[2px] w-full origin-left bg-gradient-to-r from-cyan via-violet to-magenta"
    />
  );
}
