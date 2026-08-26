/* The twelve column guides the layout is built on. Invisible at rest; they
   come up as the page is pulled back to its block-in, which is the point —
   the structure is the thing a block-in is for. */
export function Gridlines() {
  return (
    <div className="gridlines" aria-hidden="true">
      {Array.from({ length: 13 }, (_, i) => (
        <i key={i} style={{ left: `calc(${(i / 12) * 100}% - ${i === 12 ? 1 : 0}px)` }} />
      ))}
    </div>
  );
}
