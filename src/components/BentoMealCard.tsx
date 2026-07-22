"use client";

import { useState } from "react";
import { Meal, Currency } from "@/types/meal-plan";
import { motion } from "framer-motion";
import { ArrowUpRight, RefreshCw, Clock, Flame } from "lucide-react";

interface BentoMealCardProps {
  meal: Meal;
  currency: Currency;
  onOpenDetail: (meal: Meal) => void;
  onSwapMeal: (meal: Meal) => Promise<void>;
}

const cardVariants = {
  initial: { y: 0, boxShadow: "none" },
  hover: {
    y: -4,
    boxShadow: "0px 8px 40px rgba(212, 144, 122, 0.35)",
    transition: {
      duration: 0.35,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    }
  }
};

const cardImageVariants = {
  initial: { scale: 1 },
  hover: {
    scale: 1.06,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    }
  }
};

export default function BentoMealCard({
  meal,
  currency,
  onOpenDetail,
  onSwapMeal,
}: BentoMealCardProps) {
  const [isSwapping, setIsSwapping] = useState(false);

  const handleSwap = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsSwapping(true);
    try {
      await onSwapMeal(meal);
    } finally {
      setIsSwapping(false);
    }
  };

  const currencySymbol = currency === "PKR" ? "PKR " : currency === "EUR" ? "€" : currency === "GBP" ? "£" : "$";

  // High-contrast sunlit photography pool matching recipe type
  const mealImages: Record<string, string[]> = {
    Breakfast: [
      "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?auto=format&fit=crop&w=800&q=80",
    ],
    Lunch: [
      "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80",
    ],
    Dinner: [
      "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=800&q=80",
    ],
    Snack: [
      "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?auto=format&fit=crop&w=800&q=80",
    ],
  };

  const pool = mealImages[meal.type] || mealImages.Lunch;
  const cardImg = pool[Math.abs(meal.recipe_name.length) % pool.length];

  return (
    <motion.div
      onClick={() => onOpenDetail(meal)}
      variants={cardVariants}
      initial="initial"
      whileHover="hover"
      className="group cursor-pointer flex flex-col gap-3 p-4 bg-background border border-border/40 rounded-xl"
    >
      {/* Aspect-square Sunlit Photo Container */}
      <div className="overflow-hidden bg-secondary aspect-square relative rounded-lg">
        <motion.img
          variants={cardImageVariants}
          src={cardImg}
          alt={meal.recipe_name}
          className="w-full h-full object-cover"
        />

        {/* Meal Type Tag Overlay */}
        <span className="absolute top-3 left-3 bg-background/90 text-foreground font-inter text-[0.65rem] uppercase tracking-wider px-2.5 py-1 border border-border font-medium">
          {meal.type}
        </span>

        {/* Single-Meal AI Swap Button Overlay */}
        <button
          type="button"
          onClick={handleSwap}
          disabled={isSwapping}
          title="Regenerate dish"
          className="absolute top-3 right-3 p-2 bg-background/90 hover:bg-foreground hover:text-background text-foreground border border-border transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isSwapping ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Card Content & Details */}
      <div>
        <div className="flex justify-between items-center mb-1">
          <h3 className="font-playfair font-medium text-lg text-foreground group-hover:underline line-clamp-1">
            {meal.recipe_name}
          </h3>
          <ArrowUpRight className="w-4 h-4 text-foreground transition-transform group-hover:translate-x-1 group-hover:-translate-y-1 shrink-0 ml-1" />
        </div>

        <p className="font-inter text-xs text-muted leading-relaxed line-clamp-2 mb-3 font-light">
          {meal.instructions[0] || "Freshly prepared culinary meal tailored to your caloric targets."}
        </p>

        <div className="flex items-center justify-between text-xs font-inter text-muted border-t border-border/60 pt-2">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-foreground" /> {meal.prep_time_mins}m
            </span>
            <span className="flex items-center gap-1 font-serif text-foreground font-medium">
              <Flame className="w-3 h-3 text-foreground" /> {meal.calories} kcal
            </span>
          </div>

          <span className="font-serif text-sm font-medium text-foreground">
            {currencySymbol}{meal.estimated_cost}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
