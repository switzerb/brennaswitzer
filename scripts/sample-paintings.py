#!/usr/bin/env python3
"""Sample a signature colour and true proportions for each painting.

The site's palette is not chosen. Every accent colour on it comes from this
script reading an actual painting, and the pages say so out loud, so the
sampling has to be defensible:

  * Dominant-colour extraction is useless here. These are photographs of
    paint on paper, so the most common colours are all paper. Anything too
    pale or too dark to read as a field is discarded, and what remains is
    ranked by area weighted toward saturation — roughly how you would name a
    painting's colour out loud.

  * Several of these were photographed under warm light, and a few of the
    graphite drawings sample something far louder than anything else on the
    site. Chroma and value are pulled back into the band the design lives in,
    which keeps each painting's own hue while keeping the set on key.

Values are written into content/paintings/<collection>.json alongside the
rest of the content, so they are reviewable in a diff, correctable by hand
when a sample is wrong, and picked up by `pnpm seed:paintings` like any
other field. Existing values are left alone unless --force is passed.

Usage:
    python3 scripts/sample-paintings.py [--force] [--collection houses]
"""

import argparse
import colorsys
import json
import pathlib
import re
import sys

try:
    from PIL import Image
except ImportError:
    sys.exit("Pillow is required for sampling:  pip install Pillow")

ROOT = pathlib.Path(__file__).resolve().parent.parent
MANIFEST_DIR = ROOT / "content" / "paintings"

# A field has to be chromatic enough and mid-toned enough to read as colour
# rather than as paper or as a hole in the page.
MIN_SATURATION = 0.20
VALUE_RANGE = (0.20, 0.90)
SATURATION_BIAS = 1.6

# The band the rest of the design occupies.
MAX_SATURATION = 0.48
FIELD_VALUE_RANGE = (0.32, 0.78)

FALLBACK = "#8A8578"


def harmonise(hex_code: str) -> str:
    """Keep the painting's hue; pull chroma and value onto the site's key."""
    r, g, b = (int(hex_code[i : i + 2], 16) / 255 for i in (1, 3, 5))
    hue, saturation, value = colorsys.rgb_to_hsv(r, g, b)
    saturation = min(saturation, MAX_SATURATION)
    value = min(max(value, FIELD_VALUE_RANGE[0]), FIELD_VALUE_RANGE[1])
    r, g, b = colorsys.hsv_to_rgb(hue, saturation, value)
    return "#%02X%02X%02X" % tuple(round(c * 255) for c in (r, g, b))


def sample(path: pathlib.Path) -> tuple[str, float]:
    image = Image.open(path).convert("RGB")
    ratio = round(image.width / image.height, 4)

    image.thumbnail((200, 200))
    quantised = image.quantize(colors=48, method=Image.MEDIANCUT).convert("RGB")

    best_score, best_hex = -1.0, None
    widest_count, widest_hex = -1, FALLBACK

    for count, (r, g, b) in quantised.getcolors(1 << 20):
        _, saturation, value = colorsys.rgb_to_hsv(r / 255, g / 255, b / 255)
        hex_code = "#%02X%02X%02X" % (r, g, b)

        # Near-monochrome work (the graphite drawings, mostly) may have no
        # qualifying field at all; fall back to its largest region.
        if count > widest_count:
            widest_count, widest_hex = count, hex_code

        if saturation < MIN_SATURATION:
            continue
        if not VALUE_RANGE[0] < value < VALUE_RANGE[1]:
            continue

        score = count * (saturation**SATURATION_BIAS)
        if score > best_score:
            best_score, best_hex = score, hex_code

    return harmonise(best_hex or widest_hex), ratio


def detect_indent(raw: str) -> int:
    match = re.search(r"\n(\s+)\S", raw)
    return len(match.group(1)) if match else 2


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--force", action="store_true",
                        help="resample entries that already have values")
    parser.add_argument("--collection",
                        help="limit to one collection, e.g. houses")
    args = parser.parse_args()

    manifests = sorted(MANIFEST_DIR.glob("*.json"))
    if args.collection:
        manifests = [m for m in manifests if m.stem == args.collection]
        if not manifests:
            sys.exit(f"No manifest for collection {args.collection!r}")

    total, written = 0, 0
    for manifest in manifests:
        raw = manifest.read_text()
        indent = detect_indent(raw)
        entries = json.loads(raw)
        changed = False

        for entry in entries:
            total += 1
            if entry.get("field") and entry.get("ratio") and not args.force:
                continue

            image = ROOT / "public" / entry["imagePath"].lstrip("/")
            if not image.exists():
                print(f"  missing image  {entry['imagePath']}", file=sys.stderr)
                continue

            entry["field"], entry["ratio"] = sample(image)
            changed = True
            written += 1
            print(f"  {entry['field']}  {entry['ratio']:<7}  {entry['slug']}")

        if changed:
            manifest.write_text(json.dumps(entries, indent=indent, ensure_ascii=False) + "\n")

    skipped = total - written
    print(f"\n{written} sampled, {skipped} already had values "
          f"({'--force to resample' if skipped else 'all fresh'})")
    if written:
        print("Run `pnpm seed:paintings` to load them.")


if __name__ == "__main__":
    main()
