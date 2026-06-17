import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  absoluteUrl,
  companyName,
  fuelPriceBoardUrl,
  siteUrl,
} from "@/lib/site";

export const metadata: Metadata = {
  title: "Fuel Price Board Signage Case Study",
  description:
    "How custom illuminated signage capability extends into FuelWatch-ready LED fuel price boards for WA service stations.",
  alternates: {
    canonical: "/case-studies/fuel-price-boards",
  },
  openGraph: {
    title: "Fuel Price Board Signage Case Study",
    description:
      "How custom illuminated signage capability extends into FuelWatch-ready LED fuel price boards for WA service stations.",
    url: "/case-studies/fuel-price-boards",
    images: [
      {
        url: "/images/commercial-lightbox-hero.png",
        width: 1680,
        height: 960,
        alt: "Illuminated custom commercial lightbox sign on a modern shopfront",
      },
    ],
  },
};

const caseJsonLd = {
  "@context": "https://schema.org",
  "@type": "CreativeWork",
  name: "Fuel price board signage case study",
  description:
    "A specialist customer path for weather-rated, FuelWatch-ready LED fuel price board signage.",
  provider: {
    "@type": "LocalBusiness",
    name: companyName,
    url: siteUrl,
  },
  url: absoluteUrl("/case-studies/fuel-price-boards"),
};

export default function FuelPriceBoardsCaseStudy() {
  return (
    <main className="bg-stone-50 text-stone-950">
      <script type="application/ld+json" suppressHydrationWarning>
        {JSON.stringify(caseJsonLd)}
      </script>
      <section className="relative isolate overflow-hidden bg-stone-950 px-4 py-24 text-white">
        <Image
          src="/images/commercial-lightbox-hero.png"
          alt="Illuminated commercial sign used as a placeholder for signage capability"
          fill
          priority
          sizes="100vw"
          className="object-cover object-[62%_center] opacity-40"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(12,10,9,0.96)_0%,rgba(12,10,9,0.76)_56%,rgba(12,10,9,0.44)_100%)]" />
        <div className="relative z-10 mx-auto max-w-6xl">
          <Link
            href="/"
            className="inline-flex min-h-10 items-center text-sm font-bold text-amber-200 underline decoration-amber-200/40 underline-offset-4 transition-[color,text-decoration-color] hover:text-white hover:decoration-white"
          >
            Back to Commercial Lightbox
          </Link>
          <p className="mt-12 text-xs font-bold uppercase tracking-[0.18em] text-amber-300">
            Customer path
          </p>
          <h1 className="mt-4 max-w-3xl text-balance text-4xl font-semibold leading-[1.05] md:text-6xl">
            Fuel price board signage for service stations.
          </h1>
          <p className="mt-6 max-w-2xl text-pretty text-lg leading-8 text-white/78">
            Some commercial signage projects need more than a static illuminated
            face. Petrol station operators need durable roadside LED displays,
            readable pricing, and a clear path for FuelWatch-ready control.
          </p>
        </div>
      </section>

      <section className="px-4 py-20">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-800">
              Why it is separate
            </p>
            <h2 className="mt-3 text-balance text-3xl font-semibold md:text-4xl">
              The same sign discipline, narrowed for fuel retail.
            </h2>
          </div>
          <div className="grid gap-5">
            {[
              "Lightbox work focuses on cabinet, face, brand artwork, and illumination quality.",
              "Fuel price boards add roadside legibility, digit modules, weather-rated electronics, and operator controls.",
              "For WA stations, the dedicated product path can include FuelWatch-ready LED fuel price boards and site-specific board formats.",
            ].map((item) => (
              <p
                key={item}
                className="rounded-lg bg-white p-6 text-pretty leading-8 text-stone-600 shadow-[0_0_0_1px_rgba(0,0,0,0.06),0_12px_32px_rgba(0,0,0,0.05)]"
              >
                {item}
              </p>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white px-4 py-20">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-3">
          {[
            [
              "Visibility",
              "LED digit height and contrast are chosen for approach distance and road position.",
            ],
            [
              "Durability",
              "Cabinet, sealing, and service access are specified for exposed forecourt conditions.",
            ],
            [
              "Control",
              "Operators need straightforward price updates, with FuelWatch-ready automation where applicable.",
            ],
          ].map(([title, copy]) => (
            <article
              key={title}
              className="rounded-lg bg-stone-50 p-6 shadow-[0_0_0_1px_rgba(0,0,0,0.06),0_12px_32px_rgba(0,0,0,0.05)]"
            >
              <h2 className="text-xl font-semibold">{title}</h2>
              <p className="mt-4 text-pretty leading-7 text-stone-600">
                {copy}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-stone-950 px-4 py-20 text-white">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-300">
              Next step
            </p>
            <h2 className="mt-3 text-balance text-3xl font-semibold md:text-4xl">
              Need a standard lightbox or a fuel display?
            </h2>
            <p className="mt-5 max-w-2xl text-pretty text-lg leading-8 text-white/72">
              Use Commercial Lightbox for custom illuminated shopfront signage.
              For service station pricing, compare the specialist fuel price
              board range.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/#quote"
              className="inline-flex min-h-11 items-center justify-center rounded-lg bg-amber-500 px-6 py-3 text-sm font-bold text-stone-950 shadow-[0_1px_2px_rgba(0,0,0,0.12),0_16px_36px_rgba(242,163,58,0.26)] transition-[background-color,scale] hover:bg-amber-400 active:scale-[0.96]"
            >
              Request a lightbox quote
            </Link>
            <a
              href={`${fuelPriceBoardUrl}/products/fuel-price-board`}
              className="inline-flex min-h-11 items-center justify-center rounded-lg bg-white/10 px-6 py-3 text-sm font-bold text-white shadow-[0_0_0_1px_rgba(255,255,255,0.18)] transition-[background-color,scale] hover:bg-white/15 active:scale-[0.96]"
            >
              View fuel price board range
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
