import { useLocalSearchParams } from "expo-router";

import { DayPlanScreen } from "@/features/plans";

export default function DayPlanRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const planId = Array.isArray(id) ? id[0] : id;

  return <DayPlanScreen id={planId ?? "local-morning"} />;
}
