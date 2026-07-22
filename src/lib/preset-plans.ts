import { MealPlan, DietaryRestriction, Currency, PrimaryObjective } from "@/types/meal-plan";

export interface PresetPlanSummary {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  dietary: DietaryRestriction[];
  calories: number;
  objective: PrimaryObjective;
  budget: number;
  currency: Currency;
  icon: string;
  badge: string;
}

export const PRESET_PLANS_LIST: PresetPlanSummary[] = [
  {
    id: "preset-balanced-7day",
    title: "7-Day Everyday Balanced Plan",
    subtitle: "Complete whole-food nutrition for daily energy",
    description: "Features Mediterranean-inspired dishes, fresh veggies, lean meats, and whole grains. Ideal for general health & wellbeing.",
    dietary: [],
    calories: 2000,
    objective: "Maintenance",
    budget: 75,
    currency: "USD",
    icon: "🥗",
    badge: "Most Popular Preset",
  },
  {
    id: "preset-high-protein-7day",
    title: "7-Day High Protein Muscle Builder",
    subtitle: "Optimal protein ratios for strength & recovery",
    description: "Packed with grilled chicken, salmon, Greek yogurt, and legumes to support muscle growth and fat loss goals.",
    dietary: ["Low-Carb"],
    calories: 2500,
    objective: "Muscle Gain",
    budget: 95,
    currency: "USD",
    icon: "🥩",
    badge: "Fitness Choice",
  },
  {
    id: "preset-budget-halal-7day",
    title: "7-Day Budget Halal Family Plan",
    subtitle: "100% Halal certified recipes tailored for savings",
    description: "Economical and flavorful Halal meals like spiced chicken pilaf, lentil curry, and egg avocado breakfasts.",
    dietary: ["Halal"],
    calories: 2200,
    objective: "Maintenance",
    budget: 15000,
    currency: "PKR",
    icon: "🌙",
    badge: "Budget Special",
  },
  {
    id: "preset-keto-express-7day",
    title: "7-Day Low-Carb Keto Power",
    subtitle: "High healthy fats & strict low-carbohydrate ratio",
    description: "Designed for ketosis with avocados, eggs, steak, olive oil, and leafy greens. Zero refined carbs.",
    dietary: ["Keto", "Gluten-Free", "Low-Carb"],
    calories: 1800,
    objective: "Weight Loss",
    budget: 85,
    currency: "USD",
    icon: "🥑",
    badge: "Fat Burner",
  },
];

const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

function expandToFullSevenDays(plan: MealPlan): MealPlan {
  if (!plan.daily_plans || plan.daily_plans.length >= 7) {
    return plan;
  }

  const basePlans = plan.daily_plans;
  const fullSevenDays = [];

  const dayVariations: Record<string, string[]> = {
    Breakfast: [
      "with Fresh Berries & Honey",
      "with Toasted Seeds & Avocado",
      "with Poached Egg & Herbs",
      "with Greek Yogurt & Walnuts",
      "with Cinnamon & Sliced Almonds",
      "with Baby Spinach & Feta",
      "with Citrus & Spiced Butter",
    ],
    Lunch: [
      "with Lemon Tahini Dressing",
      "with Roasted Garlic & Quinoa",
      "with Smoked Paprika & Greens",
      "with Herbed Couscous",
      "with Avocado Salsa",
      "with Spiced Chickpeas",
      "with Grilled Veggies",
    ],
    Dinner: [
      "with Garlic Herb Butter",
      "with Roasted Root Vegetables",
      "with Steamed Asparagus & Lemon",
      "with Sautéed Kale & Olive Oil",
      "with Wild Rice Pilaf",
      "with Charred Broccolini",
      "with Tomato Herb Glaze",
    ],
    Snack: [
      "with Sea Salt & Almonds",
      "with Fresh Mint & Lime",
      "with Dark Chocolate Chips",
      "with Roasted Pumpkin Seeds",
      "with Honey Drizzle",
      "with Cracked Black Pepper",
      "with Dried Cranberries",
    ],
  };

  for (let i = 0; i < 7; i++) {
    const dayName = DAYS_OF_WEEK[i];
    const sourceDay = basePlans[i % basePlans.length];

    const dayMeals = sourceDay.meals.map((m) => {
      const variations = dayVariations[m.type] || dayVariations.Lunch;
      const variationText = variations[i % variations.length];

      const baseName = m.recipe_name.split(" with ")[0];
      const newName = i === 0 ? m.recipe_name : `${baseName} ${variationText}`;
      const calOffset = (i * 15 - 45);
      const costOffset = Math.round((i * 0.2 - 0.6) * 100) / 100;

      return {
        ...m,
        id: `${m.id}-d${i + 1}`,
        recipe_name: newName,
        calories: Math.max(100, m.calories + calOffset),
        estimated_cost: Math.max(1, Math.round((m.estimated_cost + costOffset) * 100) / 100),
      };
    });

    const dayTotalCalories = dayMeals.reduce((acc, m) => acc + m.calories, 0);

    fullSevenDays.push({
      day: dayName,
      day_number: i + 1,
      total_calories: dayTotalCalories,
      meals: dayMeals,
    });
  }

  const updatedWeeklyCost = Math.round(
    fullSevenDays.reduce((acc, d) => acc + d.meals.reduce((mAcc, m) => mAcc + m.estimated_cost, 0), 0)
  );

  return {
    ...plan,
    weekly_total_estimated_cost: updatedWeeklyCost,
    daily_plans: fullSevenDays,
  };
}

export function getPresetMealPlan(presetId: string): MealPlan {
  const now = new Date().toISOString();
  let rawPlan: MealPlan;

  switch (presetId) {
    case "preset-high-protein-7day":
      rawPlan = {
        id: `plan-preset-hp-${Date.now()}`,
        created_at: now,
        isAiGenerated: false,
        planType: "preset",
        currency: "USD",
        weekly_total_estimated_cost: 92,
        preferences: {
          dietary_restrictions: ["Low-Carb"],
          target_budget: 95,
          currency: "USD",
          daily_calories: 2500,
          primary_objective: "Muscle Gain",
          days_count: 7,
          meals_per_day: ["Breakfast", "Lunch", "Dinner", "Snack"],
        },
        daily_plans: [
          {
            day: "Monday",
            day_number: 1,
            total_calories: 2480,
            meals: [
              {
                id: "hp-m1-1",
                type: "Breakfast",
                recipe_name: "4-Egg Omelet with Spinach & Feta",
                prep_time_mins: 10,
                calories: 520,
                macros: { protein_g: 36, carbs_g: 6, fat_g: 38 },
                estimated_cost: 3.5,
                ingredients: [
                  { name: "Large Eggs", amount: 4, unit: "pcs", category: "Dairy & Eggs" },
                  { name: "Fresh Spinach", amount: 1, unit: "cup", category: "Produce" },
                  { name: "Feta Cheese", amount: 30, unit: "g", category: "Dairy & Eggs" },
                  { name: "Olive Oil", amount: 1, unit: "tbsp", category: "Pantry & Spices" },
                ],
                instructions: [
                  "Whisk eggs with a pinch of salt and black pepper.",
                  "Heat olive oil in skillet, sauté spinach for 1 minute.",
                  "Pour eggs over spinach, sprinkle crumbled feta, and fold when cooked."
                ],
              },
              {
                id: "hp-m1-2",
                type: "Lunch",
                recipe_name: "Double Chicken Breast Bowl with Quinoa",
                prep_time_mins: 20,
                calories: 780,
                macros: { protein_g: 68, carbs_g: 62, fat_g: 18 },
                estimated_cost: 6.2,
                ingredients: [
                  { name: "Chicken Breast", amount: 250, unit: "g", category: "Meat & Seafood" },
                  { name: "Cooked Quinoa", amount: 1.5, unit: "cups", category: "Grains & Bakery" },
                  { name: "Steamed Broccoli", amount: 1, unit: "cup", category: "Produce" },
                  { name: "Avocado Oil", amount: 1, unit: "tbsp", category: "Pantry & Spices" },
                ],
                instructions: [
                  "Season chicken breast with garlic powder, paprika, salt, and pepper.",
                  "Grill on medium-high heat for 6-7 minutes per side.",
                  "Serve over fluffy warm quinoa and steamed broccoli."
                ],
              },
              {
                id: "hp-m1-3",
                type: "Dinner",
                recipe_name: "Pan-Seared Salmon Fillet with Roasted Asparagus",
                prep_time_mins: 25,
                calories: 750,
                macros: { protein_g: 52, carbs_g: 28, fat_g: 42 },
                estimated_cost: 8.5,
                ingredients: [
                  { name: "Atlantic Salmon Fillet", amount: 220, unit: "g", category: "Meat & Seafood" },
                  { name: "Fresh Asparagus", amount: 1, unit: "bunch", category: "Produce" },
                  { name: "Roasted Sweet Potato", amount: 1, unit: "medium", category: "Produce" },
                  { name: "Lemon Juice & Butter", amount: 1, unit: "tbsp", category: "Dairy & Eggs" },
                ],
                instructions: [
                  "Preheat oven to 200°C (400°F).",
                  "Sear salmon skin-side down for 4 minutes until crispy, then flip.",
                  "Roast asparagus and sweet potato wedges alongside salmon for 15 minutes."
                ],
              },
              {
                id: "hp-m1-4",
                type: "Snack",
                recipe_name: "Greek Yogurt Protein Parfait",
                prep_time_mins: 5,
                calories: 430,
                macros: { protein_g: 34, carbs_g: 40, fat_g: 12 },
                estimated_cost: 2.8,
                ingredients: [
                  { name: "0% Greek Yogurt", amount: 250, unit: "g", category: "Dairy & Eggs" },
                  { name: "Whey Protein Powder", amount: 1, unit: "scoop", category: "Pantry & Spices" },
                  { name: "Mixed Berries", amount: 0.5, unit: "cup", category: "Produce" },
                  { name: "Almonds", amount: 15, unit: "pcs", category: "Pantry & Spices" },
                ],
                instructions: [
                  "Stir protein powder thoroughly into Greek yogurt.",
                  "Top with fresh berries and crushed almonds before serving."
                ],
              },
            ],
          },
          {
            day: "Tuesday",
            day_number: 2,
            total_calories: 2510,
            meals: [
              {
                id: "hp-m2-1",
                type: "Breakfast",
                recipe_name: "Protein Oats with Peanut Butter & Banana",
                prep_time_mins: 10,
                calories: 580,
                macros: { protein_g: 32, carbs_g: 68, fat_g: 22 },
                estimated_cost: 2.5,
                ingredients: [
                  { name: "Rolled Oats", amount: 1, unit: "cup", category: "Grains & Bakery" },
                  { name: "Natural Peanut Butter", amount: 2, unit: "tbsp", category: "Pantry & Spices" },
                  { name: "Ripe Banana", amount: 1, unit: "pc", category: "Produce" },
                  { name: "Almond Milk", amount: 1.5, unit: "cups", category: "Dairy & Eggs" },
                ],
                instructions: [
                  "Simmer oats in almond milk over low heat for 5 minutes.",
                  "Stir in peanut butter, slice banana on top, and serve warm."
                ],
              },
              {
                id: "hp-m2-2",
                type: "Lunch",
                recipe_name: "Lean Steak Fajita Salad Bowl",
                prep_time_mins: 18,
                calories: 760,
                macros: { protein_g: 62, carbs_g: 32, fat_g: 40 },
                estimated_cost: 7.5,
                ingredients: [
                  { name: "Flank Steak", amount: 200, unit: "g", category: "Meat & Seafood" },
                  { name: "Bell Peppers & Onions", amount: 1.5, unit: "cups", category: "Produce" },
                  { name: "Romaine Lettuce", amount: 2, unit: "cups", category: "Produce" },
                  { name: "Guacamole", amount: 3, unit: "tbsp", category: "Produce" },
                ],
                instructions: [
                  "Sear flank steak strips in hot skillet for 5 minutes.",
                  "Sauté sliced peppers and onions with cumin and garlic.",
                  "Assemble over bed of lettuce and top with guacamole."
                ],
              },
              {
                id: "hp-m2-3",
                type: "Dinner",
                recipe_name: "Grilled Turkey Burgers with Zucchini Fries",
                prep_time_mins: 25,
                calories: 740,
                macros: { protein_g: 58, carbs_g: 42, fat_g: 32 },
                estimated_cost: 6.8,
                ingredients: [
                  { name: "Lean Ground Turkey", amount: 220, unit: "g", category: "Meat & Seafood" },
                  { name: "Whole Grain Buns", amount: 1, unit: "pc", category: "Grains & Bakery" },
                  { name: "Zucchini Strips", amount: 2, unit: "pcs", category: "Produce" },
                  { name: "Olive Oil & Seasonings", amount: 1, unit: "tbsp", category: "Pantry & Spices" },
                ],
                instructions: [
                  "Form turkey patty and cook on grill or skillet for 6 mins per side.",
                  "Bake parmesan zucchini fries in oven at 215°C for 18 mins.",
                  "Serve burger on toasted bun with crispy fries."
                ],
              },
              {
                id: "hp-m2-4",
                type: "Snack",
                recipe_name: "Cottage Cheese with Honey & Walnuts",
                prep_time_mins: 3,
                calories: 430,
                macros: { protein_g: 30, carbs_g: 28, fat_g: 18 },
                estimated_cost: 2.2,
                ingredients: [
                  { name: "Low-Fat Cottage Cheese", amount: 200, unit: "g", category: "Dairy & Eggs" },
                  { name: "Raw Honey", amount: 1, unit: "tbsp", category: "Pantry & Spices" },
                  { name: "Walnuts", amount: 20, unit: "g", category: "Pantry & Spices" },
                ],
                instructions: [
                  "Scoop cottage cheese into bowl, drizzle with honey and crushed walnuts."
                ],
              },
            ],
          },
        ],
      };

    case "preset-budget-halal-7day":
      rawPlan = {
        id: `plan-preset-halal-${Date.now()}`,
        created_at: now,
        isAiGenerated: false,
        planType: "preset",
        currency: "PKR",
        weekly_total_estimated_cost: 14200,
        preferences: {
          dietary_restrictions: ["Halal"],
          target_budget: 15000,
          currency: "PKR",
          daily_calories: 2200,
          primary_objective: "Maintenance",
          days_count: 7,
          meals_per_day: ["Breakfast", "Lunch", "Dinner", "Snack"],
        },
        daily_plans: [
          {
            day: "Monday",
            day_number: 1,
            total_calories: 2180,
            meals: [
              {
                id: "halal-m1-1",
                type: "Breakfast",
                recipe_name: "Pakistani Egg Paratha & Masala Chai",
                prep_time_mins: 15,
                calories: 540,
                macros: { protein_g: 20, carbs_g: 62, fat_g: 24 },
                estimated_cost: 220,
                ingredients: [
                  { name: "Whole Wheat Atta Paratha", amount: 1, unit: "pc", category: "Grains & Bakery" },
                  { name: "Fresh Eggs", amount: 2, unit: "pcs", category: "Dairy & Eggs" },
                  { name: "Green Chili & Coriander", amount: 1, unit: "tbsp", category: "Produce" },
                  { name: "Milk for Chai", amount: 0.5, unit: "cup", category: "Dairy & Eggs" },
                ],
                instructions: [
                  "Whisk eggs with chopped green chilis, onions, and salt.",
                  "Fry egg omelet in a pan and toast whole wheat paratha.",
                  "Serve hot with freshly brewed cardamom tea."
                ],
              },
              {
                id: "halal-m1-2",
                type: "Lunch",
                recipe_name: "Halal Chicken Biryani with Cucumber Raita",
                prep_time_mins: 35,
                calories: 720,
                macros: { protein_g: 44, carbs_g: 82, fat_g: 22 },
                estimated_cost: 650,
                ingredients: [
                  { name: "Halal Chicken Thighs", amount: 200, unit: "g", category: "Meat & Seafood" },
                  { name: "Basmati Rice", amount: 1, unit: "cup", category: "Grains & Bakery" },
                  { name: "Yogurt Raita", amount: 0.5, unit: "cup", category: "Dairy & Eggs" },
                  { name: "Biryani Spices & Oil", amount: 2, unit: "tbsp", category: "Pantry & Spices" },
                ],
                instructions: [
                  "Marinate chicken in yogurt and spices for 20 minutes.",
                  "Cook fragrant basmati rice with whole spices.",
                  "Layer chicken and rice, steam for 15 minutes, serve with raita."
                ],
              },
              {
                id: "halal-m1-3",
                type: "Dinner",
                recipe_name: "Yellow Dal Tadka with Naan & Salad",
                prep_time_mins: 25,
                calories: 620,
                macros: { protein_g: 26, carbs_g: 88, fat_g: 16 },
                estimated_cost: 380,
                ingredients: [
                  { name: "Moong/Masoor Dal", amount: 1, unit: "cup", category: "Pantry & Spices" },
                  { name: "Garlic & Cumin Tadka", amount: 1, unit: "tbsp", category: "Pantry & Spices" },
                  { name: "Fresh Tandoori Naan", amount: 1, unit: "pc", category: "Grains & Bakery" },
                  { name: "Kachumber Salad", amount: 1, unit: "cup", category: "Produce" },
                ],
                instructions: [
                  "Pressure cook lentils until soft and creamy.",
                  "Prepare tadka with ghee, cumin seeds, garlic, and red chili.",
                  "Pour hot tadka over dal and serve with warm naan."
                ],
              },
              {
                id: "halal-m1-4",
                type: "Snack",
                recipe_name: "Roasted Chana & Fresh Fruit Chat",
                prep_time_mins: 5,
                calories: 300,
                macros: { protein_g: 12, carbs_g: 52, fat_g: 4 },
                estimated_cost: 150,
                ingredients: [
                  { name: "Roasted Black Chickpeas", amount: 50, unit: "g", category: "Pantry & Spices" },
                  { name: "Guava & Apple", amount: 1, unit: "cup", category: "Produce" },
                  { name: "Chaat Masala", amount: 0.5, unit: "tsp", category: "Pantry & Spices" },
                ],
                instructions: [
                  "Toss diced fruits with roasted chickpeas and chaat masala."
                ],
              },
            ],
          },
        ],
      };

    case "preset-keto-express-7day":
      rawPlan = {
        id: `plan-preset-keto-${Date.now()}`,
        created_at: now,
        isAiGenerated: false,
        planType: "preset",
        currency: "USD",
        weekly_total_estimated_cost: 82,
        preferences: {
          dietary_restrictions: ["Keto", "Gluten-Free", "Low-Carb"],
          target_budget: 85,
          currency: "USD",
          daily_calories: 1800,
          primary_objective: "Weight Loss",
          days_count: 7,
          meals_per_day: ["Breakfast", "Lunch", "Dinner", "Snack"],
        },
        daily_plans: [
          {
            day: "Monday",
            day_number: 1,
            total_calories: 1790,
            meals: [
              {
                id: "keto-m1-1",
                type: "Breakfast",
                recipe_name: "Keto Avocado & Bacon Scramble",
                prep_time_mins: 10,
                calories: 480,
                macros: { protein_g: 24, carbs_g: 5, fat_g: 40 },
                estimated_cost: 3.8,
                ingredients: [
                  { name: "Eggs", amount: 3, unit: "pcs", category: "Dairy & Eggs" },
                  { name: "Crispy Bacon", amount: 2, unit: "strips", category: "Meat & Seafood" },
                  { name: "Fresh Hass Avocado", amount: 0.5, unit: "pc", category: "Produce" },
                  { name: "Butter", amount: 1, unit: "tbsp", category: "Dairy & Eggs" },
                ],
                instructions: [
                  "Cook bacon strips until crispy in butter.",
                  "Scramble eggs in remaining fat over low heat.",
                  "Top with sliced avocado and cracked black pepper."
                ],
              },
              {
                id: "keto-m1-2",
                type: "Lunch",
                recipe_name: "Chicken Caesar Salad with Parmesan Crisp",
                prep_time_mins: 15,
                calories: 560,
                macros: { protein_g: 46, carbs_g: 4, fat_g: 38 },
                estimated_cost: 5.5,
                ingredients: [
                  { name: "Grilled Chicken Thigh", amount: 180, unit: "g", category: "Meat & Seafood" },
                  { name: "Romaine Hearts", amount: 2, unit: "cups", category: "Produce" },
                  { name: "Full-Fat Caesar Dressing", amount: 2, unit: "tbsp", category: "Pantry & Spices" },
                  { name: "Aged Parmesan Shavings", amount: 30, unit: "g", category: "Dairy & Eggs" },
                ],
                instructions: [
                  "Chop fresh romaine lettuce into a salad bowl.",
                  "Slice grilled chicken thigh over greens.",
                  "Toss with Caesar dressing and top with parmesan shavings."
                ],
              },
              {
                id: "keto-m1-3",
                type: "Dinner",
                recipe_name: "Ribeye Steak with Garlic Herb Butter & Cauliflower Mash",
                prep_time_mins: 25,
                calories: 570,
                macros: { protein_g: 42, carbs_g: 6, fat_g: 42 },
                estimated_cost: 8.9,
                ingredients: [
                  { name: "Ribeye Steak", amount: 200, unit: "g", category: "Meat & Seafood" },
                  { name: "Cauliflower Florets", amount: 1.5, unit: "cups", category: "Produce" },
                  { name: "Heavy Cream & Butter", amount: 2, unit: "tbsp", category: "Dairy & Eggs" },
                  { name: "Rosemary & Garlic", amount: 1, unit: "tsp", category: "Pantry & Spices" },
                ],
                instructions: [
                  "Sear ribeye in cast iron skillet 4 minutes per side with butter and rosemary.",
                  "Steam cauliflower florets and blend with cream and garlic into smooth mash.",
                  "Rest steak 5 minutes before slicing alongside creamy mash."
                ],
              },
              {
                id: "keto-m1-4",
                type: "Snack",
                recipe_name: "Macadamia Nuts & String Cheese",
                prep_time_mins: 2,
                calories: 180,
                macros: { protein_g: 8, carbs_g: 2, fat_g: 16 },
                estimated_cost: 2.1,
                ingredients: [
                  { name: "Raw Macadamia Nuts", amount: 20, unit: "g", category: "Pantry & Spices" },
                  { name: "Mozzarella Cheese Stick", amount: 1, unit: "pc", category: "Dairy & Eggs" },
                ],
                instructions: [
                  "Quick grab-and-go keto snack."
                ],
              },
            ],
          },
        ],
      };

    case "preset-balanced-7day":
    default:
      rawPlan = {
        id: `plan-preset-balanced-${Date.now()}`,
        created_at: now,
        isAiGenerated: false,
        planType: "preset",
        currency: "USD",
        weekly_total_estimated_cost: 72,
        preferences: {
          dietary_restrictions: [],
          target_budget: 75,
          currency: "USD",
          daily_calories: 2000,
          primary_objective: "Maintenance",
          days_count: 7,
          meals_per_day: ["Breakfast", "Lunch", "Dinner", "Snack"],
        },
        daily_plans: [
          {
            day: "Monday",
            day_number: 1,
            total_calories: 1980,
            meals: [
              {
                id: "bal-m1-1",
                type: "Breakfast",
                recipe_name: "Avocado Toast on Sourdough with Poached Egg",
                prep_time_mins: 12,
                calories: 420,
                macros: { protein_g: 16, carbs_g: 44, fat_g: 20 },
                estimated_cost: 3.2,
                ingredients: [
                  { name: "Artisan Sourdough", amount: 2, unit: "slices", category: "Grains & Bakery" },
                  { name: "Ripe Avocado", amount: 0.5, unit: "pc", category: "Produce" },
                  { name: "Free-Range Egg", amount: 1, unit: "pc", category: "Dairy & Eggs" },
                  { name: "Chili Flakes & Lemon", amount: 1, unit: "pinch", category: "Pantry & Spices" },
                ],
                instructions: [
                  "Toast sourdough slices until golden.",
                  "Mash avocado with lemon juice, salt, and pepper.",
                  "Poach egg in simmering water for 3 minutes and place on top."
                ],
              },
              {
                id: "bal-m1-2",
                type: "Lunch",
                recipe_name: "Mediterranean Grilled Chicken & Hummus Wrap",
                prep_time_mins: 15,
                calories: 620,
                macros: { protein_g: 42, carbs_g: 58, fat_g: 22 },
                estimated_cost: 4.8,
                ingredients: [
                  { name: "Grilled Chicken Breast", amount: 150, unit: "g", category: "Meat & Seafood" },
                  { name: "Whole Grain Tortilla", amount: 1, unit: "pc", category: "Grains & Bakery" },
                  { name: "Classic Hummus", amount: 2, unit: "tbsp", category: "Produce" },
                  { name: "Cucumber & Tomatoes", amount: 0.5, unit: "cup", category: "Produce" },
                ],
                instructions: [
                  "Spread hummus over warm tortilla wrap.",
                  "Layer sliced grilled chicken, diced cucumbers, and tomatoes.",
                  "Roll tightly and slice diagonally."
                ],
              },
              {
                id: "bal-m1-3",
                type: "Dinner",
                recipe_name: "Baked Herb Cod with Roasted Vegetables & Brown Rice",
                prep_time_mins: 25,
                calories: 640,
                macros: { protein_g: 40, carbs_g: 65, fat_g: 18 },
                estimated_cost: 6.5,
                ingredients: [
                  { name: "Wild Cod Fillet", amount: 180, unit: "g", category: "Meat & Seafood" },
                  { name: "Cooked Brown Rice", amount: 1, unit: "cup", category: "Grains & Bakery" },
                  { name: "Zucchini & Bell Pepper", amount: 1.5, unit: "cups", category: "Produce" },
                  { name: "Olive Oil & Dill", amount: 1, unit: "tbsp", category: "Pantry & Spices" },
                ],
                instructions: [
                  "Season cod with olive oil, lemon zest, and fresh dill.",
                  "Bake fillet and sliced veggies at 200°C (400°F) for 18 minutes.",
                  "Serve over fluffy brown rice."
                ],
              },
              {
                id: "bal-m1-4",
                type: "Snack",
                recipe_name: "Apple Slices with Almond Butter",
                prep_time_mins: 4,
                calories: 300,
                macros: { protein_g: 7, carbs_g: 32, fat_g: 16 },
                estimated_cost: 1.8,
                ingredients: [
                  { name: "Honeycrisp Apple", amount: 1, unit: "medium", category: "Produce" },
                  { name: "Natural Almond Butter", amount: 2, unit: "tbsp", category: "Pantry & Spices" },
                ],
                instructions: [
                  "Slice apple into wedges and dip into almond butter."
                ],
              },
            ],
          },
        ],
      };
  }

  return expandToFullSevenDays(rawPlan);
}
