import * as Location from "expo-location";

import { LocationRequestResult, LocationService } from "./location-service";
import { roundCoordinate } from "./location-state";

export function createExpoLocationService(): LocationService {
  return {
    async requestCurrentLocation(): Promise<LocationRequestResult> {
      const servicesEnabled = await Location.hasServicesEnabledAsync();

      if (!servicesEnabled) {
        return { ok: false, reason: "unavailable" };
      }

      const permission = await Location.requestForegroundPermissionsAsync();

      if (!permission.granted) {
        return {
          ok: false,
          reason: permission.canAskAgain ? "denied" : "restricted",
        };
      }

      try {
        const position = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        return {
          ok: true,
          location: {
            latitudeRounded: roundCoordinate(position.coords.latitude),
            longitudeRounded: roundCoordinate(position.coords.longitude),
          },
        };
      } catch {
        return { ok: false, reason: "unavailable" };
      }
    },
  };
}
