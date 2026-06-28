import { ArrowUpRight } from "lucide-react";
import { proof } from "@/data/content";
import Reveal from "../Reveal";
import Magnetic from "../Magnetic";
import Scramble from "../effects/Scramble";
import KineticText from "../effects/KineticText";

/**
 * "Don't trust — verify" proof strip. Renders content.proof as a centered
 * column with a scramble eyebrow, a scrubbed kinetic heading, a lead body,
 * and a row of glass cards linking to verifiable anchors (GitHub, etc.).
 * Each card opens in a new tab; the arrow nudges outward on hover.
 */
export default function Proof() {
  return (
    <section className="relative section-y border-t border-white/5">
      <div className="container-px">
        <div className="mx-auto max-w-2xl text-center">
          <Reveal>
            <Scramble as="p" text={proof.eyebrow} className="eyebrow mb-4" />
          </Reveal>
          <KineticText
            text={proof.heading}
            className="text-balance font-display text-display-lg font-semibold"
          />
          <Reveal delay={0.1}>
            <p className="mx-auto mt-6 max-w-xl text-lead leading-relaxed text-fog text-pretty">
              {proof.body}
            </p>
          </Reveal>
        </div>

        <Reveal
          delay={0.15}
          className="mx-auto mt-14 flex max-w-3xl flex-wrap items-stretch justify-center gap-4"
        >
          {proof.links.map((link) => (
            <Magnetic key={link.label} strength={0.3} className="w-full sm:w-auto">
              <a
                href={link.href}
                target="_blank"
                rel="noreferrer"
                className="group flex h-full items-center justify-between gap-6 rounded-2xl glass px-6 py-5 ring-hover focus-ring"
              >
                <span className="text-left">
                  <span className="label-meta block">{link.label}</span>
                  <span className="mt-1.5 block font-medium text-fog-bright transition-colors group-hover:text-cyan">
                    {link.value}
                  </span>
                </span>
                <ArrowUpRight
                  aria-hidden
                  className="h-5 w-5 shrink-0 text-fog-dim transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-cyan"
                />
              </a>
            </Magnetic>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
