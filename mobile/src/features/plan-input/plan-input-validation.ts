import {
  BudgetPreference,
  EnergyLevel,
  IndoorOutdoorPreference,
} from "@/domain";

export type PlanInputValues = {
  childAgeMonths: string;
  areaLabel: string;
  availableStart: string;
  availableEnd: string;
  napStart: string;
  maxTravelMinutes: string;
  budget: BudgetPreference;
  indoorOutdoor: IndoorOutdoorPreference;
  energyLevel: EnergyLevel;
  strollerRequired: boolean;
  bathroomRequired: boolean;
  interests: string;
};

export type PlanInputErrors = Partial<Record<keyof PlanInputValues, string>>;

export const defaultPlanInputValues: PlanInputValues = {
  childAgeMonths: "24",
  areaLabel: "Jersey City, NJ",
  availableStart: "09:30",
  availableEnd: "12:30",
  napStart: "14:00",
  maxTravelMinutes: "25",
  budget: "under_30",
  indoorOutdoor: "either",
  energyLevel: "normal",
  strollerRequired: true,
  bathroomRequired: true,
  interests: "story time, playground",
};

export function validatePlanInputValues(
  values: PlanInputValues,
): PlanInputErrors {
  const errors: PlanInputErrors = {};
  const childAgeMonths = parseWholeNumber(values.childAgeMonths);
  const maxTravelMinutes = parseWholeNumber(values.maxTravelMinutes);
  const startMinutes = parseTimeOfDay(values.availableStart);
  const endMinutes = parseTimeOfDay(values.availableEnd);
  const napMinutes =
    values.napStart.trim().length === 0
      ? undefined
      : parseTimeOfDay(values.napStart);

  if (
    childAgeMonths === undefined ||
    childAgeMonths < 0 ||
    childAgeMonths > 120
  ) {
    errors.childAgeMonths = "Use a whole number from 0 to 120.";
  }

  if (values.areaLabel.trim().length < 2) {
    errors.areaLabel = "Enter a city, neighborhood, or ZIP area.";
  }

  if (startMinutes === undefined) {
    errors.availableStart = "Use HH:MM.";
  }

  if (endMinutes === undefined) {
    errors.availableEnd = "Use HH:MM.";
  }

  if (
    startMinutes !== undefined &&
    endMinutes !== undefined &&
    startMinutes >= endMinutes
  ) {
    errors.availableEnd = "End must be after start.";
  }

  if (napMinutes === undefined && values.napStart.trim().length > 0) {
    errors.napStart = "Use HH:MM or leave blank.";
  }

  if (
    napMinutes !== undefined &&
    startMinutes !== undefined &&
    napMinutes <= startMinutes
  ) {
    errors.napStart = "Nap must be after the start time.";
  }

  if (
    maxTravelMinutes === undefined ||
    maxTravelMinutes < 5 ||
    maxTravelMinutes > 90
  ) {
    errors.maxTravelMinutes = "Use a whole number from 5 to 90.";
  }

  if (values.interests.length > 120) {
    errors.interests = "Keep interests under 120 characters.";
  }

  return errors;
}

function parseWholeNumber(value: string): number | undefined {
  if (!/^\d+$/.test(value.trim())) {
    return undefined;
  }

  return Number(value.trim());
}

function parseTimeOfDay(value: string): number | undefined {
  const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(value.trim());

  if (match === null) {
    return undefined;
  }

  return Number(match[1]) * 60 + Number(match[2]);
}
