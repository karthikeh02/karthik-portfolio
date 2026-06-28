import { lazy, Suspense, useEffect, useState } from "react";
import { MotionConfig } from "framer-motion";
import SmoothScroll from "./components/SmoothScroll";
import ScrollProgress from "./components/ScrollProgress";
import Preloader from "./components/Preloader";
import Nav from "./components/Nav";
import LazySection from "./components/LazySection";
// Eager: above-the-fold + the two pinned sections (their box-measured scroll
// math is fragile, so they must be present at their real height from load).
import Hero from "./components/sections/Hero";
import VelocityMarquee from "./components/sections/VelocityMarquee";
import WorkShowcase from "./components/sections/WorkShowcase";
import Manifesto from "./components/sections/Manifesto";

// WebGL is the heaviest layer — load the backdrop after first paint.
const AuroraShader = lazy(() => import("./components/AuroraShader"));

// Below-the-fold sections are lazy-MOUNTED (code-split + deferred via
// LazySection) so the entry render only builds Hero + marquee + the two pinned
// sections instead of all 14 at once — each section's observers / scroll-hooks
// construct just-in-time as it nears the viewport. Animations are unchanged.
const About = lazy(() => import("./components/sections/About"));
const Journey = lazy(() => import("./components/sections/Journey"));
const Capabilities = lazy(() => import("./components/sections/Capabilities"));
const Skills = lazy(() => import("./components/sections/Skills"));
const Certifications = lazy(() => import("./components/sections/Certifications"));
const Proof = lazy(() => import("./components/sections/Proof"));
const Approach = lazy(() => import("./components/sections/Approach"));
const Faq = lazy(() => import("./components/sections/Faq"));
const Contact = lazy(() => import("./components/sections/Contact"));
const Footer = lazy(() => import("./components/sections/Footer"));

export default function App() {
  const [loaded, setLoaded] = useState(false);

  // Safety net: never leave the hero hidden if the preloader misbehaves.
  useEffect(() => {
    const t = window.setTimeout(() => setLoaded(true), 4000);
    return () => window.clearTimeout(t);
  }, []);

  return (
    // reducedMotion="user" makes Framer Motion respect the OS setting — CSS
    // alone can't neuter JS-driven motion.
    <MotionConfig reducedMotion="user">
      <SmoothScroll>
        <a href="#main" className="skip-link">Skip to content</a>
        {/* Faint WebGL nebula behind the entire page. The wrapper below drops
            its opaque bg so this shows through; the body keeps the ink base. */}
        <Suspense fallback={null}>
          <AuroraShader className="-z-10 opacity-90" />
        </Suspense>
        <div className="grain relative min-h-screen">
          <Preloader onComplete={() => setLoaded(true)} />
          <ScrollProgress />
          <Nav />
          <main id="main" tabIndex={-1} className="relative z-10 outline-none">
            <Hero loaded={loaded} />
            <VelocityMarquee />
            <WorkShowcase />
            <LazySection id="about" minHeight="760px"><About /></LazySection>
            <LazySection id="journey" minHeight="760px"><Journey /></LazySection>
            <Manifesto />
            <LazySection minHeight="900px"><Capabilities /></LazySection>
            <LazySection id="skills" minHeight="620px"><Skills /></LazySection>
            <LazySection id="certifications" minHeight="900px"><Certifications /></LazySection>
            <LazySection id="proof" minHeight="560px"><Proof /></LazySection>
            <LazySection id="approach" minHeight="640px"><Approach /></LazySection>
            <LazySection id="faq" minHeight="760px"><Faq /></LazySection>
            <LazySection id="contact" minHeight="760px"><Contact /></LazySection>
          </main>
          <LazySection minHeight="520px"><Footer /></LazySection>
        </div>
      </SmoothScroll>
    </MotionConfig>
  );
}
