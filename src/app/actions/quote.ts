"use server";

import { siteUrl } from "@/lib/site";

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
  honeypot: string;
};

type RequiredField = keyof Omit<
  QuoteFields,
  "dimensions" | "message" | "pageUrl" | "honeypot"
>;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TELEGRAM_MESSAGE_LIMIT = 4096;

const REQUIRED_FIELDS: Array<[RequiredField, string]> = [
  ["fullName", "Full name"],
  ["businessName", "Business name"],
  ["suburb", "Suburb"],
  ["state", "State"],
  ["email", "Email"],
  ["phone", "Phone"],
  ["signType", "Sign type"],
];

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
    honeypot: readString(payload, "_gotcha"),
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

  const message = lines.join("\n");
  if (message.length <= TELEGRAM_MESSAGE_LIMIT) return message;

  return `${message.slice(0, TELEGRAM_MESSAGE_LIMIT - 16)}\n...[truncated]`;
}

export async function submitCommercialQuoteRequest(payload: unknown) {
  if (!isRecord(payload)) {
    return { ok: false, error: "Invalid request body." };
  }

  const fields = readQuoteFields(payload);

  if (fields.honeypot) {
    return { ok: true };
  }

  const validationError = validate(fields);
  if (validationError) {
    return { ok: false, error: validationError };
  }

  const botToken = process.env.TELEGRAM_BOT_TOKEN?.trim();
  const chatId = process.env.TELEGRAM_CHAT_ID?.trim();

  if (!botToken || !chatId) {
    return { ok: false, error: "Telegram is not configured." };
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

      return { ok: false, error: "Failed to send quote request." };
    }
  } catch (error) {
    console.error("Telegram quote notification error", error);

    return { ok: false, error: "Failed to send quote request." };
  }

  return { ok: true };
}
