import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle2, ShieldCheck, ArrowRight, Sparkles } from "lucide-react";

const ThankYou = () => {
  const navigate = useNavigate();

  const handleRedirect = () => {
    navigate("/auth/login");
  };

  return (
    <div className="space-y-6 w-full text-center py-4">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
        className="w-16 h-16 rounded-3xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/25"
      >
        <CheckCircle2 className="w-8 h-8" />
      </motion.div>

      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Student Account Verified</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-foreground">
          Welcome to CollegeMart!
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
          Your university profile is now active. You can start browsing items, placing bids in live move-out auctions, or listing your own gear.
        </p>
      </div>

      <div className="p-4 rounded-2xl bg-muted/60 border border-border/60 text-left space-y-2.5">
        <div className="flex items-center gap-2 text-xs font-medium text-foreground">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>Campus Escrow Protection activated</span>
        </div>
        <div className="flex items-center gap-2 text-xs font-medium text-foreground">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>Connected to your university circle</span>
        </div>
      </div>

      <Button
        onClick={handleRedirect}
        size="lg"
        className="w-full h-11 text-sm font-semibold rounded-xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-600 hover:to-amber-700 text-white shadow-md shadow-orange-500/20 cursor-pointer flex items-center justify-center gap-2 transition-all"
      >
        <span>Sign In to Your Dashboard</span>
        <ArrowRight className="w-4 h-4" />
      </Button>
    </div>
  );
};

export default ThankYou;
