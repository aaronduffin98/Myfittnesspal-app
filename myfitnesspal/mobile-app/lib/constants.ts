// Single source of truth for app colors.
// Used by both tailwind.config.js and direct style usage.
export const colors = {
  primary: "#1D63ED",
  "primary-foreground": "#FFFFFF",
  "muted-foreground": "#9D9D9D",
  white: "#FFFFFF",
  "low-shadow": "#D1D1D1",
  // MyFitnessPal palette
  "mfp-blue": "#1D63ED",
  "mfp-bg": "#EEF1F5",
  "mfp-bg-top": "#E4EEFB",
  carbs: "#2BC4A6",
  fat: "#7A3FB3",
  protein: "#F5A623",
  "track-gray": "#E7E9EC",
} as const;

// Default daily nutrition goals, used until the user saves their own in
// Settings (see hooks/useGoals.ts).
// 180g carbs * 4 + 60g fat * 9 + 200g protein * 4 = 2060 kcal
export const dailyGoals = {
  calories: 2060,
  carbs: 180,
  fat: 60,
  protein: 200,
} as const;

export const MEALS = ["breakfast", "lunch", "dinner", "snacks"] as const;
export type Meal = (typeof MEALS)[number];

export const MEAL_LABELS: Record<Meal, string> = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner",
  snacks: "Snacks",
};
