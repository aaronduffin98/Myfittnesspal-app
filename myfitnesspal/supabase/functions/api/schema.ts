// Copied from myfitnesspal/backend/src/db/schema.ts. Keep the two in sync.
import {
  pgTable,
  text,
  timestamp,
  uuid,
  boolean,
  numeric,
  date,
  integer,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").primaryKey(),
  email: text("email").notNull(),
  fullName: text("full_name"),
  isOnboardingComplete: boolean("is_onboarding_complete")
    .default(false)
    .notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const meals = ["breakfast", "lunch", "dinner", "snacks"] as const;
export type MealType = (typeof meals)[number];

export const foodEntries = pgTable("food_entries", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  brand: text("brand"),
  barcode: text("barcode"),
  meal: text("meal", { enum: meals }).notNull(),
  servingLabel: text("serving_label").notNull(),
  numberOfServings: numeric("number_of_servings", {
    precision: 10,
    scale: 3,
  })
    .default("1")
    .notNull(),
  caloriesPerServing: numeric("calories_per_serving", {
    precision: 10,
    scale: 2,
  })
    .default("0")
    .notNull(),
  carbsPerServing: numeric("carbs_per_serving", { precision: 10, scale: 2 })
    .default("0")
    .notNull(),
  fatPerServing: numeric("fat_per_serving", { precision: 10, scale: 2 })
    .default("0")
    .notNull(),
  proteinPerServing: numeric("protein_per_serving", {
    precision: 10,
    scale: 2,
  })
    .default("0")
    .notNull(),
  loggedDate: date("logged_date").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// One row per user. No row means the app shows its built-in defaults.
export const userGoals = pgTable("user_goals", {
  userId: uuid("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  calories: integer("calories").notNull(),
  carbs: integer("carbs").notNull(),
  fat: integer("fat").notNull(),
  protein: integer("protein").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// One weigh-in per user per day; logging again on the same day replaces it.
export const weightEntries = pgTable(
  "weight_entries",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    weightKg: numeric("weight_kg", { precision: 5, scale: 2 }).notNull(),
    loggedDate: date("logged_date").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("weight_entries_user_id_logged_date_key").on(
      table.userId,
      table.loggedDate
    ),
  ]
);
