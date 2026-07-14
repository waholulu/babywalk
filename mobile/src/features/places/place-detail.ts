import { mockPlaceCandidates } from "@/data/fixtures";
import { PlaceCandidate, TimeWindow, UnknownBoolean } from "@/domain";

export type PlaceDetailFact = {
  label: string;
  value: string;
  confidence: "known" | "unknown";
};

export type PlaceDetailAction = {
  label: string;
  disabledReason: string;
};

export type PlaceDetailModel = {
  candidate: PlaceCandidate;
  facts: PlaceDetailFact[];
  scheduleFacts: PlaceDetailFact[];
  amenityFacts: PlaceDetailFact[];
  verifyNotes: string[];
  actions: PlaceDetailAction[];
};

export function getPlaceDetailModel(id: string): PlaceDetailModel | null {
  const candidate = mockPlaceCandidates.find((place) => place.id === id);

  if (candidate === undefined) {
    return null;
  }

  return {
    candidate,
    facts: buildCoreFacts(candidate),
    scheduleFacts: buildScheduleFacts(candidate),
    amenityFacts: buildAmenityFacts(candidate),
    verifyNotes: buildVerifyNotes(candidate),
    actions: buildPlaceholderActions(),
  };
}

function buildCoreFacts(candidate: PlaceCandidate): PlaceDetailFact[] {
  return [
    knownFact("Category", candidate.category.replaceAll("_", " ")),
    knownFact("Area", candidate.area.label),
    buildAgeFact(candidate),
    candidate.typicalVisitMinutes === undefined
      ? unknownFact("Typical visit", "Unknown")
      : knownFact("Typical visit", `${candidate.typicalVisitMinutes} minutes`),
    candidate.price.band === "unknown"
      ? unknownFact("Price", "Unknown")
      : knownFact("Price", formatPrice(candidate)),
    candidate.indoorOutdoor === "unknown"
      ? unknownFact("Indoor/outdoor", "Unknown")
      : knownFact("Indoor/outdoor", candidate.indoorOutdoor),
    knownFact("Source", candidate.source.label),
    candidate.source.freshness === "unknown"
      ? unknownFact("Freshness", "Unknown")
      : knownFact("Freshness", candidate.source.freshness),
  ];
}

function buildScheduleFacts(candidate: PlaceCandidate): PlaceDetailFact[] {
  if (
    candidate.scheduleWindows === undefined ||
    candidate.scheduleWindows.length === 0
  ) {
    return [unknownFact("Schedule", "Unknown")];
  }

  return candidate.scheduleWindows.map((window, index) =>
    knownFact(`Schedule ${index + 1}`, formatTimeWindow(window)),
  );
}

function buildAmenityFacts(candidate: PlaceCandidate): PlaceDetailFact[] {
  return [
    formatAmenity("Stroller friendly", candidate.amenities.strollerFriendly),
    formatAmenity("Bathroom available", candidate.amenities.bathroomAvailable),
    formatAmenity("Parking available", candidate.amenities.parkingAvailable),
  ];
}

function buildVerifyNotes(candidate: PlaceCandidate): string[] {
  const notes: string[] = [
    "Verify current hours, price, and conditions before leaving.",
    "Official website or phone contact is not available in this fixture.",
  ];

  if (
    candidate.scheduleWindows === undefined ||
    candidate.scheduleWindows.length === 0
  ) {
    notes.push("Schedule is unknown in the local fixture data.");
  }

  if (candidate.ageRangeMonths === "unknown") {
    notes.push("Age fit is unknown in the local fixture data.");
  }

  if (candidate.price.band === "unknown") {
    notes.push("Price is unknown in the local fixture data.");
  }

  const unknownAmenities = buildAmenityFacts(candidate)
    .filter((fact) => fact.confidence === "unknown")
    .map((fact) => fact.label.toLocaleLowerCase());

  if (unknownAmenities.length > 0) {
    notes.push(`Verify ${unknownAmenities.join(", ")} before leaving.`);
  }

  if (
    candidate.source.freshness === "unknown" ||
    candidate.source.freshness === "stale"
  ) {
    notes.push("Source freshness is limited.");
  }

  return notes;
}

function buildPlaceholderActions(): PlaceDetailAction[] {
  return [
    {
      label: "Save",
      disabledReason: "Save action is added in TASK-024.",
    },
    {
      label: "Visited",
      disabledReason: "Visit history is added in TASK-024.",
    },
    {
      label: "Do not recommend",
      disabledReason: "Blocking is added in TASK-024.",
    },
    {
      label: "Report incorrect data",
      disabledReason: "Feedback reporting is added in TASK-025.",
    },
  ];
}

function buildAgeFact(candidate: PlaceCandidate): PlaceDetailFact {
  if (candidate.ageRangeMonths === "unknown") {
    return unknownFact("Age fit", "Unknown");
  }

  const { minMonths, maxMonths } = candidate.ageRangeMonths;

  if (minMonths !== undefined && maxMonths !== undefined) {
    return knownFact("Age fit", `${minMonths}-${maxMonths} months`);
  }

  if (minMonths !== undefined) {
    return knownFact("Age fit", `${minMonths}+ months`);
  }

  if (maxMonths !== undefined) {
    return knownFact("Age fit", `Up to ${maxMonths} months`);
  }

  return knownFact("Age fit", "All ages");
}

function formatPrice(candidate: PlaceCandidate): string {
  if (candidate.price.band === "free") {
    return "Free";
  }

  if (candidate.price.band === "under_30") {
    return candidate.price.estimatedUsd === undefined
      ? "Under $30"
      : `About $${candidate.price.estimatedUsd}`;
  }

  if (candidate.price.band === "paid") {
    return candidate.price.estimatedUsd === undefined
      ? "Paid"
      : `About $${candidate.price.estimatedUsd}`;
  }

  return "Unknown";
}

function formatAmenity(label: string, value: UnknownBoolean): PlaceDetailFact {
  if (value === "unknown") {
    return unknownFact(label, "Unknown");
  }

  return knownFact(label, value ? "Yes" : "No");
}

function formatTimeWindow(window: TimeWindow): string {
  return `${formatTime(window.startAt)}-${formatTime(window.endAt)}`;
}

function formatTime(value: string): string {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: "America/New_York",
  }).format(new Date(value));
}

function knownFact(label: string, value: string): PlaceDetailFact {
  return { label, value, confidence: "known" };
}

function unknownFact(label: string, value: string): PlaceDetailFact {
  return { label, value, confidence: "unknown" };
}
