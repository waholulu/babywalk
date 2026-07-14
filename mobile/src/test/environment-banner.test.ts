import { getEnvironmentBannerLabel } from "@/components/environment-banner-label";

describe("environment banner", () => {
  it("labels staging visibly", () => {
    expect(getEnvironmentBannerLabel("staging")).toBe("STAGING");
  });

  it("labels local visibly", () => {
    expect(getEnvironmentBannerLabel("local")).toBe("LOCAL");
  });

  it("does not label production", () => {
    expect(getEnvironmentBannerLabel("production")).toBeNull();
  });
});
