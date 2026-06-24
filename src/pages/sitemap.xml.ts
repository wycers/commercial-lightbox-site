import type { APIRoute } from "astro";
import { servicePages } from "../lib/servicePages";
import { absoluteUrl } from "../lib/site";

const routes = [
  {
    path: "/",
    lastModified: "2026-06-24",
    changeFrequency: "monthly",
    priority: "1.0",
  },
  ...servicePages.map((page) => ({
    path: page.canonicalPath,
    lastModified: "2026-06-24",
    changeFrequency: "monthly",
    priority: "0.8",
  })),
  {
    path: "/guides/fuel-price-boards",
    lastModified: "2026-06-24",
    changeFrequency: "monthly",
    priority: "0.8",
  },
  {
    path: "/preview",
    lastModified: "2026-06-24",
    changeFrequency: "monthly",
    priority: "0.7",
  },
];

function renderSitemap() {
  const entries = routes
    .map(
      (route) => `
  <url>
    <loc>${absoluteUrl(route.path)}</loc>
    <lastmod>${route.lastModified}</lastmod>
    <changefreq>${route.changeFrequency}</changefreq>
    <priority>${route.priority}</priority>
  </url>`,
    )
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${entries}
</urlset>`;
}

export const GET: APIRoute = () => {
  return new Response(renderSitemap(), {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
    },
  });
};
