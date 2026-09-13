import { Link } from "react-router-dom";
import { ArrowLeft, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import CreateListingForm from "@/modules/products/components/CreateListingForm";

const CreateListing = () => {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild className="rounded-xl border-border/70 hover:bg-muted/70">
          <Link to="/dashboard">
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </Button>
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20 mb-1">
            <Sparkles className="w-3 h-3" />
            <span>Campus Listing Station</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
            List a Campus Item or Gig
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Sell textbooks, rent calculators, offer tutoring, launch meal subscriptions, or run a 24-hour move-out auction.
          </p>
        </div>
      </div>

      <CreateListingForm />
    </div>
  );
};

export default CreateListing;
