import { PlaceCandidate } from "@/domain/place/types";
import { calculateStraightLineDistanceMiles } from "@/domain/travel/simple-estimator";

export type CandidateInputSource = "curated" | "provider";

export type CandidateMergeInput = {
  curatedCandidates: PlaceCandidate[];
  providerCandidates: PlaceCandidate[];
};

export type CandidateMergeProvenance = {
  candidateId: string;
  primarySource: CandidateInputSource;
  sourceLabels: string[];
  duplicateCandidateIds: string[];
};

export type CandidateMergeDuplicate = {
  keptCandidateId: string;
  duplicateCandidateId: string;
  keptSource: CandidateInputSource;
  duplicateSource: CandidateInputSource;
  reason: "same_name_area" | "same_name_near_coordinates";
};

export type CandidateMergeResult = {
  candidates: PlaceCandidate[];
  provenanceByCandidateId: Record<string, CandidateMergeProvenance>;
  duplicates: CandidateMergeDuplicate[];
};

type CandidateEntry = {
  candidate: PlaceCandidate;
  source: CandidateInputSource;
};

const nearDuplicateMiles = 0.2;

export function mergeCandidateSources(
  input: CandidateMergeInput,
): CandidateMergeResult {
  const keptEntries: CandidateEntry[] = [];
  const duplicateRecords: CandidateMergeDuplicate[] = [];
  const provenanceByCandidateId: Record<string, CandidateMergeProvenance> = {};

  for (const candidate of input.curatedCandidates) {
    keepCandidate(
      { candidate, source: "curated" },
      keptEntries,
      provenanceByCandidateId,
    );
  }

  for (const candidate of input.providerCandidates) {
    const duplicateMatch = findDuplicate(candidate, keptEntries);

    if (duplicateMatch === undefined) {
      keepCandidate(
        { candidate, source: "provider" },
        keptEntries,
        provenanceByCandidateId,
      );
      continue;
    }

    const provenance =
      provenanceByCandidateId[duplicateMatch.entry.candidate.id];
    provenance.duplicateCandidateIds.push(candidate.id);
    provenance.sourceLabels = mergeSourceLabels(provenance.sourceLabels, [
      candidate.source.label,
    ]);
    duplicateRecords.push({
      keptCandidateId: duplicateMatch.entry.candidate.id,
      duplicateCandidateId: candidate.id,
      keptSource: duplicateMatch.entry.source,
      duplicateSource: "provider",
      reason: duplicateMatch.reason,
    });
  }

  return {
    candidates: keptEntries.map((entry) => entry.candidate),
    provenanceByCandidateId,
    duplicates: duplicateRecords,
  };
}

function keepCandidate(
  entry: CandidateEntry,
  keptEntries: CandidateEntry[],
  provenanceByCandidateId: Record<string, CandidateMergeProvenance>,
) {
  keptEntries.push(entry);
  provenanceByCandidateId[entry.candidate.id] = {
    candidateId: entry.candidate.id,
    primarySource: entry.source,
    sourceLabels: [entry.candidate.source.label],
    duplicateCandidateIds: [],
  };
}

function findDuplicate(
  candidate: PlaceCandidate,
  keptEntries: CandidateEntry[],
):
  | {
      entry: CandidateEntry;
      reason: CandidateMergeDuplicate["reason"];
    }
  | undefined {
  for (const entry of keptEntries) {
    const nameMatches =
      normalizeComparableText(entry.candidate.name) ===
      normalizeComparableText(candidate.name);

    if (!nameMatches) {
      continue;
    }

    if (
      normalizeComparableText(entry.candidate.area.label) ===
      normalizeComparableText(candidate.area.label)
    ) {
      return { entry, reason: "same_name_area" };
    }

    if (areNearCoordinates(entry.candidate, candidate)) {
      return { entry, reason: "same_name_near_coordinates" };
    }
  }

  return undefined;
}

function areNearCoordinates(
  first: PlaceCandidate,
  second: PlaceCandidate,
): boolean {
  if (first.coordinates === undefined || second.coordinates === undefined) {
    return false;
  }

  return (
    calculateStraightLineDistanceMiles(first.coordinates, second.coordinates) <=
    nearDuplicateMiles
  );
}

function normalizeComparableText(value: string): string {
  return value.toLocaleLowerCase().replace(/[^a-z0-9]+/g, "");
}

function mergeSourceLabels(first: string[], second: string[]): string[] {
  return Array.from(new Set([...first, ...second]));
}
