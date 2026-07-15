export type LocationPermissionState =
  | "not_requested"
  | "requesting"
  | "granted"
  | "denied"
  | "restricted"
  | "unavailable";

export type CoarseCurrentLocation = {
  latitudeRounded: number;
  longitudeRounded: number;
};

export type LocationRequestResult =
  | { ok: true; location: CoarseCurrentLocation }
  | { ok: false; reason: Exclude<LocationPermissionState, "granted"> };

export type LocationService = {
  requestCurrentLocation: () => Promise<LocationRequestResult>;
};
