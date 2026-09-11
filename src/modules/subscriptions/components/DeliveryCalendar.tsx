import { useMemo } from "react";
import {
  Clock,
  CheckCircle2,
  PauseCircle,
  AlertTriangle,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type {
  ISubscription,
  ISubscriptionDelivery,
  DeliveryScheduleStatus,
} from "../subscription.types";

interface DeliveryCalendarProps {
  subscription: ISubscription;
  onReportMissed: (delivery: ISubscriptionDelivery) => void;
}

const getDeliveryBadge = (status: DeliveryScheduleStatus) => {
  switch (status) {
    case "SCHEDULED":
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-100 text-sky-800 dark:bg-sky-950/40 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
          <Clock className="w-3 h-3" />
          Scheduled
        </span>
      );
    case "COMPLETED":
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
          <CheckCircle2 className="w-3 h-3" />
          Delivered
        </span>
      );
    case "SKIPPED":
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
          <PauseCircle className="w-3 h-3" />
          Paused (Vacation)
        </span>
      );
    case "MISSED":
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
          <AlertTriangle className="w-3 h-3" />
          Missed (Refunded)
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-muted text-muted-foreground border">
          {status}
        </span>
      );
  }
};

export const DeliveryCalendar = ({
  subscription,
  onReportMissed,
}: DeliveryCalendarProps) => {
  const sortedDeliveries = useMemo(() => {
    if (!subscription.deliveries || !Array.isArray(subscription.deliveries)) {
      return [];
    }
    return [...subscription.deliveries].sort(
      (a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime()
    );
  }, [subscription.deliveries]);

  if (sortedDeliveries.length === 0) {
    return (
      <div className="py-6 text-center text-xs text-muted-foreground rounded-lg border border-dashed border-border bg-muted/20">
        No delivery schedules generated for this cycle.
      </div>
    );
  }

  return (
    <div className="space-y-2 pt-2">
      <div className="flex items-center justify-between text-xs text-muted-foreground pb-1 px-1">
        <span className="font-semibold uppercase tracking-wider text-[11px]">
          Cycle Delivery Schedule ({sortedDeliveries.length} slots)
        </span>
        <span>Escrow protected per delivery</span>
      </div>

      <div className="divide-y divide-border/60 rounded-xl border border-border/70 bg-card overflow-hidden">
        {sortedDeliveries.map((delivery, index) => {
          const dateObj = new Date(delivery.scheduledDate);
          const formattedDate = dateObj.toLocaleDateString(undefined, {
            weekday: "short",
            month: "short",
            day: "numeric",
            year: "numeric",
          });

          return (
            <div
              key={delivery.id || index}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3 hover:bg-muted/30 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                  {index + 1}
                </div>
                <div className="min-w-0 space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-foreground">
                      {formattedDate}
                    </span>
                    {getDeliveryBadge(delivery.status)}
                  </div>
                  {(delivery.note || subscription.deliverySlots) && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground truncate">
                      <MapPin className="w-3 h-3 shrink-0 text-muted-foreground/70" />
                      <span className="truncate">
                        {delivery.note || subscription.deliverySlots}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                {delivery.status === "SCHEDULED" && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => onReportMissed(delivery)}
                    className="h-7 text-xs border-rose-300 dark:border-rose-900 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-700"
                  >
                    Report Missed
                  </Button>
                )}
                {delivery.deliveredAt && (
                  <span className="text-[11px] text-muted-foreground">
                    Delivered: {new Date(delivery.deliveredAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DeliveryCalendar;
