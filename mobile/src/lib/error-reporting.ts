import { AppEnvironment, ClientEnvResult, readClientEnv } from "@/lib/env";

export type ErrorReportLevel = "warning" | "error";
export type ErrorReportPrimitive = string | number | boolean | null;
export type ErrorReportContext = Record<
  string,
  ErrorReportPrimitive | undefined
>;

export type ErrorReport = {
  level: ErrorReportLevel;
  appEnv: Exclude<AppEnvironment, "production">;
  message: string;
  errorName?: string;
  context: Record<string, ErrorReportPrimitive>;
};

export type ErrorReporterProvider = {
  capture: (report: ErrorReport) => void;
};

const sensitiveKeyPatterns = [
  "address",
  "age",
  "anon",
  "area",
  "birth",
  "child",
  "coordinate",
  "dob",
  "exact",
  "family",
  "home",
  "latitude",
  "longitude",
  "medical",
  "password",
  "profile",
  "secret",
  "token",
];

let errorReporterProvider: ErrorReporterProvider =
  createConsoleErrorReporterProvider();
let scopedContext: Record<string, ErrorReportPrimitive> = {};

export function captureException(
  error: unknown,
  options: {
    context?: ErrorReportContext;
    level?: ErrorReportLevel;
    message?: string;
  } = {},
  envResult: ClientEnvResult = readClientEnv(),
) {
  if (!envResult.ok || envResult.value.appEnv === "production") {
    return;
  }

  errorReporterProvider.capture({
    appEnv: envResult.value.appEnv,
    context: {
      ...scopedContext,
      ...sanitizeErrorContext(options.context ?? {}),
    },
    errorName: getErrorName(error),
    level: options.level ?? "error",
    message: sanitizeErrorMessage(options.message ?? getErrorMessage(error)),
  });
}

export function captureMessage(
  message: string,
  context: ErrorReportContext = {},
  envResult: ClientEnvResult = readClientEnv(),
) {
  if (!envResult.ok || envResult.value.appEnv === "production") {
    return;
  }

  errorReporterProvider.capture({
    appEnv: envResult.value.appEnv,
    context: {
      ...scopedContext,
      ...sanitizeErrorContext(context),
    },
    level: "warning",
    message: sanitizeErrorMessage(message),
  });
}

export function setErrorContext(context: ErrorReportContext) {
  scopedContext = sanitizeErrorContext(context);
}

export function clearErrorContext() {
  scopedContext = {};
}

export function sanitizeErrorContext(
  context: ErrorReportContext,
): Record<string, ErrorReportPrimitive> {
  return Object.entries(context).reduce<Record<string, ErrorReportPrimitive>>(
    (sanitized, [key, value]) => {
      if (value === undefined || isSensitiveErrorKey(key)) {
        return sanitized;
      }

      sanitized[key] = sanitizeErrorValue(value);
      return sanitized;
    },
    {},
  );
}

export function sanitizeErrorMessage(message: string): string {
  return message
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[redacted-email]")
    .replace(/-?\d{1,3}\.\d{4,}/g, "[redacted-number]")
    .replace(
      /\b(token|secret|password|anonKey|serviceRole)\s*[:=]\s*[^\s,;]+/gi,
      "$1=[redacted]",
    )
    .trim()
    .slice(0, 160);
}

export function createConsoleErrorReporterProvider(): ErrorReporterProvider {
  return {
    capture(report) {
      console.warn("[error-report]", report.message, {
        appEnv: report.appEnv,
        errorName: report.errorName,
        level: report.level,
        ...report.context,
      });
    },
  };
}

export function setErrorReporterProviderForTests(
  provider: ErrorReporterProvider,
) {
  errorReporterProvider = provider;
}

export function resetErrorReporterForTests() {
  errorReporterProvider = createConsoleErrorReporterProvider();
  clearErrorContext();
}

function isSensitiveErrorKey(key: string): boolean {
  const normalizedKey = key.toLocaleLowerCase();

  return sensitiveKeyPatterns.some((pattern) =>
    normalizedKey.includes(pattern),
  );
}

function sanitizeErrorValue(value: ErrorReportPrimitive): ErrorReportPrimitive {
  if (typeof value !== "string") {
    return value;
  }

  return sanitizeErrorMessage(value).slice(0, 80);
}

function getErrorName(error: unknown): string | undefined {
  return error instanceof Error ? error.name : undefined;
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Unknown error";
}
