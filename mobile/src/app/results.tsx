import { ThemedText } from "@/components/themed-text";
import {
  PlaceholderScreen,
  homeLink,
} from "@/features/navigation/placeholder-screen";

export default function ResultsScreen() {
  return (
    <PlaceholderScreen
      eyebrow="Results"
      title="Three outing ideas"
      summary="Placeholder for deterministic, explainable recommendations."
      links={[
        {
          href: { pathname: "/places/[id]", params: { id: "demo-place" } },
          label: "Open sample place",
        },
        {
          href: { pathname: "/plan/[id]", params: { id: "demo-plan" } },
          label: "Open sample day plan",
        },
        homeLink,
      ]}
    >
      <ThemedText>
        Future result cards will show age fit, travel estimate, budget, reasons,
        warnings, and source freshness.
      </ThemedText>
    </PlaceholderScreen>
  );
}
