import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
  BookOpen,
  Laptop,
  Bike,
  Armchair,
  GraduationCap,
  Gavel,
  ShieldCheck,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const CATEGORIES = [
  { id: "all", label: "All Items", icon: Sparkles },
  { id: "books", label: "Books & Notes", icon: BookOpen },
  { id: "electronics", label: "Laptops & Gadgets", icon: Laptop },
  { id: "mobility", label: "Cycles & Mobility", icon: Bike },
  { id: "hostel", label: "Hostel Essentials", icon: Armchair },
  { id: "services", label: "Campus Gigs & Tutoring", icon: GraduationCap },
  { id: "auctions", label: "Live Move-Out Auctions", icon: Gavel },
];

const SAMPLE_ITEMS = [
  {
    id: 1,
    title: "Engineering Mathematics (Vol 1 & 2) - Higher Engg Math",
    category: "books",
    price: 450,
    originalPrice: 1200,
    type: "SELL",
    image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80",
    campus: "IIT Delhi",
    condition: "Like New",
    seller: "Karan V. (Mech '26)",
  },
  {
    id: 2,
    title: "Casio FX-991CW Scientific Calculator (Non-Programmable)",
    category: "electronics",
    price: 850,
    originalPrice: 1550,
    type: "SELL",
    image: "https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?w=600&auto=format&fit=crop&q=80",
    campus: "BITS Pilani",
    condition: "Mint Condition",
    seller: "Ananya D. (ECE '25)",
  },
  {
    id: 3,
    title: "Hero Sprint 26T Mountain Bicycle (With Lock & Bell)",
    category: "mobility",
    price: 2400,
    originalPrice: 6500,
    type: "SELL",
    image: "https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=600&auto=format&fit=crop&q=80",
    campus: "NIT Trichy",
    condition: "Good Condition",
    seller: "Rohan M. (Hostel 6)",
  },
  {
    id: 4,
    title: "Senior Clearance: Bajaj 36L Room Air Cooler (Hostel Room)",
    category: "auctions",
    price: 1800,
    originalPrice: 4200,
    type: "AUCTION",
    image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&auto=format&fit=crop&q=80",
    campus: "Delhi University",
    condition: "Fully Working",
    seller: "Outgoing 4th Year Senior",
    bids: 6,
  },
  {
    id: 5,
    title: "Ergonomic Mesh Study Chair with Lumbar Support",
    category: "hostel",
    price: 1200,
    originalPrice: 3800,
    type: "SELL",
    image: "https://images.unsplash.com/photo-1580481077195-c54625b0445a?w=600&auto=format&fit=crop&q=80",
    campus: "IIT Bombay",
    condition: "1 Year Used",
    seller: "Vikas P. (Hostel 12)",
  },
  {
    id: 6,
    title: "1-on-1 Full Stack Web Dev & DSA Mentorship (1 Hr Session)",
    category: "services",
    price: 350,
    originalPrice: 1000,
    type: "SERVICE",
    image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&auto=format&fit=crop&q=80",
    campus: "IIT Roorkee",
    condition: "4.9 ★ (32 reviews)",
    seller: "Siddharth (Google Intern)",
  },
];

const CategoryShowcase = () => {
  const [activeTab, setActiveTab] = useState("all");

  const filteredItems =
    activeTab === "all"
      ? SAMPLE_ITEMS
      : SAMPLE_ITEMS.filter((item) => item.category === activeTab);

  return (
    <section id="explore" className="py-20 md:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center max-w-3xl mx-auto space-y-4 mb-12">
        <Badge variant="outline" className="px-3 py-1 text-xs font-semibold text-orange-600 border-orange-400/40 bg-orange-500/10">
          CAMPUS DISCOVERY
        </Badge>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground">
          What Students Are Trading Today
        </h2>
        <p className="text-muted-foreground text-base sm:text-lg">
          From last-minute semester books to cycles and move-out clearances — everything is priced by students, for students.
        </p>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-4">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeTab === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveTab(cat.id)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  isActive
                    ? "bg-orange-500 text-white shadow-md shadow-orange-500/25"
                    : "bg-muted/70 hover:bg-muted text-foreground/80 hover:text-foreground border border-border/60"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid of items */}
      <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {filteredItems.map((item) => (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              key={item.id}
              className="rounded-2xl border border-border/80 bg-card overflow-hidden flex flex-col justify-between shadow-sm hover:shadow-xl hover:border-orange-500/30 transition-all group"
            >
              <div>
                <div className="relative aspect-16/10 overflow-hidden bg-muted">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 flex gap-2">
                    <Badge
                      className={`text-[10px] font-bold ${
                        item.type === "AUCTION"
                          ? "bg-orange-600 text-white"
                          : item.type === "SERVICE"
                          ? "bg-purple-600 text-white"
                          : "bg-blue-600 text-white"
                      }`}
                    >
                      {item.type === "AUCTION"
                        ? "Live Auction"
                        : item.type === "SERVICE"
                        ? "Campus Gig"
                        : "For Sale"}
                    </Badge>
                  </div>
                  <span className="absolute bottom-2.5 right-2.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-black/75 text-white backdrop-blur-xs">
                    {item.condition}
                  </span>
                </div>

                <div className="p-5 space-y-2.5">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="font-medium text-orange-600 dark:text-orange-400">
                      {item.campus}
                    </span>
                    <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                      <ShieldCheck className="w-3.5 h-3.5" /> Escrow Protected
                    </span>
                  </div>

                  <h3 className="font-bold text-base text-foreground leading-snug line-clamp-2 group-hover:text-orange-500 transition-colors">
                    {item.title}
                  </h3>

                  <p className="text-xs text-muted-foreground">
                    Listed by: <span className="font-medium text-foreground">{item.seller}</span>
                  </p>
                </div>
              </div>

              <div className="p-5 pt-0">
                <div className="flex items-baseline justify-between border-t border-border/60 pt-3">
                  <div>
                    <span className="text-xs text-muted-foreground line-through mr-2">
                      ₹{item.originalPrice}
                    </span>
                    <span className="text-xl font-extrabold text-foreground font-mono">
                      ₹{item.price}
                    </span>
                    {item.type === "AUCTION" && (
                      <span className="text-[11px] font-bold text-orange-500 ml-2">
                        ({item.bids} bids)
                      </span>
                    )}
                  </div>

                  <Button
                    size="sm"
                    className="bg-orange-500/10 hover:bg-orange-500 text-orange-600 hover:text-white font-semibold transition-all cursor-pointer"
                    asChild
                  >
                    <Link to="/auth/signup">View Details</Link>
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Explore More CTA */}
      <div className="text-center mt-12">
        <Button
          size="lg"
          className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 shadow-md shadow-orange-500/20 gap-2 cursor-pointer"
          asChild
        >
          <Link to="/auth/signup">
            <span>Explore All 500+ Campus Listings</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </Button>
      </div>
    </section>
  );
};

export default CategoryShowcase;
