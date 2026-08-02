import { prisma } from "@/app/lib/prisma";
import { HomeNav } from "@/app/components/HomeNav";
import { PALETTES, type Palette, shuffle } from "@/app/lib/palettes";

// Colors and the featured painting are re-randomized per request.
export const dynamic = "force-dynamic";

export default async function Home() {
  const paintings = await prisma.painting.findMany({
    select: { imagePath: true },
  });
  const images = shuffle(paintings.map((p) => p.imagePath)).slice(0, 3);

  const colors = shuffle(
    PALETTES[Math.floor(Math.random() * PALETTES.length)],
  ) as Palette;

  return (
    <div className="h-dvh overflow-hidden flex flex-col">
      <div className="group shrink-0 flex flex-col overflow-hidden">
        {/* Title row — always visible, fixed height */}
        <div className="shrink-0 flex items-center justify-center px-8 py-3 sm:py-4">
          <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400">
            Hi, I&apos;m{" "}
            <span className="display-font text-zinc-900 dark:text-zinc-100">
              Brenna
            </span>
            &hellip;
          </p>
        </div>

        {/* Body — collapsed to zero height, grows to its natural content
            height on hover (grid 0fr -> 1fr), text fades in slightly after */}
        <div className="intro-body-grid px-8">
          <div>
            <div className="max-w-3xl mx-auto pb-6 sm:pb-8 space-y-1.5 sm:space-y-2 lg:space-y-4 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-snug sm:leading-normal lg:leading-relaxed opacity-0 -translate-y-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0 group-hover:delay-150">
              <p>
                Hi, I&apos;m{" "}
                <span className="display-font text-zinc-900 dark:text-zinc-100">
                  Brenna
                </span>
                . If you&apos;re here, it&apos;s probably because you know I
                paint and you&apos;re curious to see, you know I code and
                you&apos;re here to judge, or you&apos;re lost. All three
                are fine by me.
              </p>
              <p>
                You might also be a bot, or some kind of malicious actor —
                though if you&apos;re here to ransom data, respectfully, you
                can find much higher stakes elsewhere.
              </p>
              <p>
                This site is less a personal brand than a digital
                sketchbook. If you&apos;re the type who likes to stay in
                touch, please do.
              </p>
              <p>
                None of us actually know what we&apos;re doing. That&apos;s
                never a reason to stop flailing — learning something new is
                still the finest pleasure there is.
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="flex-1 min-h-0">
        <HomeNav colors={colors} images={images} />
      </div>
    </div>
  );
}
