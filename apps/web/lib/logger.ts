import pino from "pino";

/** Structured JSON logs (PRD 13.1). Never log PII: phone numbers, ID numbers, DOB. */
export const logger = pino({
  level: process.env.LOG_LEVEL ?? "info",
  base: { service: "sgela-web" },
  redact: {
    paths: [
      "phone",
      "phoneE164",
      "*.phone",
      "*.phoneE164",
      "idNumber",
      "*.idNumber",
      "dateOfBirth",
      "*.dateOfBirth",
    ],
    censor: "[redacted]",
  },
});

export function requestLogger(requestId: string) {
  return logger.child({ requestId });
}
