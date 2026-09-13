import { motion } from "framer-motion";
import { MailCheck, Wallet, Handshake, ArrowRight, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const STEPS = [
  {
    step: "01",
    icon: MailCheck,
    title: "Verify Your College Identity",
    description:
      "Sign up in 30 seconds using your official college email. This keeps your campus marketplace safe and 100% free of external strangers or scammers.",
    badge: "Closed University Community",
  },
  {
    step: "02",
    icon: Wallet,
    title: "Lock Payment in Escrow",
    description:
      "When you buy an item, place an auction bid, or book a service, your payment is held safely in campus escrow. The seller cannot withdraw until you verify the goods.",
    badge: "100% Scam Protected",
  },
  {
    step: "03",
    icon: Handshake,
    title: "Campus Meetup & OTP Handshake",
    description:
      "Meet on campus—at the library, hostel gate, or canteen. Inspect the physical item, share your unique 6-digit OTP, and payment is released in real-time.",
    badge: "Zero-Risk Handover",
  },
];

const HowItWorksSection = () => {
  return (
    <section id="how-it-works" className="py-20 md:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-border/80">
      <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
        <Badge variant="outline" className="px-3 py-1 text-xs font-semibold text-orange-600 border-orange-400/40 bg-orange-500/10">
          EFFORTLESS & SAFE
        </Badge>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground">
          How CollegeMart Works in 3 Steps
        </h2>
        <p className="text-muted-foreground text-base sm:text-lg">
          We combined the convenience of campus classifieds with institutional escrow security.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
        {STEPS.map((item, index) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={item.step}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              className="rounded-3xl border border-border/80 bg-card p-8 flex flex-col justify-between relative shadow-sm hover:shadow-xl hover:border-orange-500/30 transition-all group"
            >
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-4xl font-extrabold text-orange-500/25 group-hover:text-orange-500/50 transition-colors">
                    {item.step}
                  </span>
                  <div className="w-12 h-12 rounded-2xl bg-orange-500/10 text-orange-500 flex items-center justify-center group-hover:bg-orange-500 group-hover:text-white transition-all">
                    <Icon className="w-6 h-6" />
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-foreground">
                    {item.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-border/60">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-orange-600 dark:text-orange-400">
                  <ShieldCheck className="w-4 h-4" />
                  {item.badge}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Trust banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="mt-14 p-6 rounded-2xl bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-orange-500/10 border border-orange-500/20 text-center flex flex-col sm:flex-row items-center justify-between gap-4"
      >
        <div className="text-left space-y-1">
          <h4 className="font-bold text-base text-foreground">
            Have old books or a cycle to sell before the semester ends?
          </h4>
          <p className="text-xs text-muted-foreground">
            List your item in 60 seconds with campus image uploads and instant notifications.
          </p>
        </div>
        <Button
          className="bg-orange-500 hover:bg-orange-600 text-white font-bold gap-2 shrink-0 cursor-pointer"
          asChild
        >
          <Link to="/auth/signup">
            <span>Post a Free Listing</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </Button>
      </motion.div>
    </section>
  );
};

export default HowItWorksSection;
