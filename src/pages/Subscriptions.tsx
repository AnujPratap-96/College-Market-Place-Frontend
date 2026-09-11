import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  CalendarCheck,
  RefreshCw,
  AlertCircle,
  Repeat,
  Truck,
  Plus,
  ShoppingBag,
} from "lucide-react";
import {
  fetchMySubscriptions,
  fetchProviderManifest,
} from "@/modules/subscriptions/subscription.api";
import type {
  ISubscription,
  ISubscriptionDelivery,
  IProviderManifest,
} from "@/modules/subscriptions/subscription.types";
import SubscriptionCard from "@/modules/subscriptions/components/SubscriptionCard";
import VacationModal from "@/modules/subscriptions/components/VacationModal";
import MissedDeliveryModal from "@/modules/subscriptions/components/MissedDeliveryModal";
import ProviderManifestTable from "@/modules/subscriptions/components/ProviderManifestTable";
import { Button } from "@/components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

export const Subscriptions = () => {
  const [activeTab, setActiveTab] = useState<string>("my");
  const [subscriptions, setSubscriptions] = useState<ISubscription[]>([]);
  const [manifest, setManifest] = useState<IProviderManifest | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedSubForVacation, setSelectedSubForVacation] =
    useState<ISubscription | null>(null);
  const [vacationModalOpen, setVacationModalOpen] = useState(false);

  const [selectedSubForMissed, setSelectedSubForMissed] =
    useState<ISubscription | null>(null);
  const [selectedDeliveryForMissed, setSelectedDeliveryForMissed] =
    useState<ISubscriptionDelivery | null>(null);
  const [missedModalOpen, setMissedModalOpen] = useState(false);

  const loadData = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    const [subRes, manifestRes] = await Promise.all([
      fetchMySubscriptions(),
      fetchProviderManifest(),
    ]);

    if (subRes.subscriptions) {
      setSubscriptions(subRes.subscriptions);
    }
    if (manifestRes.manifest) {
      setManifest(manifestRes.manifest);
    }

    if (subRes.error && manifestRes.error) {
      setError(subRes.error);
    }

    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleOpenVacation = (sub: ISubscription) => {
    setSelectedSubForVacation(sub);
    setVacationModalOpen(true);
  };

  const handleReportMissed = (
    sub: ISubscription,
    delivery: ISubscriptionDelivery
  ) => {
    setSelectedSubForMissed(sub);
    setSelectedDeliveryForMissed(delivery);
    setMissedModalOpen(true);
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <CalendarCheck className="w-7 h-7 text-primary" />
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Subscriptions & Daily Services
            </h1>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Manage tiffin and recurring plans, pause for vacations with instant pro-rata refunds, or check fulfillment rosters.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadData(true)}
            disabled={loading || refreshing}
            className="h-9 gap-1.5"
          >
            <RefreshCw
              className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
            />
            <span>Refresh</span>
          </Button>
          <Button asChild size="sm" className="h-9 gap-1.5">
            <Link to="/dashboard">
              <Plus className="w-4 h-4" />
              <span>Explore Plans</span>
            </Link>
          </Button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-4 rounded-xl bg-destructive/10 text-destructive text-sm border border-destructive/20">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="my" className="gap-2">
            <Repeat className="w-4 h-4" />
            <span>My Subscriptions ({subscriptions.length})</span>
          </TabsTrigger>
          <TabsTrigger value="manifest" className="gap-2">
            <Truck className="w-4 h-4" />
            <span>Provider Manifest</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="my" className="space-y-4 outline-none">
          {loading ? (
            <div className="space-y-4">
              {[1, 2].map((n) => (
                <div
                  key={n}
                  className="h-44 rounded-xl bg-muted/40 animate-pulse border border-border/50"
                />
              ))}
            </div>
          ) : subscriptions.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-semibold text-foreground">
                  No Active Subscriptions
                </h3>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  You are not currently subscribed to any recurring food mess, laundry, or newspaper deliveries.
                </p>
              </div>
              <Button asChild size="sm" className="gap-1.5">
                <Link to="/dashboard">Browse Campus Services</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {subscriptions.map((sub) => (
                <SubscriptionCard
                  key={sub.id}
                  subscription={sub}
                  onRefresh={() => loadData(true)}
                  onOpenVacation={handleOpenVacation}
                  onReportMissed={handleReportMissed}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="manifest" className="space-y-4 outline-none">
          <ProviderManifestTable manifest={manifest} loading={loading} />
        </TabsContent>
      </Tabs>

      {selectedSubForVacation && (
        <VacationModal
          isOpen={vacationModalOpen}
          onClose={() => {
            setVacationModalOpen(false);
            setSelectedSubForVacation(null);
          }}
          subscription={selectedSubForVacation}
          onSuccess={() => loadData(true)}
        />
      )}

      {selectedSubForMissed && selectedDeliveryForMissed && (
        <MissedDeliveryModal
          isOpen={missedModalOpen}
          onClose={() => {
            setMissedModalOpen(false);
            setSelectedSubForMissed(null);
            setSelectedDeliveryForMissed(null);
          }}
          subscription={selectedSubForMissed}
          delivery={selectedDeliveryForMissed}
          onSuccess={() => loadData(true)}
        />
      )}
    </div>
  );
};

export default Subscriptions;
