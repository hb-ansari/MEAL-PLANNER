"use client";

import { useState, useMemo } from "react";
import { MealPlan, AggregatedGroceryItem } from "@/types/meal-plan";
import { aggregateGroceryList } from "@/lib/grocery";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, CheckCircle2, Circle, Search, Printer, Filter } from "lucide-react";

interface GroceryListViewProps {
  plan: MealPlan;
}

export default function GroceryListView({ plan }: GroceryListViewProps) {
  const initialItems = useMemo(() => aggregateGroceryList(plan), [plan]);
  const [items, setItems] = useState<AggregatedGroceryItem[]>(initialItems);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const toggleCheck = (id: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item))
    );
  };

  const categories = useMemo(() => {
    const set = new Set<string>();
    initialItems.forEach((i) => set.add(i.category));
    return ["All", ...Array.from(set)];
  }, [initialItems]);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCat = selectedCategory === "All" || item.category === selectedCategory;
      return matchesSearch && matchesCat;
    });
  }, [items, searchQuery, selectedCategory]);

  const checkedCount = items.filter((i) => i.checked).length;
  const progressPercent = items.length > 0 ? Math.round((checkedCount / items.length) * 100) : 0;

  const groupedByCategory = useMemo(() => {
    const groups: Record<string, AggregatedGroceryItem[]> = {};
    filteredItems.forEach((item) => {
      if (!groups[item.category]) groups[item.category] = [];
      groups[item.category].push(item);
    });
    return groups;
  }, [filteredItems]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-8 font-inter text-foreground"
    >
      {/* Overview & Progress Bar */}
      <div className="bg-white border border-border rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-muted pb-4">
          <div>
            <span className="font-clash font-semibold text-xs tracking-wider uppercase text-primary block mb-1">
              ZERO-WASTE INGREDIENT ENGINE
            </span>
            <h2 className="font-clash text-3xl font-bold text-foreground">
              Smart Grocery List
            </h2>
            <p className="font-inter text-xs text-muted-foreground mt-1 font-medium">
              Consolidated across {plan.daily_plans.length} days • {items.length} unique ingredients
            </p>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handlePrint}
            className="px-5 py-2.5 rounded-full border border-border hover:border-primary text-foreground text-xs font-semibold uppercase tracking-wider transition-colors flex items-center gap-2"
          >
            <Printer className="w-4 h-4 text-primary" /> Print Checklist
          </motion.button>
        </div>

        {/* Progress Bar */}
        <div>
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-2 font-medium">
            <span>Shopping Progress</span>
            <span className="text-primary font-bold">{progressPercent}% ({checkedCount}/{items.length} items collected)</span>
          </div>
          <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden p-0.5 border border-border">
            <motion.div
              className="h-full bg-primary rounded-full shadow-sm"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search ingredients..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-full bg-muted border border-border text-foreground text-xs font-medium focus:outline-none focus:border-primary transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 no-scrollbar">
          <Filter className="w-3.5 h-3.5 text-muted-foreground mr-1 hidden sm:block" />
          {categories.map((cat) => (
            <motion.button
              key={cat}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wide transition-all ${
                selectedCategory === cat
                  ? "bg-primary text-white shadow-sm"
                  : "bg-muted text-muted-foreground hover:text-foreground border border-border"
              }`}
            >
              {cat}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Categorized Ingredient Sections */}
      <div className="space-y-6">
        {Object.keys(groupedByCategory).length === 0 ? (
          <div className="text-center py-12 bg-white rounded-3xl border border-border">
            <p className="font-clash text-lg font-semibold text-muted-foreground">No ingredients found matching your search.</p>
          </div>
        ) : (
          Object.entries(groupedByCategory).map(([category, categoryItems]) => (
            <div key={category} className="bg-white rounded-3xl border border-border p-6 shadow-xs space-y-4">
              <h3 className="font-clash text-xl font-bold text-foreground border-b border-muted pb-3 flex items-center justify-between">
                <span>{category}</span>
                <span className="font-inter text-xs text-muted-foreground font-semibold">
                  ({categoryItems.length} items)
                </span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {categoryItems.map((item) => (
                  <motion.div
                    key={item.id}
                    onClick={() => toggleCheck(item.id)}
                    whileHover={{ scale: 1.02, x: 2 }}
                    whileTap={{ scale: 0.98 }}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start justify-between gap-3 ${
                      item.checked
                        ? "bg-primary/5 border-primary/30 text-muted-foreground opacity-75"
                        : "bg-muted/40 border-border hover:border-primary text-foreground"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <button type="button" className="mt-0.5 text-primary">
                        {item.checked ? (
                          <CheckCircle2 className="w-4 h-4 fill-primary text-white" />
                        ) : (
                          <Circle className="w-4 h-4 text-border" />
                        )}
                      </button>
                      <div>
                        <p className={`font-semibold text-sm ${item.checked ? "line-through text-muted-foreground" : "text-foreground"}`}>
                          {item.name}
                        </p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          {item.usedInMeals.length} recipes included
                        </p>
                      </div>
                    </div>

                    <span className="px-2.5 py-1 rounded-full bg-primary/10 text-primary font-clash text-xs font-bold whitespace-nowrap">
                      {item.formattedQuantity}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </motion.div>
  );
}
