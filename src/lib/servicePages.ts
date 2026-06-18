export type ServicePageData = {
  slug: string;
  title: string;
  description: string;
  canonicalPath: string;
  eyebrow: string;
  h1: string;
  intro: string;
  serviceType: string;
  image: {
    src: string;
    alt: string;
  };
  fitTitle: string;
  fitIntro: string;
  applications: Array<{
    title: string;
    copy: string;
  }>;
  quoteFactors: Array<{
    title: string;
    copy: string;
  }>;
  priceGuidance: Array<{
    title: string;
    copy: string;
  }>;
  materialNotes: Array<{
    title: string;
    copy: string;
  }>;
  approvalNotes: Array<{
    title: string;
    copy: string;
  }>;
  maintenanceNotes: Array<{
    title: string;
    copy: string;
  }>;
  processSteps: Array<{
    title: string;
    copy: string;
  }>;
  faqs: Array<{
    question: string;
    answer: string;
  }>;
  relatedLinks: Array<{
    label: string;
    href: string;
  }>;
};

const standardProcessSteps = [
  {
    title: "Share the site",
    copy: "Send photos, rough dimensions, location, artwork, indoor or outdoor use, and timing needs.",
  },
  {
    title: "Confirm the scope",
    copy: "Review materials, visibility, mounting, access, power, approvals, and any survey requirements.",
  },
  {
    title: "Build and install",
    copy: "Fabricate the cabinet and face, install on site, test illumination, and hand over support notes.",
  },
];

const standardMaintenanceNotes = [
  {
    title: "Written scope",
    copy: "Warranty, service access, cleaning guidance, and support assumptions should be confirmed in the written quote before fabrication.",
  },
  {
    title: "Service access",
    copy: "Cabinet faces, LED modules, power supplies, and fixings should remain reachable where the sign position allows it.",
  },
];

export const servicePages: ServicePageData[] = [
  {
    slug: "shopfront-lightbox-signs-perth",
    title: "Shopfront Lightbox Signs Perth | Commercial Lightbox",
    description:
      "Shopfront lightbox signs for Perth and WA businesses, including fascia, wall-mounted, and window-facing illuminated signage.",
    canonicalPath: "/shopfront-lightbox-signs-perth",
    eyebrow: "Shopfront signage",
    h1: "Shopfront lightbox signs for Perth businesses",
    intro:
      "Street-facing lightboxes need to work from the footpath, the road approach, and the shopfront itself. Scope the cabinet, face, mounting, artwork, access, and night visibility before fabrication.",
    serviceType:
      "Shopfront lightbox sign design, fabrication, and installation",
    image: {
      src: "/images/commercial-lightbox-shopfront-placeholder.png",
      alt: "Illuminated shopfront lightbox sign concept on a modern commercial frontage",
    },
    fitTitle: "Where shopfront lightboxes fit",
    fitIntro:
      "Use this path when the sign needs to identify the business from outside the tenancy.",
    applications: [
      {
        title: "Fascia signs",
        copy: "Illuminated sign faces fitted to awnings, shopfront fascia zones, or tenancy sign bands.",
      },
      {
        title: "Wall-mounted cabinets",
        copy: "Lightbox cabinets planned around fixing points, wall condition, service access, and cable paths.",
      },
      {
        title: "Window-facing signs",
        copy: "Brand panels and illuminated faces positioned for pedestrian visibility and after-hours presence.",
      },
      {
        title: "Retail and service tenancies",
        copy: "Suitable for clinics, cafes, showrooms, gyms, offices, and street-facing commercial sites.",
      },
    ],
    quoteFactors: [
      {
        title: "Viewing distance",
        copy: "Letter size, contrast, cabinet height, and LED brightness should match footpath and road approach distances.",
      },
      {
        title: "Structure and access",
        copy: "Wall condition, awning constraints, access equipment, and service access affect installation planning.",
      },
      {
        title: "Weather exposure",
        copy: "Outdoor faces, cabinet finishes, drainage, UV exposure, and sealing need to suit the frontage.",
      },
      {
        title: "Artwork readiness",
        copy: "Vector artwork is preferred. Low-resolution logos may need redraw before a clean illuminated face can be made.",
      },
    ],
    priceGuidance: [
      {
        title: "Range before formal quote",
        copy: "A first reply can give an indicative range once photos, rough width, height, suburb, and mounting position are known.",
      },
      {
        title: "Final quote inputs",
        copy: "The formal price depends on cabinet size, face material, access equipment, artwork readiness, power, and approval requirements.",
      },
    ],
    materialNotes: [
      {
        title: "Cabinet and face",
        copy: "Shopfront cabinets are scoped around aluminium housing, face material, frame finish, drainage, and future face access.",
      },
      {
        title: "Night visibility",
        copy: "LED layout, diffuser choice, colour contrast, and face opacity are matched to the frontage and viewing distance.",
      },
    ],
    approvalNotes: [
      {
        title: "Tenancy checks",
        copy: "Landlord, shopping centre, strata, heritage, or council conditions may need confirmation before production.",
      },
      {
        title: "Install assumptions",
        copy: "Wall condition, awning access, fixings, power path, and safe access equipment should be confirmed before the final scope.",
      },
    ],
    maintenanceNotes: standardMaintenanceNotes,
    processSteps: standardProcessSteps,
    faqs: [
      {
        question: "Can you quote from a shopfront photo?",
        answer:
          "Yes. A straight-on photo, rough width, suburb, mounting area, and any logo files are enough to start the scope conversation.",
      },
      {
        question: "Do shopfront lightboxes need landlord approval?",
        answer:
          "Some sites do. Tenancy rules, shopping centre requirements, heritage constraints, and council conditions should be checked during scope.",
      },
      {
        question: "Can the sign be readable at night without being too bright?",
        answer:
          "Yes. LED layout, face material, colour contrast, and sign size can be matched to viewing distance and local lighting.",
      },
      {
        question: "Do you install the finished shopfront sign?",
        answer:
          "Installation can be included with fixing, access, power coordination, illumination testing, and handover notes.",
      },
    ],
    relatedLinks: [
      { label: "Outdoor lightbox signs", href: "/outdoor-lightbox-signs" },
      { label: "Indoor lightbox signs", href: "/indoor-lightbox-signs" },
      { label: "Menu lightbox signs", href: "/menu-lightbox-signs" },
    ],
  },
  {
    slug: "indoor-lightbox-signs",
    title: "Indoor Lightbox Signs | Retail and Reception Signage WA",
    description:
      "Indoor lightbox signs for receptions, retail interiors, brand walls, showrooms, and commercial fit-outs in WA.",
    canonicalPath: "/indoor-lightbox-signs",
    eyebrow: "Indoor signage",
    h1: "Indoor lightbox signs for retail and reception spaces",
    intro:
      "Indoor lightboxes need controlled brightness, clean edges, quiet cable paths, and materials that suit close viewing. The result should look tidy in daylight and stay evenly lit after hours.",
    serviceType: "Indoor lightbox sign design, fabrication, and installation",
    image: {
      src: "/images/commercial-lightbox-indoor-placeholder.png",
      alt: "Indoor commercial lightbox sign concept in a reception setting",
    },
    fitTitle: "Where indoor lightboxes work well",
    fitIntro:
      "Use this path when the sign is viewed up close inside a business or fit-out.",
    applications: [
      {
        title: "Reception signs",
        copy: "Illuminated brand panels for lobbies, clinics, offices, and front-of-house spaces.",
      },
      {
        title: "Retail interiors",
        copy: "Lightboxes for product areas, category signage, counters, and in-store brand moments.",
      },
      {
        title: "Showrooms",
        copy: "Premium illuminated panels for product displays, sample walls, and sales environments.",
      },
      {
        title: "Tenancy fit-outs",
        copy: "Clean cabinet details, concealed fixings, and low-heat LED layouts matched to interior finishes.",
      },
    ],
    quoteFactors: [
      {
        title: "Brightness comfort",
        copy: "Close-viewing signs need even diffusion without glare for staff, visitors, and customers.",
      },
      {
        title: "Finish quality",
        copy: "Cabinet colour, face material, edge detail, and fixing method should suit the fit-out.",
      },
      {
        title: "Cleaning and access",
        copy: "Face materials and service access matter in reception, retail, and food-adjacent spaces.",
      },
      {
        title: "Cable path",
        copy: "Switching, power location, and concealed routing need to be checked before fabrication.",
      },
    ],
    priceGuidance: [
      {
        title: "Initial guidance",
        copy: "A first reply can outline the likely price path after rough dimensions, fit-out location, artwork, and finish expectations are shared.",
      },
      {
        title: "Fit-out dependencies",
        copy: "The formal quote depends on cabinet finish, brightness control, cable route, installation surface, and any access constraints.",
      },
    ],
    materialNotes: [
      {
        title: "Interior finish",
        copy: "Cabinet colour, edge detail, face material, and fixings should be selected to sit cleanly with the surrounding fit-out.",
      },
      {
        title: "Comfortable brightness",
        copy: "Diffusion, LED spacing, and face opacity are chosen for close viewing rather than maximum brightness.",
      },
    ],
    approvalNotes: [
      {
        title: "Fit-out coordination",
        copy: "Power location, switching, cable concealment, wall backing, and installation timing should be checked with the fit-out team.",
      },
      {
        title: "Site limits",
        copy: "Access hours, tenancy rules, food-adjacent cleaning needs, and visitor safety may affect installation planning.",
      },
    ],
    maintenanceNotes: standardMaintenanceNotes,
    processSteps: standardProcessSteps,
    faqs: [
      {
        question: "Are indoor lightbox signs too bright for reception areas?",
        answer:
          "They do not need to be. Face material, LED spacing, and brightness can be selected for comfortable close viewing.",
      },
      {
        question: "Can an indoor lightbox match a fit-out colour?",
        answer:
          "The cabinet finish and face artwork can usually be specified around brand colours and interior finishes.",
      },
      {
        question: "Do you need final artwork before quoting?",
        answer:
          "Final artwork helps, but a logo file and rough dimensions are enough to start. Any redraw needs can be flagged before manufacturing.",
      },
      {
        question: "Can the sign be serviced after installation?",
        answer:
          "Service access can be planned into the cabinet so faces, LED modules, and fixings remain maintainable.",
      },
    ],
    relatedLinks: [
      { label: "Menu lightbox signs", href: "/menu-lightbox-signs" },
      {
        label: "Shopfront lightbox signs",
        href: "/shopfront-lightbox-signs-perth",
      },
      { label: "Outdoor lightbox signs", href: "/outdoor-lightbox-signs" },
    ],
  },
  {
    slug: "outdoor-lightbox-signs",
    title: "Outdoor Lightbox Signs WA | Weather-Aware Signage",
    description:
      "Outdoor lightbox signs for WA shopfronts, commercial walls, fascia zones, and exposed business signage.",
    canonicalPath: "/outdoor-lightbox-signs",
    eyebrow: "Outdoor signage",
    h1: "Outdoor lightbox signs for WA commercial sites",
    intro:
      "Outdoor signs need more than a bright face. Exposure, fixing, cabinet depth, drainage, UV, service access, and power coordination should all be resolved before the sign is built.",
    serviceType: "Outdoor lightbox sign design, fabrication, and installation",
    image: {
      src: "/images/commercial-lightbox-shopfront-placeholder.png",
      alt: "Outdoor illuminated commercial lightbox sign concept on a shopfront wall",
    },
    fitTitle: "Where outdoor lightboxes fit",
    fitIntro:
      "Use this path when the sign sits outside, faces weather, or needs to be seen from a distance.",
    applications: [
      {
        title: "Street-facing businesses",
        copy: "Illuminated brand signage for shops, clinics, offices, gyms, hospitality venues, and showrooms.",
      },
      {
        title: "Exposed walls",
        copy: "Wall-mounted cabinets planned around fixing, service access, and weather exposure.",
      },
      {
        title: "Fascia and awning zones",
        copy: "Sign cabinets sized around tenancy bands, pedestrian visibility, and approach distance.",
      },
      {
        title: "Regional WA sites",
        copy: "Projects scoped around travel, access, exposure, and site-specific installation constraints.",
      },
    ],
    quoteFactors: [
      {
        title: "Exposure",
        copy: "Sun, rain, wind, coastal conditions, and impact risk influence face material and cabinet detail.",
      },
      {
        title: "Mounting",
        copy: "Fixing method depends on wall structure, backing, access equipment, and future service access.",
      },
      {
        title: "Visibility",
        copy: "Sign size, face contrast, LED layout, and cabinet position should match the approach distance.",
      },
      {
        title: "Power and approvals",
        copy: "Switching, cable paths, electrical coordination, landlord rules, and permits can affect timing.",
      },
    ],
    priceGuidance: [
      {
        title: "Indicative range first",
        copy: "A first reply can provide a practical range after photos, dimensions, exposure, wall material, and access needs are known.",
      },
      {
        title: "Final quote inputs",
        copy: "Weather exposure, face material, cabinet depth, fixings, travel, access equipment, power, and approvals shape the formal price.",
      },
    ],
    materialNotes: [
      {
        title: "Weather-aware build",
        copy: "Outdoor cabinets are scoped around aluminium housing, sealing, drainage, UV exposure, face material, and service access.",
      },
      {
        title: "Power and brightness",
        copy: "LED modules, power supplies, switching, diffuser choice, and sign position are matched to exposure and viewing distance.",
      },
    ],
    approvalNotes: [
      {
        title: "Approvals",
        copy: "Landlord, council, strata, shopping centre, or site-owner approval may be required before fabrication or install.",
      },
      {
        title: "Electrical coordination",
        copy: "Existing power, switching, cable paths, and any required electrical trade work should be confirmed before the final quote.",
      },
    ],
    maintenanceNotes: standardMaintenanceNotes,
    processSteps: standardProcessSteps,
    faqs: [
      {
        question: "What makes an outdoor lightbox different?",
        answer:
          "Outdoor signs need weather-aware cabinets, suitable face materials, drainage, fixing detail, UV resistance, and service access.",
      },
      {
        question: "Can the sign be installed on an existing wall?",
        answer:
          "Often, but the wall condition, backing, fixing method, cable path, and access requirements need to be checked.",
      },
      {
        question: "Are outdoor lightboxes suitable for regional WA?",
        answer:
          "Yes. Regional projects need travel, access, site photos, install conditions, and timing included in the quote scope.",
      },
      {
        question: "What information helps the fastest?",
        answer:
          "Send location, photos, rough dimensions, wall material, artwork, preferred timing, and whether power is already available.",
      },
    ],
    relatedLinks: [
      {
        label: "Shopfront lightbox signs",
        href: "/shopfront-lightbox-signs-perth",
      },
      { label: "Indoor lightbox signs", href: "/indoor-lightbox-signs" },
      {
        label: "Fuel price board signage",
        href: "/case-studies/fuel-price-boards",
      },
    ],
  },
  {
    slug: "menu-lightbox-signs",
    title: "Menu Lightbox Signs | Food Court and Counter Signage WA",
    description:
      "Menu lightbox signs for food courts, counters, retail menus, and close-viewing illuminated displays in WA.",
    canonicalPath: "/menu-lightbox-signs",
    eyebrow: "Menu signage",
    h1: "Menu lightbox signs for food courts and counters",
    intro:
      "Menu lightboxes need clear reading distance, controlled brightness, clean face changes, and tidy cabinet details. The goal is legibility without glare for customers waiting nearby.",
    serviceType: "Menu lightbox sign design, fabrication, and installation",
    image: {
      src: "/images/commercial-lightbox-indoor-placeholder.png",
      alt: "Indoor menu lightbox sign concept in a commercial interior",
    },
    fitTitle: "Where menu lightboxes fit",
    fitIntro:
      "Use this path when the illuminated sign needs to present products, menus, or offers at close range.",
    applications: [
      {
        title: "Food court counters",
        copy: "Backlit menus designed for queues, close reading, and tenancy-wall constraints.",
      },
      {
        title: "Cafe and takeaway menus",
        copy: "Illuminated menu faces that can balance brand impact with easy customer scanning.",
      },
      {
        title: "Retail price or product panels",
        copy: "Lightboxes for product categories, feature panels, and changeable promotional faces.",
      },
      {
        title: "Counter signage",
        copy: "Compact illuminated signs scoped around eye-level viewing, access, cleaning, and power.",
      },
    ],
    quoteFactors: [
      {
        title: "Reading distance",
        copy: "Menu text size, contrast, and layout need to match where customers stand and queue.",
      },
      {
        title: "Glare control",
        copy: "Face material, LED layout, and brightness should stay comfortable in seating and service areas.",
      },
      {
        title: "Changeability",
        copy: "Some menus need replaceable faces or service access for future price and product changes.",
      },
      {
        title: "Cleaning",
        copy: "Food-adjacent signs need suitable face materials, edges, and access for practical maintenance.",
      },
    ],
    priceGuidance: [
      {
        title: "Scope before price",
        copy: "A first reply can outline the likely path after menu size, viewing distance, artwork state, change frequency, and install location are shared.",
      },
      {
        title: "Final quote inputs",
        copy: "Face changeability, cabinet access, artwork preparation, cleaning needs, brightness control, and power location affect the formal quote.",
      },
    ],
    materialNotes: [
      {
        title: "Readable face",
        copy: "Menu lightboxes are scoped around diffuser choice, face material, LED spacing, and artwork contrast for close-range reading.",
      },
      {
        title: "Changeable content",
        copy: "If prices or menu items change often, the cabinet can be planned around replaceable faces and practical service access.",
      },
    ],
    approvalNotes: [
      {
        title: "Tenancy fit",
        copy: "Wall detail, fixing points, access hours, power, cleaning access, and tenancy rules should be checked before production.",
      },
      {
        title: "Artwork timing",
        copy: "Rough menu artwork can start the quote, but final production artwork and proofing should be confirmed before manufacture.",
      },
    ],
    maintenanceNotes: standardMaintenanceNotes,
    processSteps: standardProcessSteps,
    faqs: [
      {
        question: "Can a menu lightbox use changeable graphics?",
        answer:
          "Yes. The cabinet and face can be planned around replacement access if pricing or menu content changes regularly.",
      },
      {
        question: "How do you stop menu signs from glaring?",
        answer:
          "Diffusion, LED spacing, face material, cabinet depth, and brightness can be matched to close-viewing conditions.",
      },
      {
        question: "Do you need final menu artwork before quoting?",
        answer:
          "A rough layout, approximate size, and any existing brand files are enough to start. Final production artwork can follow after scope.",
      },
      {
        question: "Can menu lightboxes be installed in tenancy walls?",
        answer:
          "Yes, but wall detail, fixing points, power, cleaning access, and tenancy rules should be checked first.",
      },
    ],
    relatedLinks: [
      { label: "Indoor lightbox signs", href: "/indoor-lightbox-signs" },
      {
        label: "Shopfront lightbox signs",
        href: "/shopfront-lightbox-signs-perth",
      },
      { label: "Outdoor lightbox signs", href: "/outdoor-lightbox-signs" },
    ],
  },
];
