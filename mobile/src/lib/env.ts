export const appEnvironments = ["local", "staging", "production"] as const;
export const placeDataSources = ["fixtures", "supabase"] as const;

export type AppEnvironment = (typeof appEnvironments)[number];
export type PlaceDataSource = (typeof placeDataSources)[number];

export type ClientEnv = {
  appEnv: AppEnvironment;
  placeDataSource: PlaceDataSource;
  supabase?: {
    url: string;
    anonKey: string;
  };
};

export type ClientEnvIssue = {
  name:
    | "EXPO_PUBLIC_APP_ENV"
    | "EXPO_PUBLIC_PLACE_DATA_SOURCE"
    | "EXPO_PUBLIC_SUPABASE_URL"
    | "EXPO_PUBLIC_SUPABASE_ANON_KEY";
  reason: "missing" | "invalid";
};

export type ClientEnvResult =
  { ok: true; value: ClientEnv } | { ok: false; issues: ClientEnvIssue[] };

type ClientEnvSource = {
  EXPO_PUBLIC_APP_ENV?: string;
  EXPO_PUBLIC_PLACE_DATA_SOURCE?: string;
  EXPO_PUBLIC_SUPABASE_URL?: string;
  EXPO_PUBLIC_SUPABASE_ANON_KEY?: string;
};

export function parseClientEnv(env: ClientEnvSource): ClientEnvResult {
  const appEnv = env.EXPO_PUBLIC_APP_ENV?.trim();
  const placeDataSource =
    env.EXPO_PUBLIC_PLACE_DATA_SOURCE?.trim() || "fixtures";
  const parsedPlaceDataSource = isPlaceDataSource(placeDataSource)
    ? placeDataSource
    : undefined;
  const supabaseUrl = env.EXPO_PUBLIC_SUPABASE_URL?.trim();
  const supabaseAnonKey = env.EXPO_PUBLIC_SUPABASE_ANON_KEY?.trim();
  const issues: ClientEnvIssue[] = [];

  if (!appEnv) {
    issues.push({ name: "EXPO_PUBLIC_APP_ENV", reason: "missing" });
  } else if (!isAppEnvironment(appEnv)) {
    issues.push({ name: "EXPO_PUBLIC_APP_ENV", reason: "invalid" });
  }

  if (parsedPlaceDataSource === undefined) {
    issues.push({
      name: "EXPO_PUBLIC_PLACE_DATA_SOURCE",
      reason: "invalid",
    });
  }

  if (parsedPlaceDataSource === "supabase") {
    if (!supabaseUrl) {
      issues.push({ name: "EXPO_PUBLIC_SUPABASE_URL", reason: "missing" });
    } else if (!isHttpUrl(supabaseUrl)) {
      issues.push({ name: "EXPO_PUBLIC_SUPABASE_URL", reason: "invalid" });
    }

    if (!supabaseAnonKey) {
      issues.push({
        name: "EXPO_PUBLIC_SUPABASE_ANON_KEY",
        reason: "missing",
      });
    }
  } else if (
    parsedPlaceDataSource !== undefined &&
    (supabaseUrl || supabaseAnonKey)
  ) {
    if (!supabaseUrl) {
      issues.push({ name: "EXPO_PUBLIC_SUPABASE_URL", reason: "missing" });
    } else if (!isHttpUrl(supabaseUrl)) {
      issues.push({ name: "EXPO_PUBLIC_SUPABASE_URL", reason: "invalid" });
    }

    if (!supabaseAnonKey) {
      issues.push({
        name: "EXPO_PUBLIC_SUPABASE_ANON_KEY",
        reason: "missing",
      });
    }
  }

  if (
    issues.length > 0 ||
    !appEnv ||
    !isAppEnvironment(appEnv) ||
    parsedPlaceDataSource === undefined
  ) {
    return { ok: false, issues };
  }

  return {
    ok: true,
    value: {
      appEnv,
      placeDataSource: parsedPlaceDataSource,
      supabase:
        supabaseUrl && supabaseAnonKey
          ? { url: supabaseUrl, anonKey: supabaseAnonKey }
          : undefined,
    },
  };
}

export function readClientEnv(): ClientEnvResult {
  return parseClientEnv({
    EXPO_PUBLIC_APP_ENV: process.env.EXPO_PUBLIC_APP_ENV,
    EXPO_PUBLIC_PLACE_DATA_SOURCE: process.env.EXPO_PUBLIC_PLACE_DATA_SOURCE,
    EXPO_PUBLIC_SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL,
    EXPO_PUBLIC_SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
  });
}

function isAppEnvironment(value: string): value is AppEnvironment {
  return appEnvironments.includes(value as AppEnvironment);
}

function isPlaceDataSource(value: string): value is PlaceDataSource {
  return placeDataSources.includes(value as PlaceDataSource);
}

function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}
