import type { APIRoute } from "astro";
import { absoluteUrl } from "../lib/site";

const routes = [
  {
    path: "/",
    changeFrequency: "monthly",
    priority: "1.0",
  },
  {
    path: "/case-studies/fuel-price-boards",
    changeFrequency: "monthly",
    priority: "0.8",
  },
];

function renderSitemap() {
  const lastModified = new Date().toISOString();
  const entries = routes
    .map(
      (route) => `
  <url>
    <loc>${absoluteUrl(route.path)}</loc>
    <lastmod>${lastModified}</lastmod>
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
