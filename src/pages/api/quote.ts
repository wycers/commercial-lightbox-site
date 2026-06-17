import type { APIRoute } from "astro";
import { siteUrl } from "../../lib/site";

export const prerender = false;

type QuoteFields = {
  fullName: string;
  businessName: string;
  suburb: string;
  state: string;
  email: string;
  phone: string;
  signType: string;
  dimensions: string;
  message: string;
  pageUrl: string;
  _gotcha: string;
  previewImageDataUrl: string;
  previewDesignJson: string;
  previewMode: string;
};

type RequiredField = keyof Omit<
  QuoteFields,
  | "dimensions"
  | "message"
  | "pageUrl"
  | "_gotcha"
  | "previewImageDataUrl"
  | "previewDesignJson"
  | "previewMode"
>;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TELEGRAM_MESSAGE_LIMIT = 4096;
const TELEGRAM_CAPTION_LIMIT = 1024;
const MAX_PREVIEW_IMAGE_BYTES = 2.5 * 1024 * 1024;
const MAX_PREVIEW_DESIGN_LENGTH = 80_000;
const PREVIEW_IMAGE_REGEX =
  /^data:(image\/(?:png|jpeg|webp));base64,([a-z0-9+/=\s]+)$/i;

const REQUIRED_FIELDS: Array<[RequiredField, string]> = [
  ["fullName", "Full name"],
  ["businessName", "Business name"],
  ["suburb", "Suburb"],
  ["state", "State"],
  ["email", "Email"],
  ["phone", "Phone"],
  ["signType", "Sign type"],
];

function jsonResponse(body: { ok: boolean; error?: string }, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
  });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readString(payload: Record<string, unknown>, key: string) {
  const value = payload[key];
  return typeof value === "string" ? value.trim() : "";
}

function readQuoteFields(payload: Record<string, unknown>): QuoteFields {
  return {
    fullName: readString(payload, "fullName"),
    businessName: readString(payload, "businessName"),
    suburb: readString(payload, "suburb"),
    state: readString(payload, "state"),
    email: readString(payload, "email"),
    phone: readString(payload, "phone"),
    signType: readString(payload, "signType"),
    dimensions: readString(payload, "dimensions"),
    message: readString(payload, "message"),
    pageUrl: readString(payload, "pageUrl"),
    _gotcha: readString(payload, "_gotcha"),
    previewImageDataUrl: readString(payload, "previewImageDataUrl"),
    previewDesignJson: readString(payload, "previewDesignJson"),
    previewMode: readString(payload, "previewMode"),
  };
}

function validate(fields: QuoteFields) {
  const missingFields = REQUIRED_FIELDS.filter(([key]) => !fields[key]).map(
    ([, label]) => label,
  );

  if (missingFields.length > 0) {
    return `${missingFields.join(", ")} required.`;
  }

  if (!EMAIL_REGEX.test(fields.email)) {
    return "Please enter a valid email address.";
  }

  const hasPreview =
    fields.previewImageDataUrl ||
    fields.previewDesignJson ||
    fields.previewMode;

  if (!hasPreview) return;

  if (!fields.previewImageDataUrl || !fields.previewDesignJson) {
    return "Preview attachment is incomplete.";
  }

  if (fields.previewMode !== "face" && fields.previewMode !== "shopfront") {
    return "Preview mode is invalid.";
  }

  if (fields.previewDesignJson.length > MAX_PREVIEW_DESIGN_LENGTH) {
    return "Preview design data is too large.";
  }

  try {
    JSON.parse(fields.previewDesignJson);
  } catch {
    return "Preview design data is invalid.";
  }
}

function readServerEnv(key: string) {
  const astroEnv = import.meta.env as Record<string, string | undefined>;
  const value =
    (typeof process !== "undefined" ? process.env[key] : undefined) ??
    astroEnv[key];

  return typeof value === "string" ? value.trim() : "";
}

function formatTelegramMessage(fields: QuoteFields) {
  const lines = [
    "New commercial lightbox quote request",
    "",
    `Source site: ${siteUrl}`,
    `Page URL: ${fields.pageUrl || siteUrl}`,
    "",
    `Full name: ${fields.fullName}`,
    `Business: ${fields.businessName}`,
    `Location: ${fields.suburb}, ${fields.state}`,
    `Email: ${fields.email}`,
    `Phone: ${fields.phone}`,
    `Sign type: ${fields.signType}`,
  ];

  if (fields.dimensions) {
    lines.push(`Dimensions: ${fields.dimensions}`);
  }

  if (fields.message) {
    lines.push("", "Message:", fields.message);
  }

  if (fields.previewImageDataUrl) {
    lines.push("", ...formatPreviewSummary(fields));
  }

  const message = lines.join("\n");
  if (message.length <= TELEGRAM_MESSAGE_LIMIT) return message;

  return `${message.slice(0, TELEGRAM_MESSAGE_LIMIT - 16)}\n...[truncated]`;
}

function formatPreviewSummary(fields: QuoteFields) {
  const mode =
    fields.previewMode === "shopfront" ? "Shopfront mockup" : "Sign face";
  const fallback = [`Preview: attached (${mode})`];

  try {
    const parsedDesign: unknown = JSON.parse(fields.previewDesignJson);
    if (!isRecord(parsedDesign)) return fallback;

    const dimensions = isRecord(parsedDesign.dimensionsMm)
      ? parsedDesign.dimensionsMm
      : undefined;
    const cabinet = isRecord(parsedDesign.cabinet)
      ? parsedDesign.cabinet
      : undefined;
    const elements = Array.isArray(parsedDesign.elements)
      ? parsedDesign.elements
      : [];
    const previewLines = [`Preview: attached (${mode})`];

    if (
      typeof dimensions?.width === "number" &&
      typeof dimensions?.height === "number"
    ) {
      previewLines.push(
        `Preview size: ${dimensions.width} x ${dimensions.height} mm`,
      );
    }

    if (cabinet) {
      const frameStyle =
        typeof cabinet.frameStyle === "string" ? cabinet.frameStyle : "";
      const lightingMode =
        typeof cabinet.lightingMode === "string" ? cabinet.lightingMode : "";

      if (frameStyle || lightingMode) {
        previewLines.push(
          `Preview cabinet: ${[frameStyle, lightingMode]
            .filter(Boolean)
            .join(", ")}`,
        );
      }
    }

    previewLines.push(`Preview layers: ${elements.length}`);

    return previewLines;
  } catch {
    return fallback;
  }
}

function readPreviewImage(fields: QuoteFields) {
  if (!fields.previewImageDataUrl) return;

  const match = fields.previewImageDataUrl.match(PREVIEW_IMAGE_REGEX);
  if (!match) {
    return { error: "Preview image must be PNG, JPG, or WebP data." };
  }

  const mimeType = match[1].toLowerCase();
  const base64 = match[2].replace(/\s/g, "");
  const buffer = Buffer.from(base64, "base64");

  if (buffer.byteLength > MAX_PREVIEW_IMAGE_BYTES) {
    return { error: "Preview image is too large." };
  }

  const extension = mimeType === "image/jpeg" ? "jpg" : mimeType.split("/")[1];
  const arrayBuffer = buffer.buffer.slice(
    buffer.byteOffset,
    buffer.byteOffset + buffer.byteLength,
  );

  return {
    blob: new Blob([arrayBuffer], { type: mimeType }),
    fileName: `lightbox-preview.${extension}`,
  };
}

function formatPreviewCaption(fields: QuoteFields) {
  const mode =
    fields.previewMode === "shopfront" ? "Shopfront mockup" : "Sign face";
  const caption = [
    "Commercial lightbox preview",
    `Mode: ${mode}`,
    `Business: ${fields.businessName}`,
    `Contact: ${fields.fullName}`,
  ].join("\n");

  if (caption.length <= TELEGRAM_CAPTION_LIMIT) return caption;

  return caption.slice(0, TELEGRAM_CAPTION_LIMIT - 16);
}

async function sendTelegramPreviewPhoto({
  botToken,
  chatId,
  fields,
  previewImage,
}: {
  botToken: string;
  chatId: string;
  fields: QuoteFields;
  previewImage: { blob: Blob; fileName: string };
}) {
  const formData = new FormData();
  formData.append("chat_id", chatId);
  formData.append("caption", formatPreviewCaption(fields));
  formData.append("photo", previewImage.blob, previewImage.fileName);

  return fetch(`https://api.telegram.org/bot${botToken}/sendPhoto`, {
    method: "POST",
    body: formData,
  });
}

export const POST: APIRoute = async ({ request }) => {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return jsonResponse({ ok: false, error: "Invalid request body." }, 400);
  }

  if (!isRecord(payload)) {
    return jsonResponse({ ok: false, error: "Invalid request body." }, 400);
  }

  const fields = readQuoteFields(payload);

  if (fields._gotcha) {
    return jsonResponse({ ok: true });
  }

  const validationError = validate(fields);
  if (validationError) {
    return jsonResponse({ ok: false, error: validationError }, 400);
  }

  const previewImage = readPreviewImage(fields);
  if (previewImage?.error) {
    return jsonResponse({ ok: false, error: previewImage.error }, 400);
  }

  const botToken = readServerEnv("TELEGRAM_BOT_TOKEN");
  const chatId = readServerEnv("TELEGRAM_CHAT_ID");

  if (!botToken || !chatId) {
    return jsonResponse(
      { ok: false, error: "Telegram is not configured." },
      503,
    );
  }

  try {
    const telegramResponse = await fetch(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: formatTelegramMessage(fields),
          disable_web_page_preview: true,
        }),
      },
    );

    if (!telegramResponse.ok) {
      console.error(
        "Telegram quote notification failed",
        telegramResponse.status,
      );

      return jsonResponse(
        { ok: false, error: "Failed to send quote request." },
        502,
      );
    }

    if (previewImage?.blob) {
      const telegramPhotoResponse = await sendTelegramPreviewPhoto({
        botToken,
        chatId,
        fields,
        previewImage,
      });

      if (!telegramPhotoResponse.ok) {
        console.error(
          "Telegram preview photo failed",
          telegramPhotoResponse.status,
        );

        return jsonResponse(
          { ok: false, error: "Failed to send preview image." },
          502,
        );
      }
    }
  } catch (error) {
    console.error("Telegram quote notification error", error);

    return jsonResponse(
      { ok: false, error: "Failed to send quote request." },
      502,
    );
  }

  return jsonResponse({ ok: true });
};
