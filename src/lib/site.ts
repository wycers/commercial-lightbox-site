const DEFAULT_SITE_URL = "https://commercial-lightbox-site.vercel.app";
const DEFAULT_B_SITE_URL = "https://fuelix.com.au";

function trimTrailingSlash(url: string) {
  return url.replace(/\/+$/, "");
}

function readEnv(...keys: string[]) {
  const astroEnv = import.meta.env as Record<string, string | undefined>;

  for (const key of keys) {
    const value =
      astroEnv[key] ??
      (typeof process !== "undefined" ? process.env[key] : undefined);

    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }
}

export const siteName = "Commercial Lightbox";
export const companyName = "Commercial Lightbox";

export const siteUrl = trimTrailingSlash(
  readEnv("PUBLIC_SITE_URL", "NEXT_PUBLIC_SITE_URL") || DEFAULT_SITE_URL,
);

export const fuelPriceBoardUrl = trimTrailingSlash(
  readEnv("PUBLIC_B_SITE_URL", "NEXT_PUBLIC_B_SITE_URL") || DEFAULT_B_SITE_URL,
);

export function absoluteUrl(path = "/") {
  if (/^https?:\/\//.test(path)) return trimTrailingSlash(path);
  if (!path.startsWith("/")) return `${siteUrl}/${path}`;
  return `${siteUrl}${path}`;
}
