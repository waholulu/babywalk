import { ThemedText } from "@/components/themed-text";
import {
  PlaceholderScreen,
  homeLink,
} from "@/features/navigation/placeholder-screen";

export default function OnboardingScreen() {
  return (
    <PlaceholderScreen
      eyebrow="Onboarding"
      title="Family defaults"
      summary="Placeholder for age band, area, drive time, budget, and outing preferences."
      links={[homeLink]}
    >
      <ThemedText>
        This route will avoid collecting child names, exact birth dates, medical
        details, or precise home addresses.
      </ThemedText>
    </PlaceholderScreen>
  );
}
