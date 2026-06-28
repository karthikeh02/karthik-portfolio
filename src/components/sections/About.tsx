import { about, stats } from "@/data/content";
import { cn } from "@/lib/utils";
import Reveal from "../Reveal";
import Scramble from "../effects/Scramble";
import KineticText from "../effects/KineticText";
import TiltCard from "../effects/TiltCard";

// The 4 stat cards rotate through a tri-accent so the row reads as a chord,
// not a monotone. The violet card swaps its hover ring to the violet variant.
const ACCENTS = ["cyan", "violet", "magenta", "cyan"] as const;
type Accent = (typeof ACCENTS)[number];

const ACCENT_DOT: Record<Accent, string> = {
  cyan: "bg-cyan shadow-glow",
  violet: "bg-violet shadow-glow-violet",
  magenta: "bg-magenta",
};

export default function About() {
  return (
    <section
      className="section-y relative scroll-mt-24 border-t border-white/5"
    >
      <div className="container-px">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          {/* Sticky heading */}
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-28">
              <Reveal>
                <Scramble as="p" text={about.eyebrow} className="eyebrow mb-5" />
              </Reveal>
              <KineticText
                text={about.heading}
                className="text-balance font-display text-display-lg font-semibold"
              />
            </div>
          </div>

          {/* Paragraphs */}
          <div className="lg:col-span-8">
            <div className="space-y-6 text-fog">
              {about.body.map((p, i) => (
                <Reveal key={i} delay={i * 0.08}>
                  <p
                    className={cn(
                      "max-w-[68ch] text-lead text-pretty",
                      i === 0
                        ? "font-light text-fog-bright"
                        : "leading-relaxed",
                    )}
                  >
                    {p}
                  </p>
                </Reveal>
              ))}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-20 grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
          {stats.map((s, i) => {
            const accent = ACCENTS[i % ACCENTS.length];
            return (
              <Reveal key={s.label} delay={i * 0.07}>
                <TiltCard className="h-full rounded-2xl" max={7}>
                  <div
                    className={cn(
                      "h-full rounded-2xl glass p-6",
                      accent === "violet" ? "ring-hover-violet" : "ring-hover",
                    )}
                  >
                    <span
                      aria-hidden
                      className={cn(
                        "mb-5 block h-2 w-2 rounded-full",
                        ACCENT_DOT[accent],
                      )}
                    />
                    <div className="font-display text-3xl font-semibold tracking-tight tabular-nums text-gradient-neon sm:text-4xl">
                      {s.value}
                    </div>
                    <div className="mt-3 text-sm font-medium text-fog-bright">
                      {s.label}
                    </div>
                    <div className="label-meta mt-1">{s.sub}</div>
                  </div>
                </TiltCard>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
