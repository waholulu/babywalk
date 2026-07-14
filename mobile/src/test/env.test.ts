import { parseClientEnv } from "@/lib/env";

describe("client environment validation", () => {
  it("accepts a valid app environment", () => {
    expect(parseClientEnv({ EXPO_PUBLIC_APP_ENV: "local" })).toEqual({
      ok: true,
      value: { appEnv: "local", placeDataSource: "fixtures" },
    });
  });

  it("accepts Supabase public configuration when Supabase data is selected", () => {
    expect(
      parseClientEnv({
        EXPO_PUBLIC_APP_ENV: "local",
        EXPO_PUBLIC_PLACE_DATA_SOURCE: "supabase",
        EXPO_PUBLIC_SUPABASE_URL: "http://127.0.0.1:54321",
        EXPO_PUBLIC_SUPABASE_ANON_KEY: "publishable-anon-key",
      }),
    ).toEqual({
      ok: true,
      value: {
        appEnv: "local",
        placeDataSource: "supabase",
        supabase: {
          url: "http://127.0.0.1:54321",
          anonKey: "publishable-anon-key",
        },
      },
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

  it("requires Supabase public values only for Supabase data", () => {
    expect(
      parseClientEnv({
        EXPO_PUBLIC_APP_ENV: "local",
        EXPO_PUBLIC_PLACE_DATA_SOURCE: "supabase",
      }),
    ).toEqual({
      ok: false,
      issues: [
        { name: "EXPO_PUBLIC_SUPABASE_URL", reason: "missing" },
        { name: "EXPO_PUBLIC_SUPABASE_ANON_KEY", reason: "missing" },
      ],
    });
  });

  it("accepts optional Supabase public configuration in fixture mode", () => {
    expect(
      parseClientEnv({
        EXPO_PUBLIC_APP_ENV: "local",
        EXPO_PUBLIC_PLACE_DATA_SOURCE: "fixtures",
        EXPO_PUBLIC_SUPABASE_URL: "http://127.0.0.1:54321",
        EXPO_PUBLIC_SUPABASE_ANON_KEY: "publishable-anon-key",
      }),
    ).toEqual({
      ok: true,
      value: {
        appEnv: "local",
        placeDataSource: "fixtures",
        supabase: {
          url: "http://127.0.0.1:54321",
          anonKey: "publishable-anon-key",
        },
      },
    });
  });

  it("requires optional Supabase public configuration to be complete", () => {
    expect(
      parseClientEnv({
        EXPO_PUBLIC_APP_ENV: "local",
        EXPO_PUBLIC_SUPABASE_URL: "http://127.0.0.1:54321",
      }),
    ).toEqual({
      ok: false,
      issues: [{ name: "EXPO_PUBLIC_SUPABASE_ANON_KEY", reason: "missing" }],
    });
  });

  it("reports invalid data source and URL values without exposing raw values", () => {
    const result = parseClientEnv({
      EXPO_PUBLIC_APP_ENV: "local",
      EXPO_PUBLIC_PLACE_DATA_SOURCE: "database-secret-ish",
      EXPO_PUBLIC_SUPABASE_URL: "not-a-url-secret-ish",
    });

    expect(result).toEqual({
      ok: false,
      issues: [{ name: "EXPO_PUBLIC_PLACE_DATA_SOURCE", reason: "invalid" }],
    });
    expect(JSON.stringify(result)).not.toContain("secret-ish");
  });
});
