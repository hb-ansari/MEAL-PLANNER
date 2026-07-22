import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60; // Allow up to 60s for AI generation (Vercel Hobby limit)
import { MealPlanPreferences, MealPlan } from "@/types/meal-plan";
import { generateMealPlanAI } from "@/lib/ai-generator";
import { getPresetMealPlan } from "@/lib/preset-plans";
import { saveMealPlanToDb } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Check if preset plan is requested
    if (body.presetId) {
      const presetPlan = getPresetMealPlan(body.presetId);
      const planId = await saveMealPlanToDb(presetPlan);
      return NextResponse.json({ id: planId, plan: presetPlan });
    }

    const preferences: MealPlanPreferences = body;

    if (!preferences.target_budget || !preferences.daily_calories) {
      return NextResponse.json(
        { error: "Invalid preferences. Budget and calories are required." },
        { status: 400 }
      );
    }

    const mealPlan: MealPlan = await generateMealPlanAI(preferences);
    mealPlan.isAiGenerated = true;
    mealPlan.planType = "ai";
    mealPlan.preferences.isAiGenerated = true;

    const planId = await saveMealPlanToDb(mealPlan);

    return NextResponse.json({ id: planId, plan: mealPlan });
  } catch (err: any) {
    console.error("API error in /api/generate-plan:", err);
    return NextResponse.json(
      { error: err.message || "Failed to generate meal plan" },
      { status: 500 }
    );
  }
}
