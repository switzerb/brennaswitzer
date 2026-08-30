"use client";

import { useEffect, useRef } from "react";

/* The site's one interactive idea. `--r` runs 0 (block-in: flat fields of
   paint) to 1 (the finished sheet), and everything that participates reads
   it out of CSS — so this component sets one custom property and one
   attribute, and never re-renders. That matters: it is written to on every
   animation frame. */
function apply(value: number) {
  const clamped = Math.min(1, Math.max(0, value));
  const root = document.documentElement;
  root.style.setProperty("--r", clamped.toFixed(3));
  if (clamped < 0.5) root.setAttribute("data-block-in", "");
  else root.removeAttribute("data-block-in");
}

export function Scrubber() {
  const input = useRef<HTMLInputElement>(null);

  // Paint the page in, once, on first load.
  useEffect(() => {
    const el = input.current;
    if (!el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      apply(1);
      el.value = "1";
      return;
    }

    apply(0);
    el.value = "0";

    let raf = 0;
    let start: number | null = null;
    const DELAY = 260;
    const DURATION = 1150;

    const frame = (timestamp: number) => {
      if (start === null) start = timestamp;
      const t = (timestamp - start - DELAY) / DURATION;
      if (t >= 1) {
        apply(1);
        el.value = "1";
        return;
      }
      const eased = t < 0 ? 0 : 1 - Math.pow(1 - t, 3);
      apply(eased);
      el.value = String(eased);
      raf = requestAnimationFrame(frame);
    };

    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="scrub mono">
      <span className="lbl-block">Block-in</span>
      <input
        ref={input}
        type="range"
        min={0}
        max={1}
        step={0.001}
        defaultValue={1}
        aria-label="Resolve the page, from block-in to finished"
        onChange={(event) => apply(parseFloat(event.target.value))}
      />
      <span className="lbl-final">Resolved</span>
    </div>
  );
}
