import { motion } from "framer-motion";
import { Users, IndianRupee, ShieldCheck, Zap } from "lucide-react";

const STATS = [
  {
    icon: <Users className="w-6 h-6 text-orange-500" />,
    value: "12,000+",
    label: "Active Campus Students",
    detail: "Verified with official college email",
  },
  {
    icon: <IndianRupee className="w-6 h-6 text-amber-500" />,
    value: "₹25 Lakhs+",
    label: "Saved on Textbooks & Gear",
    detail: "Avoiding expensive retail markups",
  },
  {
    icon: <ShieldCheck className="w-6 h-6 text-emerald-500" />,
    value: "100%",
    label: "Escrow-Protected Trades",
    detail: "Funds held until physical OTP handshake",
  },
  {
    icon: <Zap className="w-6 h-6 text-blue-500" />,
    value: "< 5 Mins",
    label: "Average Campus Handover",
    detail: "Hostel-to-hostel or library meetups",
  },
];

const StatsBanner = () => {
  return (
    <section className="relative w-full py-12 border-y border-border/80 bg-muted/30 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {STATS.map((item, index) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="flex flex-col items-center text-center p-4 rounded-xl hover:bg-background/80 transition-colors"
            >
              <div className="p-3 rounded-2xl bg-background border border-border/80 shadow-xs mb-3">
                {item.icon}
              </div>
              <span className="text-3xl sm:text-4xl font-extrabold text-foreground font-mono tracking-tight">
                {item.value}
              </span>
              <span className="text-sm font-bold text-foreground mt-1">
                {item.label}
              </span>
              <span className="text-xs text-muted-foreground mt-0.5">
                {item.detail}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsBanner;
