import {
  Calendar,
  Users,
  Phone,
  Mail,
  Package,
  Clock,
  CheckCircle2,
  PauseCircle,
  AlertTriangle,
  ClipboardList,
  MapPin,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import type {
  IProviderManifest,
  DeliveryScheduleStatus,
} from "../subscription.types";

interface ProviderManifestTableProps {
  manifest: IProviderManifest | null;
  loading?: boolean;
}

const getDeliveryStatusBadge = (status: DeliveryScheduleStatus) => {
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
          Missed
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

export const ProviderManifestTable = ({
  manifest,
  loading = false,
}: ProviderManifestTableProps) => {
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-24 rounded-xl bg-muted/40 animate-pulse" />
        <div className="h-64 rounded-xl bg-muted/40 animate-pulse" />
      </div>
    );
  }

  if (!manifest || !manifest.deliveries || manifest.deliveries.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center space-y-3">
        <div className="w-12 h-12 rounded-full bg-muted/60 flex items-center justify-center mx-auto text-muted-foreground">
          <ClipboardList className="w-6 h-6" />
        </div>
        <h3 className="text-base font-semibold text-foreground">
          No Deliveries Scheduled For Today
        </h3>
        <p className="text-xs text-muted-foreground max-w-sm mx-auto">
          You have no active subscription drop-offs or scheduled service deliveries on today's roster.
        </p>
      </div>
    );
  }

  const manifestDate = manifest.date
    ? new Date(manifest.date).toLocaleDateString(undefined, {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : new Date().toLocaleDateString(undefined, {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      });

  return (
    <div className="space-y-4">
      <Card className="p-4 sm:p-5 border border-border/70 rounded-xl bg-gradient-to-r from-primary/5 via-background to-background">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-primary flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              Daily Fulfillment Manifest
            </span>
            <h2 className="text-lg font-bold text-foreground">{manifestDate}</h2>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-card border border-border shadow-xs">
              <Users className="w-4 h-4 text-primary" />
              <div className="text-xs">
                <span className="text-muted-foreground">Total Deliveries: </span>
                <span className="font-bold text-foreground">
                  {manifest.totalCount ?? manifest.deliveries.length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 border-b border-border text-xs text-muted-foreground font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">#</th>
                <th className="py-3 px-4">Subscriber</th>
                <th className="py-3 px-4">Phone / Contact</th>
                <th className="py-3 px-4">Product Plan</th>
                <th className="py-3 px-4">Delivery Slot / Notes</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {manifest.deliveries.map((item, index) => (
                <tr
                  key={item.delivery?.id || `${item.subscriptionId}-${index}`}
                  className="hover:bg-muted/30 transition-colors"
                >
                  <td className="py-3.5 px-4 text-xs font-mono text-muted-foreground">
                    {index + 1}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-medium text-foreground">
                      {item.subscriber?.name || "Student"}
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      <Mail className="w-3 h-3 shrink-0" />
                      <span className="truncate max-w-[180px]">
                        {item.subscriber?.email}
                      </span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-xs">
                    {item.subscriber?.phone ? (
                      <div className="flex items-center gap-1.5 font-medium text-foreground">
                        <Phone className="w-3.5 h-3.5 text-primary shrink-0" />
                        <a
                          href={`tel:${item.subscriber.phone}`}
                          className="hover:underline"
                        >
                          {item.subscriber.phone}
                        </a>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1.5">
                      <Package className="w-3.5 h-3.5 text-primary shrink-0" />
                      <span className="font-semibold text-foreground truncate max-w-[200px]">
                        {item.productTitle}
                      </span>
                    </div>
                    <div className="text-[11px] font-mono text-muted-foreground">
                      #{item.subscriptionNumber}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-xs">
                    {item.delivery?.note ? (
                      <div className="flex items-start gap-1.5 text-foreground max-w-[240px]">
                        <MapPin className="w-3.5 h-3.5 shrink-0 text-muted-foreground mt-0.5" />
                        <span>{item.delivery.note}</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">Standard delivery</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    {getDeliveryStatusBadge(item.delivery?.status || "SCHEDULED")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProviderManifestTable;
