import { motion } from "framer-motion";
import { Star, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const TESTIMONIALS = [
  {
    name: "Aayush Sharma",
    role: "B.Tech Computer Science '25",
    college: "IIT Delhi",
    avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80",
    quote:
      "When vacating Hostel 5, I had a 50L fridge and a study table to sell within 24 hours. Put them on CollegeMart's Live Auction and got ₹6,200 total by evening. The buyer came to my room with the OTP and the funds hit my wallet immediately.",
    tag: "Senior Move-Out Auction",
  },
  {
    name: "Sneha Patel",
    role: "Electronics & Comm '26",
    college: "BITS Pilani",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80",
    quote:
      "I used to dread buying engineering semester books because seniors on WhatsApp would ask for direct UPI prepayment before showing the book. With CollegeMart, my money was locked safely in escrow until I inspected the pages at the Library lawn.",
    tag: "Escrow Handshake",
  },
  {
    name: "Rohan Nair",
    role: "Mechanical Engineering '26",
    college: "NIT Trichy",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80",
    quote:
      "The vacation pause on the hostel meal subscription is a lifesaver. Whenever I go home for study leave or semester breaks, I pause my daily tiffin with one click and don't lose a single rupee. No mess contractor ever allowed that before.",
    tag: "Hostel Meal Subscription",
  },
];

const TestimonialsSection = () => {
  return (
    <section className="py-20 md:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-border/80">
      <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
        <Badge variant="outline" className="px-3 py-1 text-xs font-semibold text-orange-600 border-orange-400/40 bg-orange-500/10">
          STUDENT VOICES
        </Badge>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground">
          Loved by Students Across 50+ Campuses
        </h2>
        <p className="text-muted-foreground text-base sm:text-lg">
          Here is what campus peers have to say about the CollegeMart experience.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {TESTIMONIALS.map((item, index) => (
          <motion.div
            key={item.name}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.15 }}
            className="rounded-3xl border border-border/80 bg-card p-7 flex flex-col justify-between shadow-sm hover:shadow-xl hover:border-orange-500/30 transition-all group relative"
          >
            <div className="space-y-4">
              {/* Star Rating & Quote mark */}
              <div className="flex items-center justify-between">
                <div className="flex text-amber-400 gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
                <Badge variant="secondary" className="text-[10px] font-semibold">
                  {item.tag}
                </Badge>
              </div>

              <p className="text-foreground/90 text-sm leading-relaxed italic">
                "{item.quote}"
              </p>
            </div>

            {/* Student Info */}
            <div className="flex items-center gap-3 pt-6 mt-6 border-t border-border/60">
              <Avatar className="w-11 h-11 border border-border/80">
                <AvatarImage src={item.avatar} alt={item.name} />
                <AvatarFallback>{item.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-sm text-foreground">{item.name}</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" />
                </div>
                <span className="text-xs text-muted-foreground block">
                  {item.role} • <strong className="text-orange-600 dark:text-orange-400">{item.college}</strong>
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default TestimonialsSection;
