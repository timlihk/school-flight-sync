import { useMemo } from "react";
import { format, formatDistanceToNow, differenceInDays } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Plane,
  Car,
  Clock,
  Calendar,
  AlertCircle,
  CheckCircle2,
  User,
  Phone,
  Share2,
} from "lucide-react";
import type { NextTravelEntry } from "@/types/next-travel";
import type { Term } from "@/types/school";

interface NextTravelHeroProps {
  entry: NextTravelEntry | null;
  scope: "benenden" | "wycombe";
  onScopeChange: (scope: "benenden" | "wycombe") => void;
  isOnline: boolean;
  earliestTerm: Term | null;
  onAddFlight: (termId: string) => void;
  onAddTransport: (termId: string) => void;
  onShare: () => void;
}

export function NextTravelHero({
  entry,
  scope,
  onScopeChange,
  isOnline: _isOnline,
  earliestTerm,
  onAddFlight,
  onAddTransport,
  onShare,
}: NextTravelHeroProps) {
  const daysUntil = useMemo(() => {
    if (!entry) return null;
    return differenceInDays(entry.date, new Date());
  }, [entry]);

  const schoolName = scope === "benenden" ? "Benenden" : "Wycombe";

  // Empty state
  if (!entry) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card p-6 text-center">
        <div className="flex justify-center gap-2 mb-4">
          <Button
            variant={scope === "benenden" ? "default" : "outline"}
            size="sm"
            onClick={() => onScopeChange("benenden")}
            className={cn(
              "rounded-full",
              scope === "benenden" && "bg-benenden hover:bg-benenden/90"
            )}
          >
            Benenden
          </Button>
          <Button
            variant={scope === "wycombe" ? "default" : "outline"}
            size="sm"
            onClick={() => onScopeChange("wycombe")}
            className={cn(
              "rounded-full",
              scope === "wycombe" && "bg-wycombe hover:bg-wycombe/90"
            )}
          >
            Wycombe
          </Button>
        </div>
        <Calendar className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
        <h2 className="text-lg font-semibold mb-1">No Upcoming Travel</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Add a flight to get started
        </p>
        {earliestTerm && (
          <Button size="sm" onClick={() => onAddFlight(earliestTerm.id)}>
            <Plane className="w-4 h-4 mr-2" />
            Add Flight
          </Button>
        )}
      </div>
    );
  }

  const isFlight = entry.kind === "flight";
  const needsTransport = entry.status === "needs-transport";
  const hasTransport = entry.meta?.transport?.status === "booked";

  return (
    <div className="space-y-3">
      {/* Header: School + Date + Countdown */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant={scope === "benenden" ? "default" : "outline"}
            size="sm"
            onClick={() => onScopeChange("benenden")}
            className={cn(
              "rounded-full h-7 text-xs",
              scope === "benenden" && "bg-benenden hover:bg-benenden/90"
            )}
          >
            Ben
          </Button>
          <Button
            variant={scope === "wycombe" ? "default" : "outline"}
            size="sm"
            onClick={() => onScopeChange("wycombe")}
            className={cn(
              "rounded-full h-7 text-xs",
              scope === "wycombe" && "bg-wycombe hover:bg-wycombe/90"
            )}
          >
            WA
          </Button>
        </div>
        <div className="flex items-center gap-2">
          {daysUntil !== null && (
            <span className={cn(
              "text-sm font-medium",
              daysUntil <= 3 ? "text-journey-pending" : "text-muted-foreground"
            )}>
              {daysUntil === 0 ? "Today" : `${daysUntil} day${daysUntil > 1 ? 's' : ''}`}
            </span>
          )}
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onShare}>
            <Share2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Main Card */}
      <div className={cn(
        "rounded-2xl border bg-card p-4",
        entry.status === "booked" ? "border-journey-complete/30" :
        needsTransport ? "border-journey-pending/30" : "border-border"
      )}>
        {/* Date & Status */}
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="text-2xl font-bold">{format(entry.date, "MMM d")}</p>
            <p className="text-sm text-muted-foreground">
              {format(entry.date, "EEEE")} · {formatDistanceToNow(entry.date, { addSuffix: true })}
            </p>
          </div>
          <Badge
            variant="outline"
            className={cn(
              "text-xs",
              entry.status === "booked" && "border-journey-complete text-journey-complete",
              needsTransport && "border-journey-pending text-journey-pending",
              entry.status === "needs-flight" && "border-journey-missing text-journey-missing"
            )}
          >
            {entry.status === "booked" && <CheckCircle2 className="w-3 h-3 mr-1" />}
            {needsTransport && <Car className="w-3 h-3 mr-1" />}
            {entry.status === "needs-flight" && <Plane className="w-3 h-3 mr-1" />}
            {entry.status === "booked" ? "Ready" : needsTransport ? "Need Transport" : "Need Flight"}
          </Badge>
        </div>

        {/* Flight Info */}
        {isFlight && entry.meta && (
          <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 mb-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Plane className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm truncate">{entry.title}</p>
              <p className="text-xs text-muted-foreground truncate">{entry.detail}</p>
              {entry.meta.timeLabel && (
                <p className="text-xs font-medium text-primary mt-0.5">
                  {entry.meta.timeLabel}
                </p>
              )}
            </div>
            {entry.meta.confirmation && (
              <Badge variant="secondary" className="text-[10px] shrink-0">
                {entry.meta.confirmation}
              </Badge>
            )}
          </div>
        )}

        {/* Transport Info */}
        {isFlight && (
          <>
            {hasTransport && entry.meta?.transport ? (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-green-50 border border-green-100">
                <div className="w-10 h-10 rounded-lg bg-green-500 flex items-center justify-center">
                  <Car className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{entry.meta.transport.label}</p>
                  <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                    {entry.meta.transport.timeLabel && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {entry.meta.transport.timeLabel}
                      </span>
                    )}
                    {entry.meta.transport.driverName && (
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {entry.meta.transport.driverName}
                      </span>
                    )}
                  </div>
                </div>
                {entry.meta.transport.phoneNumber && (
                  <a
                    href={`tel:${entry.meta.transport.phoneNumber}`}
                    className="shrink-0 p-2 rounded-lg bg-white hover:bg-green-100 transition-colors"
                  >
                    <Phone className="w-4 h-4 text-green-600" />
                  </a>
                )}
              </div>
            ) : needsTransport ? (
              <Button 
                size="sm" 
                className="w-full bg-journey-pending hover:bg-journey-pending/90"
                onClick={() => {
                  console.log('[NextTravelHero] Book Transport clicked, termId:', entry.termId);
                  if (entry.termId) {
                    onAddTransport(entry.termId);
                  } else {
                    console.error('[NextTravelHero] No termId available');
                  }
                }}
              >
                <Car className="w-4 h-4 mr-2" />
                Book Transport
              </Button>
            ) : null}
          </>
        )}

        {/* Notes */}
        {entry.meta?.notes && (
          <p className="mt-3 text-xs text-muted-foreground bg-muted/30 rounded-lg p-2">
            <span className="font-medium">Note:</span> {entry.meta.notes}
          </p>
        )}
      </div>

      {/* Add Flight Button (if needed) */}
      {(entry.status === "needs-flight" || entry.status === "unplanned") && entry.termId && (
        <Button 
          onClick={() => {
            console.log('[NextTravelHero] Add Flight clicked, termId:', entry.termId);
            if (entry.termId) {
              onAddFlight(entry.termId);
            }
          }} 
          className="w-full"
        >
          <Plane className="w-4 h-4 mr-2" />
          Add Flight
        </Button>
      )}
    </div>
  );
}

export default NextTravelHero;
