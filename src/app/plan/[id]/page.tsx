"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { MealPlan, Meal } from "@/types/meal-plan";
import BentoMealCard from "@/components/BentoMealCard";
import MealDetailModal from "@/components/MealDetailModal";
import GroceryListView from "@/components/GroceryListView";
import { ShoppingCart, Share2, Check } from "lucide-react";

export default function PlanDashboardPage() {
  const params = useParams();
  const planId = params?.id as string;

  const [plan, setPlan] = useState<MealPlan | null>(null);
  const [activeTab, setActiveTab] = useState<"dashboard" | "grocery">("dashboard");
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>("");

  useEffect(() => {
    if (!planId) return;

    async function fetchPlan() {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/plan/${planId}`);
        if (!res.ok) {
          throw new Error("Meal plan not found or expired.");
        }
        const data = await res.json();
        setPlan(data);
      } catch (err: any) {
        setErrorMsg(err.message || "Failed to load meal plan");
      } finally {
        setIsLoading(false);
      }
    }

    fetchPlan();
  }, [planId]);

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleSwapMeal = async (targetMeal: Meal) => {
    if (!plan) return;

    try {
      const res = await fetch("/api/swap-meal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId: plan.id,
          dayNumber: plan.daily_plans[selectedDayIndex]?.day_number || 1,
          mealId: targetMeal.id,
          mealType: targetMeal.type,
          currentRecipeName: targetMeal.recipe_name,
          targetCalories: targetMeal.calories,
        }),
      });

      const data = await res.json();
      if (res.ok && data.plan) {
        setPlan(data.plan);
        if (selectedMeal && selectedMeal.id === targetMeal.id && data.updatedMeal) {
          setSelectedMeal(data.updatedMeal);
        }
      }
    } catch (err) {
      console.error("Meal swap failed:", err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 font-inter">
        <div className="w-8 h-8 border-2 border-foreground border-t-transparent rounded-full animate-spin" />
        <p className="text-xs uppercase tracking-widest text-muted">Loading Weekly Plan...</p>
      </div>
    );
  }

  if (errorMsg || !plan) {
    return (
      <div className="max-w-md mx-auto my-24 p-12 text-center border border-border space-y-6 bg-background">
        <h2 className="font-playfair text-3xl text-foreground font-normal">Plan Not Found</h2>
        <p className="font-inter text-xs text-muted leading-relaxed">{errorMsg || "The requested meal plan could not be retrieved."}</p>
        <Link
          href="/onboarding"
          className="inline-block border border-foreground rounded-full px-8 py-4 font-inter text-xs uppercase tracking-widest text-foreground hover:bg-foreground hover:text-background transition-all"
        >
          Generate New Menu ↗
        </Link>
      </div>
    );
  }

  const currencySymbol = plan.currency === "PKR" ? "PKR " : plan.currency === "EUR" ? "€" : plan.currency === "GBP" ? "£" : "$";
  const currentDayPlan = plan.daily_plans[selectedDayIndex] || plan.daily_plans[0];

  return (
    <div className="py-24 px-8 md:px-16 max-w-7xl mx-auto space-y-16 bg-background font-sans">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border pb-8">
        <div className="space-y-2">
          <div className="flex items-center gap-3 font-inter text-xs uppercase tracking-widest text-muted">
            {plan.isAiGenerated !== false && plan.planType !== "preset" ? (
              <span className="text-foreground font-medium">Bespoke AI Menu</span>
            ) : (
              <span className="text-foreground font-medium">Seasonal Preset Menu</span>
            )}
            <span>•</span>
            <span>ID: {plan.id}</span>
          </div>

          <h1 className="font-playfair text-4xl sm:text-5xl text-foreground font-normal">
            Your Weekly Plan
          </h1>
        </div>

        <div className="flex items-end gap-6 font-inter">
          <div className="text-right">
            <span className="text-xs uppercase tracking-widest text-muted block mb-1">
              Estimated Cost
            </span>
            <span className="font-playfair text-3xl font-medium text-foreground">
              {currencySymbol}{plan.weekly_total_estimated_cost}.00
            </span>
          </div>

          <button
            onClick={handleCopyLink}
            className="border border-foreground rounded-full px-5 py-3 text-xs uppercase tracking-widest text-foreground hover:bg-foreground hover:text-background transition-all flex items-center gap-2"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
            <span>{copied ? "Link Copied" : "Share Plan"}</span>
          </button>
        </div>
      </div>

      {/* Switcher Tabs (Weekly Grid vs Smart Grocery List) */}
      <div className="flex justify-between items-center border-b border-border pb-4 font-inter text-xs">
        <div className="flex items-center gap-8">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`uppercase tracking-widest py-2 border-b-2 font-medium transition-all ${
              activeTab === "dashboard"
                ? "border-foreground text-foreground"
                : "border-transparent text-muted hover:text-foreground"
            }`}
          >
            Weekly Schedule Grid
          </button>

          <button
            onClick={() => setActiveTab("grocery")}
            className={`uppercase tracking-widest py-2 border-b-2 font-medium transition-all flex items-center gap-2 ${
              activeTab === "grocery"
                ? "border-foreground text-foreground"
                : "border-transparent text-muted hover:text-foreground"
            }`}
          >
            <ShoppingCart className="w-3.5 h-3.5" /> Smart Grocery List
          </button>
        </div>

        {activeTab === "dashboard" && (
          <span className="hidden sm:block text-muted">
            Target: <strong className="text-foreground font-serif text-base font-normal">{plan.preferences.daily_calories} kcal</strong> / day
          </span>
        )}
      </div>

      {/* Main Tab Content */}
      {activeTab === "dashboard" ? (
        <div className="space-y-12">
          {/* Day Selector Ribbon */}
          <div className="flex items-center gap-2 overflow-x-auto pb-4 no-scrollbar border-b border-border">
            {plan.daily_plans.map((dp, idx) => {
              const isSelected = selectedDayIndex === idx;
              return (
                <button
                  key={dp.day_number || idx}
                  onClick={() => setSelectedDayIndex(idx)}
                  className={`px-6 py-4 border text-left min-w-[140px] transition-all ${
                    isSelected
                      ? "border-foreground bg-foreground text-background"
                      : "border-border text-foreground hover:border-foreground"
                  }`}
                >
                  <span className="font-inter text-[0.65rem] uppercase tracking-widest block font-medium opacity-80">
                    {dp.day}
                  </span>
                  <span className="font-playfair text-xl block font-medium">
                    Day {dp.day_number || idx + 1}
                  </span>
                  <span className="font-inter text-[0.7rem] block font-light opacity-80 mt-0.5">
                    {dp.total_calories} kcal
                  </span>
                </button>
              );
            })}
          </div>

          {/* Grid View Cards (Effect 2) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
            {currentDayPlan.meals.map((meal) => (
              <BentoMealCard
                key={meal.id}
                meal={meal}
                currency={plan.currency}
                onOpenDetail={(m) => setSelectedMeal(m)}
                onSwapMeal={handleSwapMeal}
              />
            ))}
          </div>
        </div>
      ) : (
        <GroceryListView plan={plan} />
      )}

      {/* Meal Detail Modal */}
      <MealDetailModal
        meal={selectedMeal}
        currency={plan.currency}
        onClose={() => setSelectedMeal(null)}
        onSwapMeal={handleSwapMeal}
      />
    </div>
  );
}
