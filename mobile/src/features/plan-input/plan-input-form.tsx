import { useMemo, useState, type ReactNode } from "react";
import {
  StyleSheet,
  Switch,
  TextInput,
  View,
  type KeyboardTypeOptions,
} from "react-native";
import { useRouter } from "expo-router";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Button, Chip, ScreenContainer } from "@/components/ui";
import { Radii, Spacing } from "@/constants/theme";
import {
  buildCoarseCurrentLocationLabel,
  buildLocationStatusMessage,
  createExpoLocationService,
  LocationPermissionState,
} from "@/features/location";
import { useTheme } from "@/hooks/use-theme";
import { trackAnalyticsEvent } from "@/lib/analytics";
import {
  defaultPlanInputValues,
  getPlanSubmitDestination,
  type PlanInputErrors,
  type PlanInputValues,
  validatePlanInputValues,
} from "./plan-input-validation";

type ChoiceOption<T extends string> = {
  label: string;
  value: T;
};

const budgetOptions: ChoiceOption<PlanInputValues["budget"]>[] = [
  { label: "Free", value: "free" },
  { label: "Under $30", value: "under_30" },
  { label: "Flexible", value: "flexible" },
];

const indoorOutdoorOptions: ChoiceOption<PlanInputValues["indoorOutdoor"]>[] = [
  { label: "Indoor", value: "indoor" },
  { label: "Outdoor", value: "outdoor" },
  { label: "Either", value: "either" },
];

const energyOptions: ChoiceOption<PlanInputValues["energyLevel"]>[] = [
  { label: "Easy", value: "easy" },
  { label: "Normal", value: "normal" },
  { label: "Adventure", value: "adventure" },
];

export function PlanInputForm() {
  const router = useRouter();
  const [values, setValues] = useState<PlanInputValues>(defaultPlanInputValues);
  const [errors, setErrors] = useState<PlanInputErrors>({});
  const [submittedSummary, setSubmittedSummary] = useState<string | undefined>(
    undefined,
  );
  const [locationState, setLocationState] =
    useState<LocationPermissionState>("not_requested");
  const validationSummary = useMemo(
    () => validatePlanInputValues(values),
    [values],
  );
  const locationService = useMemo(() => createExpoLocationService(), []);

  function updateValue<Key extends keyof PlanInputValues>(
    key: Key,
    value: PlanInputValues[Key],
  ) {
    setValues((currentValues) => ({ ...currentValues, [key]: value }));
    setSubmittedSummary(undefined);
  }

  function handleSubmit() {
    const nextErrors = validatePlanInputValues(values);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length === 0) {
      const destination = getPlanSubmitDestination(nextErrors);
      setSubmittedSummary(
        `${values.areaLabel.trim()} • ${values.availableStart}-${values.availableEnd} • ${values.maxTravelMinutes.trim()} min`,
      );
      trackAnalyticsEvent("plan_submitted", {
        bathroom_required: values.bathroomRequired,
        budget: values.budget,
        energy_level: values.energyLevel,
        has_interests: values.interests.trim().length > 0,
        has_nap: values.napStart.trim().length > 0,
        indoor_outdoor: values.indoorOutdoor,
        max_travel_bucket: buildMaxTravelBucket(values.maxTravelMinutes),
        stroller_required: values.strollerRequired,
      });
      if (destination !== undefined) {
        router.push(destination);
      }
    }
  }

  function handleReset() {
    setValues(defaultPlanInputValues);
    setErrors({});
    setSubmittedSummary(undefined);
    setLocationState("not_requested");
  }

  async function handleUseCurrentLocation() {
    setSubmittedSummary(undefined);
    setLocationState("requesting");

    const result = await locationService.requestCurrentLocation();

    if (result.ok) {
      updateValue(
        "areaLabel",
        buildCoarseCurrentLocationLabel(result.location),
      );
      setLocationState("granted");
    } else {
      setLocationState(result.reason);
    }
  }

  return (
    <ScreenContainer>
      <ThemedView style={styles.header}>
        <ThemedText type="smallBold" themeColor="primary">
          Home
        </ThemedText>
        <ThemedText type="title">Plan today</ThemedText>
      </ThemedView>

      <ThemedView style={styles.form} accessibilityLabel="Plan today form">
        <Field
          label="Child age"
          error={errors.childAgeMonths}
          hint="Months, from 0 to 120."
        >
          <Input
            value={values.childAgeMonths}
            onChangeText={(value) => updateValue("childAgeMonths", value)}
            keyboardType="number-pad"
            accessibilityLabel="Child age in months"
            accessibilityHint="Enter the child age in months."
          />
        </Field>

        <Field
          label="Area"
          error={errors.areaLabel}
          hint={buildLocationStatusMessage(locationState)}
        >
          <Input
            value={values.areaLabel}
            onChangeText={(value) => updateValue("areaLabel", value)}
            autoCapitalize="words"
            accessibilityLabel="Planning area"
          />
          <Button
            variant="secondary"
            disabled={locationState === "requesting"}
            onPress={() => {
              void handleUseCurrentLocation();
            }}
            accessibilityLabel="Use current location"
            accessibilityHint="Requests foreground location permission only after this button is pressed."
          >
            {locationState === "requesting"
              ? "Checking location..."
              : "Use current location"}
          </Button>
        </Field>

        <View style={styles.row}>
          <Field
            label="Start"
            error={errors.availableStart}
            style={styles.rowField}
            hint="24-hour time."
          >
            <Input
              value={values.availableStart}
              onChangeText={(value) => updateValue("availableStart", value)}
              keyboardType="numbers-and-punctuation"
              accessibilityLabel="Available start time"
            />
          </Field>
          <Field
            label="End"
            error={errors.availableEnd}
            style={styles.rowField}
            hint="24-hour time."
          >
            <Input
              value={values.availableEnd}
              onChangeText={(value) => updateValue("availableEnd", value)}
              keyboardType="numbers-and-punctuation"
              accessibilityLabel="Available end time"
            />
          </Field>
        </View>

        <View style={styles.row}>
          <Field
            label="Nap starts"
            error={errors.napStart}
            style={styles.rowField}
            hint="Optional."
          >
            <Input
              value={values.napStart}
              onChangeText={(value) => updateValue("napStart", value)}
              keyboardType="numbers-and-punctuation"
              accessibilityLabel="Nap start time"
            />
          </Field>
          <Field
            label="Max travel"
            error={errors.maxTravelMinutes}
            style={styles.rowField}
            hint="Minutes."
          >
            <Input
              value={values.maxTravelMinutes}
              onChangeText={(value) => updateValue("maxTravelMinutes", value)}
              keyboardType="number-pad"
              accessibilityLabel="Maximum travel time in minutes"
            />
          </Field>
        </View>

        <SegmentedChoice
          label="Budget"
          options={budgetOptions}
          value={values.budget}
          onChange={(value) => updateValue("budget", value)}
        />

        <SegmentedChoice
          label="Indoor or outdoor"
          options={indoorOutdoorOptions}
          value={values.indoorOutdoor}
          onChange={(value) => updateValue("indoorOutdoor", value)}
        />

        <SegmentedChoice
          label="Energy"
          options={energyOptions}
          value={values.energyLevel}
          onChange={(value) => updateValue("energyLevel", value)}
        />

        <ToggleRow
          label="Stroller friendly"
          value={values.strollerRequired}
          onValueChange={(value) => updateValue("strollerRequired", value)}
        />

        <ToggleRow
          label="Bathroom available"
          value={values.bathroomRequired}
          onValueChange={(value) => updateValue("bathroomRequired", value)}
        />

        <Field
          label="Interests"
          error={errors.interests}
          hint="Comma-separated."
        >
          <Input
            value={values.interests}
            onChangeText={(value) => updateValue("interests", value)}
            accessibilityLabel="Family interests"
            accessibilityHint="Enter optional interests separated by commas."
          />
        </Field>

        {Object.keys(validationSummary).length > 0 ? (
          <ValidationSummary errors={validationSummary} />
        ) : null}

        {submittedSummary === undefined ? null : (
          <ThemedView
            type="backgroundElement"
            accessibilityLiveRegion="polite"
            style={styles.status}
          >
            <ThemedText type="smallBold">Inputs ready</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {submittedSummary}
            </ThemedText>
          </ThemedView>
        )}

        <View style={styles.actions}>
          <Button
            onPress={handleSubmit}
            accessibilityLabel="Show three ideas"
            accessibilityHint="Checks the form inputs."
            style={styles.actionButton}
          >
            Show 3 ideas
          </Button>
          <Button
            variant="secondary"
            onPress={handleReset}
            accessibilityLabel="Reset plan inputs"
            style={styles.actionButton}
          >
            Reset
          </Button>
        </View>
      </ThemedView>
    </ScreenContainer>
  );
}

function buildMaxTravelBucket(value: string): string {
  const minutes = Number(value.trim());

  if (!Number.isFinite(minutes)) {
    return "unknown";
  }

  if (minutes <= 15) {
    return "0_15";
  }

  if (minutes <= 30) {
    return "16_30";
  }

  if (minutes <= 60) {
    return "31_60";
  }

  return "61_plus";
}

function Field({
  children,
  error,
  hint,
  label,
  style,
}: {
  children: ReactNode;
  error?: string;
  hint?: string;
  label: string;
  style?: object;
}) {
  return (
    <ThemedView style={[styles.field, style]}>
      <ThemedText type="smallBold">{label}</ThemedText>
      {children}
      {hint === undefined ? null : (
        <ThemedText type="small" themeColor="textSecondary">
          {hint}
        </ThemedText>
      )}
      {error === undefined ? null : (
        <ThemedText type="smallBold" themeColor="danger">
          {error}
        </ThemedText>
      )}
    </ThemedView>
  );
}

function Input({
  keyboardType = "default",
  ...props
}: {
  accessibilityHint?: string;
  accessibilityLabel: string;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  keyboardType?: KeyboardTypeOptions;
  onChangeText: (value: string) => void;
  value: string;
}) {
  const theme = useTheme();

  return (
    <TextInput
      {...props}
      keyboardType={keyboardType}
      placeholderTextColor={theme.textSecondary}
      style={[
        styles.input,
        {
          borderColor: theme.border,
          color: theme.text,
          backgroundColor: theme.background,
        },
      ]}
    />
  );
}

function SegmentedChoice<T extends string>({
  label,
  onChange,
  options,
  value,
}: {
  label: string;
  onChange: (value: T) => void;
  options: ChoiceOption<T>[];
  value: T;
}) {
  return (
    <ThemedView style={styles.field}>
      <ThemedText type="smallBold">{label}</ThemedText>
      <View accessibilityRole="radiogroup" style={styles.chipRow}>
        {options.map((option) => (
          <Chip
            key={option.value}
            selected={option.value === value}
            onPress={() => onChange(option.value)}
            accessibilityRole="radio"
            accessibilityLabel={`${label}: ${option.label}`}
            accessibilityState={{ selected: option.value === value }}
          >
            {option.label}
          </Chip>
        ))}
      </View>
    </ThemedView>
  );
}

function ToggleRow({
  label,
  onValueChange,
  value,
}: {
  label: string;
  onValueChange: (value: boolean) => void;
  value: boolean;
}) {
  return (
    <ThemedView style={styles.toggleRow}>
      <ThemedText type="smallBold">{label}</ThemedText>
      <Switch
        value={value}
        onValueChange={onValueChange}
        accessibilityLabel={label}
        accessibilityRole="switch"
      />
    </ThemedView>
  );
}

function ValidationSummary({ errors }: { errors: PlanInputErrors }) {
  return (
    <ThemedView
      type="backgroundElement"
      accessibilityRole="alert"
      style={styles.validationSummary}
    >
      <ThemedText type="smallBold" themeColor="danger">
        Check these fields
      </ThemedText>
      {Object.values(errors).map((error) => (
        <ThemedText key={error} type="small" themeColor="danger">
          {error}
        </ThemedText>
      ))}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: Spacing.one,
  },
  form: {
    gap: Spacing.four,
  },
  field: {
    gap: Spacing.two,
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.three,
  },
  rowField: {
    flex: 1,
    minWidth: 140,
  },
  input: {
    minHeight: 48,
    borderRadius: Radii.medium,
    borderWidth: 1,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    fontSize: 16,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.two,
  },
  toggleRow: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.three,
  },
  validationSummary: {
    borderRadius: Radii.medium,
    gap: Spacing.one,
    padding: Spacing.three,
  },
  status: {
    borderRadius: Radii.medium,
    gap: Spacing.one,
    padding: Spacing.three,
  },
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.three,
  },
  actionButton: {
    flex: 1,
    minWidth: 144,
  },
});
