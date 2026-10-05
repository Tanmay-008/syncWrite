import { Badge } from "@/components/ui/badge";
import { Wifi, WifiOff, RefreshCw } from "lucide-react";

export type ConnectionStatus = "connected" | "syncing" | "offline";

interface ConnectionBadgeProps {
  status: ConnectionStatus;
}

const statusConfig: Record<
  ConnectionStatus,
  {
    label: string;
    icon: typeof Wifi;
    dotClass: string;
    badgeClass: string;
  }
> = {
  connected: {
    label: "Connected",
    icon: Wifi,
    dotClass: "bg-emerald-500",
    badgeClass:
      "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-50",
  },
  syncing: {
    label: "Syncing",
    icon: RefreshCw,
    dotClass: "bg-amber-500",
    badgeClass:
      "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-50",
  },
  offline: {
    label: "Offline",
    icon: WifiOff,
    dotClass: "bg-slate-400",
    badgeClass:
      "border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-50",
  },
};

export function ConnectionBadge({ status }: ConnectionBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Badge
      variant="outline"
      className={`gap-1.5 px-2.5 py-1 text-xs font-medium ${config.badgeClass}`}
    >
      {status === "syncing" ? (
        <Icon className="h-3 w-3 animate-spin" />
      ) : (
        <span className="relative flex h-2 w-2">
          {status === "connected" && (
            <span
              className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${config.dotClass}`}
            />
          )}
          <span
            className={`relative inline-flex h-2 w-2 rounded-full ${config.dotClass}`}
          />
        </span>
      )}
      {config.label}
    </Badge>
  );
}
