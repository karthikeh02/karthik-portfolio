import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus } from "lucide-react";
import { faqs } from "@/data/content";
import Reveal from "../Reveal";
import Scramble from "../effects/Scramble";
import KineticText from "../effects/KineticText";

const EASE = [0.22, 1, 0.36, 1] as const;

export default function Faq() {
  // First item open by default so the section never reads as an empty list.
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="section-y relative border-t border-white/5">
      <div className="container-px">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          {/* Sticky heading */}
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-28">
              <Reveal>
                <Scramble as="p" text="Questions" className="eyebrow mb-5" />
              </Reveal>
              <KineticText
                text="The things people usually ask."
                className="text-balance font-display text-display-lg font-semibold"
              />
            </div>
          </div>

          {/* Accordion */}
          <div className="lg:col-span-8">
            <div className="flex flex-col">
              {faqs.map((item, i) => {
                const isOpen = open === i;
                const buttonId = `faq-trigger-${i}`;
                const panelId = `faq-panel-${i}`;
                return (
                  <Reveal key={item.q} delay={(i % 4) * 0.05}>
                    <div className="border-b border-white/8">
                      <h3>
                        <button
                          id={buttonId}
                          onClick={() => setOpen(isOpen ? null : i)}
                          className="focus-ring group flex w-full items-center justify-between gap-6 rounded-lg py-6 text-left"
                          aria-expanded={isOpen}
                          aria-controls={panelId}
                        >
                          <span className="font-display text-xl font-medium tracking-tight text-fog-bright transition-colors group-hover:text-cyan sm:text-2xl">
                            {item.q}
                          </span>
                          <motion.span
                            aria-hidden
                            animate={{ rotate: isOpen ? 45 : 0 }}
                            transition={{ duration: 0.3, ease: EASE }}
                            className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/10 text-cyan transition-colors group-hover:border-cyan/40"
                          >
                            <Plus className="h-4 w-4" />
                          </motion.span>
                        </button>
                      </h3>

                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.div
                            key="content"
                            id={panelId}
                            role="region"
                            aria-labelledby={buttonId}
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.4, ease: EASE }}
                            className="overflow-hidden"
                          >
                            <p className="text-pretty max-w-2xl pb-7 text-lead leading-relaxed text-fog">
                              {item.a}
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
