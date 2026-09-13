import { motion } from "framer-motion";
import { ShieldCheck, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const COMPARISONS = [
  {
    feature: "User Verification",
    other: "Anonymous users & fake profiles",
    collegemart: "100% Verified University Email Only (.edu / college)",
  },
  {
    feature: "Payment Protection",
    other: "Direct UPI prepayment (Huge scam risk)",
    collegemart: "Escrow Locked Until Physical 6-Digit OTP Handshake",
  },
  {
    feature: "Meetup Safety",
    other: "Random city corners & metro stations",
    collegemart: "Inside your own campus (Hostels, Library, Canteen)",
  },
  {
    feature: "Disputes & Support",
    other: "Ignored by customer support, no recourse",
    collegemart: "Campus arbitration with escrow freeze & refunds",
  },
  {
    feature: "Senior Move-Outs",
    other: "Lowballing spam messages & flaky buyers",
    collegemart: "Fair 24-Hour Live Auctions with Anti-Sniping",
  },
];

const SafetySection = () => {
  return (
    <section id="safety" className="py-20 md:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-border/80">
      <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
        <Badge variant="outline" className="px-3 py-1 text-xs font-semibold text-emerald-600 border-emerald-400/40 bg-emerald-500/10">
          CAMPUS TRUST & SAFETY
        </Badge>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground">
          Built to End Campus Prepayment Scams
        </h2>
        <p className="text-muted-foreground text-base sm:text-lg">
          Students lose thousands every semester on WhatsApp groups and generic classifieds. Here is how CollegeMart protects every single transaction.
        </p>
      </div>

      {/* Comparison Grid */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto rounded-3xl border border-border/80 bg-card overflow-hidden shadow-lg"
      >
        {/* Table Header */}
        <div className="grid grid-cols-12 border-b border-border/80 bg-muted/40 p-4 sm:p-5 text-xs sm:text-sm font-bold">
          <div className="col-span-4 sm:col-span-3 text-muted-foreground uppercase tracking-wider">
            Feature
          </div>
          <div className="col-span-4 text-red-500/80 flex items-center gap-1.5">
            <XCircle className="w-4 h-4 text-red-500 shrink-0" />
            <span className="truncate">Generic Marketplaces (OLX / FB)</span>
          </div>
          <div className="col-span-4 sm:col-span-5 text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
            <span className="font-extrabold">CollegeMart Campus Protection</span>
          </div>
        </div>

        {/* Rows */}
        <div className="divide-y divide-border/60">
          {COMPARISONS.map((row, index) => (
            <div
              key={row.feature}
              className={`grid grid-cols-12 p-4 sm:p-5 text-xs sm:text-sm items-center transition-colors ${
                index % 2 === 0 ? "bg-background" : "bg-muted/20"
              }`}
            >
              <div className="col-span-4 sm:col-span-3 font-semibold text-foreground">
                {row.feature}
              </div>
              <div className="col-span-4 text-muted-foreground pr-2 flex items-start gap-1.5">
                <span className="text-red-500 shrink-0 font-bold">✕</span>
                <span>{row.other}</span>
              </div>
              <div className="col-span-4 sm:col-span-5 text-foreground font-semibold flex items-start gap-1.5">
                <span className="text-emerald-500 shrink-0 font-bold">✓</span>
                <span className="text-emerald-700 dark:text-emerald-300">{row.collegemart}</span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  );
};

export default SafetySection;
