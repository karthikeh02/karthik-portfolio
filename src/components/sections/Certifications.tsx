import { certifications, type Certification } from "@/data/content";
import { cn } from "@/lib/utils";
import Reveal from "../Reveal";
import Scramble from "../effects/Scramble";
import KineticText from "../effects/KineticText";
import TiltCard from "../effects/TiltCard";

type Accent = Certification["accent"];

/**
 * Per-accent class sets, spelled out in full so Tailwind's JIT keeps them —
 * never built dynamically. `bar` colours the top-accent line, `glow` the soft
 * hover halo, `date` tints the meta date, and `ring` swaps the hover ring so
 * violet cards lean violet rather than cyan.
 */
const BAR: Record<Accent, string> = {
  cyan: "bg-cyan shadow-glow",
  violet: "bg-violet shadow-glow-violet",
  magenta: "bg-magenta shadow-[0_0_18px_rgba(244,114,182,0.55)]",
};

const GLOW: Record<Accent, string> = {
  cyan: "bg-cyan/10",
  violet: "bg-violet/10",
  magenta: "bg-magenta/10",
};

const DATE: Record<Accent, string> = {
  cyan: "text-cyan",
  violet: "text-violet-glow",
  magenta: "text-magenta",
};

const RING: Record<Accent, string> = {
  cyan: "ring-hover",
  violet: "ring-hover-violet",
  magenta: "ring-hover-violet",
};

function Card({ item }: { item: Certification }) {
  return (
    <TiltCard className="h-full rounded-2xl">
      <div
        className={cn(
          "group relative flex h-full flex-col overflow-hidden rounded-2xl glass p-6 focus-ring",
          RING[item.accent],
        )}
      >
        {/* Top-accent line — the one coloured beat per card. */}
        <span
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-x-0 top-0 h-px",
            BAR[item.accent],
          )}
        />

        {/* Soft hover halo, tinted to the accent. */}
        <span
          aria-hidden
          className={cn(
            "pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100",
            GLOW[item.accent],
          )}
        />

        <p className={cn("label-meta mb-4", DATE[item.accent])}>{item.date}</p>

        <h3 className="font-display text-lg font-semibold leading-snug tracking-tight text-fog-bright text-balance sm:text-xl">
          {item.name}
        </h3>

        <p className="mt-2 text-sm text-fog">{item.issuer}</p>
      </div>
    </TiltCard>
  );
}

/**
 * Credentials wall. Renders content.certifications as a header block (scramble
 * eyebrow, scrubbed kinetic heading, lead body) over a responsive grid of glass
 * cert cards — each carrying a single accent beat across its top line, date and
 * hover ring. Stagger and tilt honour prefers-reduced-motion via the shared
 * Reveal / TiltCard primitives.
 */
export default function Certifications() {
  return (
    <section className="relative section-y border-t border-white/[0.08]">
      <div className="container-px">
        <div className="mb-12 max-w-2xl sm:mb-16">
          <Reveal>
            <Scramble
              as="p"
              text={certifications.eyebrow}
              className="eyebrow mb-4"
            />
          </Reveal>
          <KineticText
            text={certifications.heading}
            className="text-balance font-display text-display-lg font-semibold"
          />
          <Reveal delay={0.1}>
            <p className="mt-6 max-w-xl text-lead leading-relaxed text-fog text-pretty">
              {certifications.body}
            </p>
          </Reveal>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
          {certifications.items.map((item, i) => (
            <Reveal key={`${item.name}-${item.issuer}`} delay={(i % 3) * 0.06}>
              <Card item={item} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
