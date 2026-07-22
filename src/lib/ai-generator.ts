import { MealPlanPreferences, MealPlan, Meal, DailyPlan, MealType } from "@/types/meal-plan";
import { GoogleGenerativeAI } from "@google/generative-ai";

const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export async function generateMealPlanAI(preferences: MealPlanPreferences): Promise<MealPlan> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey) {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      // gemini-1.5-flash: stable, fast, best for production on Vercel Hobby
      const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        generationConfig: { responseMimeType: "application/json" },
      });

      const prompt = `You are a professional nutritionist and executive chef.
Generate a structured JSON meal plan based on these exact constraints:
- Dietary Restrictions: ${preferences.dietary_restrictions.length > 0 ? preferences.dietary_restrictions.join(", ") : "None"}
- Target Weekly Budget: ${preferences.target_budget} ${preferences.currency}
- Target Daily Calories: ${preferences.daily_calories} kcal
- Primary Objective: ${preferences.primary_objective}
- Days Count: ${preferences.days_count} days
- Meals Per Day: ${preferences.meals_per_day.join(", ")}

Respond STRICTLY in JSON format with no markdown wrappers or extra text.
Required Schema:
{
  "weekly_total_estimated_cost": number,
  "daily_plans": [
    {
      "day": string,
      "day_number": number,
      "total_calories": number,
      "meals": [
        {
          "id": string,
          "type": "Breakfast" | "Lunch" | "Dinner" | "Snack",
          "recipe_name": string,
          "prep_time_mins": number,
          "calories": number,
          "macros": { "protein_g": number, "carbs_g": number, "fat_g": number },
          "estimated_cost": number,
          "ingredients": [
            { "name": string, "amount": number, "unit": string, "category": "Produce" | "Dairy & Eggs" | "Meat & Seafood" | "Grains & Bakery" | "Pantry & Spices" }
          ],
          "instructions": [string]
        }
      ]
    }
  ]
}`;

      const response = await model.generateContent(prompt);
      const text = response.response.text();

      if (text) {
        const parsed = JSON.parse(text);
        const planId = `plan-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
        const plan: MealPlan = {
          id: planId,
          created_at: new Date().toISOString(),
          preferences,
          weekly_total_estimated_cost: parsed.weekly_total_estimated_cost || Math.round(preferences.target_budget * 0.9),
          currency: preferences.currency,
          daily_plans: parsed.daily_plans || [],
        };
        return ensureAllDays(plan, preferences);
      }
    } catch (err) {
      console.warn("Gemini AI generation error, falling back to structured generator:", err);
    }
  }

  // Fallback high-quality structured generator
  return ensureAllDays(generateFallbackMealPlan(preferences), preferences);
}

function ensureAllDays(plan: MealPlan, preferences: MealPlanPreferences): MealPlan {
  const targetDays = Math.min(Math.max(preferences.days_count || 7, 1), 7);
  if (!plan.daily_plans || plan.daily_plans.length >= targetDays) {
    return plan;
  }

  const existingDays = [...plan.daily_plans];
  const fullDays: DailyPlan[] = [];

  for (let i = 0; i < targetDays; i++) {
    if (existingDays[i]) {
      fullDays.push(existingDays[i]);
    } else {
      const templateDay = existingDays[i % existingDays.length];
      const dayName = DAYS_OF_WEEK[i % 7];
      const dayMeals: Meal[] = templateDay.meals.map((m) => ({
        ...m,
        id: `${m.id}-d${i + 1}`,
      }));

      fullDays.push({
        day: dayName,
        day_number: i + 1,
        total_calories: templateDay.total_calories,
        meals: dayMeals,
      });
    }
  }

  return {
    ...plan,
    daily_plans: fullDays,
  };
}

export async function swapSingleMealAI(
  preferences: MealPlanPreferences,
  mealType: MealType,
  currentMealName: string,
  targetCalories: number
): Promise<Meal> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey) {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        generationConfig: { responseMimeType: "application/json" },
      });

      const prompt = `Generate a single alternative ${mealType} meal recipe replacing "${currentMealName}".
Must fit dietary restrictions: ${preferences.dietary_restrictions.join(", ") || "None"}.
Target Calories: ~${targetCalories} kcal.
Currency: ${preferences.currency}.

Strict JSON output only:
{
  "type": "${mealType}",
  "recipe_name": string,
  "prep_time_mins": number,
  "calories": number,
  "macros": { "protein_g": number, "carbs_g": number, "fat_g": number },
  "estimated_cost": number,
  "ingredients": [
    { "name": string, "amount": number, "unit": string, "category": "Produce" | "Dairy & Eggs" | "Meat & Seafood" | "Grains & Bakery" | "Pantry & Spices" }
  ],
  "instructions": [string]
}`;

      const res = await model.generateContent(prompt);
      const text = res.response.text();

      if (text) {
        const parsedMeal = JSON.parse(text);
        return {
          ...parsedMeal,
          id: `meal-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        };
      }
    } catch (err) {
      console.warn("Swap AI error, using fallback swap:", err);
    }
  }

  return generateFallbackSingleMeal(mealType, currentMealName, targetCalories, preferences);
}

// Fallback intelligent meal plan generator
function generateFallbackMealPlan(preferences: MealPlanPreferences): MealPlan {
  const planId = `plan-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const daysCount = Math.min(Math.max(preferences.days_count || 7, 1), 7);
  const dailyPlans: DailyPlan[] = [];

  const isPKR = preferences.currency === "PKR";
  const costMultiplier = isPKR ? 280 : 1;

  const totalWeeklyBudget = preferences.target_budget;
  const budgetPerDay = totalWeeklyBudget / daysCount;

  for (let i = 0; i < daysCount; i++) {
    const dayName = DAYS_OF_WEEK[i % 7];
    const meals: Meal[] = [];
    let dayCalories = 0;

    const mealsToGenerate = preferences.meals_per_day && preferences.meals_per_day.length > 0
      ? preferences.meals_per_day
      : (["Breakfast", "Lunch", "Dinner", "Snack"] as MealType[]);

    const totalMealWeight = mealsToGenerate.reduce((acc, m) => acc + (m === "Snack" ? 0.15 : 0.28), 0);

    mealsToGenerate.forEach((type) => {
      const weight = type === "Snack" ? 0.15 : 0.28;
      const targetCal = Math.round((preferences.daily_calories * weight) / totalMealWeight);
      const targetCost = Math.round(((budgetPerDay * weight) / totalMealWeight) * 100) / 100;

      const meal = getFallbackRecipe(type, i, targetCal, targetCost, preferences, costMultiplier);
      meals.push(meal);
      dayCalories += meal.calories;
    });

    dailyPlans.push({
      day: dayName,
      day_number: i + 1,
      total_calories: dayCalories,
      meals,
    });
  }

  const estimatedTotalCost = Math.round(
    dailyPlans.reduce((acc, d) => acc + d.meals.reduce((mAcc, m) => mAcc + m.estimated_cost, 0), 0)
  );

  return {
    id: planId,
    created_at: new Date().toISOString(),
    preferences,
    weekly_total_estimated_cost: estimatedTotalCost,
    currency: preferences.currency,
    daily_plans: dailyPlans,
  };
}

function getFallbackRecipe(
  type: MealType,
  dayOffset: number,
  targetCal: number,
  targetCost: number,
  preferences: MealPlanPreferences,
  costMultiplier: number
): Meal {
  const isVegan = preferences.dietary_restrictions.includes("Vegan");
  const isKeto = preferences.dietary_restrictions.includes("Keto");

  const recipeDatabase: Record<MealType, Array<{ name: string; prep: number; protein: number; carbs: number; fat: number; ingredients: any[]; steps: string[] }>> = {
    Breakfast: [
      {
        name: isKeto ? "Scrambled Eggs with Avocado & Spinach" : isVegan ? "Avocado Toast on Sourdough with Seeds" : "Oatmeal with Almonds, Honey & Berries",
        prep: 10,
        protein: isKeto ? 24 : 14,
        carbs: isKeto ? 8 : 52,
        fat: isKeto ? 28 : 12,
        ingredients: [
          { name: isKeto ? "Eggs" : isVegan ? "Sourdough Bread" : "Rolled Oats", amount: isKeto ? 3 : 1, unit: isKeto ? "pcs" : "cup", category: isKeto ? "Dairy & Eggs" : "Grains & Bakery" },
          { name: "Avocado", amount: 0.5, unit: "pc", category: "Produce" },
          { name: isKeto ? "Spinach" : "Almonds", amount: isKeto ? 1 : 15, unit: isKeto ? "cup" : "pcs", category: isKeto ? "Produce" : "Pantry & Spices" },
          { name: "Olive Oil", amount: 1, unit: "tbsp", category: "Pantry & Spices" },
        ],
        steps: [
          "Prepare ingredients and heat pan over medium flame.",
          "Cook ingredients gently for 5-8 minutes until golden.",
          "Plate nicely and season with a pinch of salt and pepper."
        ]
      },
      {
        name: isVegan ? "Berry Chia Seed Pudding with Coconut Milk" : "Greek Yogurt Bowl with Honey & Walnuts",
        prep: 8,
        protein: 18,
        carbs: 35,
        fat: 14,
        ingredients: [
          { name: isVegan ? "Chia Seeds" : "Greek Yogurt", amount: isVegan ? 3 : 1, unit: isVegan ? "tbsp" : "cup", category: isVegan ? "Pantry & Spices" : "Dairy & Eggs" },
          { name: "Honey", amount: 1, unit: "tbsp", category: "Pantry & Spices" },
          { name: "Walnuts", amount: 10, unit: "pcs", category: "Pantry & Spices" },
          { name: "Fresh Berries", amount: 0.5, unit: "cup", category: "Produce" },
        ],
        steps: [
          "Whisk bases together in a serving bowl.",
          "Top with fresh berries, crunchy walnuts, and drizzled honey."
        ]
      }
    ],
    Lunch: [
      {
        name: isVegan ? "Mediterranean Chickpea & Quinoa Bowl" : isKeto ? "Grilled Chicken Caesar Salad (No Croutons)" : "Grilled Chicken Breast with Brown Rice & Broccoli",
        prep: 20,
        protein: isKeto ? 42 : 36,
        carbs: isKeto ? 10 : 58,
        fat: isKeto ? 24 : 14,
        ingredients: [
          { name: isVegan ? "Chickpeas" : "Chicken Breast", amount: 200, unit: "g", category: isVegan ? "Pantry & Spices" : "Meat & Seafood" },
          { name: isKeto ? "Romaine Lettuce" : "Brown Rice", amount: isKeto ? 2 : 1, unit: isKeto ? "cups" : "cup", category: isKeto ? "Produce" : "Grains & Bakery" },
          { name: "Broccoli", amount: 1, unit: "cup", category: "Produce" },
          { name: "Olive Oil", amount: 1, unit: "tbsp", category: "Pantry & Spices" },
        ],
        steps: [
          "Season protein with garlic, paprika, salt, and pepper.",
          "Grill or sauté on medium-high heat for 12-15 minutes.",
          "Steam vegetables and serve warm over grain/greens base."
        ]
      },
      {
        name: isVegan ? "Lentil Soup with Crusty Whole Wheat Roll" : "Turkey & Cucumber Avocado Wrap",
        prep: 15,
        protein: 30,
        carbs: 45,
        fat: 16,
        ingredients: [
          { name: isVegan ? "Brown Lentils" : "Sliced Turkey", amount: 150, unit: "g", category: isVegan ? "Pantry & Spices" : "Meat & Seafood" },
          { name: "Cucumber", amount: 1, unit: "pc", category: "Produce" },
          { name: "Whole Grain Wrap", amount: 1, unit: "pc", category: "Grains & Bakery" },
          { name: "Hummus", amount: 2, unit: "tbsp", category: "Produce" },
        ],
        steps: [
          "Spread hummus across wrap surface.",
          "Layer protein and sliced fresh veggies tightly.",
          "Slice in half and serve immediately."
        ]
      }
    ],
    Dinner: [
      {
        name: isVegan ? "Tofu Veggie Stir-Fry with Sesame Noodles" : "Baked Salmon Fillet with Asparagus & Sweet Potato",
        prep: 25,
        protein: 38,
        carbs: 42,
        fat: 18,
        ingredients: [
          { name: isVegan ? "Firm Tofu" : "Salmon Fillet", amount: 200, unit: "g", category: isVegan ? "Dairy & Eggs" : "Meat & Seafood" },
          { name: "Asparagus", amount: 1, unit: "bunch", category: "Produce" },
          { name: "Sweet Potato", amount: 1, unit: "medium", category: "Produce" },
          { name: "Soy Sauce & Ginger", amount: 1, unit: "tbsp", category: "Pantry & Spices" },
        ],
        steps: [
          "Preheat oven to 200°C (400°F).",
          "Season salmon/tofu and asparagus with olive oil and spices.",
          "Roast for 18-20 minutes until tender and caramelized."
        ]
      },
      {
        name: isVegan ? "Vegetable Curry with Jasmine Rice" : "Lean Beef Steak with Garlic Butter & Roasted Zucchini",
        prep: 30,
        protein: 34,
        carbs: 38,
        fat: 20,
        ingredients: [
          { name: isVegan ? "Mixed Veggies" : "Lean Beef Steak", amount: 200, unit: "g", category: isVegan ? "Produce" : "Meat & Seafood" },
          { name: "Zucchini", amount: 1, unit: "large", category: "Produce" },
          { name: "Jasmine Rice", amount: 0.75, unit: "cup", category: "Grains & Bakery" },
          { name: "Garlic Butter", amount: 1, unit: "tbsp", category: "Dairy & Eggs" },
        ],
        steps: [
          "Sear steak/veggies in hot skillet for 3-4 mins per side.",
          "Baste with garlic butter for richness.",
          "Serve alongside steamed Jasmine rice."
        ]
      }
    ],
    Snack: [
      {
        name: "Apple Slices with Peanut Butter",
        prep: 5,
        protein: 8,
        carbs: 24,
        fat: 12,
        ingredients: [
          { name: "Crisp Apple", amount: 1, unit: "medium", category: "Produce" },
          { name: "Natural Peanut Butter", amount: 2, unit: "tbsp", category: "Pantry & Spices" },
        ],
        steps: ["Core and slice apple.", "Serve with creamy peanut butter for dipping."]
      },
      {
        name: "Handful of Mixed Nuts & Dark Chocolate",
        prep: 2,
        protein: 6,
        carbs: 16,
        fat: 14,
        ingredients: [
          { name: "Mixed Nuts (Almonds, Cashews)", amount: 30, unit: "g", category: "Pantry & Spices" },
          { name: "Dark Chocolate (70%)", amount: 15, unit: "g", category: "Pantry & Spices" },
        ],
        steps: ["Combine in a snack dish and enjoy!"]
      }
    ]
  };

  const pool = recipeDatabase[type];
  const template = pool[dayOffset % pool.length];

  const actualCost = Math.round(targetCost * costMultiplier * 100) / 100;

  return {
    id: `meal-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    type,
    recipe_name: template.name,
    prep_time_mins: template.prep,
    calories: targetCal,
    macros: {
      protein_g: template.protein,
      carbs_g: template.carbs,
      fat_g: template.fat,
    },
    estimated_cost: actualCost,
    ingredients: template.ingredients,
    instructions: template.steps,
  };
}

function generateFallbackSingleMeal(
  mealType: MealType,
  currentMealName: string,
  targetCalories: number,
  preferences: MealPlanPreferences
): Meal {
  const alternates: Record<MealType, string[]> = {
    Breakfast: ["Protein Berry Smoothie Bowl", "Poached Eggs on Avocado Toast", "Banana Peanut Butter Oat Pancakes"],
    Lunch: ["Mediterranean Quinoa Salad with Feta", "Turkey Breast & Spinach Stuffed Pita", "Grilled Shrimp Caesar Bowl"],
    Dinner: ["Pan-Seared Cod with Roasted Cauliflower", "Beef Teriyaki Stir-Fry with Broccoli", "Stuffed Bell Peppers with Black Beans & Rice"],
    Snack: ["Greek Yogurt with Honey & Granola", "Hummus with Cucumber & Carrot Sticks", "Protein Almond Energy Bites"],
  };

  const list = alternates[mealType] || alternates.Lunch;
  const newName = list.find((n) => n !== currentMealName) || list[0];
  const isPKR = preferences.currency === "PKR";
  const cost = isPKR ? Math.round(450 + Math.random() * 200) : Math.round((3 + Math.random() * 3) * 100) / 100;

  return {
    id: `meal-swap-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    type: mealType,
    recipe_name: newName,
    prep_time_mins: 12 + Math.floor(Math.random() * 10),
    calories: targetCalories || 480,
    macros: {
      protein_g: 28 + Math.floor(Math.random() * 10),
      carbs_g: 45 + Math.floor(Math.random() * 15),
      fat_g: 14 + Math.floor(Math.random() * 6),
    },
    estimated_cost: cost,
    ingredients: [
      { name: "Primary Protein", amount: 150, unit: "g", category: "Meat & Seafood" },
      { name: "Fresh Veggie Mix", amount: 1, unit: "cup", category: "Produce" },
      { name: "Extra Virgin Olive Oil", amount: 1, unit: "tbsp", category: "Pantry & Spices" },
    ],
    instructions: [
      "Prepare fresh ingredients and heat skillet.",
      "Sauté for 8-10 minutes until aromatic and fully cooked.",
      "Garnish with herbs and serve fresh."
    ],
  };
}
