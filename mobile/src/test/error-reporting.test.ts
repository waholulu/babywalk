import {
  ErrorReport,
  captureException,
  captureMessage,
  clearErrorContext,
  resetErrorReporterForTests,
  sanitizeErrorContext,
  sanitizeErrorMessage,
  setErrorContext,
  setErrorReporterProviderForTests,
} from "@/lib/error-reporting";

const localEnv = {
  ok: true,
  value: { appEnv: "local", placeDataSource: "fixtures" },
} as const;

const productionEnv = {
  ok: true,
  value: { appEnv: "production", placeDataSource: "fixtures" },
} as const;

describe("error reporting wrapper", () => {
  afterEach(() => {
    resetErrorReporterForTests();
  });

  it("drops sensitive context keys and preserves safe primitives", () => {
    expect(
      sanitizeErrorContext({
        childAgeMonths: 24,
        preciseLatitude: 40.717812,
        homeAddress: "123 Main St",
        supabaseAnonKey: "secret",
        route: "results",
        retryable: true,
      }),
    ).toEqual({
      retryable: true,
      route: "results",
    });
  });

  it("redacts sensitive free-text patterns", () => {
    expect(
      sanitizeErrorMessage(
        "Failed for parent@example.com token=abc123 near 40.717812,-74.043143",
      ),
    ).toBe(
      "Failed for [redacted-email] token=[redacted] near [redacted-number],[redacted-number]",
    );
  });

  it("uses a replaceable provider for sanitized local exceptions", () => {
    const reports: ErrorReport[] = [];
    setErrorReporterProviderForTests({
      capture(report) {
        reports.push(report);
      },
    });

    captureException(
      new Error("Weather failed token=abc123"),
      {
        context: {
          childName: "A",
          feature: "recommendations",
        },
      },
      localEnv,
    );

    expect(reports).toEqual([
      {
        appEnv: "local",
        context: { feature: "recommendations" },
        errorName: "Error",
        level: "error",
        message: "Weather failed token=[redacted]",
      },
    ]);
  });

  it("merges scoped context without leaking sensitive fields", () => {
    const reports: ErrorReport[] = [];
    setErrorReporterProviderForTests({
      capture(report) {
        reports.push(report);
      },
    });
    setErrorContext({
      app_section: "results",
      exactHomeLocation: "40.7,-74.0",
    });

    captureMessage("Soft failure", { action: "retry" }, localEnv);
    clearErrorContext();

    expect(reports).toEqual([
      {
        appEnv: "local",
        context: { action: "retry", app_section: "results" },
        level: "warning",
        message: "Soft failure",
      },
    ]);
  });

  it("does not emit through the production default path", () => {
    const reports: ErrorReport[] = [];
    setErrorReporterProviderForTests({
      capture(report) {
        reports.push(report);
      },
    });

    captureException(new Error("Production crash"), {}, productionEnv);

    expect(reports).toEqual([]);
  });
});
