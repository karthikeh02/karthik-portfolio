import { skills } from "@/data/content";
import Reveal from "../Reveal";
import Scramble from "../effects/Scramble";
import KineticText from "../effects/KineticText";

/**
 * Skills — a crisp, scannable credibility strip. Each group is a labelled
 * cluster of mono pills, revealed with a left-to-right stagger. Motion is
 * routed through <Reveal>, which already honours prefers-reduced-motion, so
 * reduced-motion users get the full static grid with no animation.
 */
export default function Skills() {
  return (
    <section className="relative section-y-tight">
      <div className="container-px">
        {/* Header */}
        <div className="mb-12 sm:mb-16">
          <Reveal>
            <Scramble as="p" text={skills.eyebrow} className="eyebrow mb-4" />
          </Reveal>
          <KineticText
            text={skills.heading}
            className="max-w-2xl text-balance font-display text-display-lg font-semibold"
          />
        </div>

        {/* Groups */}
        <div className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {skills.groups.map((group, i) => (
            <Reveal key={group.label} delay={i * 0.06}>
              <div>
                <p className="label-meta mb-4 text-cyan">{group.label}</p>
                <ul className="flex flex-wrap gap-2">
                  {group.items.map((item) => (
                    <li
                      key={item}
                      className="rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-1.5 font-mono text-xs text-fog transition-colors hover:border-cyan/30 hover:text-fog-bright"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
