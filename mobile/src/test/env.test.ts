import { parseClientEnv } from "@/lib/env";

describe("client environment validation", () => {
  it("accepts a valid app environment", () => {
    expect(parseClientEnv({ EXPO_PUBLIC_APP_ENV: "local" })).toEqual({
      ok: true,
      value: { appEnv: "local" },
    });
  });

  it("reports a missing app environment", () => {
    expect(parseClientEnv({})).toEqual({
      ok: false,
      issues: [{ name: "EXPO_PUBLIC_APP_ENV", reason: "missing" }],
    });
  });

  it("reports an invalid app environment without exposing the raw value", () => {
    const result = parseClientEnv({ EXPO_PUBLIC_APP_ENV: "secret-ish-value" });

    expect(result).toEqual({
      ok: false,
      issues: [{ name: "EXPO_PUBLIC_APP_ENV", reason: "invalid" }],
    });
    expect(JSON.stringify(result)).not.toContain("secret-ish-value");
  });
});
