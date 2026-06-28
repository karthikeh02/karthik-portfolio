import { lazy, Suspense, useRef } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type Variants,
} from "framer-motion";
import { ArrowDown, ArrowRight, Github } from "lucide-react";
import { profile } from "@/data/content";
import { cn } from "@/lib/utils";
import Magnetic from "../Magnetic";

// ParticleField runs a hand-written WebGL field — load it after the hero
// paints so first paint stays fast.
const ParticleField = lazy(() => import("../ParticleField"));

const EASE = [0.22, 1, 0.36, 1] as const;

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.055, delayChildren: 0.15 } },
};
const item: Variants = {
  hidden: { opacity: 0, y: 26 },
  show: { opacity: 1, y: 0, transition: { duration: 0.85, ease: EASE } },
};
const letter: Variants = {
  hidden: { opacity: 0, y: "55%" },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
};

function AnimatedWord({ word, className = "" }: { word: string; className?: string }) {
  return (
    <span className={cn("inline-flex overflow-hidden", className)}>
      {word.split("").map((ch, i) => (
        <motion.span key={i} variants={letter} className="inline-block">
          {ch}
        </motion.span>
      ))}
    </span>
  );
}

export default function Hero({ loaded }: { loaded: boolean }) {
  const ref = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [0, -130]);
  const opacity = useTransform(scrollYProgress, [0, 0.75], [1, 0]);
  // Subtle "recede" as the hero scrolls away — adds depth to the hand-off.
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.94]);

  return (
    <section
      id="top"
      ref={ref}
      className="relative flex min-h-[100svh] items-center overflow-hidden"
    >
      {/* Background layers */}
      <Suspense fallback={null}>
        <ParticleField className="absolute inset-0 z-0" />
      </Suspense>
      <div className="pointer-events-none absolute inset-0 z-0 bg-grid-fade [background-size:64px_64px] opacity-60 [mask-image:radial-gradient(ellipse_70%_60%_at_50%_40%,black,transparent)]" />
      <div className="pointer-events-none absolute inset-0 z-0 bg-radial-glow" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-40 bg-gradient-to-t from-ink to-transparent" />

      <motion.div
        style={{ y, opacity, scale }}
        className="container-px relative z-10 w-full pt-[calc(var(--nav-h)+1.25rem)] sm:pt-[calc(var(--nav-h)+3rem)]"
      >
        <motion.div variants={container} initial="hidden" animate={loaded ? "show" : "hidden"}>
          <motion.div variants={item} className="mb-7 flex items-center gap-3 label-meta">
            <span className="flex items-center gap-2 rounded-full border border-white/10 px-3 py-1">
              <span className="h-1.5 w-1.5 animate-pulse-glow rounded-full bg-live" />
              {profile.role}
            </span>
            <span className="hidden text-fog-dim/70 sm:inline">/ {profile.location}</span>
          </motion.div>

          <h1 className="font-display font-semibold leading-[0.86] tracking-tightest text-balance">
            <span className="block text-display-hero text-fog-bright">
              <AnimatedWord word={profile.headlineTop} />
            </span>
            <span className="block text-display-hero">
              <AnimatedWord word={profile.headlineBottom} className="text-gradient-neon" />
            </span>
          </h1>

          <motion.p
            variants={item}
            className="mt-8 max-w-xl text-lead text-pretty text-fog"
          >
            {profile.intro}
          </motion.p>

          <motion.div variants={item} className="mt-10 flex flex-wrap items-center gap-4">
            <Magnetic strength={0.4}>
              <a href={profile.cta.primary.href} className="group btn-primary focus-ring">
                {profile.cta.primary.label}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </a>
            </Magnetic>
            <Magnetic strength={0.4}>
              <a href={profile.cta.secondary.href} className="btn-ghost focus-ring">
                {profile.cta.secondary.label}
              </a>
            </Magnetic>
            <Magnetic strength={0.3}>
              <a
                href={profile.github}
                target="_blank"
                rel="noreferrer"
                className="focus-ring inline-flex items-center gap-2 rounded-full px-2 py-1 label-meta text-fog transition-colors hover:text-cyan"
              >
                <Github className="h-4 w-4" />
                GitHub
              </a>
            </Magnetic>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Scroll cue */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: loaded ? 1 : 0 }}
        transition={{ delay: 1, duration: 1 }}
        className="absolute bottom-7 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2 label-meta"
      >
        <span>Scroll</span>
        <motion.span
          animate={reduceMotion ? undefined : { y: [0, 8, 0] }}
          transition={
            reduceMotion
              ? undefined
              : { duration: 1.8, repeat: Infinity, ease: "easeInOut" }
          }
        >
          <ArrowDown className="h-4 w-4 text-cyan" />
        </motion.span>
      </motion.div>
    </section>
  );
}
