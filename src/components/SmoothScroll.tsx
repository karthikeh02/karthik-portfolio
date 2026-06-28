import { useEffect, type ReactNode } from "react";
import { frame, cancelFrame } from "framer-motion";
import Lenis from "lenis";

declare global {
  interface Window {
    __lenis?: Lenis;
  }
}

/**
 * Wraps the app in Lenis smooth scrolling and upgrades in-page anchor links
 * (href="#section") to eased scrolls. Disabled when the user prefers reduced
 * motion — native scrolling takes over.
 *
 * Lenis is driven from Framer Motion's frame clock so useScroll / useVelocity
 * read the exact same timeline (no 1-frame desync). The instance is also
 * exposed as window.__lenis so UI (e.g. the mobile menu) can pause scrolling.
 *
 * Every load starts at the hero: without manual scrollRestoration a mid-page
 * reload would play the preloader + intro over the middle of the page.
 */
export default function SmoothScroll({ children }: { children: ReactNode }) {
  useEffect(() => {
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    window.scrollTo(0, 0);

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.6,
    });
    lenis.scrollTo(0, { immediate: true });
    window.__lenis = lenis;

    const update = (data: { timestamp: number }) => {
      lenis.raf(data.timestamp);
    };
    frame.update(update, true);

    const onClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement | null)?.closest<HTMLAnchorElement>(
        'a[href^="#"]'
      );
      if (!anchor) return;
      const id = anchor.getAttribute("href");
      if (!id || id === "#") return;
      const el = document.querySelector(id);
      if (!el) return;
      e.preventDefault();
      lenis.scrollTo(el as HTMLElement, { offset: -90 });
    };
    document.addEventListener("click", onClick);

    return () => {
      cancelFrame(update);
      document.removeEventListener("click", onClick);
      lenis.destroy();
      delete window.__lenis;
    };
  }, []);

  return <>{children}</>;
}
