import {
  PlaceholderScreen,
  coreRouteLinks,
} from "@/features/navigation/placeholder-screen";
import { ThemedText } from "@/components/themed-text";

export default function HomeScreen() {
  return (
    <PlaceholderScreen
      eyebrow="Home"
      title="Plan today"
      summary="A placeholder home screen for the future family outing planner workflow."
      links={coreRouteLinks}
    >
      <ThemedText>
        TASK-006 only creates reachable routes. The real planning form,
        recommendations, and saved data arrive in later tasks.
      </ThemedText>
    </PlaceholderScreen>
  );
}
