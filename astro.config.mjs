import react from "@astrojs/react";
import vercel from "@astrojs/vercel";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";
import { loadEnv } from "vite";

const DEFAULT_SITE_URL = "https://commercial-lightbox-site.vercel.app";
const mode =
  process.env.NODE_ENV === "production" ? "production" : "development";
const env = loadEnv(mode, process.cwd(), "");
const site = trimTrailingSlash(
  env.PUBLIC_SITE_URL?.trim() ||
    env.NEXT_PUBLIC_SITE_URL?.trim() ||
    DEFAULT_SITE_URL,
);

function trimTrailingSlash(url) {
  return url.replace(/\/+$/, "");
}

export default defineConfig({
  site,
  trailingSlash: "never",
  integrations: [react()],
  adapter: vercel(),
  vite: {
    plugins: [tailwindcss()],
  },
});
