import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return [
    {
      url: absoluteUrl("/"),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: absoluteUrl("/case-studies/fuel-price-boards"),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
  ];
}
