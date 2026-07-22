"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight, Plus, Minus } from "lucide-react";
import AuthModal from "@/components/AuthModal";
import { PRESET_PLANS_LIST } from "@/lib/preset-plans";
import { FloatingLeaves } from "@/components/FloatingLeaves";

// Photography assets with dramatic late-afternoon sunlight & hard shadows
const HERO_IMG = "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=2000&q=80"; // dramatic sunlit roast
const PARALLAX_IMG = "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=2000&q=80"; // moody sunlit fresh produce

const ACCORDION_ITEMS = [
  {
    id: "item-1",
    title: "Personalized Meal Plans",
    content: "Our AI takes your budget, caloric targets, and exact dietary constraints (Halal, Keto, Vegan, Gluten-Free) to curate a balanced 7-day culinary menu.",
  },
  {
    id: "item-2",
    title: "Balanced Nutrition",
    content: "Every dish is calculated with chef-level precision and complete macro breakdowns (Protein, Carbs, Fats) tailored specifically to your fitness objective.",
  },
  {
    id: "item-3",
    title: "Save Time and Money",
    content: "Automated grocery lists aggregate duplicate ingredients across all 7 days, eliminating food waste and keeping your total spending strictly within budget.",
  },
  {
    id: "item-4",
    title: "Flexible and Customizable",
    content: "Don't like a specific meal? Tap 'Regenerate This Dish' for single-meal AI replacements without corrupting your weekly calorie and budget targets.",
  },
];

const cardVariants = {
  initial: { opacity: 0, y: 50, filter: "blur(8px)" },
  animate: (index: number) => ({
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.7,
      delay: index * 0.12,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    }
  }),
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

export default function LandingPage() {
  const router = useRouter();
  const [openAccordion, setOpenAccordion] = useState<string | null>("item-1");
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signup");
  const [loadingPresetId, setLoadingPresetId] = useState<string | null>(null);
  const [contactForm, setContactForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleContactSubmit = (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate sending
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      setContactForm({ name: "", email: "", subject: "", message: "" });
    }, 1500);
  };

  const toggleAccordion = (id: string) => {
    setOpenAccordion((prev) => (prev === id ? null : id));
  };

  const openAuth = (mode: "signin" | "signup") => {
    setAuthMode(mode);
    setIsAuthOpen(true);
  };

  const handleSelectPreset = async (presetId: string) => {
    setLoadingPresetId(presetId);
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
    } catch (err) {
      console.error(err);
      setLoadingPresetId(null);
    }
  };

  return (
    <div className="bg-background text-foreground min-h-screen">
      {/* 6.2 Hero Section (Top Half) */}
      <section className="relative min-h-[85vh] bg-foreground text-white flex flex-col justify-end overflow-hidden">
        {/* Sunlit Food Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center z-0 opacity-80"
          style={{ backgroundImage: `url(${HERO_IMG})` }}
        />

        {/* Dramatic Shadow Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-foreground via-foreground/70 to-transparent z-10" />

        {/* Floating Petal Particles */}
        <FloatingLeaves />

        {/* Hero Overlaid Content */}
        <div className="relative z-20 px-8 md:px-16 pb-12 pt-32 max-w-7xl w-full mx-auto flex flex-col items-start text-left">
          <div className="max-w-2xl space-y-6">
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="font-inter text-xs text-white/70 uppercase tracking-[0.25em] font-medium block"
            >
              — CURATED FOR YOU
            </motion.span>

            <motion.h1
              initial={{ opacity: 0, y: 40, filter: "blur(10px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="font-cormorant text-6xl sm:text-7xl md:text-8xl font-normal leading-[1.05] tracking-tight text-white"
            >
              Meals Rooted in <br />
              <span className="italic font-light">Intention.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.65, ease: [0.22, 1, 0.36, 1] }}
              className="font-inter font-light text-sm sm:text-base text-white/80 max-w-lg leading-relaxed"
            >
              Tell us your tastes, budget, and dietary needs. We'll curate a seven-day menu that feels like dining out, cooked at home.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.85, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-4 pt-4"
            >
              <div className="flex flex-wrap items-center gap-4">
                <Link
                  href="/onboarding"
                  className="bg-[#d4907a] hover:bg-[#c27f6a] text-white px-8 py-4 rounded-lg font-inter font-semibold text-xs tracking-widest uppercase transition-all shadow-lg flex items-center gap-2"
                >
                  <span>Draft My Menu</span>
                  <ArrowUpRight className="w-4 h-4" />
                </Link>

                <button
                  onClick={() => openAuth("signup")}
                  className="border border-white/60 hover:bg-white/10 text-white px-8 py-4 rounded-lg font-inter font-semibold text-xs tracking-widest uppercase transition-all"
                >
                  Create Account
                </button>
              </div>

              <div className="flex items-center gap-4 text-xs font-inter text-white/70 tracking-wide pt-2">
                <span>🛡 No Subscription Required</span>
                <span>•</span>
                <span>✨ Instant Guest Presets</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 6.3 The AI Generator Form / Setup Section */}
      <section id="our-services" className="py-24 px-8 md:px-16 border-b border-border bg-background">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-start">
          {/* Left Column */}
          <div className="space-y-6">
            <span className="font-inter text-xs font-medium uppercase tracking-widest text-muted">
              01 / CONFIGURATION
            </span>
            <h2 className="font-playfair font-normal text-4xl sm:text-5xl text-foreground leading-tight">
              Craft Your Menu
            </h2>
            <p className="font-inter font-light text-sm text-muted leading-relaxed max-w-md">
              Choose from our pre-curated seasonal menus or configure your custom dietary requirements to generate a 7-day culinary schedule.
            </p>
          </div>

          {/* Right Column (Minimalist Form Preview & Preset Switcher) */}
          <div className="space-y-8">
            <div className="grid grid-cols-2 gap-4 border-b border-border pb-6">
              <button
                onClick={() => router.push("/onboarding")}
                className="py-4 text-left border-b-2 border-foreground font-playfair text-xl text-foreground font-medium"
              >
                Instant Seasonal Presets ↗
              </button>
              <button
                onClick={() => router.push("/onboarding")}
                className="py-4 text-left border-b-2 border-transparent font-playfair text-xl text-muted hover:text-foreground transition-colors"
              >
                Bespoke AI Profile ↗
              </button>
            </div>

            <div className="space-y-6 pt-2">
              <div className="border-b border-border pb-4">
                <label className="font-inter text-xs uppercase tracking-widest text-muted block mb-2 font-medium">
                  Target Weekly Budget ($)
                </label>
                <div className="font-playfair text-3xl text-foreground font-normal">
                  $75.00 USD / week
                </div>
              </div>

              <div className="border-b border-border pb-4">
                <label className="font-inter text-xs uppercase tracking-widest text-muted block mb-2 font-medium">
                  Dietary Preferences
                </label>
                <div className="flex flex-wrap gap-2 pt-1 font-inter text-xs">
                  {["Halal", "Keto", "Vegan", "Gluten-Free", "Low-Carb"].map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1.5 border border-border text-foreground font-medium rounded-full bg-secondary/30"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4">
                <Link
                  href="/onboarding"
                  className="w-full inline-block text-center border border-foreground rounded-full px-8 py-5 font-inter font-medium text-xs tracking-widest uppercase text-foreground hover:bg-foreground hover:text-background transition-all shadow-sm"
                >
                  Generate Your Menu ↗
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6.6 The Weekly Dashboard (Grid View Preview of Featured Plans) */}
      <section id="our-meal-plans" className="py-24 px-8 md:px-16 bg-background">
        <div className="max-w-7xl mx-auto space-y-16">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border pb-8">
            <div>
              <span className="font-inter text-xs uppercase tracking-widest text-muted block mb-2 font-medium">
                02 / CURATED SELECTIONS
              </span>
              <h2 className="font-playfair text-4xl md:text-5xl text-foreground font-normal">
                Your Weekly Menu
              </h2>
            </div>
            <div className="font-inter text-xs uppercase tracking-widest text-muted">
              Estimated Average: <span className="font-serif text-lg text-foreground font-medium ml-1">$65.00 – $95.00</span>
            </div>
          </div>

          {/* Grid View Cards (Effect 2) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
            {PRESET_PLANS_LIST.map((preset, index) => {
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
                <motion.div
                  key={preset.id}
                  onClick={() => handleSelectPreset(preset.id)}
                  variants={cardVariants}
                  custom={index}
                  initial="initial"
                  whileInView="animate"
                  whileHover="hover"
                  viewport={{ once: true, margin: "-60px" }}
                  className="group cursor-pointer flex flex-col gap-3 p-4 bg-background border border-border/40 rounded-xl"
                >
                  <div className="overflow-hidden bg-secondary aspect-square relative rounded-lg">
                    <motion.img
                      variants={cardImageVariants}
                      src={sampleImg}
                      alt={preset.title}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-3 right-3 bg-background/90 backdrop-blur-sm text-foreground text-[0.65rem] font-inter uppercase tracking-wider px-2.5 py-1 border border-border">
                      {preset.badge}
                    </span>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <h3 className="font-playfair font-medium text-lg text-foreground group-hover:underline">
                        {preset.title}
                      </h3>
                      <ArrowUpRight className="w-4 h-4 text-foreground transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                    </div>

                    <p className="font-inter text-xs text-muted leading-relaxed line-clamp-2 mb-3">
                      {preset.subtitle}
                    </p>

                    <div className="flex justify-between items-center text-xs font-inter border-t border-border/60 pt-2 text-muted">
                      <span>{preset.calories} kcal / day</span>
                      <span className="font-serif text-sm font-medium text-foreground">
                        {currencySym}{preset.budget}
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 6.4 Why Choose Us (Accordion Section) */}
      <section id="why-choose-us" className="py-24 px-8 md:px-16 bg-background border-t border-border">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-12 items-start">
          {/* Left Title */}
          <div className="space-y-4">
            <span className="font-inter text-xs uppercase tracking-widest text-muted block font-medium">
              03 / ADVANTAGES
            </span>
            <h2 className="font-playfair text-3xl md:text-4xl text-foreground font-normal">
              Why Choose Our AI?
            </h2>
            <p className="font-inter font-light text-xs text-muted leading-relaxed">
              Designed to feel like having a personal chef and nutritionist in your pocket.
            </p>
          </div>

          {/* Right Accordion (Effect 3) */}
          <div className="divide-y divide-border border-t border-b border-border">
            {ACCORDION_ITEMS.map((item) => {
              const isOpen = openAccordion === item.id;
              return (
                <div key={item.id} className="py-2">
                  <button
                    onClick={() => toggleAccordion(item.id)}
                    className="w-full flex justify-between items-center py-6 text-left group"
                  >
                    <span className="font-playfair text-xl text-foreground font-medium group-hover:opacity-80 transition-opacity">
                      {item.title}
                    </span>
                    <span className="text-foreground p-1">
                      {isOpen ? <Minus className="w-5 h-5 stroke-[1.5]" /> : <Plus className="w-5 h-5 stroke-[1.5]" />}
                    </span>
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                        className="overflow-hidden pb-6"
                      >
                        <p className="font-inter text-sm text-muted leading-relaxed max-w-xl">
                          {item.content}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 6.3.5 How It Works Section */}
      <section id="how-it-works" className="py-24 px-8 md:px-16 bg-background border-t border-border">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="border-b border-border pb-8">
            <span className="font-inter text-xs uppercase tracking-widest text-muted block mb-2 font-medium">
              04 / PROCESS
            </span>
            <h2 className="font-playfair text-4xl md:text-5xl text-foreground font-normal">
              How It Works
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              {
                step: "01",
                title: "Configure Profile",
                description: "Define your exact budget, calorie thresholds, and select dietary rules such as Halal, Keto, or Vegan."
              },
              {
                step: "02",
                title: "AI Generation",
                description: "Our culinary neural engine runs a multi-variable optimization to generate a complete, balanced 7-day plan."
              },
              {
                step: "03",
                title: "Cook & Refine",
                description: "Swap single meals instantly, view step-by-step cooking instructions, and shop with aggregated smart grocery lists."
              }
            ].map((item, idx) => (
              <div key={idx} className="space-y-4">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: idx * 0.2, ease: [0.22, 1, 0.36, 1] }}
                  className="font-playfair text-6xl md:text-7xl font-light text-[#d4907a]/40 select-none"
                >
                  {item.step}
                </motion.div>
                <h3 className="font-playfair text-xl font-medium text-foreground">
                  {item.title}
                </h3>
                <p className="font-inter font-light text-sm text-muted leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6.5 Parallax Divider */}
      <section className="h-[50vh] relative flex items-center justify-center overflow-hidden z-10">
        <div
          className="absolute inset-0 bg-cover bg-center z-0 opacity-75"
          style={{ backgroundImage: `url(${PARALLAX_IMG})` }}
        />
        <div className="absolute inset-0 bg-foreground/60 z-10" />

        <div className="relative z-20 px-8 text-center max-w-3xl">
          <h2 className="font-playfair text-white text-3xl md:text-5xl font-normal leading-tight">
            "Nourish your life with expertly crafted meal plans that make healthy eating effortless."
          </h2>
        </div>
      </section>

      {/* 6.5.5 Testimonials Section */}
      <section id="testimonials" className="py-24 px-8 md:px-16 bg-background border-t border-border">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="border-b border-border pb-8 text-center md:text-left">
            <span className="font-inter text-xs uppercase tracking-widest text-muted block mb-2 font-medium">
              05 / TESTIMONIALS
            </span>
            <h2 className="font-playfair text-4xl md:text-5xl text-foreground font-normal">
              What Our Members Say
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                quote: "Platter.ai completely changed how I think about home cooking. The budget tracking keeps us right on target every single week!",
                author: "Sarah K.",
                role: "Busy Professional",
                rating: "★★★★★"
              },
              {
                quote: "The macro balance calculations are incredibly precise. I love the ability to swap single meals on the fly without ruining my targets.",
                author: "Marcus D.",
                role: "Fitness Enthusiast",
                rating: "★★★★★"
              },
              {
                quote: "No food waste and chef-level recipes. Finding Halal and Gluten-Free recipes that actually taste good has never been easier.",
                author: "Amira L.",
                role: "Home Cook & Mom",
                rating: "★★★★★"
              }
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: idx * 0.15, ease: [0.22, 1, 0.36, 1] }}
                className="p-8 bg-[#fdf0ec]/30 border border-border/40 rounded-2xl flex flex-col justify-between space-y-6"
              >
                <div className="space-y-4">
                  <div className="text-[#d4907a] text-sm tracking-wider">{item.rating}</div>
                  <p className="font-inter font-light text-sm text-foreground leading-relaxed italic">
                    "{item.quote}"
                  </p>
                </div>
                <div>
                  <h4 className="font-playfair font-medium text-base text-foreground">
                    {item.author}
                  </h4>
                  <span className="font-inter text-xs text-muted">
                    {item.role}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 6.7 Footer / Get In Touch */}
      <section id="get-in-touch" className="py-24 px-8 md:px-16 bg-background border-t border-border overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-start">
          {/* Left Column */}
          <div className="space-y-6">
            <span className="font-inter text-xs uppercase tracking-widest text-muted block font-medium">
              06 / GET IN TOUCH
            </span>
            <h2 className="font-playfair text-4xl md:text-5xl text-foreground font-normal leading-tight">
              Let's Start a<br />
              <span className="italic font-light">Conversation.</span>
            </h2>
            <p className="font-inter font-light text-sm text-muted leading-relaxed max-w-md">
              Have a question, suggestion, or want to collaborate? Drop us a message and we'll get back to you within 24 hours.
            </p>
            <div className="flex flex-col gap-4 pt-4 font-inter text-sm text-muted">
              <div className="flex items-center gap-3">
                <span className="text-[#d4907a]">✉</span>
                <span>support@platter.ai</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[#d4907a]">⏰</span>
                <span>Response within 24 hours</span>
              </div>
            </div>
          </div>

          {/* Right Column — Contact Form */}
          <div className="relative">
            <AnimatePresence mode="wait">
              {isSubmitted ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -20 }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  className="flex flex-col items-center justify-center text-center py-16 space-y-6"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                    className="w-20 h-20 rounded-full bg-[#d4907a]/15 flex items-center justify-center text-4xl"
                  >
                    ✓
                  </motion.div>
                  <h3 className="font-playfair text-3xl text-foreground font-normal">
                    Query Sent Successfully!
                  </h3>
                  <p className="font-inter text-sm text-muted max-w-sm leading-relaxed">
                    Thank you for reaching out. We'll review your message and respond within 24 hours.
                  </p>
                  <button
                    onClick={() => setIsSubmitted(false)}
                    className="font-inter text-xs uppercase tracking-widest text-[#d4907a] hover:text-[#c27f6a] transition-colors font-medium pt-2"
                  >
                    Send Another Message →
                  </button>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  onSubmit={handleContactSubmit}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="font-inter text-xs uppercase tracking-widest text-muted block font-medium">
                        Your Name
                      </label>
                      <input
                        type="text"
                        required
                        value={contactForm.name}
                        onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                        placeholder="John Doe"
                        className="w-full bg-transparent border-b-2 border-border focus:border-foreground outline-none py-3 font-inter text-sm text-foreground placeholder:text-muted/50 transition-colors"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="font-inter text-xs uppercase tracking-widest text-muted block font-medium">
                        Email Address
                      </label>
                      <input
                        type="email"
                        required
                        value={contactForm.email}
                        onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                        placeholder="john@example.com"
                        className="w-full bg-transparent border-b-2 border-border focus:border-foreground outline-none py-3 font-inter text-sm text-foreground placeholder:text-muted/50 transition-colors"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="font-inter text-xs uppercase tracking-widest text-muted block font-medium">
                      Subject
                    </label>
                    <input
                      type="text"
                      required
                      value={contactForm.subject}
                      onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                      placeholder="What's this about?"
                      className="w-full bg-transparent border-b-2 border-border focus:border-foreground outline-none py-3 font-inter text-sm text-foreground placeholder:text-muted/50 transition-colors"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="font-inter text-xs uppercase tracking-widest text-muted block font-medium">
                      Your Message
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={contactForm.message}
                      onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                      placeholder="Tell us how we can help..."
                      className="w-full bg-transparent border-b-2 border-border focus:border-foreground outline-none py-3 font-inter text-sm text-foreground placeholder:text-muted/50 transition-colors resize-none"
                    />
                  </div>

                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full border border-foreground rounded-full px-8 py-5 font-inter font-medium text-xs tracking-widest uppercase text-foreground hover:bg-foreground hover:text-background transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                    >
                      {isSubmitting ? (
                        <>
                          <motion.span
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full"
                          />
                          <span>Sending...</span>
                        </>
                      ) : (
                        <>
                          <span>Send Message</span>
                          <ArrowUpRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Massive full-width brand text "Platter.ai" */}
        <div className="max-w-7xl mx-auto w-full mt-24 pt-8 border-t border-border/60">
          <h1 className="font-playfair tracking-tighter text-[14vw] font-normal leading-none opacity-90 text-foreground text-center select-none">
            Platter.ai
          </h1>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 font-inter text-xs text-muted pt-6">
            <span>© {new Date().getFullYear()} Platter.ai Inc. All Rights Reserved.</span>
            <span>Plan Well • Eat Well</span>
          </div>
        </div>
      </section>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        initialMode={authMode}
      />
    </div>
  );
}
