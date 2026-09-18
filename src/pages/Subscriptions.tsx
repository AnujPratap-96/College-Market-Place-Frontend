import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  CalendarCheck,
  RefreshCw,
  Repeat,
  Truck,
  Plus,
  ShoppingBag,
} from "lucide-react";
import {
  fetchMySubscriptions,
  fetchProviderManifest, syncHolidays, fetchHolidays,
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
import InteractiveCalendar from "@/modules/subscriptions/components/InteractiveCalendar";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

export const Subscriptions = () => {
  const [activeTab, setActiveTab] = useState<string>("my");
  const [holidays, setHolidays] = useState<Date[]>([]);
  const [savingHolidays, setSavingHolidays] = useState(false);
  const [subscriptions, setSubscriptions] = useState<ISubscription[]>([]);
  const [manifest, setManifest] = useState<IProviderManifest | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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

    const [subRes, manifestRes, holRes] = await Promise.all([
      fetchMySubscriptions(),
      fetchProviderManifest(), fetchHolidays(),
    ]);

    if (subRes.subscriptions) {
      setSubscriptions(subRes.subscriptions);
    }
    if (manifestRes.manifest) {
    if (holRes.dates) setHolidays(holRes.dates);
      setManifest(manifestRes.manifest);
    }

    if (subRes.error && manifestRes.error) {
      toast.error(subRes.error);
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

  
  const handleSaveHolidays = async (dates: Date[]) => {
    setSavingHolidays(true);
    const res = await syncHolidays(dates);
    if (res.success) {
      setHolidays(dates);
      toast.success(`Saved ${dates.length} blackout dates! Deliveries will be skipped.`);
    } else {
      toast.error(res.error || 'Failed to save holidays');
    }
    setSavingHolidays(false);
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/60">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20 mb-1">
            <CalendarCheck className="w-3.5 h-3.5" />
            <span>Recurring Hostel Services</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
            Subscriptions & Meal Plans
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Manage hostel tiffin deliveries, laundry services, and vacation pause credits.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadData(true)}
            disabled={loading || refreshing}
            className="h-10 px-4 rounded-xl border-border/70 hover:bg-muted/70 font-semibold text-xs gap-1.5"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`}
            />
            <span>Refresh</span>
          </Button>
          <Button
            asChild
            size="sm"
            className="h-10 px-4 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold text-xs shadow-md shadow-orange-500/20 gap-1.5 cursor-pointer"
          >
            <Link to="/dashboard">
              <Plus className="w-4 h-4" />
              <span>Explore Plans</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Vacation Pause Banner */}
      <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent border border-emerald-500/20 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1 max-w-xl">
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-300">
            <Repeat className="w-3.5 h-3.5" />
            <span>Semester Break or Heading Home?</span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Pause your tiffin or laundry service for any number of days. Your wallet is automatically credited with a pro-rata refund for missed dates.
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full max-w-lg grid-cols-3 p-1 bg-muted/80 rounded-2xl h-11 border border-border/60">
          <TabsTrigger value="my" className="gap-2 rounded-xl text-xs font-semibold data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-xs">
            <Repeat className="w-4 h-4" />
            <span>My Plans ({subscriptions.length})</span>
          </TabsTrigger>
          <TabsTrigger value="manifest" className="gap-2 rounded-xl text-xs font-semibold data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-xs">
            <Truck className="w-4 h-4" />
            <span>Hostel Manifest</span>
          </TabsTrigger>
          <TabsTrigger value="holidays" className="gap-2 rounded-xl text-xs font-semibold data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-xs">
            <CalendarCheck className="w-4 h-4" />
            <span>Holidays</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="my" className="space-y-4 outline-none">
          {loading ? (
            <div className="space-y-4">
              {[1, 2].map((n) => (
                <div
                  key={n}
                  className="h-44 rounded-2xl bg-card/60 animate-pulse border border-border/60"
                />
              ))}
            </div>
          ) : subscriptions.length === 0 ? (
            <div className="rounded-3xl border border-border/70 bg-card/75 backdrop-blur-md p-12 text-center space-y-4 max-w-md mx-auto shadow-xs">
              <div className="w-14 h-14 rounded-2xl bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center mx-auto">
                <ShoppingBag className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-foreground">
                  No Active Subscriptions
                </h3>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
                  You are not currently subscribed to any daily hostel tiffin, laundry, or recurring campus meal deliveries.
                </p>
              </div>
              <Button asChild size="sm" className="rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold">
                <Link to="/dashboard">Browse Campus Plans</Link>
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

        <TabsContent value="holidays" className="space-y-4 outline-none">
          <InteractiveCalendar initialHolidays={holidays} loading={savingHolidays}  
            onSave={handleSaveHolidays} 
          />
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
