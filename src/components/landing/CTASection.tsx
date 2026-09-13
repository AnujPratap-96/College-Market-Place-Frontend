import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2, GraduationCap } from "lucide-react";

const CTASection = () => {
  return (
    <section className="py-20 md:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-border/80">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-orange-500 via-amber-500 to-orange-600 text-white p-8 sm:p-14 lg:p-20 shadow-2xl shadow-orange-500/20 text-center"
      >
        {/* Ambient background decoration */}
        <div className="absolute top-0 right-0 w-[450px] h-[450px] bg-white/10 rounded-full blur-3xl pointer-events-none -mr-32 -mt-32" />
        <div className="absolute bottom-0 left-0 w-[350px] h-[350px] bg-black/10 rounded-full blur-2xl pointer-events-none -ml-24 -mb-24" />

        <div className="relative z-10 max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-white/15 backdrop-blur-md border border-white/25 text-white">
            <GraduationCap className="w-4 h-4" />
            <span>Exclusively for College & University Students</span>
          </div>

          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
            Ready to Experience the Safest Way to Trade on Campus?
          </h2>

          <p className="text-white/90 text-base sm:text-xl max-w-2xl mx-auto leading-relaxed font-medium">
            Join thousands of college students saving money on textbooks, trading tech, and bidding on senior clearance deals without prepayment scam anxiety.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button
              size="lg"
              className="w-full sm:w-auto h-13 px-8 text-base font-extrabold bg-white text-orange-600 hover:bg-white/95 hover:text-orange-700 shadow-xl gap-2 cursor-pointer transition-all hover:scale-105"
              asChild
            >
              <Link to="/auth/signup">
                <span>Sign Up With College Email</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>

            <Button
              size="lg"
              variant="outline"
              className="w-full sm:w-auto h-13 px-7 text-base font-bold bg-white/10 hover:bg-white/20 text-white border-white/40 backdrop-blur-xs cursor-pointer"
              asChild
            >
              <Link to="/auth/login">
                Existing Student? Sign In
              </Link>
            </Button>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 pt-4 text-xs font-semibold text-white/85">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-white" /> 30-second signup
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-white" /> 100% Escrow protected
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-white" /> Free forever for buyers
            </span>
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default CTASection;
