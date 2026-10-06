import type { Metadata } from "next";

/**
 * The site's public address, for link previews, the sitemap and robots.txt.
 * Set NEXT_PUBLIC_SITE_URL once there's a custom domain; until then Vercel's own production address is used.
 */
export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000")
).replace(/\/$/, "");

// The link-preview image lives at src/app/opengraph-image.jpg. A page that sets its own openGraph replaces the
// layout's whole block (image included), so every page names it again here.
const ogImage = {
  url: "/opengraph-image.jpg",
  width: 1200,
  height: 630,
  alt: "Tejas Thange, written in lines like a relief map, with the line: AI/ML engineer. I build with LLMs by day and argue about random stuff by night.",
};

/** A page's title and description, repeated for link previews so a shared /work link says "Work", not the home title. */
export function pageMeta(title: string, description: string, path: string): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { type: "website", siteName: "Tejas Thange", locale: "en_IN", title, description, url: path, images: [ogImage] },
    twitter: { card: "summary_large_image", title, description, images: [ogImage] },
  };
}
