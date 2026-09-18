import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  ArrowLeft,
  Loader2,
  Tag,
  Clock,
  Sparkles,
  Repeat,
  ShieldCheck,
  Gavel,
} from "lucide-react";
import type { RootState } from "@/store/store";
import { fetchProductById, updateProduct } from "@/modules/products/product.api";
import type { ProductType, IProduct } from "@/modules/products/product.types";
import { MultiImageUploader } from "@/components/ui/MultiImageUploader";
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
import { toast } from "@/components/ui/toast";

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

export const EditListing = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const currentUser = useSelector((state: RootState) => state.user);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [product, setProduct] = useState<IProduct | null>(null);

  const [type, setType] = useState<ProductType>("SELL");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [securityDeposit, setSecurityDeposit] = useState("");
  const [rentalDuration, setRentalDuration] = useState("");
  const [serviceDuration, setServiceDuration] = useState("");
  const [deliveryDays, setDeliveryDays] = useState<string[]>([]);
  const [deliverySlots, setDeliverySlots] = useState("");

  useEffect(() => {
    if (!id) return;
    const loadProduct = async () => {
      setLoading(true);
      const res = await fetchProductById(id);
      if (res.error || !res.product) {
        toast.error(res.error || "Failed to load listing details");
        navigate("/dashboard/products");
        return;
      }

      const p = res.product;
      setProduct(p);
      setType(p.type);
      setTitle(p.title);
      setCategory(p.category);
      setDescription(p.description);
      setPrice(String(p.price));
      const loadedImages = p.images && p.images.length > 0
        ? p.images
        : p.imageUrl
        ? [p.imageUrl]
        : [];
      setImages(loadedImages);

      if (p.securityDeposit !== undefined) setSecurityDeposit(String(p.securityDeposit));
      if (p.rentalDuration) setRentalDuration(p.rentalDuration);
      if (p.serviceDuration) setServiceDuration(p.serviceDuration);
      if (p.deliveryDays) setDeliveryDays(p.deliveryDays);
      if (p.deliverySlots) setDeliverySlots(p.deliverySlots);

      setLoading(false);
    };

    loadProduct();
  }, [id, navigate]);

  const isOwner = Boolean(
    currentUser.id &&
      product &&
      (product.owner?.id === currentUser.id || product.seller?.id === currentUser.id)
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    const trimmedTitle = title.trim();
    const trimmedDesc = description.trim();
    const numPrice = parseFloat(price);

    if (!trimmedTitle || trimmedTitle.length < 2) {
      toast.error("Title must be at least 2 characters long.");
      return;
    }

    if (!category) {
      toast.error("Please select a category.");
      return;
    }

    if (isNaN(numPrice) || numPrice <= 0) {
      toast.error("Price must be greater than 0.");
      return;
    }

    if (!trimmedDesc || trimmedDesc.length < 5) {
      toast.error("Description must be at least 5 characters long.");
      return;
    }

    if (type === "SERVICE" && !serviceDuration.trim()) {
      toast.error("Please specify service duration.");
      return;
    }

    if (type === "SUBSCRIPTION" && !deliverySlots.trim()) {
      toast.error("Please provide delivery/service slots.");
      return;
    }

    setSubmitting(true);

    const updatePayload: Record<string, any> = {
      title: trimmedTitle,
      description: trimmedDesc,
      category,
      images,
      imageUrl: images[0] || undefined,
    };

    if (type !== "AUCTION") {
      updatePayload.price = numPrice;
      updatePayload.type = type;
      if (type === "RENT") {
        updatePayload.securityDeposit = securityDeposit ? parseFloat(securityDeposit) : undefined;
        updatePayload.rentalDuration = rentalDuration.trim() ? rentalDuration.trim() : undefined;
      } else if (type === "SERVICE") {
        updatePayload.serviceDuration = serviceDuration.trim() ? serviceDuration.trim() : undefined;
      } else if (type === "SUBSCRIPTION") {
        updatePayload.deliveryDays = deliveryDays;
        updatePayload.deliverySlots = deliverySlots.trim() ? deliverySlots.trim() : undefined;
      }
    }

    const result = await updateProduct(id, updatePayload);

    setSubmitting(false);

    if (result.success) {
      toast.success("Listing updated successfully!");
      navigate(`/dashboard/products/${id}`);
    } else {
      toast.error(result.error || "Failed to update listing.");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-3">
        <Loader2 size={32} className="animate-spin text-primary" />
        <p className="text-xs font-semibold">Loading listing details...</p>
      </div>
    );
  }

  if (product && !isOwner) {
    return (
      <div className="p-8 text-center bg-card rounded-3xl border border-border/80 max-w-md mx-auto space-y-3">
        <h3 className="text-lg font-bold text-foreground">Unauthorized</h3>
        <p className="text-xs text-muted-foreground">
          You do not have permission to edit this listing.
        </p>
        <Button asChild className="rounded-xl text-xs">
          <Link to="/dashboard/products">Back to My Listings</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild className="rounded-xl">
          <Link to={`/dashboard/products/${id}`}>
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
            Edit Listing
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Update pricing, descriptions, specifications, or add more photos.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="bg-card/85 backdrop-blur-md rounded-3xl border border-border/70 p-6 sm:p-8 shadow-xs space-y-6">
          {product?.type === "AUCTION" ? (
            <div className="p-4 rounded-2xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-orange-500/20 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0">
                  <Gavel className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-foreground">Live Auction Listing</p>
                  <p className="text-[11px] text-muted-foreground">
                    Title, description, category, and photos can be edited. Starting bid, timer, and bids are locked.
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-1 text-[11px] font-bold rounded-full bg-orange-500 text-white shrink-0">
                Auction Terms Locked
              </span>
            </div>
          ) : (
            <div>
              <Label className="text-xs font-bold text-foreground">Listing Model</Label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-2">
                {[
                  { typeKey: "SELL", label: "Sell Item", icon: Tag, color: "text-blue-500" },
                  { typeKey: "RENT", label: "Rent Out", icon: Clock, color: "text-amber-500" },
                  { typeKey: "SERVICE", label: "Campus Service", icon: Sparkles, color: "text-purple-500" },
                  { typeKey: "SUBSCRIPTION", label: "Subscription", icon: Repeat, color: "text-emerald-500" },
                ].map((item) => {
                  const Icon = item.icon;
                  const isSelected = type === item.typeKey;
                  return (
                    <button
                      key={item.typeKey}
                      type="button"
                      onClick={() => setType(item.typeKey as ProductType)}
                      className={`flex items-center gap-2 p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? "border-orange-500 bg-orange-500/10 text-foreground font-bold shadow-xs"
                          : "border-border/70 bg-card hover:border-border text-muted-foreground"
                      }`}
                    >
                      <Icon className={`w-4 h-4 shrink-0 ${item.color}`} />
                      <span className="text-xs">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="title" className="text-xs font-bold">
              Listing Title *
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
              className="rounded-xl h-10 text-sm"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category" className="text-xs font-bold">
                Category *
              </Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger id="category" className="w-full h-10 rounded-xl">
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
              <Label htmlFor="price" className="text-xs font-bold">
                {type === "AUCTION"
                  ? "Starting Bid (₹, Locked)"
                  : type === "RENT"
                  ? "Rental Rate per Day (₹) *"
                  : type === "SERVICE"
                  ? "Service Fee (₹) *"
                  : type === "SUBSCRIPTION"
                  ? "Subscription Rate (₹) *"
                  : "Price (₹) *"}
              </Label>
              <Input
                id="price"
                type="number"
                min="1"
                step="any"
                value={price}
                disabled={type === "AUCTION"}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPrice(e.target.value)}
                className={`rounded-xl h-10 text-sm ${
                  type === "AUCTION" ? "bg-muted/50 cursor-not-allowed opacity-80" : ""
                }`}
                required
              />
              {type === "AUCTION" && (
                <p className="text-[11px] text-muted-foreground">
                  Starting price cannot be modified after auction creation.
                </p>
              )}
            </div>
          </div>

          {type === "RENT" && (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-4">
              <div className="text-xs font-bold text-amber-700 dark:text-amber-300 flex items-center gap-1.5">
                <ShieldCheck size={14} />
                Rental Escrow Configuration
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="security-deposit" className="text-xs font-medium">
                    Refundable Security Deposit (₹)
                  </Label>
                  <Input
                    id="security-deposit"
                    type="number"
                    min="0"
                    placeholder="e.g. 500"
                    value={securityDeposit}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSecurityDeposit(e.target.value)}
                    className="h-10 rounded-xl bg-card text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="rental-duration" className="text-xs font-medium">
                    Rental Duration Limit
                  </Label>
                  <Input
                    id="rental-duration"
                    placeholder="e.g. 1 Semester, 7 Days, 2 Weeks"
                    value={rentalDuration}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRentalDuration(e.target.value)}
                    className="h-10 rounded-xl bg-card text-xs"
                  />
                </div>
              </div>
            </div>
          )}

          {type === "SERVICE" && (
            <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20 space-y-2">
              <Label htmlFor="service-duration" className="text-xs font-bold text-purple-700 dark:text-purple-300">
                Service Duration / Turnaround Time *
              </Label>
              <Input
                id="service-duration"
                placeholder="e.g. 2 hours per session, 24-hour turnaround"
                value={serviceDuration}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setServiceDuration(e.target.value)}
                className="h-10 rounded-xl bg-card text-xs"
                required
              />
            </div>
          )}

          {type === "SUBSCRIPTION" && (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-emerald-700 dark:text-emerald-300">
                    Delivery Days
                  </Label>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"].map(day => (
                      <button
                        key={day}
                        type="button"
                        onClick={() => setDeliveryDays(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day])}
                        className={`px-3 py-1 text-xs rounded-full border transition-colors cursor-pointer ${
                          deliveryDays.includes(day)
                            ? 'bg-emerald-500 text-white border-emerald-500 shadow-sm'
                            : 'bg-background hover:bg-muted text-muted-foreground border-border/70'
                        }`}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="delivery-slots" className="text-xs font-bold text-emerald-700 dark:text-emerald-300">
                    Delivery / Availability Slots *
                  </Label>
                  <Input
                    id="delivery-slots"
                    placeholder="e.g. Lunch (12:30 PM) & Dinner (8:00 PM)"
                    value={deliverySlots}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDeliverySlots(e.target.value)}
                    className="h-10 rounded-xl bg-card text-xs"
                    required
                  />
                </div>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="description" className="text-xs font-bold">
              Description *
            </Label>
            <textarea
              id="description"
              className="flex min-h-[110px] w-full rounded-2xl border border-input bg-transparent px-3 py-2 text-xs shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
              value={description}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
              required
            />
          </div>

          <MultiImageUploader
            images={images}
            onChange={setImages}
            folder="products"
            maxImages={6}
          />

          <div className="flex items-center gap-3 pt-4 border-t border-border/60">
            <Button
              type="submit"
              disabled={submitting}
              className="gap-2 h-11 px-6 rounded-xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-600 hover:to-amber-700 text-white font-semibold shadow-md shadow-orange-500/20 cursor-pointer"
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {submitting ? "Saving Changes..." : "Save Changes"}
            </Button>
            <Button
              type="button"
              variant="outline"
              asChild
              className="rounded-xl h-11 px-5 text-xs font-medium"
            >
              <Link to={`/dashboard/products/${id}`}>Cancel</Link>
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default EditListing;
