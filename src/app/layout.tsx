import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Geist_Mono, Tiro_Devanagari_Marathi } from "next/font/google";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Intro } from "@/components/intro";
import { person } from "@/content/site";
import { siteUrl } from "@/lib/site-url";
import "./globals.css";

const cabinet = localFont({
  variable: "--font-cabinet",
  display: "swap",
  src: [
    { path: "../fonts/CabinetGrotesk-Medium.woff2", weight: "500" },
    { path: "../fonts/CabinetGrotesk-Bold.woff2", weight: "700" },
    { path: "../fonts/CabinetGrotesk-Extrabold.woff2", weight: "800" },
  ],
});

const general = localFont({
  variable: "--font-general",
  display: "swap",
  src: [
    { path: "../fonts/GeneralSans-Regular.woff2", weight: "400" },
    { path: "../fonts/GeneralSans-Italic.woff2", weight: "400", style: "italic" },
    { path: "../fonts/GeneralSans-Medium.woff2", weight: "500" },
    { path: "../fonts/GeneralSans-Semibold.woff2", weight: "600" },
  ],
});

const mono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"], display: "swap" });

const marathi = Tiro_Devanagari_Marathi({
  variable: "--font-marathi",
  weight: "400",
  subsets: ["devanagari"],
  display: "swap",
});

const title = "Tejas Thange, AI/ML engineer";
const description = "AI/ML engineer in Pune. These days mostly RAG and LLM apps, with some computer vision and GANs before that.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description,
  applicationName: "Tejas Thange",
  authors: [{ name: "Tejas Thange", url: siteUrl }],
  creator: "Tejas Thange",
  alternates: { canonical: "/" },
  // The preview image and icons come from the files next to this layout (opengraph-image.jpg, icon.png, …).
  openGraph: { type: "website", siteName: "Tejas Thange", locale: "en_IN", title, description, url: "/" },
  twitter: { card: "summary_large_image", title, description },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#0b0b0c" },
    { media: "(prefers-color-scheme: dark)", color: "#0b0b0c" },
  ],
};

// Every visit opens dark. A visitor's switch to light lasts for that visit only (sessionStorage),
// so nobody lands on light mode they didn't choose. Runs before first paint: no flash.
// It also picks this visit's glow colour for the cards (one of five) and the spear's metal (silver, gold or red),
// never the same as last time. On the first page of a visit (dark, motion allowed) it also marks the intro to play.
const themeScript = `(function(){var d=document.documentElement,t='dark';try{localStorage.removeItem('theme');t=sessionStorage.getItem('theme')==='light'?'light':'dark'}catch(e){}d.dataset.theme=t;var g=['blue','navy','orange','green','purple'],l=null;try{l=localStorage.getItem('glow')}catch(e){}var o=g.filter(function(x){return x!==l}),c=o[Math.floor(Math.random()*o.length)];d.dataset.glow=c;try{localStorage.setItem('glow',c)}catch(e){}var m=['silver','gold','red'],q=null;try{q=localStorage.getItem('spear')}catch(e){}var r=m.filter(function(x){return x!==q}),k=r[Math.floor(Math.random()*r.length)];d.dataset.spear=k;try{localStorage.setItem('spear',k)}catch(e){}try{if(t==='dark'&&!sessionStorage.getItem('intro')&&!matchMedia('(prefers-reduced-motion: reduce)').matches){d.dataset.intro='1';sessionStorage.setItem('intro','1')}}catch(e){}})()`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${cabinet.variable} ${general.variable} ${marathi.variable} ${mono.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body id="top" className="min-h-dvh">
        <Intro en={person.nameEn} mr={person.nameMr} />
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
