// src/components/landing/CTASection.tsx
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const CTASection = () => {
  return (
    <section className="py-24 px-6 bg-gradient-to-br from-background to-muted text-foreground border-t border-border">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="max-w-3xl mx-auto text-center bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl px-10 py-16 shadow-lg"
      >
        <h2 className="text-4xl font-bold mb-4">
          Ready to <span className="text-orange-400">Sell</span> &{" "}
          <span className="text-orange-400">Buy</span> on Campus?
        </h2>
        <p className="text-muted-foreground mb-8 text-lg">
          Join hundreds of students making the most of their college marketplace.
        </p>
        <Button size="lg" className="text-base font-semibold" asChild>
          <Link to="/auth/signup">Create Your Account</Link>
        </Button>
      </motion.div>
    </section>
  );
};

export default CTASection;
