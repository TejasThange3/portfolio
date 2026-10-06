import type { MetadataRoute } from "next";
import { caseStudies } from "@/content/site";
import { siteUrl } from "@/lib/site-url";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ["", "/work", "/experience", "/space", ...caseStudies.map((c) => `/work/${c.slug}`)];
  return pages.map((p) => ({
    url: `${siteUrl}${p}`,
    changeFrequency: "monthly",
    priority: p === "" ? 1 : p.startsWith("/work/") ? 0.6 : 0.8,
  }));
}
