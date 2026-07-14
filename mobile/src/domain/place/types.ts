import {
  AgeRangeMonths,
  Coordinates,
  CoarseArea,
  MoneyEstimate,
  SourceInfo,
  TimeWindow,
  UnknownBoolean,
} from "@/domain/common";

export type PlaceCategory =
  | "library"
  | "playground"
  | "museum"
  | "zoo"
  | "farm"
  | "park"
  | "waterfront"
  | "indoor_play"
  | "community_center"
  | "other";

export type PlaceCandidate = {
  id: string;
  name: string;
  category: PlaceCategory;
  area: CoarseArea;
  coordinates?: Coordinates;
  ageRangeMonths: AgeRangeMonths | "unknown";
  typicalVisitMinutes?: number;
  price: MoneyEstimate;
  indoorOutdoor: "indoor" | "outdoor" | "mixed" | "unknown";
  scheduleWindows?: TimeWindow[];
  amenities: {
    strollerFriendly: UnknownBoolean;
    bathroomAvailable: UnknownBoolean;
    parkingAvailable: UnknownBoolean;
  };
  source: SourceInfo;
};
