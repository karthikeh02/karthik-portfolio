import { motion, useReducedMotion } from "framer-motion";
import { approach } from "@/data/content";
import { cn } from "@/lib/utils";
import Reveal from "../Reveal";
import Scramble from "../effects/Scramble";
import KineticText from "../effects/KineticText";

const EASE = [0.22, 1, 0.36, 1] as const;

export default function Approach() {
  const reduceMotion = useReducedMotion();

  return (
    <section
      className="section-y relative border-t border-white/5"
    >
      <div className="container-px">
        <div className="mb-16 max-w-2xl">
          <Reveal>
            <Scramble as="p" text={approach.eyebrow} className="eyebrow mb-4" />
          </Reveal>
          <KineticText
            text={approach.heading}
            className="text-balance font-display text-display-lg font-semibold"
          />
        </div>

        <div className="relative grid gap-px overflow-hidden rounded-3xl border border-white/8 sm:grid-cols-2 lg:grid-cols-4">
          {approach.steps.map((step, i) => (
            <Reveal
              key={step.no}
              delay={i * 0.08}
              className="group relative bg-ink-100/60 p-8 transition-colors hover:bg-ink-200/80"
            >
              {/* Top accent line: draws on scroll into view, brightens on hover. */}
              <motion.span
                aria-hidden
                className={cn(
                  "absolute inset-x-0 top-0 h-px origin-left bg-gradient-to-r from-cyan to-violet",
                  "transition-shadow duration-500 group-hover:shadow-glow",
                )}
                initial={reduceMotion ? false : { scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{
                  duration: 0.7,
                  delay: i * 0.08 + 0.15,
                  ease: EASE,
                }}
              />

              <div className="mb-8 font-mono text-sm text-cyan">{step.no}</div>
              <h3 className="font-display text-2xl font-semibold tracking-tight text-fog-bright">
                {step.title}
              </h3>
              <p className="mt-3 text-lead leading-relaxed text-fog">
                {step.text}
              </p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
