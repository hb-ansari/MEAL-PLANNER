import { MealPlan, AggregatedGroceryItem, Ingredient } from "@/types/meal-plan";

export function aggregateGroceryList(plan: MealPlan): AggregatedGroceryItem[] {
  const itemMap = new Map<string, {
    name: string;
    category: Ingredient["category"];
    unitsMap: Map<string, number>;
    usedInMeals: Set<string>;
  }>();

  for (const dailyPlan of plan.daily_plans) {
    for (const meal of dailyPlan.meals) {
      for (const ing of meal.ingredients) {
        const normalizedName = ing.name.trim().toLowerCase();
        const category = ing.category || "Pantry & Spices";
        const unit = ing.unit.trim().toLowerCase() || "item";
        const amount = ing.amount || 1;

        if (!itemMap.has(normalizedName)) {
          itemMap.set(normalizedName, {
            name: ing.name.trim(),
            category,
            unitsMap: new Map(),
            usedInMeals: new Set(),
          });
        }

        const itemData = itemMap.get(normalizedName)!;
        const currentAmount = itemData.unitsMap.get(unit) || 0;
        itemData.unitsMap.set(unit, currentAmount + amount);
        itemData.usedInMeals.add(`${dailyPlan.day}: ${meal.recipe_name}`);
      }
    }
  }

  const result: AggregatedGroceryItem[] = [];
  let counter = 1;

  itemMap.forEach((data) => {
    const amountsArr: { amount: number; unit: string }[] = [];
    const formattedParts: string[] = [];

    data.unitsMap.forEach((amt, u) => {
      // Round to 2 decimal places if needed
      const roundedAmt = Math.round(amt * 100) / 100;
      amountsArr.push({ amount: roundedAmt, unit: u });
      formattedParts.push(`${roundedAmt} ${u}`);
    });

    result.push({
      id: `grocery-${counter++}`,
      name: data.name,
      amounts: amountsArr,
      formattedQuantity: formattedParts.join(" + "),
      category: data.category,
      checked: false,
      usedInMeals: Array.from(data.usedInMeals),
    });
  });

  // Sort by category and name
  const categoryOrder: Record<string, number> = {
    "Produce": 1,
    "Dairy & Eggs": 2,
    "Meat & Seafood": 3,
    "Grains & Bakery": 4,
    "Pantry & Spices": 5,
    "Other": 6,
  };

  return result.sort((a, b) => {
    const catDiff = (categoryOrder[a.category] || 99) - (categoryOrder[b.category] || 99);
    if (catDiff !== 0) return catDiff;
    return a.name.localeCompare(b.name);
  });
}
