import { useEffect, useRef, type RefObject } from "react";
import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
  type MotionValue,
} from "framer-motion";
import { profile } from "@/data/content";

const ROW_A = [...profile.keywords];
const ROW_B = [
  "Trustless",
  "Permissionless",
  "Onchain",
  "Composable",
  "Verifiable",
  "Non-custodial",
  "Immutable",
  "Open Source",
];

// Seamless modulo wrap: keeps the percentage offset inside [min, max).
const wrap = (min: number, max: number, v: number) => {
  const r = max - min;
  return ((((v - min) % r) + r) % r) + min;
};

// One reusable word run, duplicated inside the track for the seamless loop.
function Words({ items, outline }: { items: string[]; outline: boolean }) {
  return (
    <>
      {items.map((word, i) => (
        <span key={i} className="flex items-center" aria-hidden="true">
          <span
            className={`px-7 font-display text-[clamp(2rem,4.5vw,5rem)] font-semibold leading-none tracking-tighter ${
              outline ? "text-transparent" : "text-fog-bright/90"
            }`}
            style={
              outline
                ? { WebkitTextStroke: "1px rgba(154,160,176,0.35)" }
                : undefined
            }
          >
            {word}
          </span>
          <span className="text-cyan/70">◆</span>
        </span>
      ))}
    </>
  );
}

// Velocity-driven track: base scroll advances baseX, scroll velocity nudges
// speed + direction, and a clamped skew sells the physical scroll coupling.
function VelocityTrack({
  items,
  baseVelocity,
  velocityFactor,
  skew,
  visibleRef,
  outline = false,
}: {
  items: string[];
  baseVelocity: number;
  velocityFactor: MotionValue<number>;
  skew: MotionValue<string>;
  visibleRef: RefObject<boolean>;
  outline?: boolean;
}) {
  // Two copies translated by -50% gives one full wrap cycle.
  const baseX = useMotionValue(0);
  const x = useTransform(baseX, (v) => `${wrap(-50, 0, v)}%`);
  const directionRef = useRef(1);
  // Eased velocity contribution so the row settles instead of snapping to rest.
  const factorRef = useRef(0);

  useAnimationFrame((_, delta) => {
    // Skip all per-frame work while the marquee is scrolled offscreen so the
    // rAF body no-ops (saves CPU on mobile); the hook still runs every render.
    if (!visibleRef.current) return;

    // Base drift in % per second, normalised by the frame delta.
    let moveBy = baseVelocity * (delta / 1000);

    // Only commit a direction flip past a deadzone so it doesn't jitter at rest.
    const factor = velocityFactor.get();
    if (factor < -0.15) directionRef.current = -1;
    else if (factor > 0.15) directionRef.current = 1;

    // Ease the velocity contribution toward the live factor; at rest it decays
    // smoothly to 0 so the row coasts to base speed without a jerk.
    factorRef.current += (factor - factorRef.current) * (1 - Math.exp(-delta / 120));

    moveBy += directionRef.current * moveBy * Math.abs(factorRef.current);

    baseX.set(baseX.get() + moveBy);
  });

  return (
    <div className="flex w-max">
      <motion.div className="flex w-max items-center" style={{ x, skewX: skew }}>
        <Words items={items} outline={outline} />
        <Words items={items} outline={outline} />
      </motion.div>
    </div>
  );
}

export default function VelocityMarquee() {
  const reduceMotion = useReducedMotion();

  // Pause the marquee rAF body while the section is scrolled out of view.
  const sectionRef = useRef<HTMLElement>(null);
  const visibleRef = useRef(true);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        visibleRef.current = entry.isIntersecting;
      },
      { rootMargin: "200px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Single source of truth: window scroll -> velocity -> smoothed spring.
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocity, {
    damping: 50,
    stiffness: 400,
  });
  // Clamped so fast flicks can't strobe the marquee.
  const velocityFactor = useTransform(
    smoothVelocity,
    [-1500, 0, 1500],
    [-2, 0, 2],
    { clamp: true }
  );
  // Halved shear; the two rails get equal-and-opposite skew so they shear apart.
  const skew = useTransform(
    smoothVelocity,
    [-1500, 1500],
    ["-2.5deg", "2.5deg"],
    { clamp: true }
  );
  const skewInverted = useTransform(
    smoothVelocity,
    [-1500, 1500],
    ["2.5deg", "-2.5deg"],
    { clamp: true }
  );

  // Reduced motion: static-friendly CSS loops, no rAF / velocity coupling.
  if (reduceMotion) {
    return (
      <section className="relative overflow-hidden border-y border-white/5 bg-ink-50/40 py-10 sm:py-14">
        <div className="mask-fade-x flex flex-col gap-4">
          <div className="flex w-max">
            <div className="flex w-max items-center animate-marquee">
              <Words items={ROW_A} outline={false} />
              <Words items={ROW_A} outline={false} />
            </div>
          </div>
          <div className="flex w-max">
            <div className="flex w-max items-center animate-marquee-reverse">
              <Words items={ROW_B} outline />
              <Words items={ROW_B} outline />
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden border-y border-white/5 bg-ink-50/40 py-10 sm:py-14"
    >
      <div className="mask-fade-x flex flex-col gap-4">
        <VelocityTrack
          items={ROW_A}
          baseVelocity={-1.5}
          velocityFactor={velocityFactor}
          skew={skew}
          visibleRef={visibleRef}
        />
        <VelocityTrack
          items={ROW_B}
          baseVelocity={1.5}
          velocityFactor={velocityFactor}
          skew={skewInverted}
          visibleRef={visibleRef}
          outline
        />
      </div>
    </section>
  );
}
