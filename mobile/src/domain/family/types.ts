import { CoarseArea, TimeWindow } from "@/domain/common";

export type BudgetPreference = "free" | "under_30" | "flexible";

export type IndoorOutdoorPreference = "indoor" | "outdoor" | "either";

export type EnergyLevel = "easy" | "normal" | "adventure";

export type FamilyLocation =
  | {
      kind: "current_location";
    }
  | {
      kind: "saved_area";
      area: CoarseArea;
    }
  | {
      kind: "manual_area";
      area: CoarseArea;
    };

export type FamilyConstraints = {
  childAgeMonths: number;
  availableWindow: TimeWindow;
  napWindow?: TimeWindow;
  location: FamilyLocation;
  maxTravelMinutes: number;
  budget: BudgetPreference;
  indoorOutdoor: IndoorOutdoorPreference;
  energyLevel: EnergyLevel;
  strollerRequired?: boolean;
  bathroomRequired?: boolean;
  interests?: string[];
  memberships?: string[];
  blockedPlaceIds?: string[];
};
