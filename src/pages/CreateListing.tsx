import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import CreateListingForm from "@/modules/products/components/CreateListingForm";

const CreateListing = () => {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/dashboard">
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            List New Item
          </h1>
          <p className="text-muted-foreground">
            Sell items, rent out equipment, offer campus services, or launch recurring delivery plans
          </p>
        </div>
      </div>

      <CreateListingForm />
    </div>
  );
};

export default CreateListing;
