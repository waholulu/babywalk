import { AppEnvironment } from "@/lib/env";

export function getEnvironmentBannerLabel(
  appEnv: AppEnvironment,
): "LOCAL" | "STAGING" | null {
  if (appEnv === "production") {
    return null;
  }

  return appEnv === "staging" ? "STAGING" : "LOCAL";
}
