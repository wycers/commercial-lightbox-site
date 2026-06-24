import type { ChangeEvent } from "react";
import { useEffect, useRef, useState } from "react";
import { contactEmail, contactPhone, emailHref, phoneHref } from "../lib/site";

type FormFields = {
  fullName: string;
  businessName: string;
  suburb: string;
  state: string;
  email: string;
  phone: string;
  signType: string;
  dimensions: string;
  message: string;
};

type FormErrors = Partial<Record<keyof FormFields, string>>;

type QuoteSubmitResult = {
  ok: boolean;
  error?: string;
};

type PreviewQuoteDraft = Partial<Pick<FormFields, "dimensions" | "message">> & {
  previewImageDataUrl?: string;
  previewSummary?: string;
};

const initialFields: FormFields = {
  fullName: "",
  businessName: "",
  suburb: "",
  state: "",
  email: "",
  phone: "",
  signType: "",
  dimensions: "",
  message: "",
};

const states = ["WA", "NSW", "VIC", "QLD", "SA", "TAS", "NT", "ACT"];

const signTypes = [
  "Indoor advertising lightbox",
  "Outdoor advertising lightbox",
  "Service station fuel price display",
  "Shopfront lightbox",
  "Not sure yet",
];

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CONTACT_REQUIRED_ERROR = "Enter an email or phone number.";
const SUBMIT_FAILURE_MESSAGE =
  "We could not send your quote request just now. Please try again in a moment, or use another contact option on the website.";
const PREVIEW_QUOTE_DRAFT_KEY = "lightboxPreviewQuoteDraft";
const PREVIEW_IMAGE_DATA_URL_REGEX =
  /^data:image\/(?:jpeg|jpg|png|webp);base64,/i;

const contactLinks = [
  contactPhone
    ? {
        label: "Call",
        value: contactPhone,
        href: phoneHref(contactPhone),
      }
    : null,
  contactEmail
    ? {
        label: "Email",
        value: contactEmail,
        href: emailHref(contactEmail),
      }
    : null,
].filter(Boolean) as Array<{ label: string; value: string; href: string }>;

const focusableErrorFields: Array<keyof FormFields> = [
  "fullName",
  "email",
  "phone",
  "signType",
];

const fieldLabels: Record<keyof FormFields, string> = {
  fullName: "Full name",
  businessName: "Business name",
  suburb: "Suburb",
  state: "State",
  email: "Email",
  phone: "Phone",
  signType: "Sign type",
  dimensions: "Approx. dimensions",
  message: "Message",
};

function validate(fields: FormFields): FormErrors {
  const errors: FormErrors = {};
  if (!fields.fullName.trim()) errors.fullName = "Full name is required.";
  if (!fields.signType) errors.signType = "Sign type is required.";

  const hasEmail = Boolean(fields.email.trim());
  const hasPhone = Boolean(fields.phone.trim());

  if (!hasEmail && !hasPhone) {
    errors.email = CONTACT_REQUIRED_ERROR;
    errors.phone = CONTACT_REQUIRED_ERROR;
  } else if (hasEmail && !EMAIL_REGEX.test(fields.email.trim())) {
    errors.email = "Please enter a valid email address.";
  }

  return errors;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readDraftString(payload: Record<string, unknown>, key: string) {
  const value = payload[key];
  if (typeof value === "string") return value.trim();
  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }

  return "";
}

function formatDraftDimensions(payload: Record<string, unknown>) {
  const width =
    readDraftString(payload, "width") || readDraftString(payload, "widthMm");
  const height =
    readDraftString(payload, "height") || readDraftString(payload, "heightMm");
  const unit =
    readDraftString(payload, "unit") ||
    (readDraftString(payload, "widthMm") || readDraftString(payload, "heightMm")
      ? "mm"
      : "");

  if (!width || !height) return "";

  return `${width} x ${height}${unit ? ` ${unit}` : ""}`;
}

function readPreviewImageDataUrl(payload: Record<string, unknown>) {
  const dataUrl =
    readDraftString(payload, "previewImageDataUrl") ||
    readDraftString(payload, "previewThumbnail");

  if (!PREVIEW_IMAGE_DATA_URL_REGEX.test(dataUrl)) return "";

  return dataUrl.length <= 650_000 ? dataUrl : "";
}

function readPreviewQuoteDraft(): PreviewQuoteDraft {
  if (typeof window === "undefined") return {};

  try {
    const raw = window.sessionStorage.getItem(PREVIEW_QUOTE_DRAFT_KEY);
    const trimmed = raw?.trim();
    if (!trimmed) return {};

    const parsed: unknown = JSON.parse(trimmed);

    if (typeof parsed === "string") {
      return parsed.trim() ? { message: parsed.trim() } : {};
    }

    if (!isRecord(parsed)) return {};

    const dimensions =
      readDraftString(parsed, "dimensions") ||
      readDraftString(parsed, "size") ||
      formatDraftDimensions(parsed);
    const message =
      readDraftString(parsed, "message") ||
      readDraftString(parsed, "designSummary") ||
      readDraftString(parsed, "summary");
    const previewSummary =
      readDraftString(parsed, "previewSummary") ||
      readDraftString(parsed, "designSummary") ||
      readDraftString(parsed, "summary") ||
      message;
    const previewImageDataUrl = readPreviewImageDataUrl(parsed);

    return {
      ...(dimensions ? { dimensions } : {}),
      ...(message ? { message } : {}),
      ...(previewSummary ? { previewSummary } : {}),
      ...(previewImageDataUrl ? { previewImageDataUrl } : {}),
    };
  } catch {
    try {
      const raw = window.sessionStorage.getItem(PREVIEW_QUOTE_DRAFT_KEY);
      const message = raw?.trim();
      return message ? { message } : {};
    } catch {
      return {};
    }
  }
}

function getErrorId(field: keyof FormFields) {
  return `${field}-error`;
}

function getErrorSummaryItems(errors: FormErrors) {
  const items: Array<{
    field: keyof FormFields;
    label: string;
    message: string;
  }> = [];

  if (errors.fullName) {
    items.push({
      field: "fullName",
      label: fieldLabels.fullName,
      message: errors.fullName,
    });
  }

  if (
    errors.email === CONTACT_REQUIRED_ERROR &&
    errors.phone === CONTACT_REQUIRED_ERROR
  ) {
    items.push({
      field: "email",
      label: "Email or phone",
      message: CONTACT_REQUIRED_ERROR,
    });
  } else {
    if (errors.email) {
      items.push({
        field: "email",
        label: fieldLabels.email,
        message: errors.email,
      });
    }

    if (errors.phone) {
      items.push({
        field: "phone",
        label: fieldLabels.phone,
        message: errors.phone,
      });
    }
  }

  if (errors.signType) {
    items.push({
      field: "signType",
      label: fieldLabels.signType,
      message: errors.signType,
    });
  }

  return items;
}

export default function QuoteForm() {
  const [fields, setFields] = useState<FormFields>(initialFields);
  const [errors, setErrors] = useState<FormErrors>({});
  const [previewDraft, setPreviewDraft] = useState<PreviewQuoteDraft>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const fieldRefs = useRef<
    Partial<Record<keyof FormFields, HTMLElement | null>>
  >({});

  useEffect(() => {
    const draft = readPreviewQuoteDraft();
    if (!draft.dimensions && !draft.message && !draft.previewImageDataUrl) {
      return;
    }

    setFields((prev) => ({
      ...prev,
      dimensions: prev.dimensions || draft.dimensions || "",
      message: prev.message || draft.message || "",
    }));
    setPreviewDraft(draft);
  }, []);

  function registerField(field: keyof FormFields) {
    return (element: HTMLElement | null) => {
      fieldRefs.current[field] = element;
    };
  }

  function focusFirstError(validationErrors: FormErrors) {
    const firstField = focusableErrorFields.find(
      (field) => validationErrors[field],
    );

    if (!firstField) return;

    requestAnimationFrame(() => {
      fieldRefs.current[firstField]?.focus();
    });
  }

  function describedBy(field: keyof FormFields, extraIds: string[] = []) {
    const ids = [...extraIds];
    if (errors[field]) ids.push(getErrorId(field));

    return ids.length > 0 ? ids.join(" ") : undefined;
  }

  function renderError(field: keyof FormFields) {
    const error = errors[field];
    if (!error) return null;

    return (
      <p id={getErrorId(field)} className={errorClass}>
        {error}
      </p>
    );
  }

  function handleChange(
    event: ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) {
    const { name, value } = event.target;
    setFields((prev) => ({ ...prev, [name]: value }));
    if (submitError) setSubmitError("");

    const fieldName = name as keyof FormFields;
    if (errors[fieldName]) {
      setErrors((prev) => {
        const next = { ...prev, [fieldName]: undefined };

        if (
          (fieldName === "email" || fieldName === "phone") &&
          (prev.email === CONTACT_REQUIRED_ERROR ||
            prev.phone === CONTACT_REQUIRED_ERROR)
        ) {
          next.email = undefined;
          next.phone = undefined;
        }

        return next;
      });
    }
  }

  async function handleSubmit(event: { preventDefault: () => void }) {
    event.preventDefault();
    const validationErrors = validate(fields);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      focusFirstError(validationErrors);
      return;
    }

    setSubmitting(true);
    setSubmitError("");

    try {
      const response = await fetch("/api/quote", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...fields,
          pageUrl: window.location.href,
          previewSummary: previewDraft.previewSummary || "",
          _gotcha: honeypot,
        }),
      });
      const result = (await response.json()) as QuoteSubmitResult;

      if (result.ok) {
        setSubmitted(true);
        setFields(initialFields);
        setErrors({});
        setHoneypot("");
      } else {
        setSubmitError(SUBMIT_FAILURE_MESSAGE);
      }
    } catch {
      setSubmitError(SUBMIT_FAILURE_MESSAGE);
    } finally {
      setSubmitting(false);
    }
  }

  const inputClass =
    "w-full rounded-lg border border-black/10 bg-white px-4 py-3 text-sm text-stone-950 shadow-[0_1px_1px_rgba(0,0,0,0.04)_inset] transition-[border-color,box-shadow] placeholder:text-stone-400 focus:border-amber-500 focus:outline-none focus:ring-4 focus:ring-amber-500/15";
  const labelClass = "mb-2 block text-sm font-semibold text-stone-800";
  const errorClass = "mt-1 text-sm text-red-700";
  const optionalLabelClass = "font-normal text-stone-500";
  const errorSummaryItems = getErrorSummaryItems(errors);

  if (submitted) {
    return (
      <output
        aria-live="polite"
        className="rounded-lg bg-teal-50 p-6 text-center shadow-[0_0_0_1px_rgba(15,118,110,0.18),0_12px_32px_rgba(15,118,110,0.12)]"
      >
        <span className="block text-lg font-semibold text-teal-900">
          Thank you. We will reply within one business day.
        </span>
        <span className="mt-2 block text-sm leading-6 text-teal-800">
          Photos or artwork can follow if they help the scope.
        </span>
      </output>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <input
        name="_gotcha"
        style={{ display: "none" }}
        tabIndex={-1}
        autoComplete="off"
        value={honeypot}
        onChange={(event) => setHoneypot(event.target.value)}
      />

      <div className="rounded-lg bg-stone-50 p-4 text-sm leading-6 text-stone-600 shadow-[0_0_0_1px_rgba(0,0,0,0.06)]">
        <p className="font-semibold text-stone-950">What happens next</p>
        <p className="mt-1 text-pretty">
          Share what you know now. We will reply with the cleanest next step.
        </p>
        {contactLinks.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {contactLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="inline-flex min-h-10 items-center rounded-lg bg-white px-3 py-2 text-sm font-bold text-teal-800 shadow-[0_0_0_1px_rgba(15,118,110,0.16)] transition-[background-color,scale] hover:bg-teal-50 active:scale-[0.96]"
              >
                {link.label}: {link.value}
              </a>
            ))}
          </div>
        )}
      </div>

      {(previewDraft.previewSummary || previewDraft.previewImageDataUrl) && (
        <section
          aria-label="Preview design notes"
          className={`grid gap-4 rounded-lg bg-amber-50 p-4 shadow-[0_0_0_1px_rgba(180,83,9,0.16)] ${
            previewDraft.previewImageDataUrl ? "sm:grid-cols-[9rem_1fr]" : ""
          }`}
        >
          {previewDraft.previewImageDataUrl && (
            <img
              src={previewDraft.previewImageDataUrl}
              alt="Lightbox preview generated in the preview tool"
              className="aspect-[4/3] w-full rounded-md object-cover outline outline-1 -outline-offset-1 outline-black/10"
            />
          )}
          <div>
            <p className="text-sm font-semibold text-stone-950">
              Preview notes added
            </p>
            {previewDraft.dimensions && (
              <p className="mt-1 font-mono text-xs font-semibold uppercase tracking-[0.14em] text-amber-800">
                {previewDraft.dimensions}
              </p>
            )}
            {previewDraft.previewSummary && (
              <p className="mt-2 whitespace-pre-line text-pretty text-xs leading-6 text-stone-600">
                {previewDraft.previewSummary}
              </p>
            )}
          </div>
        </section>
      )}

      {errorSummaryItems.length > 0 && (
        <div
          role="alert"
          aria-labelledby="quote-error-summary-title"
          className="rounded-lg bg-red-50 p-4 text-sm text-red-800 shadow-[0_0_0_1px_rgba(185,28,28,0.14)]"
        >
          <p id="quote-error-summary-title" className="font-semibold">
            Please fix the highlighted fields.
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {errorSummaryItems.map((item) => (
              <li key={item.field}>
                <a
                  href={`#${item.field}`}
                  className="font-semibold underline decoration-red-500/60 underline-offset-2"
                  onClick={(event) => {
                    event.preventDefault();
                    fieldRefs.current[item.field]?.focus();
                  }}
                >
                  {item.label}
                </a>
                : {item.message}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="fullName" className={labelClass}>
            Full name <span className="text-red-700">*</span>
          </label>
          <input
            id="fullName"
            name="fullName"
            type="text"
            value={fields.fullName}
            onChange={handleChange}
            className={inputClass}
            autoComplete="name"
            ref={registerField("fullName")}
            aria-invalid={Boolean(errors.fullName)}
            aria-describedby={describedBy("fullName")}
          />
          {renderError("fullName")}
        </div>
        <div>
          <label htmlFor="businessName" className={labelClass}>
            Business name{" "}
            <span className={optionalLabelClass}>(recommended)</span>
          </label>
          <input
            id="businessName"
            name="businessName"
            type="text"
            value={fields.businessName}
            onChange={handleChange}
            className={inputClass}
            autoComplete="organization"
          />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="suburb" className={labelClass}>
            Suburb <span className={optionalLabelClass}>(recommended)</span>
          </label>
          <input
            id="suburb"
            name="suburb"
            type="text"
            value={fields.suburb}
            onChange={handleChange}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="state" className={labelClass}>
            State <span className={optionalLabelClass}>(recommended)</span>
          </label>
          <select
            id="state"
            name="state"
            value={fields.state}
            onChange={handleChange}
            className={inputClass}
          >
            <option value="">Select state</option>
            {states.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>
        </div>
      </div>

      <fieldset className="space-y-3">
        <legend className="text-sm font-semibold text-stone-800">
          Contact details <span className="text-red-700">*</span>
        </legend>
        <p id="contact-help" className="text-sm text-stone-600">
          Email or phone is enough.
        </p>
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="email" className={labelClass}>
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={fields.email}
              onChange={handleChange}
              className={inputClass}
              autoComplete="email"
              ref={registerField("email")}
              aria-invalid={Boolean(errors.email)}
              aria-describedby={describedBy("email", ["contact-help"])}
            />
            {renderError("email")}
          </div>
          <div>
            <label htmlFor="phone" className={labelClass}>
              Phone
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              value={fields.phone}
              onChange={handleChange}
              className={inputClass}
              autoComplete="tel"
              ref={registerField("phone")}
              aria-invalid={Boolean(errors.phone)}
              aria-describedby={describedBy("phone", ["contact-help"])}
            />
            {renderError("phone")}
          </div>
        </div>
      </fieldset>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="signType" className={labelClass}>
            Sign type <span className="text-red-700">*</span>
          </label>
          <select
            id="signType"
            name="signType"
            value={fields.signType}
            onChange={handleChange}
            className={inputClass}
            ref={registerField("signType")}
            aria-invalid={Boolean(errors.signType)}
            aria-describedby={describedBy("signType")}
          >
            <option value="">Select sign type</option>
            {signTypes.map((signType) => (
              <option key={signType} value={signType}>
                {signType}
              </option>
            ))}
          </select>
          {renderError("signType")}
        </div>
        <div>
          <label htmlFor="dimensions" className={labelClass}>
            Approx. dimensions{" "}
            <span className={optionalLabelClass}>(recommended)</span>
          </label>
          <input
            id="dimensions"
            name="dimensions"
            type="text"
            value={fields.dimensions}
            onChange={handleChange}
            className={inputClass}
            placeholder="Example: 2400 x 600 mm"
          />
        </div>
      </div>

      <div>
        <label htmlFor="message" className={labelClass}>
          Message <span className={optionalLabelClass}>(optional)</span>
        </label>
        <textarea
          id="message"
          name="message"
          rows={4}
          value={fields.message}
          onChange={handleChange}
          className={inputClass}
          placeholder="Size, sign position, power, approvals, timing, files ready to send."
        />
      </div>

      {submitError && (
        <div role="alert" className="space-y-3 text-sm text-red-700">
          <p>{submitError}</p>
          {contactLinks.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {contactLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="inline-flex min-h-10 items-center rounded-lg bg-red-50 px-3 py-2 font-bold text-red-800 shadow-[0_0_0_1px_rgba(185,28,28,0.16)] transition-[background-color,scale] hover:bg-red-100 active:scale-[0.96]"
                >
                  {link.label}: {link.value}
                </a>
              ))}
            </div>
          )}
        </div>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-amber-500 px-6 py-3 text-sm font-bold text-stone-950 shadow-[0_1px_2px_rgba(0,0,0,0.08),0_16px_36px_rgba(242,163,58,0.28)] transition-[background-color,scale,box-shadow] hover:bg-amber-400 active:scale-[0.96] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
      >
        {submitting ? "Sending..." : "Request a lightbox quote"}
      </button>
    </form>
  );
}
