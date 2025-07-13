// src/components/landing/FeaturesSection.tsx
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import {
  RocketIcon,
  ShieldCheck,
  UsersRound,
  BadgeCheck,
  PackageCheck,
  Star,
} from "lucide-react";

const features = [
  {
    icon: <ShieldCheck className="h-10 w-10 text-orange-400" />,
    title: "Verified Students",
    desc: "Signup only with your official college email.",
  },
  {
    icon: <RocketIcon className="h-10 w-10 text-orange-400" />,
    title: "Post Instantly",
    desc: "List or find products in just a few clicks.",
  },
  {
    icon: <UsersRound className="h-10 w-10 text-orange-400" />,
    title: "Private Campus",
    desc: "Only accessible by your own college community.",
  },
  {
    icon: <BadgeCheck className="h-10 w-10 text-orange-400" />,
    title: "Safe & Secure",
    desc: "Moderated listings and secure communication.",
  },
  {
    icon: <PackageCheck className="h-10 w-10 text-orange-400" />,
    title: "Multiple Categories",
    desc: "Books, electronics, notes, essentials, and more.",
  },
  {
    icon: <Star className="h-10 w-10 text-orange-400" />,
    title: "Trusted by Students",
    desc: "Built for students, by students.",
  },
];

// Create a motion-enhanced version of the Card
const MotionCard = motion(Card);

const FeaturesSection = () => {
  return (
    <section className="py-24 px-6 bg-[url('https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&w=1400&q=80')] bg-cover bg-center text-white border-t border-border backdrop-blur-md rounded-lg">
      <div className="max-w-7xl mx-auto text-center space-y-12">
        <h2 className="text-4xl font-bold tracking-tight">
          Why Choose <span className="text-orange-400">CollegeMart</span>?
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {features.map((item, index) => (
            <MotionCard
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ scale: 1.05 }}
              className="p-7 flex flex-col items-center text-center rounded-xl bg-white/10 backdrop-blur-md shadow-md border border-white/20"
            >
              <div className="mb-2">{item.icon}</div>
              <h3 className="text-xl font-semibold text-foreground">{item.title}</h3>
              <p className="text-base text-foreground/80 mt-2">{item.desc}</p>
            </MotionCard>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
