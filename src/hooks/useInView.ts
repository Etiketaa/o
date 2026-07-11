import { useEffect, useRef, useState } from "react";

interface Options {
  /** IntersectionObserver root element */
  root?: Element | null;
  /** Threshold(s) for callback */
  threshold?: number | number[];
  /** If true, the observer stops after first intersection */
  once?: boolean;
}

/**
 * Hook that tracks whether an element is visible in viewport.
 * Returns a ref to attach to the element and a boolean `inView`.
 *
 * Usage:
 *   const [ref, inView] = useInView({ threshold: 0.2, once: true });
 *   <div ref={ref} className={inView ? "animate-fade-in" : "opacity-0"} />
 */
export function useInView({ root = null, threshold = 0.2, once = true }: Options = {}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setInView(true);
            if (once) observer.disconnect();
          } else if (!once) {
            setInView(false);
          }
        });
      },
      { root, threshold }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [root, threshold, once]);

  return [ref, inView] as const;
}
