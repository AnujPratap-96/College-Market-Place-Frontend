import { Link } from "react-router-dom";
import { GraduationCap, ArrowUpRight } from "lucide-react";

const FooterSection = () => {
  return (
    <footer className="w-full bg-card border-t border-border/80 text-foreground pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-border/60">
          {/* Col 1: Branding & Summary (2 cols on desktop) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white shadow-sm">
                <GraduationCap className="w-4 h-4" />
              </div>
              <span className="text-xl font-extrabold tracking-tight text-foreground">
                College<span className="text-orange-500">Mart</span>
              </span>
            </div>

            <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
              The premier peer-to-peer campus marketplace designed exclusively for verified college students. Buy, sell, rent, and bid with 100% Escrow & OTP handshake protection.
            </p>

            <div className="flex items-center gap-2 pt-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Campus Escrow & Realtime Auctions Active</span>
            </div>
          </div>

          {/* Col 2: Marketplace */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
              Marketplace
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/auth/signup" className="hover:text-foreground transition-colors">
                  Textbooks & Notes
                </Link>
              </li>
              <li>
                <Link to="/auth/signup" className="hover:text-foreground transition-colors">
                  Laptops & Electronics
                </Link>
              </li>
              <li>
                <Link to="/auth/signup" className="hover:text-foreground transition-colors">
                  Bicycles & Mobility
                </Link>
              </li>
              <li>
                <Link to="/auth/signup" className="hover:text-foreground transition-colors">
                  Hostel Essentials
                </Link>
              </li>
              <li>
                <a href="#auctions" className="hover:text-foreground transition-colors flex items-center gap-1">
                  <span>Senior Move-Out Auctions</span>
                  <ArrowUpRight className="w-3 h-3 text-orange-500" />
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Campus Trust & Safety */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
              Safety & Trust
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="#safety" className="hover:text-foreground transition-colors">
                  How Escrow Works
                </a>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-foreground transition-colors">
                  6-Digit OTP Handshake
                </a>
              </li>
              <li>
                <Link to="/auth/signup" className="hover:text-foreground transition-colors">
                  Verified Campus Directory
                </Link>
              </li>
              <li>
                <Link to="/auth/signup" className="hover:text-foreground transition-colors">
                  Dispute Arbitration
                </Link>
              </li>
              <li>
                <a href="#faq" className="hover:text-foreground transition-colors">
                  Community FAQ
                </a>
              </li>
            </ul>
          </div>

          {/* Col 4: Campus Life */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
              Student Life
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/auth/signup" className="hover:text-foreground transition-colors">
                  Post Free Listing
                </Link>
              </li>
              <li>
                <Link to="/auth/signup" className="hover:text-foreground transition-colors">
                  Campus Ambassador Program
                </Link>
              </li>
              <li>
                <Link to="/auth/signup" className="hover:text-foreground transition-colors">
                  Launch in Your College
                </Link>
              </li>
              <li>
                <Link to="/auth/login" className="hover:text-foreground transition-colors">
                  Student Sign In
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>
            &copy; {new Date().getFullYear()} CollegeMart. Built for students, by students.
          </p>

          <div className="flex items-center gap-6">
            <Link to="/auth/signup" className="hover:text-foreground transition-colors">
              Privacy Policy
            </Link>
            <Link to="/auth/signup" className="hover:text-foreground transition-colors">
              Terms of Service
            </Link>
            <Link to="/auth/signup" className="hover:text-foreground transition-colors">
              Campus Security
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default FooterSection;
