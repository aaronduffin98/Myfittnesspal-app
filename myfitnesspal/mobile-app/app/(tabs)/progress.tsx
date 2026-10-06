import { useMemo, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Toast } from "toastify-react-native";
import { AppBar } from "@/components/AppBar";
import { AppButton } from "@/components/AppButton";
import { AppText } from "@/components/AppText";
import { Card } from "@/components/Card";
import { WeightChart } from "@/components/WeightChart";
import { colors as appColors } from "@/lib/constants";
import {
  localTodayIso,
  useDeleteWeight,
  useLogWeight,
  useWeights,
  type WeightEntry,
} from "@/hooks/useWeights";

// Show the last ~3 months on the chart so it stays readable.
const CHART_POINTS = 90;

function formatDate(iso: string): string {
  // Parse as a local date so it doesn't shift a day in some time zones.
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-IE", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

function parseWeight(text: string): number | null {
  const value = Number(text.replace(",", "."));
  if (!text.trim() || !Number.isFinite(value) || value < 20 || value > 500) {
    return null;
  }
  return Math.round(value * 100) / 100;
}

export default function ProgressScreen() {
  const { data: weights = [], refetch, isRefetching } = useWeights();
  const logWeight = useLogWeight();
  const deleteWeight = useDeleteWeight();
  const [weightText, setWeightText] = useState("");

  const today = localTodayIso();
  const todaysEntry = weights.find((w) => w.loggedDate === today);
  const parsed = parseWeight(weightText);

  const latest = weights[weights.length - 1];
  const first = weights[0];
  const change = latest && first ? latest.weightKg - first.weightKg : 0;
  const history = useMemo(() => [...weights].reverse(), [weights]);

  const handleLog = async () => {
    if (parsed === null) return;
    try {
      await logWeight.mutateAsync({ weightKg: parsed, loggedDate: today });
      setWeightText("");
      Toast.success(todaysEntry ? "Today's weight updated" : "Weight logged");
    } catch {
      Toast.error("Could not save weight. Check your connection and try again.");
    }
  };

  const handleDelete = (entry: WeightEntry) => {
    Alert.alert(
      "Delete weigh-in",
      `Remove ${entry.weightKg.toFixed(1)} kg on ${formatDate(entry.loggedDate)}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () =>
            deleteWeight.mutateAsync(entry.id).catch(() => {
              Toast.error("Could not delete. Try again.");
            }),
        },
      ]
    );
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-mfp-bg"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <AppBar
        title={
          <AppText className="text-gray-900 text-2xl" fontWeight="bold">
            Progress
          </AppText>
        }
      />
      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 40, gap: 12 }}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={appColors.primary}
          />
        }
      >
        <Card>
          <AppText className="text-gray-900 text-lg" fontWeight="bold">
            Log today&apos;s weight
          </AppText>
          <AppText className="text-gray-400 text-sm mt-1">
            {todaysEntry
              ? `Logged ${todaysEntry.weightKg.toFixed(1)} kg today. Saving again replaces it.`
              : formatDate(today)}
          </AppText>
          <View className="flex-row items-center mt-3" style={{ gap: 12 }}>
            <View className="flex-1 flex-row items-center border border-gray-300 rounded-lg px-4 py-3">
              <TextInput
                value={weightText}
                onChangeText={setWeightText}
                placeholder={latest ? latest.weightKg.toFixed(1) : "e.g. 82.5"}
                placeholderTextColor="#B0B0B0"
                keyboardType="decimal-pad"
                maxLength={6}
                className="flex-1 text-primary text-base font-din-rounded-bold"
                style={{ padding: 0, color: appColors.primary }}
              />
              <AppText className="text-gray-400 text-base ml-1">kg</AppText>
            </View>
            <AppButton
              text="Save"
              onPress={handleLog}
              disabled={parsed === null}
              loading={logWeight.isPending}
              className="w-28"
            />
          </View>
        </Card>

        <Card>
          <View className="flex-row items-end justify-between mb-3">
            <View>
              <AppText className="text-gray-400 text-sm">Current</AppText>
              <AppText className="text-gray-900 text-3xl" fontWeight="bold">
                {latest ? `${latest.weightKg.toFixed(1)} kg` : "–"}
              </AppText>
            </View>
            {weights.length >= 2 && (
              <View className="items-end">
                <AppText className="text-gray-400 text-sm">Since first weigh-in</AppText>
                <AppText
                  className="text-lg"
                  fontWeight="bold"
                  style={{ color: change <= 0 ? appColors.carbs : appColors.protein }}
                >
                  {change > 0 ? "+" : ""}
                  {change.toFixed(1)} kg
                </AppText>
              </View>
            )}
          </View>
          <WeightChart points={weights.slice(-CHART_POINTS)} />
        </Card>

        {history.length > 0 && (
          <Card className="py-2">
            <AppText className="text-gray-900 text-lg pt-2 pb-1" fontWeight="bold">
              History
            </AppText>
            {history.map((entry, i) => (
              <View
                key={entry.id}
                className={`flex-row items-center justify-between py-3 ${
                  i < history.length - 1 ? "border-b border-gray-100" : ""
                }`}
              >
                <AppText className="text-gray-800 text-base">
                  {formatDate(entry.loggedDate)}
                </AppText>
                <View className="flex-row items-center" style={{ gap: 16 }}>
                  <AppText className="text-gray-900 text-base" fontWeight="bold">
                    {entry.weightKg.toFixed(1)} kg
                  </AppText>
                  <Pressable hitSlop={10} onPress={() => handleDelete(entry)}>
                    <Ionicons name="trash-outline" size={18} color="#B0B0B0" />
                  </Pressable>
                </View>
              </View>
            ))}
          </Card>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
