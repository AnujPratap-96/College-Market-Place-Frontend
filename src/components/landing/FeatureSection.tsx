import { motion } from "framer-motion";
import {
  ShieldCheck,
  Gavel,
  Repeat,
  Sparkles,
  Clock,
  KeyRound,
  Calendar,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

const FeatureSection = () => {
  return (
    <section id="features" className="py-20 md:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-border/80">
      <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
        <Badge variant="outline" className="px-3 py-1 text-xs font-semibold text-orange-600 border-orange-400/40 bg-orange-500/10">
          BUILT DIFFERENTLY FOR CAMPUS
        </Badge>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground">
          Why CollegeMart Leaves OLX & Facebook In the Dust
        </h2>
        <p className="text-muted-foreground text-base sm:text-lg">
          Campus commerce shouldn't mean meeting sketchy strangers or worrying about payment scams. We engineered every feature for student life.
        </p>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Bento Card 1: 100% Escrow & OTP Handshake (Spans 7 cols on desktop) */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="md:col-span-7 rounded-3xl border border-border/80 bg-gradient-to-br from-card via-card to-orange-500/5 p-8 flex flex-col justify-between shadow-sm hover:shadow-xl hover:border-orange-500/30 transition-all group"
        >
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-orange-500/10 text-orange-500 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-foreground">
                100% Escrow Lock & 6-Digit OTP Handshake
              </h3>
              <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
                When an item is bought or service booked, funds are locked securely in escrow. No money reaches the seller until you meet in person, inspect the item, and exchange the secret 6-digit OTP.
              </p>
            </div>
          </div>

          {/* Graphic mockup of OTP Handshake */}
          <div className="mt-8 p-4 rounded-2xl bg-muted/60 border border-border/80 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-foreground flex items-center gap-1.5">
                <KeyRound className="w-4 h-4 text-orange-500" />
                Physical Handshake Verification
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                Active Escrow Hold
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-background border border-border/60">
              <div>
                <span className="text-[11px] text-muted-foreground block">Buyer OTP Code</span>
                <span className="font-mono text-xl font-extrabold tracking-widest text-orange-500">
                  7 4 9 • 3 8 2
                </span>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-muted-foreground block">Meetup Location</span>
                <span className="text-xs font-bold text-foreground">Central Library Ground Floor</span>
              </div>
            </div>

            <p className="text-[11px] text-muted-foreground text-center">
              Funds are released instantaneously the moment the seller confirms this OTP on their phone.
            </p>
          </div>
        </motion.div>

        {/* Bento Card 2: Senior Move-Out Live Auctions (Spans 5 cols) */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="md:col-span-5 rounded-3xl border border-border/80 bg-gradient-to-br from-card via-card to-amber-500/5 p-8 flex flex-col justify-between shadow-sm hover:shadow-xl hover:border-amber-500/30 transition-all group"
        >
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <Gavel className="w-6 h-6" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-foreground">
                Senior Move-Out Live Auctions
              </h3>
              <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
                Graduating seniors can clear out room coolers, kettles, monitors, and textbooks in fast 24-hour bidding wars with automatic anti-sniping protection.
              </p>
            </div>
          </div>

          <div className="mt-6 p-4 rounded-2xl bg-muted/60 border border-border/80 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-foreground">Live Bid Stream</span>
              <span className="text-orange-500 font-mono text-xs flex items-center gap-1 font-semibold">
                <Clock className="w-3 h-3" /> Ends 01:24:10
              </span>
            </div>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between items-center p-2 rounded-lg bg-background border text-[11px]">
                <span className="font-semibold text-foreground">Pranav (CS '26)</span>
                <span className="font-mono font-bold text-emerald-600">₹3,400</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded-lg bg-background/50 text-muted-foreground text-[11px]">
                <span>Aarav (Mech '25)</span>
                <span className="font-mono">₹3,250 (Refunded)</span>
              </div>
            </div>
            <span className="text-[10px] text-muted-foreground block text-center">
              Outbid? Your escrow hold is refunded automatically back to your wallet in milliseconds.
            </span>
          </div>
        </motion.div>

        {/* Bento Card 3: Peer Gigs & Campus Tutoring (Spans 5 cols) */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="md:col-span-5 rounded-3xl border border-border/80 bg-gradient-to-br from-card via-card to-purple-500/5 p-8 flex flex-col justify-between shadow-sm hover:shadow-xl hover:border-purple-500/30 transition-all group"
        >
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
              <Sparkles className="w-6 h-6" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-foreground">
                Student Gigs & Skill Exchange
              </h3>
              <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
                Monetize your skills on campus. Offer exam prep, coding help, lab report assistance, cycle puncture repairs, or moving help to hostel mates.
              </p>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-2 pt-2">
            {[
              "🐍 Python & DSA Tutoring",
              "🎨 UI/UX Portfolio Reviews",
              "🚲 Cycle Tune-ups",
              "📦 Hostel Room Moving",
              "📷 Fest & Convocation Photography",
            ].map((skill) => (
              <span
                key={skill}
                className="px-3 py-1.5 rounded-full text-xs font-semibold bg-background border border-border/80 text-foreground"
              >
                {skill}
              </span>
            ))}
          </div>
        </motion.div>

        {/* Bento Card 4: Hostel Meal & Laundry Subscriptions with Vacation Pauses (Spans 7 cols) */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="md:col-span-7 rounded-3xl border border-border/80 bg-gradient-to-br from-card via-card to-emerald-500/5 p-8 flex flex-col justify-between shadow-sm hover:shadow-xl hover:border-emerald-500/30 transition-all group"
        >
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <Repeat className="w-6 h-6" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-foreground">
                Hostel Subscriptions with Vacation Pauses
              </h3>
              <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
                Subscribe to verified local hostel mess tiffins, laundry plans, or milk deliveries. Traveling home for Diwali or semester breaks? Pause your deliveries with 1 click to save every single rupee.
              </p>
            </div>
          </div>

          <div className="mt-6 p-4 rounded-2xl bg-muted/60 border border-border/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-foreground block">Vacation Pause Mode</span>
                <span className="text-muted-foreground text-[11px]">
                  Pause deliveries for Oct 12 – Oct 20 • No charges deducted
                </span>
              </div>
            </div>
            <Badge className="bg-emerald-600 text-white shrink-0 font-semibold px-3 py-1">
              Zero-Waste Guarantee
            </Badge>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default FeatureSection;
