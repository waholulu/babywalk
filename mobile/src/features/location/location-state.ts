import {
  CoarseCurrentLocation,
  LocationPermissionState,
} from "./location-service";

export function buildLocationStatusMessage(
  state: LocationPermissionState,
): string {
  if (state === "not_requested") {
    return "Use current location only when you choose it, or enter a city, neighborhood, or ZIP area.";
  }

  if (state === "requesting") {
    return "Requesting location permission...";
  }

  if (state === "granted") {
    return "Using a coarse current-location area for this plan.";
  }

  if (state === "denied") {
    return "Location permission was denied. Enter a city, neighborhood, or ZIP area instead.";
  }

  if (state === "restricted") {
    return "Location permission is restricted on this device. Manual area entry still works.";
  }

  return "Current location is unavailable right now. Manual area entry still works.";
}

export function buildCoarseCurrentLocationLabel(
  location: CoarseCurrentLocation,
): string {
  return `Near current location (${formatCoordinate(
    location.latitudeRounded,
  )}, ${formatCoordinate(location.longitudeRounded)})`;
}

export function roundCoordinate(value: number): number {
  return Math.round(value * 100) / 100;
}

function formatCoordinate(value: number): string {
  return value.toFixed(2);
}
