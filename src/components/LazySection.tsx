import { Suspense, useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Defers MOUNTING a below-the-fold section until it nears the viewport, so its
 * components / IntersectionObservers / scroll-hooks / MotionValues construct
 * just-in-time instead of all at once on first paint (the synchronous
 * first-render avalanche that froze entry).
 *
 * The wrapper itself is always in the DOM and carries the section's `id` +
 * scroll-margin, so in-page anchors and the nav scroll-spy keep working even
 * before the real section mounts. `minHeight` reserves the box so the page
 * height (and scroll position) doesn't jump as sections swap in. The wrapper
 * mounts well before view (rootMargin) so the chunk + hooks are ready in time.
 */
export default function LazySection({
  id,
  minHeight = "60vh",
  children,
}: {
  id?: string;
  minHeight?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setShow(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setShow(true);
          io.disconnect();
        }
      },
      { rootMargin: "700px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} id={id} className="scroll-mt-24" style={show ? undefined : { minHeight }}>
      {show ? (
        <Suspense fallback={<div style={{ minHeight }} aria-hidden="true" />}>
          {children}
        </Suspense>
      ) : null}
    </div>
  );
}
