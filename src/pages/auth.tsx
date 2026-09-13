import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Outlet, useNavigate, useLocation, Link } from "react-router-dom";
import { GraduationCap, ShieldCheck, Zap, Lock, Sparkles, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

const AuthLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const path = location.pathname.split("/")[2] || "login";

  const hideTabsOn = [
    "verify-otp",
    "complete-signup",
    "thank-you",
    "forgot-password",
    "reset-otp",
    "reset-password",
  ];
  const shouldShowTabs = !hideTabsOn.includes(path);

  return (
    <div className="min-h-[calc(100vh-4rem)] w-full flex items-center justify-center relative overflow-hidden py-10 px-4 sm:px-6">
      {/* Ambient background glow orbs */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-orange-500/10 dark:bg-orange-500/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-amber-500/10 dark:bg-amber-500/15 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
        {/* Left Column: Campus Trust & Brand Showcase (Visible on lg screens) */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="hidden lg:flex lg:col-span-5 flex-col justify-between space-y-8 pr-4"
        >
          <div className="space-y-6">
            <Link to="/" className="inline-flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 via-amber-500 to-orange-600 flex items-center justify-center text-white shadow-md shadow-orange-500/25 group-hover:shadow-orange-500/40 transition-all">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-black tracking-tight text-foreground leading-none">
                  College<span className="text-orange-500">Mart</span>
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground leading-tight mt-0.5">
                  Campus Marketplace
                </span>
              </div>
            </Link>

            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20 mb-3">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Verified Students Only</span>
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight text-foreground leading-tight">
                Buy, sell, rent & bid inside your own university.
              </h1>
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                Connect with peers across hostels. No outside strangers, zero WhatsApp prepayment scams, and guaranteed safe delivery handshakes.
              </p>
            </div>

            <div className="space-y-3.5 pt-2">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-primary/10 text-primary shrink-0 mt-0.5">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-foreground">6-Digit OTP Escrow Handshake</h4>
                  <p className="text-xs text-muted-foreground">Funds stay locked until you inspect the item in person at the campus canteen or library.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400 shrink-0 mt-0.5">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-foreground">Move-Out Live Auctions</h4>
                  <p className="text-xs text-muted-foreground">Grab fridges, study chairs, cycles, and lab kits from graduating seniors at fair auction prices.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-foreground">100% University Verified</h4>
                  <p className="text-xs text-muted-foreground">Restricted to university email domains (.edu, .ac.in). Zero random classified spammers.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-border/60">
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>12,000+ students · 100% Escrow Protection · ₹0 hidden fees</span>
            </div>
          </div>
        </motion.div>

        {/* Right Column: Interactive Auth Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="lg:col-span-7 flex justify-center w-full"
        >
          <div className="w-full max-w-md bg-card/80 backdrop-blur-xl border border-border/80 shadow-2xl rounded-3xl p-6 sm:p-8">
            {shouldShowTabs && (
              <div className="mb-6">
                <Tabs value={path} onValueChange={(val) => navigate(`/auth/${val}`)} className="w-full">
                  <TabsList className="grid w-full grid-cols-2 p-1 bg-muted/80 rounded-xl h-11 border border-border/50">
                    <TabsTrigger
                      value="login"
                      className="rounded-lg text-xs sm:text-sm font-semibold data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-xs transition-all"
                    >
                      Sign In
                    </TabsTrigger>
                    <TabsTrigger
                      value="signup"
                      className="rounded-lg text-xs sm:text-sm font-semibold data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-xs transition-all"
                    >
                      Create Account
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            )}
            <Outlet />
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AuthLayout;
