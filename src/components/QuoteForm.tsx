import type { ChangeEvent } from "react";
import { useState } from "react";

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

const initialFields: FormFields = {
  fullName: "",
  businessName: "",
  suburb: "",
  state: "WA",
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

function validate(fields: FormFields): FormErrors {
  const errors: FormErrors = {};
  if (!fields.fullName.trim()) errors.fullName = "Full name is required.";
  if (!fields.businessName.trim())
    errors.businessName = "Business name is required.";
  if (!fields.suburb.trim()) errors.suburb = "Suburb is required.";
  if (!fields.state) errors.state = "State is required.";
  if (!fields.email.trim()) {
    errors.email = "Email is required.";
  } else if (!EMAIL_REGEX.test(fields.email)) {
    errors.email = "Please enter a valid email address.";
  }
  if (!fields.phone.trim()) errors.phone = "Phone number is required.";
  if (!fields.signType) errors.signType = "Sign type is required.";
  return errors;
}

export default function QuoteForm() {
  const [fields, setFields] = useState<FormFields>(initialFields);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [honeypot, setHoneypot] = useState("");

  function handleChange(
    event: ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) {
    const { name, value } = event.target;
    setFields((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormFields]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  }

  async function handleSubmit(event: { preventDefault: () => void }) {
    event.preventDefault();
    const validationErrors = validate(fields);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
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
          _gotcha: honeypot,
        }),
      });
      const result = (await response.json()) as QuoteSubmitResult;

      if (result.ok) {
        setSubmitted(true);
        setFields(initialFields);
        setErrors({});
      } else {
        setSubmitError(
          result.error ||
            (response.ok
              ? "Failed to send quote request."
              : "Something went wrong. Please try again."),
        );
      }
    } catch {
      setSubmitError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const inputClass =
    "w-full rounded-lg border border-black/10 bg-white px-4 py-3 text-sm text-stone-950 shadow-[0_1px_1px_rgba(0,0,0,0.04)_inset] transition-[border-color,box-shadow] placeholder:text-stone-400 focus:border-amber-500 focus:outline-none focus:ring-4 focus:ring-amber-500/15";
  const labelClass = "mb-2 block text-sm font-semibold text-stone-800";
  const errorClass = "mt-1 text-sm text-red-700";

  if (submitted) {
    return (
      <div className="rounded-lg bg-teal-50 p-6 text-center shadow-[0_0_0_1px_rgba(15,118,110,0.18),0_12px_32px_rgba(15,118,110,0.12)]">
        <p className="text-lg font-semibold text-teal-900">
          Thank you. We will be in touch within one business day.
        </p>
      </div>
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
          />
          {errors.fullName && <p className={errorClass}>{errors.fullName}</p>}
        </div>
        <div>
          <label htmlFor="businessName" className={labelClass}>
            Business name <span className="text-red-700">*</span>
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
          {errors.businessName && (
            <p className={errorClass}>{errors.businessName}</p>
          )}
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="suburb" className={labelClass}>
            Suburb <span className="text-red-700">*</span>
          </label>
          <input
            id="suburb"
            name="suburb"
            type="text"
            value={fields.suburb}
            onChange={handleChange}
            className={inputClass}
          />
          {errors.suburb && <p className={errorClass}>{errors.suburb}</p>}
        </div>
        <div>
          <label htmlFor="state" className={labelClass}>
            State <span className="text-red-700">*</span>
          </label>
          <select
            id="state"
            name="state"
            value={fields.state}
            onChange={handleChange}
            className={inputClass}
          >
            {states.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>
          {errors.state && <p className={errorClass}>{errors.state}</p>}
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="email" className={labelClass}>
            Email <span className="text-red-700">*</span>
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={fields.email}
            onChange={handleChange}
            className={inputClass}
            autoComplete="email"
          />
          {errors.email && <p className={errorClass}>{errors.email}</p>}
        </div>
        <div>
          <label htmlFor="phone" className={labelClass}>
            Phone <span className="text-red-700">*</span>
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            value={fields.phone}
            onChange={handleChange}
            className={inputClass}
            autoComplete="tel"
          />
          {errors.phone && <p className={errorClass}>{errors.phone}</p>}
        </div>
      </div>

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
          >
            <option value="">Select sign type</option>
            {signTypes.map((signType) => (
              <option key={signType} value={signType}>
                {signType}
              </option>
            ))}
          </select>
          {errors.signType && <p className={errorClass}>{errors.signType}</p>}
        </div>
        <div>
          <label htmlFor="dimensions" className={labelClass}>
            Approx. dimensions
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
          Message
        </label>
        <textarea
          id="message"
          name="message"
          rows={4}
          value={fields.message}
          onChange={handleChange}
          className={inputClass}
          placeholder="Tell us about the site, wall or pylon position, power access, and timing."
        />
      </div>

      {submitError && <p className="text-sm text-red-700">{submitError}</p>}

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
