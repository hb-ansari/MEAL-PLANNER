import { NextRequest, NextResponse } from "next/server";
import { swapSingleMealAI } from "@/lib/ai-generator";
import { getMealPlanFromDb, updateMealPlanInDb } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const { planId, dayNumber, mealId, mealType, currentRecipeName, targetCalories } = await req.json();

    if (!planId || !mealId) {
      return NextResponse.json({ error: "Missing planId or mealId" }, { status: 400 });
    }

    const existingPlan = await getMealPlanFromDb(planId);
    if (!existingPlan) {
      return NextResponse.json({ error: "Meal plan not found" }, { status: 404 });
    }

    const newMeal = await swapSingleMealAI(
      existingPlan.preferences,
      mealType,
      currentRecipeName,
      targetCalories
    );

    // Update meal in plan array
    let updated = false;
    existingPlan.daily_plans = existingPlan.daily_plans.map((dayPlan) => {
      if (dayPlan.day_number === dayNumber || existingPlan.daily_plans.length === 1) {
        dayPlan.meals = dayPlan.meals.map((meal) => {
          if (meal.id === mealId) {
            updated = true;
            return { ...newMeal, id: mealId };
          }
          return meal;
        });
      }
      return dayPlan;
    });

    if (!updated) {
      // Fallback update any meal with matching id
      existingPlan.daily_plans.forEach((dayPlan) => {
        dayPlan.meals = dayPlan.meals.map((meal) => (meal.id === mealId ? { ...newMeal, id: mealId } : meal));
      });
    }

    // Recalculate total estimated cost
    existingPlan.weekly_total_estimated_cost = Math.round(
      existingPlan.daily_plans.reduce(
        (acc, d) => acc + d.meals.reduce((mAcc, m) => mAcc + m.estimated_cost, 0),
        0
      )
    );

    await updateMealPlanInDb(existingPlan);

    return NextResponse.json({ success: true, updatedMeal: newMeal, plan: existingPlan });
  } catch (err: any) {
    console.error("Error in /api/swap-meal:", err);
    return NextResponse.json({ error: err.message || "Failed to swap meal" }, { status: 500 });
  }
}
