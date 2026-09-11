import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AlertCircle, Loader2, Gavel } from "lucide-react";
import { ImageUploader } from "@/components/ui/ImageUploader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createProduct } from "../product.api";
import type { ProductType, SubscriptionFrequency } from "../product.types";

const CATEGORIES = [
  { value: "books", label: "Books & Study Material" },
  { value: "stationery", label: "Stationery & Tools" },
  { value: "electronics", label: "Electronics & Gadgets" },
  { value: "cycles", label: "Bicycles & Mobility" },
  { value: "clothing", label: "Clothing & Uniforms" },
  { value: "essentials", label: "Campus Essentials" },
  { value: "furniture", label: "Furniture" },
  { value: "food", label: "Food & Meals" },
  { value: "services", label: "Services & Tutoring" },
  { value: "other", label: "Other" },
];

const CreateListingForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [type, setType] = useState<ProductType>("SELL");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  const [securityDeposit, setSecurityDeposit] = useState("");
  const [rentalDuration, setRentalDuration] = useState("");
  const [serviceDuration, setServiceDuration] = useState("");
  const [frequency, setFrequency] = useState<SubscriptionFrequency>("MONTHLY");
  const [deliverySlots, setDeliverySlots] = useState("");

  const [minIncrement, setMinIncrement] = useState("50");
  const [reservePrice, setReservePrice] = useState("");
  const [durationHours, setDurationHours] = useState("24");
  const [antiSnipingSeconds, setAntiSnipingSeconds] = useState("60");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedTitle = title.trim();
    const trimmedDesc = description.trim();
    const numPrice = parseFloat(price);

    if (!trimmedTitle || trimmedTitle.length < 2) {
      setError("Title must be at least 2 characters long.");
      return;
    }

    if (!category) {
      setError("Please select a category.");
      return;
    }

    if (isNaN(numPrice) || numPrice <= 0) {
      setError("Price must be greater than 0.");
      return;
    }

    if (!trimmedDesc || trimmedDesc.length < 5) {
      setError("Description must be at least 5 characters long.");
      return;
    }

    if (type === "SERVICE" && !serviceDuration.trim()) {
      setError("Please specify service duration (e.g., '1 hour', 'Per assignment').");
      return;
    }

    if (type === "SUBSCRIPTION" && !deliverySlots.trim()) {
      setError("Please provide delivery/service slots (e.g., 'Lunch & Dinner').");
      return;
    }

    setLoading(true);

    const result = await createProduct({
      title: trimmedTitle,
      description: trimmedDesc,
      price: numPrice,
      category,
      type,
      imageUrl: imageUrl.trim() || undefined,
      securityDeposit: type === "RENT" && securityDeposit ? parseFloat(securityDeposit) : undefined,
      rentalDuration: type === "RENT" && rentalDuration.trim() ? rentalDuration.trim() : undefined,
      serviceDuration: type === "SERVICE" && serviceDuration.trim() ? serviceDuration.trim() : undefined,
      frequency: type === "SUBSCRIPTION" ? frequency : undefined,
      deliverySlots: type === "SUBSCRIPTION" && deliverySlots.trim() ? deliverySlots.trim() : undefined,
      startingBid: type === "AUCTION" ? numPrice : undefined,
      minIncrement: type === "AUCTION" && minIncrement ? parseFloat(minIncrement) : undefined,
      reservePrice: type === "AUCTION" && reservePrice ? parseFloat(reservePrice) : undefined,
      durationHours: type === "AUCTION" && durationHours ? parseFloat(durationHours) : undefined,
      antiSnipingSeconds: type === "AUCTION" && antiSnipingSeconds ? parseFloat(antiSnipingSeconds) : undefined,
    });

    setLoading(false);

    if (result.success) {
      if (type === "AUCTION") {
        navigate("/dashboard/auctions");
      } else {
        navigate("/dashboard/products");
      }
    } else {
      setError(result.error || "Failed to create listing.");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card className="border-border/60 shadow-sm">
        <CardHeader>
          <CardTitle>Listing Information</CardTitle>
          <CardDescription>
            Specify the listing type, details, pricing, and availability.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm border border-destructive/20">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="listing-type">Listing Type *</Label>
            <Select value={type} onValueChange={(val: ProductType) => setType(val)}>
              <SelectTrigger id="listing-type" className="w-full">
                <SelectValue placeholder="Select listing type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SELL">Sell Item (One-time purchase)</SelectItem>
                <SelectItem value="RENT">Rent Item (Daily/weekly rental)</SelectItem>
                <SelectItem value="SERVICE">Campus Service / Task (Freelance, errands, help)</SelectItem>
                <SelectItem value="SUBSCRIPTION">Recurring Delivery Plan (Mess, tiffin, laundry)</SelectItem>
                <SelectItem value="AUCTION">Live Auction (Senior Move-Out Sale)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              placeholder={
                type === "SERVICE"
                  ? "e.g., Python / Web Development Tutoring"
                  : type === "RENT"
                  ? "e.g., Scientific Calculator / Bicycle"
                  : type === "SUBSCRIPTION"
                  ? "e.g., Daily Hostel Tiffin Meal Delivery"
                  : type === "AUCTION"
                  ? "e.g., Senior Room Clearance - Mini Fridge / Cooler"
                  : "e.g., Data Structures Textbook (5th Edition)"
              }
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger id="category" className="w-full">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">
                {type === "RENT"
                  ? "Rental Rate per Day (₹) *"
                  : type === "SERVICE"
                  ? "Service Fee (₹) *"
                  : type === "SUBSCRIPTION"
                  ? "Subscription Rate (₹) *"
                  : type === "AUCTION"
                  ? "Starting Bid (₹) *"
                  : "Price (₹) *"}
              </Label>
              <Input
                id="price"
                type="number"
                min="1"
                step="any"
                placeholder="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
              />
            </div>
          </div>

          {type === "RENT" && (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-4">
              <div className="text-sm font-semibold text-amber-700 dark:text-amber-300">
                Rental Configuration
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="security-deposit">Security Deposit (₹)</Label>
                  <Input
                    id="security-deposit"
                    type="number"
                    min="0"
                    placeholder="e.g., 500 (Refundable)"
                    value={securityDeposit}
                    onChange={(e) => setSecurityDeposit(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rental-duration">Rental Terms</Label>
                  <Input
                    id="rental-duration"
                    placeholder="e.g., Min 2 days, Max 1 month"
                    value={rentalDuration}
                    onChange={(e) => setRentalDuration(e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {type === "SERVICE" && (
            <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 space-y-4">
              <div className="text-sm font-semibold text-purple-700 dark:text-purple-300">
                Service Details
              </div>
              <div className="space-y-2">
                <Label htmlFor="service-duration">Service Duration / Scope *</Label>
                <Input
                  id="service-duration"
                  placeholder='e.g., "1 hour", "Per assignment", "2 hours"'
                  value={serviceDuration}
                  onChange={(e) => setServiceDuration(e.target.value)}
                  required
                />
              </div>
            </div>
          )}

          {type === "SUBSCRIPTION" && (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 space-y-4">
              <div className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                Subscription Plan Settings
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="frequency">Billing Frequency *</Label>
                  <Select
                    value={frequency}
                    onValueChange={(val: SubscriptionFrequency) => setFrequency(val)}
                  >
                    <SelectTrigger id="frequency" className="w-full">
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="WEEKLY">Weekly</SelectItem>
                      <SelectItem value="MONTHLY">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="delivery-slots">Delivery / Serving Slots *</Label>
                  <Input
                    id="delivery-slots"
                    placeholder='e.g., Lunch (12:30 PM) & Dinner (8:00 PM)'
                    value={deliverySlots}
                    onChange={(e) => setDeliverySlots(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {type === "AUCTION" && (
            <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/20 space-y-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-orange-700 dark:text-orange-300">
                <Gavel className="w-4 h-4" />
                <span>Live Auction Configuration</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="duration-hours">Auction Duration (Hours) *</Label>
                  <Input
                    id="duration-hours"
                    type="number"
                    min="1"
                    max="168"
                    placeholder="24"
                    value={durationHours}
                    onChange={(e) => setDurationHours(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="min-increment">Minimum Increment (₹) *</Label>
                  <Input
                    id="min-increment"
                    type="number"
                    min="1"
                    placeholder="50"
                    value={minIncrement}
                    onChange={(e) => setMinIncrement(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reserve-price">Reserve Price (₹, Optional)</Label>
                  <Input
                    id="reserve-price"
                    type="number"
                    min="0"
                    placeholder="Optional minimum to win"
                    value={reservePrice}
                    onChange={(e) => setReservePrice(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="anti-sniping">Anti-Sniping Buffer (Seconds)</Label>
                  <Input
                    id="anti-sniping"
                    type="number"
                    min="15"
                    max="300"
                    placeholder="60"
                    value={antiSnipingSeconds}
                    onChange={(e) => setAntiSnipingSeconds(e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <textarea
              id="description"
              className="flex min-h-[110px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
              placeholder="Describe the item condition, specifications, terms, or service deliverables..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <ImageUploader
            label="Product Photo"
            folder="products"
            value={imageUrl}
            onChange={setImageUrl}
          />

          <div className="flex gap-3 pt-4 border-t border-border/50">
            <Button type="submit" disabled={loading} className="gap-2">
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? "Creating Listing..." : "Create Listing"}
            </Button>
            <Button type="button" variant="outline" asChild>
              <Link to="/dashboard">Cancel</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
};

export default CreateListingForm;
