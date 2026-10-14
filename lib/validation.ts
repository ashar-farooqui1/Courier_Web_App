/**
 * Shared form validation for the whole portal.
 *
 * - `sanitize.*` runs in onChange and blocks characters a field can never hold
 *   (letters in a phone, digits in a person's name, a second "." in an amount…).
 * - `rules.*` build validators that run on submit and return an error message or null.
 * - `validateFields` applies a rule per field and returns only the failing fields.
 */

export type FieldErrors<T> = Partial<Record<keyof T, string>>;
export type Validator = (value: string) => string | null;

const NAME_CHARS = /[^\p{L}\s.'-]/gu;
const MAX_AMOUNT = 10_000_000;

export const sanitize = {
  /** Whole numbers only (quantity, OTP, account number). */
  digits(value: string, maxLength?: number): string {
    const digits = value.replace(/\D/g, "");
    return maxLength ? digits.slice(0, maxLength) : digits;
  },

  /** Positive decimal (amount, weight, percentage) — one dot, limited decimals. */
  decimal(value: string, maxDecimals = 2): string {
    let next = value.replace(/[^\d.]/g, "");
    const dot = next.indexOf(".");
    if (dot !== -1) {
      next = next.slice(0, dot + 1) + next.slice(dot + 1).replace(/\./g, "").slice(0, maxDecimals);
    }
    return next.slice(0, 12);
  },

  /** Phone: optional leading "+", then digits. */
  phone(value: string): string {
    const trimmed = value.trimStart();
    const plus = trimmed.startsWith("+") ? "+" : "";
    return plus + trimmed.replace(/\D/g, "").slice(0, plus ? 12 : 11);
  },

  /** CNIC: digits and dashes, e.g. 42201-1234567-1 or 4220112345671. */
  cnic(value: string): string {
    return value.replace(/[^\d-]/g, "").slice(0, 15);
  },

  /** NTN / STRN / GST style numbers: digits and dashes. */
  taxNumber(value: string): string {
    return value.replace(/[^\d-]/g, "").slice(0, 20);
  },

  /** Person or place name: letters, spaces, dot, apostrophe, hyphen. */
  name(value: string): string {
    return value.replace(NAME_CHARS, "").replace(/\s{2,}/g, " ").slice(0, 100);
  },

  /** Uppercase letters/digits/dash (short codes, vehicle numbers). */
  code(value: string, maxLength = 20): string {
    return value.toUpperCase().replace(/[^A-Z0-9-]/g, "").slice(0, maxLength);
  },

  /** Scanned / typed AWB numbers: letters, digits, dash, and comma/space separators. */
  awbList(value: string): string {
    return value.replace(/[^A-Za-z0-9,\s-]/g, "");
  },

  /** IBAN: uppercase letters and digits, max 24 (Pakistan). */
  iban(value: string): string {
    return value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 24);
  },
};

interface RuleOptions {
  required?: boolean;
}

function isBlank(value: string): boolean {
  return value.trim() === "";
}

/** Wraps a rule so an empty optional field passes and an empty required field fails. */
function optional(label: string, opts: RuleOptions | undefined, check: Validator): Validator {
  return (value) => {
    if (isBlank(value)) return opts?.required ? `${label} is required.` : null;
    return check(value.trim());
  };
}

export const rules = {
  required(label: string): Validator {
    return (value) => (isBlank(value) ? `${label} is required.` : null);
  },

  /** A selected id from a dropdown. */
  selected(label: string): Validator {
    return (value) =>
      isBlank(value) || value.trim() === "0" ? `Please select ${label.toLowerCase()}.` : null;
  },

  name(label: string, opts?: RuleOptions): Validator {
    return optional(label, opts, (value) => {
      if (/[^\p{L}\s.'-]/u.test(value)) return `${label} can only contain letters.`;
      if (value.length < 2) return `${label} must be at least 2 characters.`;
      if (value.length > 100) return `${label} must be 100 characters or less.`;
      return null;
    });
  },

  text(label: string, opts?: RuleOptions & { min?: number; max?: number }): Validator {
    const min = opts?.min ?? 2;
    const max = opts?.max ?? 100;
    return optional(label, opts, (value) => {
      if (value.length < min) return `${label} must be at least ${min} characters.`;
      if (value.length > max) return `${label} must be ${max} characters or less.`;
      if (!/[\p{L}\d]/u.test(value)) return `${label} must contain letters or numbers.`;
      return null;
    });
  },

  address(label: string, opts?: RuleOptions): Validator {
    return rules.text(label, { ...opts, min: 5, max: 250 });
  },

  email(label: string, opts?: RuleOptions): Validator {
    return optional(label, opts, (value) =>
      /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value) ? null : `Enter a valid ${label.toLowerCase()} (e.g. name@example.com).`
    );
  },

  /** Pakistani mobile: 03XXXXXXXXX or +923XXXXXXXXX. */
  mobile(label: string, opts?: RuleOptions): Validator {
    return optional(label, opts, (value) =>
      /^(03\d{9}|\+923\d{9})$/.test(value)
        ? null
        : `${label} must be a valid mobile number (e.g. 03001234567).`
    );
  },

  /** Mobile or landline: 03XXXXXXXXX, 021XXXXXXXX, +92XXXXXXXXXX. */
  phone(label: string, opts?: RuleOptions): Validator {
    return optional(label, opts, (value) =>
      /^(0\d{9,10}|\+92\d{10})$/.test(value)
        ? null
        : `${label} must be a valid phone number (e.g. 03001234567).`
    );
  },

  cnic(label: string, opts?: RuleOptions): Validator {
    return optional(label, opts, (value) =>
      /^\d{5}-?\d{7}-?\d$/.test(value)
        ? null
        : `${label} must be 13 digits (e.g. 42201-1234567-1).`
    );
  },

  ntn(label: string, opts?: RuleOptions): Validator {
    return optional(label, opts, (value) => {
      const digits = value.replace(/-/g, "");
      return /^\d+(-\d+)*$/.test(value) && digits.length >= 7 && digits.length <= 13
        ? null
        : `${label} must be 7 to 13 digits.`;
    });
  },

  iban(label: string, opts?: RuleOptions): Validator {
    return optional(label, opts, (value) =>
      /^PK\d{2}[A-Z]{4}[A-Z0-9]{16}$/.test(value)
        ? null
        : `${label} must be 24 characters starting with PK (e.g. PK36SCBL0000001123456702).`
    );
  },

  accountNumber(label: string, opts?: RuleOptions): Validator {
    return optional(label, opts, (value) =>
      /^\d{8,20}$/.test(value) ? null : `${label} must be 8 to 20 digits.`
    );
  },

  /** Money that must be more than zero (e.g. COD amount). */
  amount(label: string, opts?: RuleOptions & { allowZero?: boolean }): Validator {
    return optional(label, opts, (value) => {
      const n = Number(value);
      if (!Number.isFinite(n)) return `${label} must be a number.`;
      if (n < 0) return `${label} cannot be negative.`;
      if (n === 0 && !opts?.allowZero) return `${label} must be greater than 0.`;
      if (n > MAX_AMOUNT) return `${label} cannot be more than ${MAX_AMOUNT.toLocaleString()}.`;
      return null;
    });
  },

  /** Weight in kg, greater than zero. */
  weight(label: string, opts?: RuleOptions & { max?: number }): Validator {
    const max = opts?.max ?? 1000;
    return optional(label, opts, (value) => {
      const n = Number(value);
      if (!Number.isFinite(n) || n <= 0) return `${label} must be greater than 0.`;
      if (n > max) return `${label} cannot be more than ${max} kg.`;
      return null;
    });
  },

  integer(label: string, opts?: RuleOptions & { min?: number; max?: number }): Validator {
    const min = opts?.min ?? 1;
    const max = opts?.max ?? 10_000;
    return optional(label, opts, (value) => {
      const n = Number(value);
      if (!Number.isInteger(n)) return `${label} must be a whole number.`;
      if (n < min) return `${label} must be at least ${min}.`;
      if (n > max) return `${label} cannot be more than ${max}.`;
      return null;
    });
  },

  percentage(label: string, opts?: RuleOptions): Validator {
    return optional(label, opts, (value) => {
      const n = Number(value);
      if (!Number.isFinite(n) || n < 0) return `${label} must be a valid number.`;
      if (n > 100) return `${label} cannot be more than 100%.`;
      return null;
    });
  },

  /** Any non-negative number (prices, factors). */
  number(label: string, opts?: RuleOptions & { max?: number }): Validator {
    return optional(label, opts, (value) => {
      const n = Number(value);
      if (!Number.isFinite(n) || n < 0) return `${label} must be a valid number.`;
      if (opts?.max !== undefined && n > opts.max) return `${label} cannot be more than ${opts.max}.`;
      return null;
    });
  },

  code(label: string, opts?: RuleOptions & { min?: number; max?: number }): Validator {
    const min = opts?.min ?? 2;
    const max = opts?.max ?? 10;
    return optional(label, opts, (value) => {
      if (!/^[A-Z0-9-]+$/.test(value)) return `${label} can only contain letters and numbers.`;
      if (value.length < min || value.length > max) return `${label} must be ${min} to ${max} characters.`;
      return null;
    });
  },
};

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

/** Uploaded file must be an image (or PDF when allowed) of 5 MB or less. Empty is allowed. */
export function validateUploadFile(
  file: File | null,
  label: string,
  opts?: { allowPdf?: boolean }
): string | null {
  if (!file) return null;
  const isImage = file.type.startsWith("image/");
  const isPdf = file.type === "application/pdf";
  if (!isImage && !(opts?.allowPdf && isPdf)) {
    return `${label} must be an image${opts?.allowPdf ? " or PDF" : ""}.`;
  }
  if (file.size > MAX_UPLOAD_BYTES) return `${label} must be 5 MB or less.`;
  return null;
}

export type FieldRules<T> = Partial<Record<keyof T, Validator>>;

/** Runs each field's rule; returns only the fields that failed. */
export function validateFields<T extends object>(values: T, fieldRules: FieldRules<T>): FieldErrors<T> {
  const errors: FieldErrors<T> = {};
  for (const key of Object.keys(fieldRules) as (keyof T)[]) {
    const rule = fieldRules[key];
    if (!rule) continue;
    const raw = values[key];
    const message = rule(raw == null ? "" : String(raw));
    if (message) errors[key] = message;
  }
  return errors;
}

export function hasErrors<T>(errors: FieldErrors<T>): boolean {
  return Object.values(errors).some(Boolean);
}

export const FIX_FIELDS_MESSAGE = "Please fix the highlighted fields.";

/** Removes one field's error (call when the user edits that field). */
export function clearFieldError<T>(errors: FieldErrors<T>, field: keyof T): FieldErrors<T> {
  if (!errors[field]) return errors;
  const next = { ...errors };
  delete next[field];
  return next;
}
