import {
  defaultPlanInputValues,
  getPlanSubmitDestination,
  validatePlanInputValues,
} from "@/features/plan-input/plan-input-validation";

describe("validatePlanInputValues", () => {
  it("accepts the default plan inputs", () => {
    expect(validatePlanInputValues(defaultPlanInputValues)).toEqual({});
  });

  it("validates required numeric and area fields", () => {
    expect(
      validatePlanInputValues({
        ...defaultPlanInputValues,
        childAgeMonths: "two",
        areaLabel: "",
        maxTravelMinutes: "100",
      }),
    ).toEqual({
      childAgeMonths: "Use a whole number from 0 to 120.",
      areaLabel: "Enter a city, neighborhood, or ZIP area.",
      maxTravelMinutes: "Use a whole number from 5 to 90.",
    });
  });

  it("validates time order and optional nap time", () => {
    expect(
      validatePlanInputValues({
        ...defaultPlanInputValues,
        availableStart: "12:30",
        availableEnd: "09:30",
        napStart: "08:00",
      }),
    ).toEqual({
      availableEnd: "End must be after start.",
      napStart: "Nap must be after the start time.",
    });
  });

  it("allows blank nap time", () => {
    expect(
      validatePlanInputValues({
        ...defaultPlanInputValues,
        napStart: "",
      }),
    ).toEqual({});
  });

  it("limits interest text length", () => {
    expect(
      validatePlanInputValues({
        ...defaultPlanInputValues,
        interests: "a".repeat(121),
      }),
    ).toEqual({
      interests: "Keep interests under 120 characters.",
    });
  });

  it("navigates to results only after valid input", () => {
    expect(getPlanSubmitDestination({})).toBe("/results");
    expect(
      getPlanSubmitDestination({
        areaLabel: "Enter a city, neighborhood, or ZIP area.",
      }),
    ).toBeUndefined();
  });
});
