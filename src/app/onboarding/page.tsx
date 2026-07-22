"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  DietaryRestriction,
  PrimaryObjective,
  MealType,
  Currency,
  MealPlanPreferences,
} from "@/types/meal-plan";
import { PRESET_PLANS_LIST } from "@/lib/preset-plans";
import { getStoredUser, UserProfile } from "@/lib/auth";
import AuthModal from "@/components/AuthModal";
import { ArrowUpRight, Lock } from "lucide-react";

const DIETARY_OPTIONS: DietaryRestriction[] = [
  "Halal",
  "Vegan",
  "Vegetarian",
  "Keto",
  "Gluten-Free",
  "Dairy-Free",
  "Nut Allergy",
  "Low-Carb",
];

const OBJECTIVES: PrimaryObjective[] = ["Weight Loss", "Muscle Gain", "Maintenance"];

export default function OnboardingFormPage() {
  const router = useRouter();

  const [user, setUser] = useState<UserProfile | null>(null);
  const [activeCategory, setActiveCategory] = useState<"preset" | "ai">("preset");

  // Custom AI preferences state
  const [dietary, setDietary] = useState<DietaryRestriction[]>(["Halal"]);
  const [budget, setBudget] = useState<number>(75);
  const [currency, setCurrency] = useState<Currency>("USD");
  const [calories, setCalories] = useState<number>(2200);
  const [objective, setObjective] = useState<PrimaryObjective>("Maintenance");
  const [daysCount, setDaysCount] = useState<number>(7);
  const [selectedMeals, setSelectedMeals] = useState<MealType[]>(["Breakfast", "Lunch", "Dinner", "Snack"]);

  // UI state
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingPresetId, setLoadingPresetId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);
  const [authReason, setAuthReason] = useState<string>("");

  useEffect(() => {
    const stored = getStoredUser();
    setUser(stored);
    if (stored && !stored.isGuest) {
      setActiveCategory("ai");
    }
  }, []);

  const isRegisteredUser = Boolean(user && !user.isGuest);

  const toggleDiet = (diet: DietaryRestriction) => {
    setDietary((prev) =>
      prev.includes(diet) ? prev.filter((d) => d !== diet) : [...prev, diet]
    );
  };

  const handleCurrencyChange = (newCurrency: Currency) => {
    setCurrency(newCurrency);
    if (newCurrency === "PKR" && budget < 1000) {
      setBudget(15000);
    } else if (newCurrency !== "PKR" && budget > 500) {
      setBudget(75);
    }
  };

  const promptAccountForAi = (reason?: string) => {
    setAuthReason(
      reason ||
        "Custom AI Menu Drafts require a registered account. Create a free account or sign in to customize your AI menu!"
    );
    setIsAuthOpen(true);
  };

  const handleSelectPreset = async (presetId: string) => {
    setIsLoading(true);
    setLoadingPresetId(presetId);
    setErrorMsg("");

    try {
      const res = await fetch("/api/generate-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ presetId }),
      });

      const data = await res.json();
      if (!res.ok || !data.id) {
        throw new Error(data.error || "Failed to load preset meal plan");
      }

      router.push(`/plan/${data.id}`);
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred while loading the preset plan.");
      setIsLoading(false);
      setLoadingPresetId(null);
    }
  };

  const handleSubmitAi = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isRegisteredUser) {
      promptAccountForAi();
      return;
    }

    setIsLoading(true);
    setErrorMsg("");

    const preferences: MealPlanPreferences = {
      dietary_restrictions: dietary,
      target_budget: budget,
      currency,
      daily_calories: calories,
      primary_objective: objective,
      days_count: daysCount,
      meals_per_day: selectedMeals,
      isAiGenerated: true,
    };

    try {
      const res = await fetch("/api/generate-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(preferences),
      });

      const data = await res.json();

      if (!res.ok || !data.id) {
        throw new Error(data.error || "Failed to generate AI meal plan");
      }

      router.push(`/plan/${data.id}`);
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred while generating your AI plan.");
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 py-16 px-8 bg-background">
      {/* Header */}
      <div className="text-center space-y-4 pt-4">
        <span className="font-inter text-xs uppercase tracking-widest text-muted block font-medium">
          01 / MENU GENERATOR
        </span>
        <h1 className="font-playfair font-normal text-5xl sm:text-6xl text-foreground">
          Craft Your Menu
        </h1>
        <p className="font-inter font-light text-sm text-muted max-w-lg mx-auto leading-relaxed">
          Select an instant seasonal menu or configure bespoke dietary parameters using our high-end culinary AI.
        </p>
      </div>

      {/* Plan Category Tabs */}
      <div className="grid grid-cols-2 gap-6 border-b border-border">
        <button
          type="button"
          onClick={() => setActiveCategory("preset")}
          className={`py-4 font-playfair text-xl transition-all text-left flex items-center justify-start gap-3 border-b-2 ${
            activeCategory === "preset"
              ? "border-foreground text-foreground font-medium"
              : "border-transparent text-muted hover:text-foreground"
          }`}
        >
          <span>Standard Menus</span>
          <span className="font-inter text-xs text-muted uppercase tracking-wider font-normal">
            (Free Access)
          </span>
        </button>

        <button
          type="button"
          onClick={() => {
            if (!isRegisteredUser) {
              promptAccountForAi();
            } else {
              setActiveCategory("ai");
            }
          }}
          className={`py-4 font-playfair text-xl transition-all text-left flex items-center justify-start gap-3 border-b-2 ${
            activeCategory === "ai"
              ? "border-foreground text-foreground font-medium"
              : "border-transparent text-muted hover:text-foreground"
          }`}
        >
          <span>Bespoke AI Profile</span>
          {isRegisteredUser ? (
            <span className="font-inter text-xs text-foreground uppercase tracking-wider font-normal">
              (Unlocked)
            </span>
          ) : (
            <span className="font-inter text-xs text-muted uppercase tracking-wider font-normal flex items-center gap-1">
              <Lock className="w-3.5 h-3.5" /> (Account Only)
            </span>
          )}
        </button>
      </div>

      {/* Tab 1: Standard Preset Plans */}
      {activeCategory === "preset" && (
        <div className="space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {PRESET_PLANS_LIST.map((preset) => {
              const isThisLoading = loadingPresetId === preset.id;
              const currencySym = preset.currency === "PKR" ? "PKR " : "$";
              const sampleImg =
                preset.id === "preset-high-protein-7day"
                  ? "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80"
                  : preset.id === "preset-keto-express-7day"
                  ? "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80"
                  : preset.id === "preset-budget-halal-7day"
                  ? "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=800&q=80"
                  : "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80";

              return (
                <div
                  key={preset.id}
                  className="group cursor-pointer flex flex-col justify-between border-b border-border pb-8 space-y-4"
                >
                  <div className="space-y-3">
                    <div className="overflow-hidden bg-secondary aspect-[4/3] relative">
                      <img
                        src={sampleImg}
                        alt={preset.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <span className="absolute top-3 right-3 bg-background/90 text-foreground font-inter text-[0.65rem] uppercase tracking-wider px-2.5 py-1 border border-border">
                        {preset.badge}
                      </span>
                    </div>

                    <div className="flex justify-between items-baseline pt-2">
                      <h3 className="font-playfair text-2xl text-foreground font-medium group-hover:underline">
                        {preset.title}
                      </h3>
                      <span className="font-serif text-lg text-foreground font-medium">
                        {currencySym}{preset.budget}
                      </span>
                    </div>

                    <p className="font-inter text-xs text-muted leading-relaxed">
                      {preset.subtitle}
                    </p>

                    <div className="flex items-center gap-4 text-xs font-inter text-muted pt-1">
                      <span>{preset.calories} kcal / day</span>
                      <span>•</span>
                      <span>{preset.objective}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleSelectPreset(preset.id)}
                    disabled={isLoading}
                    className="w-full border border-foreground rounded-full py-4 font-inter text-xs uppercase tracking-widest text-foreground hover:bg-foreground hover:text-background transition-all flex items-center justify-center gap-2"
                  >
                    {isThisLoading ? (
                      <span>Loading Menu...</span>
                    ) : (
                      <>
                        <span>Select Menu</span>
                        <ArrowUpRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: Custom AI Generator */}
      {activeCategory === "ai" && (
        <div className="space-y-12">
          {!isRegisteredUser ? (
            <div className="border border-border p-12 text-center space-y-6">
              <span className="font-inter text-xs uppercase tracking-widest text-muted block">
                ACCOUNT REQUIRED
              </span>
              <h2 className="font-playfair text-4xl text-foreground font-normal">
                Bespoke AI Profile is Locked
              </h2>
              <p className="font-inter text-xs text-muted max-w-md mx-auto leading-relaxed">
                Create a free account to enable bespoke AI menu generation, single-dish swaps, and personalized calorie profiling.
              </p>
              <button
                onClick={() => promptAccountForAi()}
                className="border border-foreground rounded-full px-8 py-4 font-inter text-xs uppercase tracking-widest text-foreground hover:bg-foreground hover:text-background transition-all"
              >
                Create Account / Sign In ↗
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmitAi} className="space-y-12 pt-4">
              {/* Field 1: Budget (Border-b only input) */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="font-inter text-xs uppercase tracking-widest text-muted font-medium">
                    Weekly Budget ({currency})
                  </label>
                  <div className="flex items-center gap-2 font-inter text-xs">
                    {(["USD", "PKR", "EUR", "GBP"] as Currency[]).map((curr) => (
                      <button
                        type="button"
                        key={curr}
                        onClick={() => handleCurrencyChange(curr)}
                        className={`hover:text-foreground uppercase transition-colors ${
                          currency === curr ? "text-foreground font-semibold underline" : "text-muted"
                        }`}
                      >
                        {curr}
                      </button>
                    ))}
                  </div>
                </div>

                <input
                  type="number"
                  min={1}
                  max={currency === "PKR" ? 500000 : 2000}
                  value={budget}
                  onChange={(e) => setBudget(Number(e.target.value))}
                  className="w-full border-b border-border bg-transparent py-4 text-foreground font-playfair text-4xl focus:outline-none focus:border-foreground transition-colors"
                />
              </div>

              {/* Field 2: Dietary Preferences */}
              <div className="space-y-3">
                <label className="font-inter text-xs uppercase tracking-widest text-muted block font-medium">
                  Dietary Preferences
                </label>
                <div className="flex flex-wrap gap-2 pt-1 font-inter text-xs">
                  {DIETARY_OPTIONS.map((tag) => {
                    const active = dietary.includes(tag);
                    return (
                      <button
                        type="button"
                        key={tag}
                        onClick={() => toggleDiet(tag)}
                        className={`px-4 py-2 border text-xs font-medium transition-all ${
                          active
                            ? "border-foreground bg-foreground text-background"
                            : "border-border text-foreground hover:border-foreground"
                        }`}
                      >
                        {tag} {active && "✓"}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Field 3: Daily Calories & Objective */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-end">
                <div className="space-y-3">
                  <div className="flex justify-between font-inter text-xs uppercase tracking-widest text-muted">
                    <span>Target Calories</span>
                    <span className="font-serif text-base text-foreground font-medium">{calories} kcal / day</span>
                  </div>
                  <input
                    type="range"
                    min={1200}
                    max={4000}
                    step={50}
                    value={calories}
                    onChange={(e) => setCalories(Number(e.target.value))}
                    className="w-full h-1 bg-border rounded-none appearance-none cursor-pointer accent-foreground"
                  />
                </div>

                <div className="space-y-3">
                  <label className="font-inter text-xs uppercase tracking-widest text-muted block font-medium">
                    Primary Goal
                  </label>
                  <div className="grid grid-cols-3 gap-2 font-inter text-xs">
                    {OBJECTIVES.map((obj) => (
                      <button
                        type="button"
                        key={obj}
                        onClick={() => setObjective(obj)}
                        className={`py-3 border text-center font-medium transition-all ${
                          objective === obj
                            ? "border-foreground bg-foreground text-background"
                            : "border-border text-foreground hover:border-foreground"
                        }`}
                      >
                        {obj}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {errorMsg && (
                <div className="p-4 border border-foreground text-foreground text-xs font-inter">
                  ⚠️ {errorMsg}
                </div>
              )}

              {/* Submit Button: Pill-shaped with dark border */}
              <div className="pt-6">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full border border-foreground rounded-full py-6 text-xl md:text-2xl font-playfair text-foreground hover:bg-foreground hover:text-background transition-all shadow-sm flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {isLoading ? (
                    <span>AI Crafting Menu...</span>
                  ) : (
                    <>
                      <span>Generate Your Menu</span>
                      <ArrowUpRight className="w-6 h-6 stroke-[1.5]" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        initialMode="signup"
        reasonMessage={authReason}
      />
    </div>
  );
}
