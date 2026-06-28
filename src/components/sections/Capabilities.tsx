import {
  ScrollText,
  Bot,
  Share2,
  ShieldCheck,
  ShieldAlert,
  Layers3,
  type LucideIcon,
} from "lucide-react";
import { capabilities, type Capability } from "@/data/content";
import Reveal from "../Reveal";
import Scramble from "../effects/Scramble";
import KineticText from "../effects/KineticText";
import TiltCard from "../effects/TiltCard";
import { cn } from "@/lib/utils";

const GLYPHS: Record<Capability["glyph"], LucideIcon> = {
  security: ShieldAlert,
  contract: ScrollText,
  defi: Bot,
  network: Share2,
  crypto: ShieldCheck,
  stack: Layers3,
};

/**
 * Tri-accent rotation by card index (cyan / violet / magenta). Class strings are
 * spelled out in full so Tailwind's JIT can see them — never constructed dynamically.
 */
type Accent = {
  tile: string;
  icon: string;
  glow: string;
  ring: string;
};

const ACCENTS: readonly Accent[] = [
  {
    tile: "from-cyan/15 to-violet/15",
    icon: "text-cyan",
    glow: "bg-cyan/10",
    ring: "ring-hover",
  },
  {
    tile: "from-violet/15 to-cyan/15",
    icon: "text-violet-glow",
    glow: "bg-violet/10",
    ring: "ring-hover-violet",
  },
  {
    tile: "from-magenta/15 to-violet/15",
    icon: "text-magenta",
    glow: "bg-magenta/10",
    ring: "ring-hover-violet",
  },
];

function Card({ cap, featured, accent }: { cap: Capability; featured?: boolean; accent: Accent }) {
  const Icon = GLYPHS[cap.glyph];
  return (
    <TiltCard className="h-full rounded-3xl">
      <div
        className={cn(
          "group relative flex h-full flex-col overflow-hidden rounded-3xl glass p-7 sm:p-8 focus-ring",
          accent.ring,
        )}
      >
        {/* hover glow */}
        <div
          className={cn(
            "pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100",
            accent.glow,
          )}
        />

        <div
          className={cn(
            "mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-br transition-transform duration-400 group-hover:scale-110 group-hover:rotate-3",
            accent.tile,
          )}
        >
          <Icon className={cn("h-6 w-6", accent.icon)} />
        </div>

        <h3 className="font-display text-2xl font-semibold tracking-tight text-fog-bright">
          {cap.title}
        </h3>
        <p className={cn("mt-3 text-lead text-fog text-pretty", featured && "max-w-md")}>
          {cap.blurb}
        </p>
      </div>
    </TiltCard>
  );
}

export default function Capabilities() {
  return (
    <section className="relative section-y">
      <div className="container-px">
        <div className="mb-12 sm:mb-16">
          <Reveal>
            <Scramble as="p" text="What I do" className="eyebrow mb-4" />
          </Reveal>
          <KineticText
            text="Six things I'm genuinely good at."
            className="max-w-2xl text-balance font-display text-display-lg font-semibold"
          />
        </div>

        <div className="grid gap-4 sm:gap-5 md:grid-cols-2 lg:grid-cols-3">
          {capabilities.map((cap, i) => (
            <Reveal
              key={cap.id}
              delay={(i % 3) * 0.06}
              className={i === 0 ? "md:col-span-2 lg:col-span-2" : ""}
            >
              <Card cap={cap} featured={i === 0} accent={ACCENTS[i % 3]} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
