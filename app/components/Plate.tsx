import Link from "next/link";
import Image from "next/image";
import { fieldFor, ratioFor } from "@/app/lib/paintingFields";

interface PlateProps {
  imagePath: string;
  title: string;
  meta?: string;
  href?: string;
  /** CSS aspect-ratio for the frame. Omit to let the plate fill its row. */
  aspect?: string;
  /** Gallery sheets show the whole painting, framed to its own proportions;
      the home page crops for composition. */
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
  aspect,
  uncropped = false,
  sizes = "(max-width: 768px) 100vw, 33vw",
  priority = false,
}: PlateProps) {
  // An uncropped plate takes the painting's own shape, so nothing is
  // letterboxed and nothing is cut off.
  const ratio = aspect ?? (uncropped ? String(ratioFor(imagePath)) : undefined);

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
          "--field": fieldFor(imagePath),
          ...(ratio ? { "--ar": ratio } : {}),
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
