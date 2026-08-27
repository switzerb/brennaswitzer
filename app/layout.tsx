import type { Metadata } from "next";
import { Archivo, Newsreader, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { TitleBlock } from "./components/TitleBlock";
import { FootRule } from "./components/FootRule";
import { Gridlines } from "./components/Gridlines";

/* Archivo carries the width axis — the headings are set expanded, which is
   where the drafting-sheet voice comes from. */
const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  axes: ["wdth"],
  display: "swap",
});

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  axes: ["opsz"],
  style: ["normal", "italic"],
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://brennaswitzer.com"),
  title: {
    default: "Brenna Switzer — Staff Software Engineer",
    template: "%s — Brenna Switzer",
  },
  description:
    "Staff software engineer and painter in Portland, Oregon. Writing on software and systems, and a gallery of paintings and drawings.",
  openGraph: {
    title: "Brenna Switzer — Staff Software Engineer",
    description:
      "Staff software engineer and painter in Portland, Oregon. Everything good starts out rough.",
    type: "website",
  },
};

/* Set the block-in before first paint so the page never flashes its
   resolved state and then jump back. Reduced motion skips it entirely. */
const NO_FLASH = `try{if(!matchMedia("(prefers-reduced-motion: reduce)").matches){var d=document.documentElement;d.style.setProperty("--r","0");d.setAttribute("data-block-in","")}}catch(e){}`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${archivo.variable} ${newsreader.variable} ${jetbrains.variable} antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: NO_FLASH }} />
      </head>
      <body>
        <div className="sheet">
          <div className="sheet-inner">
            <TitleBlock />
            <div className="stage">
              <Gridlines />
              {children}
            </div>
            <FootRule />
          </div>
        </div>
      </body>
    </html>
  );
}
