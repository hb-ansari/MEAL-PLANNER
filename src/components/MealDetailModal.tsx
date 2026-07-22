"use client";

import { useState } from "react";
import { Meal, Currency } from "@/types/meal-plan";
import { X, Clock, RefreshCw, CheckCircle2, Circle } from "lucide-react";

interface MealDetailModalProps {
  meal: Meal | null;
  currency: Currency;
  onClose: () => void;
  onSwapMeal: (meal: Meal) => Promise<void>;
}

export default function MealDetailModal({
  meal,
  currency,
  onClose,
  onSwapMeal,
}: MealDetailModalProps) {
  const [completedSteps, setCompletedSteps] = useState<Record<number, boolean>>({});
  const [isSwapping, setIsSwapping] = useState(false);

  if (!meal) return null;

  const toggleStep = (index: number) => {
    setCompletedSteps((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const handleSwap = async () => {
    setIsSwapping(true);
    try {
      await onSwapMeal(meal);
      onClose();
    } finally {
      setIsSwapping(false);
    }
  };

  const currencySymbol = currency === "PKR" ? "PKR " : currency === "EUR" ? "€" : currency === "GBP" ? "£" : "$";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-background border border-border shadow-2xl overflow-hidden max-h-[90vh] flex flex-col font-sans">
        {/* Header */}
        <div className="p-8 pb-6 border-b border-border flex items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-3 font-inter text-xs text-muted">
              <span className="uppercase tracking-widest font-medium text-foreground border border-border px-2.5 py-0.5">
                {meal.type}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-foreground" /> {meal.prep_time_mins} mins
              </span>
              <span className="font-serif text-foreground font-medium text-sm">
                {currencySymbol}{meal.estimated_cost}
              </span>
            </div>

            {/* Recipe Name (Playfair Display 2.5rem) */}
            <h2 className="font-playfair text-3xl sm:text-4xl text-foreground font-normal">
              {meal.recipe_name}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-2.5 border border-border text-foreground hover:bg-foreground hover:text-background transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content (Two Columns) */}
        <div className="p-8 overflow-y-auto space-y-8 flex-1">
          {/* Quick Macro Bar */}
          <div className="grid grid-cols-4 gap-4 font-serif border-b border-border pb-6 text-center">
            <div>
              <span className="font-inter text-[0.65rem] uppercase tracking-widest text-muted block">Calories</span>
              <span className="text-xl font-medium text-foreground">{meal.calories} kcal</span>
            </div>
            <div>
              <span className="font-inter text-[0.65rem] uppercase tracking-widest text-muted block">Protein</span>
              <span className="text-xl font-medium text-foreground">{meal.macros.protein_g}g</span>
            </div>
            <div>
              <span className="font-inter text-[0.65rem] uppercase tracking-widest text-muted block">Carbs</span>
              <span className="text-xl font-medium text-foreground">{meal.macros.carbs_g}g</span>
            </div>
            <div>
              <span className="font-inter text-[0.65rem] uppercase tracking-widest text-muted block">Fat</span>
              <span className="text-xl font-medium text-foreground">{meal.macros.fat_g}g</span>
            </div>
          </div>

          {/* Two Columns Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            {/* Left Column: Ingredients */}
            <div className="space-y-4">
              <h3 className="font-inter font-medium text-xs uppercase tracking-widest text-foreground border-b border-border pb-2">
                Ingredients ({meal.ingredients.length})
              </h3>
              <ul className="space-y-3 font-inter font-light text-sm text-muted leading-[1.85]">
                {meal.ingredients.map((ing, i) => (
                  <li key={i} className="flex justify-between border-b border-border/40 pb-1.5">
                    <span className="text-foreground">{ing.name}</span>
                    <span className="font-serif text-foreground font-medium">{ing.amount} {ing.unit}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Right Column: Instructions */}
            <div className="space-y-4">
              <h3 className="font-inter font-medium text-xs uppercase tracking-widest text-foreground border-b border-border pb-2">
                Preparation Instructions
              </h3>
              <div className="space-y-4 font-inter font-light text-sm text-muted leading-[1.85]">
                {meal.instructions.map((step, idx) => {
                  const isDone = completedSteps[idx];
                  return (
                    <div
                      key={idx}
                      onClick={() => toggleStep(idx)}
                      className={`p-4 border cursor-pointer transition-all flex items-start gap-3 ${
                        isDone
                          ? "bg-secondary/40 border-border text-muted"
                          : "bg-background border-border text-foreground hover:border-foreground"
                      }`}
                    >
                      <button type="button" className="mt-0.5 text-foreground">
                        {isDone ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4 text-border" />}
                      </button>
                      <div className="text-xs sm:text-sm leading-[1.85]">
                        <span className="font-inter font-medium text-foreground mr-2">Step {idx + 1}:</span>
                        <span className={isDone ? "line-through text-muted" : ""}>{step}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Footer CTA: "Regenerate This Meal" */}
        <div className="p-6 border-t border-border bg-background flex items-center justify-between gap-4 font-inter text-xs">
          <button
            type="button"
            onClick={handleSwap}
            disabled={isSwapping}
            className="border border-foreground text-foreground px-6 py-3 uppercase tracking-widest font-medium hover:bg-foreground hover:text-background transition-all flex items-center gap-2 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSwapping ? "animate-spin" : ""}`} />
            <span>{isSwapping ? "Regenerating..." : "Regenerate This Meal"}</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="bg-foreground text-background px-6 py-3 uppercase tracking-widest font-medium hover:opacity-90 transition-opacity"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
