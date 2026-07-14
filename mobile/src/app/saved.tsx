import { ThemedText } from "@/components/themed-text";
import {
  PlaceholderScreen,
  homeLink,
} from "@/features/navigation/placeholder-screen";

export default function SavedScreen() {
  return (
    <PlaceholderScreen
      eyebrow="Saved"
      title="Saved places"
      summary="Placeholder for saved places, recent visits, and blocked recommendations."
      links={[homeLink]}
    >
      <ThemedText>
        Persistence and user-owned data isolation will be added after the local
        route and recommendation skeletons are in place.
      </ThemedText>
    </PlaceholderScreen>
  );
}
