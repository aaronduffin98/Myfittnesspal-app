import { useEffect, useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, TextInput, View } from "react-native";
import { Toast } from "toastify-react-native";
import { AppBar } from "@/components/AppBar";
import { AppButton } from "@/components/AppButton";
import { AppText } from "@/components/AppText";
import { Card } from "@/components/Card";
import { colors as appColors } from "@/lib/constants";
import { useGoals, useSaveGoals, type Goals } from "@/hooks/useGoals";

const FIELDS: { key: keyof Goals; label: string; unit: string }[] = [
  { key: "calories", label: "Calories", unit: "kcal" },
  { key: "protein", label: "Protein", unit: "g" },
  { key: "carbs", label: "Carbs", unit: "g" },
  { key: "fat", label: "Fat", unit: "g" },
];

type GoalsText = Record<keyof Goals, string>;

function toText(goals: Goals): GoalsText {
  return {
    calories: String(goals.calories),
    carbs: String(goals.carbs),
    fat: String(goals.fat),
    protein: String(goals.protein),
  };
}

function parseWhole(text: string): number | null {
  if (!/^\d+$/.test(text.trim())) return null;
  return Number(text.trim());
}

export default function SettingsScreen() {
  const goals = useGoals();
  const saveGoals = useSaveGoals();
  const [form, setForm] = useState<GoalsText>(() => toText(goals));
  const [dirty, setDirty] = useState(false);

  // Pick up goals loaded from the server, unless the user is mid-edit.
  useEffect(() => {
    if (!dirty) setForm(toText(goals));
  }, [goals, dirty]);

  const parsed = {
    calories: parseWhole(form.calories),
    carbs: parseWhole(form.carbs),
    fat: parseWhole(form.fat),
    protein: parseWhole(form.protein),
  };
  const isValid =
    parsed.calories !== null &&
    parsed.calories >= 500 &&
    parsed.carbs !== null &&
    parsed.fat !== null &&
    parsed.protein !== null;

  const macroCalories =
    (parsed.carbs ?? 0) * 4 + (parsed.fat ?? 0) * 9 + (parsed.protein ?? 0) * 4;

  const handleChange = (key: keyof Goals, text: string) => {
    setDirty(true);
    setForm((prev) => ({ ...prev, [key]: text.replace(/[^\d]/g, "") }));
  };

  const handleSave = async () => {
    if (!isValid) return;
    try {
      await saveGoals.mutateAsync(parsed as Goals);
      setDirty(false);
      Toast.success("Daily targets saved");
    } catch {
      Toast.error("Could not save targets. Check your connection and try again.");
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-mfp-bg"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <AppBar
        title={
          <AppText className="text-gray-900 text-2xl" fontWeight="bold">
            Settings
          </AppText>
        }
      />
      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 40, gap: 12 }}
        keyboardShouldPersistTaps="handled"
      >
        <Card>
          <AppText className="text-gray-900 text-lg" fontWeight="bold">
            Daily targets
          </AppText>
          <AppText className="text-gray-400 text-sm mt-1">
            Shown on your Today screen.
          </AppText>

          {FIELDS.map(({ key, label, unit }) => (
            <View key={key} className="flex-row items-center justify-between py-3">
              <AppText className="text-gray-800 text-base">{label}</AppText>
              <View
                className="flex-row items-center border border-gray-300 rounded-lg px-4 py-2"
                style={{ minWidth: 120 }}
              >
                <TextInput
                  value={form[key]}
                  onChangeText={(text) => handleChange(key, text)}
                  keyboardType="number-pad"
                  maxLength={5}
                  className="flex-1 text-primary text-sm text-right font-din-rounded-bold"
                  style={{ padding: 0, color: appColors.primary }}
                />
                <AppText className="text-gray-400 text-sm ml-1">{unit}</AppText>
              </View>
            </View>
          ))}

          <AppText className="text-gray-400 text-sm mt-2">
            Your macros add up to {macroCalories.toLocaleString()} kcal
            {parsed.calories !== null && macroCalories !== parsed.calories
              ? ` (calorie target is ${parsed.calories.toLocaleString()})`
              : ""}
            .
          </AppText>
        </Card>

        <AppButton
          text="Save targets"
          onPress={handleSave}
          disabled={!isValid || !dirty}
          loading={saveGoals.isPending}
        />
        {!isValid && (
          <AppText className="text-red-500 text-sm text-center">
            Enter whole numbers, with at least 500 kcal.
          </AppText>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
