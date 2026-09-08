import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ShoppingBag, Package } from "lucide-react";
import { fetchUserProfile, type IPost } from "@/services/api";
import { Button } from "@/components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Card,
  CardContent,
} from "@/components/ui/card";

const Orders = () => {
  const [purchased, setPurchased] = useState<IPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setLoading(true);
    const result = await fetchUserProfile();
    if (result.success && result.success.purchasedItems) {
      setPurchased(result.success.purchasedItems);
    }
    setLoading(false);
  };

  const OrderCard = ({ order }: { order: IPost }) => (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="flex">
        <div className="w-24 h-24 bg-muted flex-shrink-0">
          <img
            src={order.images[0] || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200"}
            alt={order.title}
            className="w-full h-full object-cover"
          />
        </div>
        <CardContent className="flex-1 p-4">
          <h3 className="font-semibold truncate">{order.title}</h3>
          <p className="text-primary font-bold">₹{order.price}</p>
          <div className="flex items-center gap-2 mt-2 text-sm text-green-500">
            <span>✓ Purchased</span>
          </div>
        </CardContent>
      </div>
    </Card>
  );

  const EmptyState = ({ type }: { type: "purchases" | "sales" }) => (
    <Card className="p-12 text-center">
      <div className="bg-primary/10 p-4 rounded-full inline-flex mb-4">
        <ShoppingBag className="w-8 h-8 text-primary" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">
        {type === "purchases" ? "No purchases yet" : "No sales yet"}
      </h3>
      <p className="text-muted-foreground mb-4">
        {type === "purchases"
          ? "Items you buy will appear here"
          : "When someone buys your items, they'll appear here"}
      </p>
      {type === "sales" ? (
        <Button asChild>
          <Link to="/dashboard/products/create">Create Listing</Link>
        </Button>
      ) : (
        <Button asChild>
          <Link to="/dashboard">Browse Products</Link>
        </Button>
      )}
    </Card>
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-muted rounded animate-pulse w-32" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <div className="flex">
                <div className="w-24 h-24 bg-muted animate-pulse" />
                <CardContent className="flex-1 p-4 space-y-2">
                  <div className="h-5 bg-muted rounded animate-pulse" />
                  <div className="h-4 bg-muted rounded animate-pulse w-2/3" />
                </CardContent>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <Tabs defaultValue="purchases" className="space-y-6">
      <TabsList className="bg-card p-1">
        <TabsTrigger value="purchases" className="gap-2">
          <ShoppingBag className="w-4 h-4" />
          Purchases
        </TabsTrigger>
        <TabsTrigger value="sales" className="gap-2">
          <Package className="w-4 h-4" />
          Sales
        </TabsTrigger>
      </TabsList>

      <TabsContent value="purchases">
        {purchased.length === 0 ? (
          <EmptyState type="purchases" />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {purchased.map((order, index) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <OrderCard order={order} />
              </motion.div>
            ))}
          </div>
        )}
      </TabsContent>

      <TabsContent value="sales">
        <EmptyState type="sales" />
      </TabsContent>
    </Tabs>
  );
};

export default Orders;