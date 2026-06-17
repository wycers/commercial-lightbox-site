import type { APIRoute } from "astro";
import { absoluteUrl } from "../lib/site";

export const GET: APIRoute = () => {
  return new Response(
    [
      "User-agent: *",
      "Allow: /",
      `Sitemap: ${absoluteUrl("/sitemap.xml")}`,
    ].join("\n"),
    {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
      },
    },
  );
};
