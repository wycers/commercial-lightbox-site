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
  previewSummary: string;
  pageUrl: string;
  _gotcha: string;
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TELEGRAM_MESSAGE_LIMIT = 4096;
const CONTACT_REQUIRED_ERROR = "Enter an email or phone number.";
const QUOTE_FAILURE_MESSAGE = "Unable to send quote request right now.";

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
    previewSummary: readString(payload, "previewSummary"),
    pageUrl: readString(payload, "pageUrl"),
    _gotcha: readString(payload, "_gotcha"),
  };
}

function validate(fields: QuoteFields) {
  if (!fields.fullName) return "Full name is required.";
  if (!fields.signType) return "Sign type is required.";

  const hasEmail = Boolean(fields.email);
  const hasPhone = Boolean(fields.phone);

  if (!hasEmail && !hasPhone) return CONTACT_REQUIRED_ERROR;

  if (hasEmail && !EMAIL_REGEX.test(fields.email)) {
    return "Please enter a valid email address.";
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
  const location = [fields.suburb, fields.state].filter(Boolean).join(", ");
  const lines = [
    "New commercial lightbox quote request",
    "",
    `Source site: ${siteUrl}`,
    `Page URL: ${fields.pageUrl || siteUrl}`,
    "",
    `Full name: ${fields.fullName}`,
    `Business: ${fields.businessName || "Not supplied"}`,
    `Location: ${location || "Not supplied"}`,
    `Email: ${fields.email || "Not supplied"}`,
    `Phone: ${fields.phone || "Not supplied"}`,
    `Sign type: ${fields.signType}`,
  ];

  if (fields.dimensions) {
    lines.push(`Dimensions: ${fields.dimensions}`);
  }

  if (fields.message) {
    lines.push("", "Message:", fields.message);
  }

  if (
    fields.previewSummary &&
    (!fields.message || !fields.message.includes(fields.previewSummary))
  ) {
    lines.push("", "Preview summary:", fields.previewSummary);
  }

  const message = lines.join("\n");
  if (message.length <= TELEGRAM_MESSAGE_LIMIT) return message;

  return `${message.slice(0, TELEGRAM_MESSAGE_LIMIT - 16)}\n...[truncated]`;
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

  const botToken = readServerEnv("TELEGRAM_BOT_TOKEN");
  const chatId = readServerEnv("TELEGRAM_CHAT_ID");

  if (!botToken || !chatId) {
    console.error("Telegram quote notification is not configured");

    return jsonResponse({ ok: false, error: QUOTE_FAILURE_MESSAGE }, 503);
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

      return jsonResponse({ ok: false, error: QUOTE_FAILURE_MESSAGE }, 502);
    }
  } catch (error) {
    console.error("Telegram quote notification error", error);

    return jsonResponse({ ok: false, error: QUOTE_FAILURE_MESSAGE }, 502);
  }

  return jsonResponse({ ok: true });
};
