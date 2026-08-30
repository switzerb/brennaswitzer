"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { hueSortKey, readableOn } from "@/app/lib/color";

export interface IndexEntry {
  code: string;
  title: string;
  detail: string;
  href: string;
  /** Present only for work that carries a sampled colour. */
  hex?: string;
}

export interface IndexSection {
  id: string;
  title: string;
  entries: IndexEntry[];
}

export interface Family {
  id: string;
  title: string;
  specimens: { code: string; title: string; hex: string; provenance: string }[];
}

type Order = "colour" | "az";

/**
 * Picking a specimen re-tints the site. Both grounds are read back out of
 * CSS so the ink can be computed for each theme, which means a tint stays
 * legible when the viewer's theme flips underneath it — and no hex from
 * globals.css is duplicated here.
 */
function applyTint(hex: string) {
  const root = document.documentElement;
  const styles = getComputedStyle(root);
  const light = styles.getPropertyValue("--paper-light").trim();
  const dark = styles.getPropertyValue("--paper-dark").trim();
  if (light) root.style.setProperty("--tint-light", readableOn(hex, light));
  if (dark) root.style.setProperty("--tint-dark", readableOn(hex, dark));
}

export function BookIndex({
  sections,
  families,
  defaultSpecimen,
}: {
  sections: IndexSection[];
  families: Family[];
  defaultSpecimen: string;
}) {
  const [order, setOrder] = useState<Order>("colour");
  const [picked, setPicked] = useState(defaultSpecimen);

  const specimens = families.flatMap((family) => family.specimens);
  const current =
    specimens.find((s) => s.code === picked) ?? specimens[0] ?? null;

  // The site opens wearing the first specimen, so the accent is always some
  // painting's colour rather than a default that belongs to nothing.
  const openingHex = current?.hex;
  useEffect(() => {
    if (openingHex) applyTint(openingHex);
  }, [openingHex]);

  function pick(code: string, hex: string) {
    setPicked(code);
    applyTint(hex);
  }

  const ordered = sections.map((section) => {
    const entries = [...section.entries];
    if (order === "az") entries.sort((a, b) => a.title.localeCompare(b.title));
    else if (entries.every((e) => e.hex))
      entries.sort((a, b) => hueSortKey(a.hex!) - hueSortKey(b.hex!));
    return { ...section, entries };
  });

  return (
    <>
      <div className="index-controls">
        <span className="index-controls-label mono">Order within sections</span>
        <div className="index-chips">
          {(["colour", "az"] as const).map((id) => (
            <button
              key={id}
              type="button"
              className="index-chip mono"
              aria-pressed={order === id}
              onClick={() => setOrder(id)}
            >
              {id === "colour" ? "Colour" : "A–Z"}
            </button>
          ))}
        </div>
      </div>

      <div className="book-index">
        {ordered.map((section) => (
          <section className="book-section" key={section.id}>
            <h2 className="book-section-head">
              <span className="book-section-title">{section.title}</span>
              <span className="leader" aria-hidden="true" />
              <span className="book-section-count mono">
                {String(section.entries.length).padStart(2, "0")}
              </span>
            </h2>

            <ul className="book-entries">
              {section.entries.map((entry) => (
                <li className="book-entry" key={entry.code}>
                  {entry.hex ? (
                    <button
                      type="button"
                      className="entry-chip"
                      style={{ background: entry.hex }}
                      aria-label={`Tint the site with ${entry.title}`}
                      aria-pressed={entry.code === picked}
                      onClick={() => pick(entry.code, entry.hex!)}
                    />
                  ) : (
                    <span className="entry-chip entry-chip-empty" />
                  )}
                  <span className="entry-code mono">{entry.code}</span>
                  <Link className="entry-title" href={entry.href}>
                    {entry.title}
                  </Link>
                  <span className="leader" aria-hidden="true" />
                  <span className="entry-detail mono">{entry.detail}</span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <div className="specimen-bar">
        <p className="specimen-readout mono">
          {current ? (
            <>
              <span
                className="specimen-swatch"
                style={{ background: current.hex }}
              />
              Specimen <span className="tinted">{current.code}</span>{" "}
              <span className="tinted">{current.title}</span>
              <span className="sep">·</span>
              <span className="tinted">{current.hex.toUpperCase()}</span>
              <span className="sep">·</span>
              {current.provenance}
            </>
          ) : (
            "No specimens yet"
          )}
          <span className="specimen-hint">
            Sampled from the work — pick one
          </span>
        </p>

        <div className="families">
          {families.map((family) => (
            <div
              className="family"
              key={family.id}
              style={{ flexGrow: family.specimens.length }}
            >
              <div className="family-head mono">
                <span>{family.title}</span>
                <span>{String(family.specimens.length).padStart(2, "0")}</span>
              </div>
              <div className="family-chips">
                {[...family.specimens]
                  .sort((a, b) => hueSortKey(a.hex) - hueSortKey(b.hex))
                  .map((specimen) => (
                    <button
                      key={specimen.code}
                      type="button"
                      className="family-chip"
                      data-picked={specimen.code === picked ? "" : undefined}
                      style={{ background: specimen.hex }}
                      aria-label={`${specimen.title}, ${specimen.hex}`}
                      aria-pressed={specimen.code === picked}
                      onClick={() => pick(specimen.code, specimen.hex)}
                    />
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
