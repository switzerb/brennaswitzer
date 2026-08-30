import Link from "next/link";
import Image from "next/image";
import { packJustifiedRows } from "@/app/lib/rows";

export interface RunItem {
  imagePath: string;
  title: string;
  /** The work's true proportions. Null until the sampler has seen it. */
  ratio: number | null;
  /** Sampled colour, used as the plate's block-in field. */
  field?: string | null;
  /** Small print under the plate — medium, usually. */
  meta?: string | null;
  /** Groups the row's rule label, e.g. the place a house is in. */
  marker?: string | null;
  href?: string;
}

/**
 * Rows are assigned at this nominal width, then rendered fluidly: each plate
 * gets `flex-grow` proportional to its ratio, so widths stay in proportion
 * and heights stay equal at whatever width the row actually gets. Nothing
 * measures the DOM, so there is nothing to recompute on resize.
 */
const NOMINAL_WIDTH = 1400;
const GAP = 12;
const DEFAULT_RATIO = 4 / 3;
const DEFAULT_FIELD = "#55647D";

function rangeLabel(items: readonly RunItem[]): string {
  const first = items[0]?.marker;
  const last = items[items.length - 1]?.marker;
  if (!first || !last) return "";
  return first === last ? first : `${first} → ${last}`;
}

export function Run({
  items,
  targetHeight,
}: {
  items: readonly RunItem[];
  targetHeight: number;
}) {
  const rows = packJustifiedRows(
    items.map((item) => ({ ...item, ratio: item.ratio ?? DEFAULT_RATIO })),
    { width: NOMINAL_WIDTH, gap: GAP, targetHeight },
  );

  // Plate numbers are a running total across rows. Scanned once here rather
  // than accumulated inside the map, so nothing is reassigned during render.
  const numbered = rows.map((row, index) => ({
    row,
    from: rows.slice(0, index).reduce((n, prev) => n + prev.items.length, 1),
  }));

  return (
    <div className="run">
      {numbered.map(({ row, from }) => {
        const range = rangeLabel(row.items);

        return (
          <section className="run-row-block" key={row.items[0].imagePath}>
            <div className="run-row">
              {row.items.map((item) => {
                const width = item.ratio * row.height;
                const frame = (
                  <div className="plate-img">
                    <Image
                      src={item.imagePath}
                      alt={item.title}
                      fill
                      sizes={`(max-width: 700px) 50vw, ${Math.max(
                        8,
                        Math.round((width / NOMINAL_WIDTH) * 100),
                      )}vw`}
                      className="object-cover"
                    />
                  </div>
                );

                return (
                  <figure
                    className="run-plate"
                    key={item.imagePath}
                    data-pinned={row.justified ? undefined : ""}
                    style={
                      {
                        "--field": item.field ?? DEFAULT_FIELD,
                        "--ar": String(item.ratio),
                        "--grow": item.ratio,
                        "--w": `${Math.round(width)}px`,
                      } as React.CSSProperties
                    }
                  >
                    <div className="run-label">{item.title}</div>
                    {item.href ? <Link href={item.href}>{frame}</Link> : frame}
                    {item.meta && (
                      <figcaption className="run-meta">{item.meta}</figcaption>
                    )}
                  </figure>
                );
              })}
            </div>

            <div className="run-rule" />

            <div className="run-marker mono">
              <span className="run-range">{range}</span>
              <span className="run-count">
                {String(from).padStart(2, "0")}&ndash;
                {String(from + row.items.length - 1).padStart(2, "0")} /{" "}
                {items.length}
              </span>
            </div>
          </section>
        );
      })}
    </div>
  );
}
