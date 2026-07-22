export type DietaryRestriction =
  | "Halal"
  | "Vegan"
  | "Vegetarian"
  | "Keto"
  | "Gluten-Free"
  | "Dairy-Free"
  | "Nut Allergy"
  | "Low-Carb";

export type PrimaryObjective = "Weight Loss" | "Muscle Gain" | "Maintenance";

export type MealType = "Breakfast" | "Lunch" | "Dinner" | "Snack";

export type Currency = "USD" | "PKR" | "EUR" | "GBP";

export interface Ingredient {
  name: string;
  amount: number;
  unit: string;
  category: "Produce" | "Dairy & Eggs" | "Meat & Seafood" | "Grains & Bakery" | "Pantry & Spices" | "Other";
}

export interface Macros {
  protein_g: number;
  carbs_g: number;
  fat_g: number;
}

export interface Meal {
  id: string;
  type: MealType;
  recipe_name: string;
  prep_time_mins: number;
  calories: number;
  macros: Macros;
  estimated_cost: number;
  ingredients: Ingredient[];
  instructions: string[];
}

export interface DailyPlan {
  day: string;
  day_number: number;
  total_calories: number;
  meals: Meal[];
}

export interface MealPlanPreferences {
  dietary_restrictions: DietaryRestriction[];
  target_budget: number;
  currency: Currency;
  daily_calories: number;
  primary_objective: PrimaryObjective;
  days_count: number;
  meals_per_day: MealType[];
  isAiGenerated?: boolean;
}

export interface MealPlan {
  id: string;
  created_at: string;
  preferences: MealPlanPreferences;
  weekly_total_estimated_cost: number;
  currency: Currency;
  daily_plans: DailyPlan[];
  isAiGenerated?: boolean;
  planType?: "ai" | "preset";
}

export interface AggregatedGroceryItem {
  id: string;
  name: string;
  amounts: { amount: number; unit: string }[];
  formattedQuantity: string;
  category: Ingredient["category"];
  checked: boolean;
  usedInMeals: string[];
}
