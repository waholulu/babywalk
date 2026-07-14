export const appEnvironments = ["local", "staging", "production"] as const;

export type AppEnvironment = (typeof appEnvironments)[number];

export type ClientEnv = {
  appEnv: AppEnvironment;
};

export type ClientEnvIssue = {
  name: "EXPO_PUBLIC_APP_ENV";
  reason: "missing" | "invalid";
};

export type ClientEnvResult =
  { ok: true; value: ClientEnv } | { ok: false; issues: ClientEnvIssue[] };

type ClientEnvSource = {
  EXPO_PUBLIC_APP_ENV?: string;
};

export function parseClientEnv(env: ClientEnvSource): ClientEnvResult {
  const appEnv = env.EXPO_PUBLIC_APP_ENV?.trim();

  if (!appEnv) {
    return {
      ok: false,
      issues: [{ name: "EXPO_PUBLIC_APP_ENV", reason: "missing" }],
    };
  }

  if (!isAppEnvironment(appEnv)) {
    return {
      ok: false,
      issues: [{ name: "EXPO_PUBLIC_APP_ENV", reason: "invalid" }],
    };
  }

  return { ok: true, value: { appEnv } };
}

export function readClientEnv(): ClientEnvResult {
  return parseClientEnv({
    EXPO_PUBLIC_APP_ENV: process.env.EXPO_PUBLIC_APP_ENV,
  });
}

function isAppEnvironment(value: string): value is AppEnvironment {
  return appEnvironments.includes(value as AppEnvironment);
}
