import { useLocalSearchParams } from "expo-router";

import { PlaceDetailScreen } from "@/features/places";

export default function PlaceDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const placeId = Array.isArray(id) ? id[0] : id;

  return <PlaceDetailScreen id={placeId ?? ""} />;
}
