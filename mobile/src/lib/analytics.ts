import { AppEnvironment, ClientEnvResult, readClientEnv } from "@/lib/env";

export const analyticsEventNames = [
  "plan_submitted",
  "recommendations_loaded",
] as const;

export type AnalyticsEventName = (typeof analyticsEventNames)[number];
export type AnalyticsPrimitive = string | number | boolean | null;
export type AnalyticsProperties = Record<
  string,
  AnalyticsPrimitive | undefined
>;

export type AnalyticsEvent = {
  name: AnalyticsEventName;
  appEnv: Exclude<AppEnvironment, "production">;
  properties: Record<string, AnalyticsPrimitive>;
};

export type AnalyticsProvider = {
  track: (event: AnalyticsEvent) => void;
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
  "profile",
  "secret",
  "token",
];

let analyticsProvider: AnalyticsProvider = createConsoleAnalyticsProvider();

export function trackAnalyticsEvent(
  name: AnalyticsEventName,
  properties: AnalyticsProperties = {},
  envResult: ClientEnvResult = readClientEnv(),
) {
  if (!envResult.ok || envResult.value.appEnv === "production") {
    return;
  }

  analyticsProvider.track({
    name,
    appEnv: envResult.value.appEnv,
    properties: sanitizeAnalyticsProperties(properties),
  });
}

export function sanitizeAnalyticsProperties(
  properties: AnalyticsProperties,
): Record<string, AnalyticsPrimitive> {
  return Object.entries(properties).reduce<Record<string, AnalyticsPrimitive>>(
    (sanitized, [key, value]) => {
      if (value === undefined || isSensitiveAnalyticsKey(key)) {
        return sanitized;
      }

      sanitized[key] = sanitizeAnalyticsValue(value);
      return sanitized;
    },
    {},
  );
}

export function createConsoleAnalyticsProvider(): AnalyticsProvider {
  return {
    track(event) {
      console.info("[analytics]", event.name, {
        appEnv: event.appEnv,
        ...event.properties,
      });
    },
  };
}

export function setAnalyticsProviderForTests(provider: AnalyticsProvider) {
  analyticsProvider = provider;
}

export function resetAnalyticsProviderForTests() {
  analyticsProvider = createConsoleAnalyticsProvider();
}

function isSensitiveAnalyticsKey(key: string): boolean {
  const normalizedKey = key.toLocaleLowerCase();

  return sensitiveKeyPatterns.some((pattern) =>
    normalizedKey.includes(pattern),
  );
}

function sanitizeAnalyticsValue(value: AnalyticsPrimitive): AnalyticsPrimitive {
  if (typeof value !== "string") {
    return value;
  }

  return value.trim().slice(0, 80);
}
