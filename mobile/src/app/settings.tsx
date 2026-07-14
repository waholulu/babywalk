import { ThemedText } from "@/components/themed-text";
import {
  PlaceholderScreen,
  homeLink,
} from "@/features/navigation/placeholder-screen";

export default function SettingsScreen() {
  return (
    <PlaceholderScreen
      eyebrow="Settings"
      title="Preferences"
      summary="Placeholder for account, privacy, family defaults, and app settings."
      links={[homeLink]}
    >
      <ThemedText>
        Future settings will keep privacy choices explicit and avoid exposing
        secrets or sensitive family profile data.
      </ThemedText>
    </PlaceholderScreen>
  );
}
