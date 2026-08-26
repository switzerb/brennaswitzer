import Link from "next/link";
import Image from "next/image";

/** Used when a painting has not been sampled yet — the slate out of Tuscany Four. */
const DEFAULT_FIELD = "#55647D";
const DEFAULT_RATIO = 4 / 3;

interface PlateProps {
  imagePath: string;
  title: string;
  meta?: string;
  href?: string;
  /** Sampled from the work by scripts/sample-paintings.py. */
  field?: string | null;
  /** The work's true proportions, width / height. */
  ratio?: number | null;
  /** Override the frame's aspect-ratio. Omit to let the plate fill its row. */
  aspect?: string;
  /**
   * Gallery sheets show the whole painting, framed to its own proportions;
   * the home page crops for composition.
   */
  uncropped?: boolean;
  sizes?: string;
  priority?: boolean;
}

/* A plate in a catalogue: hairline frame, the work at full colour, a mono
   caption. The colour field over the image is that painting's own sampled
   colour, so at --r:0 the page reads as a block-in of the real thing. */
export function Plate({
  imagePath,
  title,
  meta,
  href,
  field,
  ratio,
  aspect,
  uncropped = false,
  sizes = "(max-width: 768px) 100vw, 33vw",
  priority = false,
}: PlateProps) {
  // An uncropped plate takes the painting's own shape, so nothing is
  // letterboxed and nothing is cut off.
  const frameRatio =
    aspect ?? (uncropped ? String(ratio ?? DEFAULT_RATIO) : undefined);

  const frame = (
    <div className="plate-img">
      <Image
        src={imagePath}
        alt={title}
        fill
        sizes={sizes}
        priority={priority}
        className="object-cover"
      />
    </div>
  );

  return (
    <figure
      className={`plate${uncropped ? " uncropped" : ""}`}
      style={
        {
          "--field": field ?? DEFAULT_FIELD,
          ...(frameRatio ? { "--ar": frameRatio } : {}),
        } as React.CSSProperties
      }
    >
      {href ? <Link href={href}>{frame}</Link> : frame}
      <figcaption className="mono">
        <b>{title}</b>
        {meta && <span>{meta}</span>}
      </figcaption>
    </figure>
  );
}
