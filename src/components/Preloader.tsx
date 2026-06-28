import { useEffect, useState } from "react";
import {
  AnimatePresence,
  animate,
  motion,
  useMotionValue,
  useTransform,
} from "framer-motion";
import { profile } from "@/data/content";

const EASE = [0.76, 0, 0.24, 1] as const;

/**
 * Full-screen intro. Deterministically counts 0 → 100 over ~1.6s, then lifts
 * away to reveal the hero. Skipped instantly for reduced-motion users.
 */
export default function Preloader({ onComplete }: { onComplete: () => void }) {
  // Single source of truth: a MotionValue driven by framer-motion's animate().
  const progress = useMotionValue(0);
  const [count, setCount] = useState(0);
  const [done, setDone] = useState(false);

  // Bar width tracks the same MotionValue — no separate state, no drift.
  const barWidth = useTransform(progress, (v) => `${v}%`);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setDone(true);
      onComplete();
      return;
    }

    let completed = false;
    const finish = () => {
      if (completed) return;
      completed = true;
      setDone(true);
      onComplete();
    };

    const unsubscribe = progress.on("change", (v) => setCount(Math.round(v)));

    const controls = animate(progress, 100, {
      duration: 1.6,
      ease: [0.76, 0, 0.24, 1],
      onComplete: () => {
        // Let 100% breathe for a beat before the curtain lifts.
        window.setTimeout(finish, 400);
      },
    });

    return () => {
      controls.stop();
      unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          className="fixed inset-0 z-[120] flex flex-col justify-between bg-ink px-6 py-8 sm:px-10 sm:py-10"
          exit={{ y: "-100%" }}
          transition={{ duration: 0.9, ease: EASE }}
        >
          <div className="label-meta flex items-center justify-between">
            <span>{profile.name}</span>
            <span className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 animate-pulse-glow rounded-full bg-live" />
              establishing&nbsp;keys
            </span>
          </div>

          <div className="flex flex-1 items-center" aria-hidden="true">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="font-display text-[15vw] font-semibold leading-none tracking-tighter text-fog-bright sm:text-[11vw]"
            >
              <span className="text-gradient-neon">DECRYPTING</span>
            </motion.div>
          </div>

          <div className="flex items-end justify-between gap-6">
            <div className="hidden max-w-xs font-mono text-[0.7rem] leading-relaxed text-fog-dim sm:block">
              &gt; verifying signature…<br />
              &gt; opening secure channel…
            </div>
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:items-end">
              <div className="font-mono text-5xl font-medium tabular-nums text-fog-bright sm:text-7xl">
                {String(count).padStart(3, "0")}
                <span className="text-cyan">%</span>
              </div>
              <div className="h-px w-full overflow-hidden bg-white/10 sm:w-72">
                <motion.div
                  className="h-full bg-gradient-to-r from-cyan to-violet"
                  style={{ width: barWidth }}
                />
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
