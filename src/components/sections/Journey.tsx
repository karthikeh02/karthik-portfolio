import { journey, type JourneyEntry } from "@/data/content";
import { cn } from "@/lib/utils";
import Reveal from "../Reveal";
import Scramble from "../effects/Scramble";
import KineticText from "../effects/KineticText";

type Accent = JourneyEntry["accent"];

// Per-entry accent system: the rail node dot, its glow, the period label tint,
// and the soft halo behind the node all derive from the same accent so each row
// reads as one coherent colour beat against the dark field.
const NODE: Record<Accent, string> = {
  cyan: "bg-cyan shadow-glow",
  violet: "bg-violet shadow-glow-violet",
  magenta: "bg-magenta shadow-[0_0_18px_rgba(244,114,182,0.55)]",
};

const PERIOD: Record<Accent, string> = {
  cyan: "text-cyan",
  violet: "text-violet-glow",
  magenta: "text-magenta",
};

const HALO: Record<Accent, string> = {
  cyan: "bg-cyan/15",
  violet: "bg-violet/15",
  magenta: "bg-magenta/15",
};

export default function Journey() {
  return (
    <section className="relative section-y border-t border-white/[0.08]">
      <div className="container-px">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          {/* Sticky heading */}
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-28">
              <Reveal>
                <Scramble
                  as="p"
                  text={journey.eyebrow}
                  className="eyebrow mb-5"
                />
              </Reveal>
              <KineticText
                text={journey.heading}
                className="text-balance font-display text-display-lg font-semibold"
              />
            </div>
          </div>

          {/* Timeline */}
          <div className="lg:col-span-8">
            <ol className="relative">
              {/* Connected vertical rail behind the nodes. Fades out at the foot
                  so the line reads as an open trajectory, not a closed box. */}
              <span
                aria-hidden
                className="pointer-events-none absolute bottom-2 left-[7px] top-2 w-px bg-gradient-to-b from-white/20 via-white/10 to-transparent"
              />

              {journey.entries.map((entry, i) => (
                <li key={`${entry.period}-${entry.title}`}>
                  <Reveal variant="slide-left" delay={i * 0.08}>
                    <div
                      className={cn(
                        "group relative grid grid-cols-[16px_1fr] gap-x-5 pb-12 pl-0 sm:gap-x-7",
                        i === journey.entries.length - 1 && "pb-0",
                      )}
                    >
                      {/* Node + halo, aligned to the rail */}
                      <span className="relative mt-[6px] flex h-4 w-4 items-center justify-center">
                        <span
                          aria-hidden
                          className={cn(
                            "absolute h-6 w-6 rounded-full blur-md transition-opacity duration-500 group-hover:opacity-100 opacity-60",
                            HALO[entry.accent],
                          )}
                        />
                        <span
                          aria-hidden
                          className={cn(
                            "relative h-[10px] w-[10px] rounded-full ring-4 ring-ink-100/80",
                            NODE[entry.accent],
                          )}
                        />
                      </span>

                      <div className="min-w-0">
                        <Scramble
                          as="p"
                          text={entry.period}
                          className={cn(
                            "label-meta mb-2",
                            PERIOD[entry.accent],
                          )}
                        />
                        <h3 className="text-balance font-display text-display-md font-semibold text-fog-bright">
                          {entry.title}
                        </h3>
                        <p className="text-pretty mt-3 max-w-[60ch] text-lead text-fog">
                          {entry.note}
                        </p>
                      </div>
                    </div>
                  </Reveal>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
