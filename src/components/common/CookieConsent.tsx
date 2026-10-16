import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cookie, ShieldCheck, ChevronDown, ChevronUp, Lock, Check, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";

const CONSENT_STORAGE_KEY = "college_marketplace_cookie_consent";

interface CookiePreferences {
  essential: boolean;
  security: boolean;
  preferences: boolean;
}

export const CookieConsent = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [isIncognitoDetected, setIsIncognitoDetected] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    essential: true,
    security: true,
    preferences: true,
  });

  useEffect(() => {
    // Check if consent has already been given
    const savedConsent = localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!savedConsent) {
      // Small delay for smooth entry after page loads
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    // Detect potential incognito / third-party cookie restrictions
    const detectPrivateMode = async () => {
      try {
        if ("storage" in navigator && "estimate" in navigator.storage) {
          const { quota } = await navigator.storage.estimate();
          // Quotas under 120MB in modern Chromium typically indicate Incognito mode
          if (quota && quota < 120 * 1024 * 1024) {
            setIsIncognitoDetected(true);
          }
        }
      } catch {
        // Fallback: ignore error
      }
    };
    detectPrivateMode();
  }, []);

  const handleAcceptAll = () => {
    const consent = {
      status: "accepted",
      preferences: { essential: true, security: true, preferences: true },
      date: new Date().toISOString(),
    };
    localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(consent));
    setIsVisible(false);
  };

  const handleAcceptEssential = () => {
    const consent = {
      status: "essential_only",
      preferences: { essential: true, security: true, preferences: false },
      date: new Date().toISOString(),
    };
    localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(consent));
    setIsVisible(false);
  };

  const handleSaveCustom = () => {
    const consent = {
      status: "custom",
      preferences,
      date: new Date().toISOString(),
    };
    localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(consent));
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 50, scale: 0.95 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="fixed bottom-4 left-4 right-4 sm:left-6 sm:right-auto sm:max-w-md z-50"
      >
        <div className="bg-card/95 backdrop-blur-xl border border-border/80 shadow-2xl rounded-2xl p-4 sm:p-5 text-foreground space-y-3.5">
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0">
                <Cookie className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold tracking-tight text-foreground leading-tight">
                  Campus Cookie & Storage Notice
                </h3>
                <span className="text-[11px] text-muted-foreground font-medium">
                  University Verified Marketplace
                </span>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <ShieldCheck className="w-3 h-3" />
              Escrow Safe
            </span>
          </div>

          {/* Description */}
          <p className="text-xs text-muted-foreground leading-relaxed">
            We use essential session tokens and campus local storage to keep you signed in, protect live auction bids in escrow, and ensure secure in-person item handshakes.
          </p>

          {/* Incognito Notice / Tip */}
          {isIncognitoDetected && (
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 text-xs flex items-start gap-2">
              <Eye className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <p className="font-semibold text-[11px]">Private / Incognito Mode Detected</p>
                <p className="text-[11px] leading-tight text-amber-700 dark:text-amber-400">
                  By clicking <strong>Accept All</strong>, we enable secure session storage so your login and live auction bids remain active without unexpected logouts.
                </p>
              </div>
            </div>
          )}

          {/* Expandable Preferences Section */}
          {showDetails && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-2.5 pt-2 border-t border-border/60 text-xs"
            >
              <div className="flex items-start justify-between gap-3 p-2 rounded-lg bg-muted/40 border border-border/50">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5 font-semibold text-foreground text-xs">
                    <Lock className="w-3.5 h-3.5 text-primary" />
                    <span>Essential Session & Auth</span>
                    <span className="text-[10px] text-muted-foreground">(Required)</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Maintains verified student login sessions, token refresh, and cross-tab sync.
                  </p>
                </div>
                <div className="w-5 h-5 rounded bg-primary/20 text-primary flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5" />
                </div>
              </div>

              <div className="flex items-start justify-between gap-3 p-2 rounded-lg bg-muted/40 border border-border/50">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5 font-semibold text-foreground text-xs">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Escrow & Live Auctions</span>
                    <span className="text-[10px] text-muted-foreground">(Required)</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Safeguards real-time auction bids, wallet holds, and delivery OTP handshake codes.
                  </p>
                </div>
                <div className="w-5 h-5 rounded bg-emerald-500/20 text-emerald-600 flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5" />
                </div>
              </div>

              <div className="flex items-start justify-between gap-3 p-2 rounded-lg bg-muted/40 border border-border/50">
                <div className="space-y-0.5">
                  <div className="font-semibold text-foreground text-xs">UI Theme & Filters</div>
                  <p className="text-[11px] text-muted-foreground">
                    Remembers dark/light mode preference and your active campus filters.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.preferences}
                  onChange={(e) =>
                    setPreferences((prev) => ({ ...prev, preferences: e.target.checked }))
                  }
                  className="rounded text-orange-500 focus:ring-orange-500 h-4 w-4 mt-0.5 cursor-pointer"
                />
              </div>
            </motion.div>
          )}

          {/* Action Buttons */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                className="bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-600 hover:to-amber-700 text-white font-semibold flex-1 rounded-xl shadow-sm text-xs h-9 cursor-pointer"
                onClick={showDetails ? handleSaveCustom : handleAcceptAll}
              >
                {showDetails ? "Save Preferences" : "Accept All Cookies"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-xs font-semibold rounded-xl border-border/70 text-muted-foreground hover:text-foreground h-9 cursor-pointer px-3"
                onClick={handleAcceptEssential}
              >
                Essential Only
              </Button>
            </div>

            <button
              type="button"
              onClick={() => setShowDetails((prev) => !prev)}
              className="w-full flex items-center justify-center gap-1 text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer py-0.5"
            >
              <span>{showDetails ? "Hide Cookie Details" : "Customize Preferences & Info"}</span>
              {showDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
