import { Cinzel, Pinyon_Script, Special_Elite } from "next/font/google";

// Only the Space page loads these: Roman inscriptional capitals for quotes carved in stone,
// a typewriter face for the modern thinkers' index cards, and a script for the "Today's quote" title.
export const cinzel = Cinzel({ variable: "--font-cinzel", subsets: ["latin"], weight: ["500", "700"], display: "swap" });
export const typewriter = Special_Elite({ variable: "--font-typewriter", subsets: ["latin"], weight: "400", display: "swap" });
export const script = Pinyon_Script({ variable: "--font-script", subsets: ["latin"], weight: "400", display: "swap" });
