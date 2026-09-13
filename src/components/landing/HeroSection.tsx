import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ShieldCheck,
  Gavel,
  CheckCircle2,
  Clock,
  Flame,
  Star,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const HeroSection = () => {
  // Live demo auction countdown
  const [timeLeft, setTimeLeft] = useState({ hours: 2, minutes: 41, seconds: 18 });

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 2, minutes: 45, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative w-full overflow-hidden pt-12 pb-20 md:pt-16 md:pb-28">
      {/* Ambient background glow effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] pointer-events-none -z-10">
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-orange-500/20 via-amber-400/15 to-transparent rounded-full blur-3xl" />
        <div className="absolute top-32 left-1/4 w-[280px] h-[280px] bg-orange-400/10 rounded-full blur-2xl" />
        <div className="absolute top-28 right-1/4 w-[320px] h-[320px] bg-amber-500/10 rounded-full blur-2xl" />
      </div>

      {/* Subtle grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:28px_28px] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto space-y-6">
          {/* Top Announcement Pill */}
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex"
          >
            <a
              href="#auctions"
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-orange-500/10 hover:bg-orange-500/15 text-orange-600 dark:text-orange-400 border border-orange-500/25 transition-all shadow-xs group cursor-pointer"
            >
              <span className="flex h-2 w-2 rounded-full bg-orange-500 animate-pulse" />
              <span>Senior Move-Out Clearance & Live Auctions Now Live</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </a>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-foreground leading-[1.1]"
          >
            The Smarter Way to{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600">
              Buy, Sell, Rent & Bid
            </span>{" "}
            On Your Campus.
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
          >
            Connect directly with verified students across your college. Trade textbooks, lab gear, cycles, and tech with{" "}
            <span className="text-foreground font-semibold">100% Escrow & OTP Handshake</span> fraud protection.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2"
          >
            <Button
              size="lg"
              className="w-full sm:w-auto h-13 px-8 text-base font-bold bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-600 hover:to-amber-600 text-white shadow-lg shadow-orange-500/25 gap-2 cursor-pointer transition-all hover:shadow-orange-500/35"
              asChild
            >
              <Link to="/auth/signup">
                <span>Join With College Email</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>

            <Button
              size="lg"
              variant="outline"
              className="w-full sm:w-auto h-13 px-7 text-base font-semibold border-border hover:bg-muted/60 text-foreground gap-2 cursor-pointer"
              asChild
            >
              <a href="#how-it-works">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>How Escrow Works</span>
              </a>
            </Button>
          </motion.div>

          {/* Micro Trust Indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-wrap items-center justify-center gap-y-2 gap-x-6 pt-3 text-xs font-medium text-muted-foreground"
          >
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>Verified .edu & college emails only</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>0% Platform fee for buyers</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>Campus Handshake 6-Digit OTP</span>
            </div>
          </motion.div>
        </div>

        {/* Hero Interactive Showcase Mockup */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.35 }}
          className="mt-14 max-w-5xl mx-auto relative"
        >
          {/* Subtle frame container */}
          <div className="relative rounded-2xl border border-border/80 bg-gradient-to-b from-card/80 to-card/40 backdrop-blur-xl p-4 sm:p-6 shadow-2xl shadow-orange-500/5">
            {/* Header bar of preview */}
            <div className="flex items-center justify-between border-b border-border/60 pb-3 mb-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-400/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-400/80" />
                </div>
                <span className="font-mono text-[11px] text-muted-foreground/80 pl-2">
                  collegemart.app/campus/live-feed
                </span>
              </div>
              <div className="flex items-center gap-2 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span>Live Campus Activity</span>
              </div>
            </div>

            {/* Showcase Grid: 3 Realistic Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Card 1: Trending Item */}
              <div className="rounded-xl border border-border/70 bg-background/60 p-3.5 flex flex-col justify-between space-y-3 hover:border-orange-500/40 transition-colors">
                <div className="relative aspect-4/3 rounded-lg overflow-hidden bg-muted">
                  <img
                    src="https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80"
                    alt="Textbooks & Notes"
                    className="w-full h-full object-cover"
                  />
                  <Badge className="absolute top-2 left-2 bg-blue-600 text-white text-[10px] font-bold">
                    For Sale
                  </Badge>
                  <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-black/75 text-white backdrop-blur-xs">
                    Like New
                  </span>
                </div>
                <div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                    <span>Hostel 4 • CS Branch</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" /> Escrow
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-foreground line-clamp-1">
                    Algorithm Design + Cormen CLRS (4th Edition)
                  </h4>
                  <div className="flex items-baseline justify-between mt-2 pt-2 border-t border-border/50">
                    <div>
                      <span className="text-xs text-muted-foreground">Price: </span>
                      <span className="text-base font-extrabold text-foreground font-mono">₹650</span>
                    </div>
                    <span className="text-[11px] text-orange-500 font-semibold">Instant Handshake</span>
                  </div>
                </div>
              </div>

              {/* Card 2: Center Spotlight Live Auction */}
              <div className="rounded-xl border-2 border-orange-500/40 bg-gradient-to-b from-orange-500/5 via-background/80 to-background/60 p-3.5 flex flex-col justify-between space-y-3 shadow-md relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[10px] font-extrabold bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-xs flex items-center gap-1">
                  <Flame className="w-3 h-3 fill-white" />
                  SENIOR MOVE-OUT AUCTION
                </div>
                <div className="relative aspect-4/3 rounded-lg overflow-hidden bg-muted mt-1">
                  <img
                    src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80"
                    alt="Audio Gear"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between px-2.5 py-1 rounded-md bg-black/80 text-white text-[11px] font-mono font-bold backdrop-blur-xs">
                    <span className="flex items-center gap-1 text-amber-300">
                      <Clock className="w-3 h-3" /> Ends in:
                    </span>
                    <span>
                      {String(timeLeft.hours).padStart(2, "0")}:{String(timeLeft.minutes).padStart(2, "0")}:
                      {String(timeLeft.seconds).padStart(2, "0")}
                    </span>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                    <span>4th Year Senior • Room 302</span>
                    <Badge variant="outline" className="text-[10px] text-orange-600 border-orange-400">
                      7 Bids
                    </Badge>
                  </div>
                  <h4 className="font-bold text-sm text-foreground line-clamp-1">
                    Sony Noise Canceling Headphones + Case
                  </h4>
                  <div className="mt-2 pt-2 border-t border-border/50 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-muted-foreground block">Leading Bid</span>
                      <span className="text-base font-extrabold text-orange-500 font-mono">₹4,200</span>
                    </div>
                    <Button size="sm" className="h-7 text-xs bg-orange-500 hover:bg-orange-600 text-white font-bold gap-1 px-2.5">
                      <Gavel className="w-3 h-3" /> Bid +₹100
                    </Button>
                  </div>
                </div>
              </div>

              {/* Card 3: Peer Service / Tiffin */}
              <div className="rounded-xl border border-border/70 bg-background/60 p-3.5 flex flex-col justify-between space-y-3 hover:border-orange-500/40 transition-colors">
                <div className="relative aspect-4/3 rounded-lg overflow-hidden bg-muted">
                  <img
                    src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop&q=80"
                    alt="Campus Tutoring & Gigs"
                    className="w-full h-full object-cover"
                  />
                  <Badge className="absolute top-2 left-2 bg-purple-600 text-white text-[10px] font-bold">
                    Campus Service
                  </Badge>
                  <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-black/75 text-white backdrop-blur-xs flex items-center gap-1">
                    <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" /> 4.9 (24)
                  </span>
                </div>
                <div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                    <span>M.Tech TA • Lab 2</span>
                    <span className="text-purple-600 dark:text-purple-400 font-semibold text-[11px]">
                      Per Session
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-foreground line-clamp-1">
                    Python & DSA Coding Exam Mentorship
                  </h4>
                  <div className="flex items-baseline justify-between mt-2 pt-2 border-t border-border/50">
                    <div>
                      <span className="text-xs text-muted-foreground">Fee: </span>
                      <span className="text-base font-extrabold text-foreground font-mono">₹300</span>
                    </div>
                    <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                      Book with Escrow
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Live Handshake Status Pill */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="mt-4 p-2.5 rounded-xl bg-muted/60 border border-border/70 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs"
            >
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-emerald-500/15 text-emerald-600 flex items-center justify-center shrink-0">
                  <Lock className="w-3.5 h-3.5" />
                </div>
                <span className="text-foreground">
                  <strong className="font-semibold">Recent Handshake:</strong> Priya M. bought a Scientific Calculator from Kabir R. • 6-digit OTP verified at Library Lawn
                </span>
              </div>
              <span className="text-muted-foreground text-[11px] shrink-0 font-medium">4 mins ago</span>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
