const DEFAULT_SITE_URL = "https://commercial-lightbox-site.vercel.app";
const DEFAULT_B_SITE_URL = "https://fuelix.com.au";

function trimTrailingSlash(url: string) {
  return url.replace(/\/+$/, "");
}

export const siteName = "Commercial Lightbox";
export const companyName = "Commercial Lightbox";

export const siteUrl = trimTrailingSlash(
  process.env.NEXT_PUBLIC_SITE_URL?.trim() || DEFAULT_SITE_URL,
);

export const fuelPriceBoardUrl = trimTrailingSlash(
  process.env.NEXT_PUBLIC_B_SITE_URL?.trim() || DEFAULT_B_SITE_URL,
);

export function absoluteUrl(path = "/") {
  if (!path.startsWith("/")) return `${siteUrl}/${path}`;
  return `${siteUrl}${path}`;
}
