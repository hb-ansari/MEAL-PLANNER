import { createClient } from "@supabase/supabase-js";
import { MealPlan } from "@/types/meal-plan";
import { getPresetMealPlan } from "./preset-plans";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  "";

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Memory cache fallback for local development / missing env vars
const memoryStore = new Map<string, MealPlan>();

export async function saveMealPlanToDb(plan: MealPlan): Promise<string> {
  memoryStore.set(plan.id, plan);

  if (supabase) {
    try {
      const payload: any = {
        id: plan.id,
        created_at: plan.created_at,
        preferences: {
          ...plan.preferences,
          isAiGenerated: plan.isAiGenerated ?? true,
          planType: plan.planType ?? "ai",
        },
        weekly_total_estimated_cost: plan.weekly_total_estimated_cost,
        daily_plans: plan.daily_plans,
        currency: plan.currency,
      };

      const { data, error } = await supabase
        .from("meal_plans")
        .insert(payload)
        .select("id")
        .single();

      if (error) {
        console.warn("Supabase insert warning, using memory fallback:", error.message);
      } else if (data?.id) {
        return data.id;
      }
    } catch (err) {
      console.warn("Supabase store exception, using memory fallback:", err);
    }
  }

  return plan.id;
}

export async function getMealPlanFromDb(id: string): Promise<MealPlan | null> {
  if (memoryStore.has(id)) {
    return memoryStore.get(id) || null;
  }

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("meal_plans")
        .select("*")
        .eq("id", id)
        .single();

      if (!error && data) {
        const plan: MealPlan = {
          id: data.id,
          created_at: data.created_at,
          preferences: data.preferences,
          weekly_total_estimated_cost: data.weekly_total_estimated_cost,
          currency: data.currency || "USD",
          daily_plans: data.daily_plans,
          isAiGenerated: data.is_ai_generated ?? data.preferences?.isAiGenerated ?? true,
          planType: data.plan_type || data.preferences?.planType || (data.is_ai_generated === false ? "preset" : "ai"),
        };

        memoryStore.set(id, plan);
        return plan;
      }
    } catch (err) {
      console.error("Error fetching meal plan from Supabase:", err);
    }
  }

  // Fallback for preset plan IDs across worker restarts
  if (id.startsWith("preset-") || id.startsWith("plan-preset-")) {
    let presetKey = "preset-balanced-7day";
    if (id.includes("high-protein") || id.includes("hp")) {
      presetKey = "preset-high-protein-7day";
    } else if (id.includes("halal")) {
      presetKey = "preset-budget-halal-7day";
    } else if (id.includes("keto")) {
      presetKey = "preset-keto-express-7day";
    }

    const presetPlan = getPresetMealPlan(presetKey);
    presetPlan.id = id;
    memoryStore.set(id, presetPlan);
    return presetPlan;
  }

  return null;
}

export async function updateMealPlanInDb(plan: MealPlan): Promise<boolean> {
  memoryStore.set(plan.id, plan);

  if (supabase) {
    try {
      const { error } = await supabase
        .from("meal_plans")
        .update({
          daily_plans: plan.daily_plans,
          weekly_total_estimated_cost: plan.weekly_total_estimated_cost,
        })
        .eq("id", plan.id);

      if (error) {
        console.warn("Supabase update error:", error.message);
      }
    } catch (err) {
      console.warn("Supabase update exception:", err);
    }
  }
  return true;
}
