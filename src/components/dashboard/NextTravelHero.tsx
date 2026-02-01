import { useMemo } from "react";
import { format, formatDistanceToNow, isAfter, differenceInDays, differenceInHours, differenceInMinutes } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Plane,
  Car,
  Clock,
  MapPin,
  Calendar,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  User,
  Phone,
  Share2,
  WifiOff,
  School,
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
  isOnline,
  earliestTerm,
  onAddFlight,
  onAddTransport,
  onShare,
}: NextTravelHeroProps) {
  // Calculate countdown from entry date
  const countdown = useMemo(() => {
    if (!entry) return null;
    const now = new Date();
    const targetDate = entry.date;
    
    const days = differenceInDays(targetDate, now);
    const hours = differenceInHours(targetDate, now) % 24;
    const minutes = differenceInMinutes(targetDate, now) % 60;
    
    if (days > 0) {
      return { value: days, unit: days === 1 ? "day" : "days", urgent: days <= 3 };
    } else if (hours > 0) {
      return { value: hours, unit: hours === 1 ? "hour" : "hours", urgent: true };
    } else {
      return { value: minutes, unit: minutes === 1 ? "minute" : "minutes", urgent: true };
    }
  }, [entry]);

  const schoolName = scope === "benenden" ? "Benenden" : "Wycombe Abbey";
  const schoolColor = scope === "benenden" ? "benenden" : "wycombe";

  // Empty state when no entry
  if (!entry) {
    return (
      <div
        className={cn(
          "relative overflow-hidden rounded-3xl",
          "bg-gradient-to-br from-card via-card to-muted/50",
          "border-2 border-dashed border-border",
          "p-8 text-center"
        )}
      >
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className={cn(
              "absolute -top-20 -right-20 w-64 h-64 rounded-full blur-3xl opacity-10",
              scope === "benenden" ? "bg-benenden" : "bg-wycombe"
            )}
          />
        </div>

        <div className="relative">
          {/* School Selector */}
          <div className="flex justify-center gap-2 mb-6">
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

          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-10 h-10 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-semibold mb-2">No Upcoming Travel</h2>
          <p className="text-muted-foreground mb-4 max-w-xs mx-auto">
            Add your first flight to start tracking your journey
          </p>
          {earliestTerm && (
            <Button onClick={() => onAddFlight(earliestTerm.id)}>
              <Plane className="w-4 h-4 mr-2" />
              Add Flight
            </Button>
          )}
        </div>
      </div>
    );
  }

  const isFlight = entry.kind === "flight";
  const needsTransport = entry.status === "needs-transport";
  const isStaying = entry.status === "staying";

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-3xl",
        "bg-gradient-to-br from-card via-card to-muted/30",
        "border-2 transition-all duration-500",
        entry.status === "booked" || entry.status === "complete"
          ? "border-journey-complete/30"
          : needsTransport
          ? "border-journey-pending/30"
          : "border-border",
        "shadow-elevated-lg"
      )}
    >
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className={cn(
            "absolute -top-20 -right-20 w-64 h-64 rounded-full blur-3xl opacity-20",
            scope === "benenden" ? "bg-benenden" : "bg-wycombe"
          )}
        />
        <div
          className={cn(
            "absolute -bottom-20 -left-20 w-48 h-48 rounded-full blur-3xl opacity-10",
            isFlight ? "bg-transport-flight" : "bg-transport-ground"
          )}
        />
      </div>

      <div className="relative p-6 lg:p-8">
        {/* Header with School Selector */}
        <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center",
                "bg-gradient-to-br",
                scope === "benenden"
                  ? "from-benenden/20 to-benenden/5"
                  : "from-wycombe/20 to-wycombe/5"
              )}
            >
              {isStaying ? (
                <School className={cn("w-6 h-6", scope === "benenden" ? "text-benenden" : "text-wycombe")} />
              ) : (
                <Plane className={cn("w-6 h-6", scope === "benenden" ? "text-benenden" : "text-wycombe")} />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold">
                  {isStaying ? "Staying at School" : entry.title}
                </h2>
                <Badge
                  variant="secondary"
                  className={cn(
                    "text-[10px] font-medium",
                    scope === "benenden"
                      ? "bg-benenden-subtle text-benenden"
                      : "bg-wycombe-subtle text-wycombe"
                  )}
                >
                  {schoolName}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{entry.detail}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* School Toggle */}
            <div className="flex rounded-lg border border-border p-0.5 bg-background">
              <button
                onClick={() => onScopeChange("benenden")}
                className={cn(
                  "px-3 py-1 rounded-md text-xs font-medium transition-all",
                  scope === "benenden"
                    ? "bg-benenden text-white"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Ben
              </button>
              <button
                onClick={() => onScopeChange("wycombe")}
                className={cn(
                  "px-3 py-1 rounded-md text-xs font-medium transition-all",
                  scope === "wycombe"
                    ? "bg-wycombe text-white"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                WA
              </button>
            </div>

            {/* Share Button */}
            <Button
              variant="outline"
              size="icon"
              onClick={onShare}
              className="rounded-xl"
            >
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Countdown & Date Row */}
        <div className="flex flex-wrap items-center gap-4 mb-6">
          {countdown && (
            <div
              className={cn(
                "flex flex-col items-center px-5 py-3 rounded-2xl",
                "bg-gradient-to-br",
                countdown.urgent
                  ? "from-journey-pending/10 to-journey-pending/5"
                  : "from-journey-complete/10 to-journey-complete/5"
              )}
            >
              <span
                className={cn(
                  "text-4xl font-bold",
                  countdown.urgent ? "text-journey-pending" : "text-journey-complete"
                )}
              >
                {countdown.value}
              </span>
              <span className="text-xs text-muted-foreground uppercase tracking-wide">
                {countdown.unit}
              </span>
            </div>
          )}

          <div className="flex-1 min-w-[200px]">
            <div className="glass-card p-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-lg">
                    {format(entry.date, "EEEE, MMMM d")}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {formatDistanceToNow(entry.date, { addSuffix: true })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Status Badge */}
        <div className="flex items-center gap-2 mb-4">
          <Badge
            variant="outline"
            className={cn(
              "text-sm font-medium px-3 py-1",
              entry.status === "booked" && "border-journey-complete text-journey-complete",
              entry.status === "needs-transport" && "border-journey-pending text-journey-pending",
              entry.status === "needs-flight" && "border-journey-missing text-journey-missing",
              entry.status === "staying" && "border-primary text-primary",
              entry.status === "unplanned" && "border-muted-foreground text-muted-foreground"
            )}
          >
            {entry.status === "booked" && <CheckCircle2 className="w-4 h-4 mr-1.5" />}
            {entry.status === "needs-transport" && <Car className="w-4 h-4 mr-1.5" />}
            {entry.status === "needs-flight" && <Plane className="w-4 h-4 mr-1.5" />}
            {entry.status === "staying" && <School className="w-4 h-4 mr-1.5" />}
            {entry.status === "unplanned" && <AlertCircle className="w-4 h-4 mr-1.5" />}
            {entry.status === "booked" && "Fully Booked"}
            {entry.status === "needs-transport" && "Needs Transport"}
            {entry.status === "needs-flight" && "Needs Flight"}
            {entry.status === "staying" && "Staying at School"}
            {entry.status === "unplanned" && "Not Planned"}
          </Badge>

          {!isOnline && (
            <Badge variant="secondary" className="gap-1.5 text-muted-foreground">
              <WifiOff className="w-3 h-3" />
              Offline
            </Badge>
          )}
        </div>

        {/* Flight Details (if flight entry) */}
        {isFlight && entry.meta && (
          <div className="glass-card p-5 mb-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-transport-flight-subtle flex items-center justify-center">
                  <Plane className="w-7 h-7 text-transport-flight" />
                </div>
                <div>
                  <p className="font-bold text-lg">{entry.title}</p>
                  <p className="text-sm text-muted-foreground">{entry.detail}</p>
                </div>
              </div>

              {entry.meta.timeLabel && (
                <div className="sm:ml-auto flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10">
                  <Clock className="w-5 h-5 text-primary" />
                  <span className="font-bold text-primary">{entry.meta.timeLabel}</span>
                </div>
              )}
            </div>

            {entry.meta.confirmation && (
              <div className="mt-4 pt-4 border-t border-border/50 flex flex-wrap gap-2">
                <Badge variant="secondary" className="gap-1.5">
                  <span className="text-muted-foreground">Confirmation:</span>
                  <span className="font-mono">{entry.meta.confirmation}</span>
                </Badge>
              </div>
            )}
            
            {entry.meta.notes && (
              <div className="mt-3 text-sm text-muted-foreground bg-muted/30 rounded-lg p-3">
                <span className="font-medium text-foreground">Notes:</span>{' '}
                {entry.meta.notes}
              </div>
            )}
          </div>
        )}

        {/* Transport Section */}
        {isFlight && entry.meta?.transport && (
          <div className="mt-4">
            {entry.meta.transport.status === "booked" ? (
              <div
                className={cn(
                  "rounded-2xl p-4 border-l-4",
                  "bg-transport-ground-subtle border-transport-ground"
                )}
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-transport-ground text-white flex items-center justify-center">
                      <Car className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-semibold">{entry.meta.transport.label}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CheckCircle2 className="w-3.5 h-3.5 text-journey-complete" />
                        <span>Confirmed</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 sm:ml-auto">
                    {entry.meta.transport.timeLabel && (
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-background">
                        <Clock className="w-4 h-4 text-transport-ground" />
                        <span className="font-medium">
                          Pickup: {entry.meta.transport.timeLabel}
                        </span>
                      </div>
                    )}

                    {entry.meta.transport.driverName && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <User className="w-4 h-4" />
                        <span>{entry.meta.transport.driverName}</span>
                      </div>
                    )}

                    {entry.meta.transport.phoneNumber && (
                      <a
                        href={`tel:${entry.meta.transport.phoneNumber}`}
                        className="flex items-center gap-2 text-sm text-primary hover:underline"
                      >
                        <Phone className="w-4 h-4" />
                        <span>{entry.meta.transport.phoneNumber}</span>
                      </a>
                    )}
                  </div>
                </div>

                {entry.meta.transport.notes && (
                  <p className="mt-3 text-sm text-muted-foreground bg-background/50 rounded-lg p-3">
                    <span className="font-medium">Note:</span>{" "}
                    {entry.meta.transport.notes}
                  </p>
                )}
              </div>
            ) : needsTransport ? (
              <div
                className={cn(
                  "rounded-2xl p-4 border-l-4",
                  "bg-journey-missing/5 border-journey-missing"
                )}
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-journey-missing/10 flex items-center justify-center">
                      <AlertCircle className="w-5 h-5 text-journey-missing" />
                    </div>
                    <div>
                      <p className="font-medium text-journey-missing">
                        Transport Not Booked
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Book transport to reach your flight on time
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={() => entry.termId && onAddTransport(entry.termId)}
                    className="sm:ml-auto bg-journey-missing hover:bg-journey-missing/90"
                  >
                    <Car className="w-4 h-4 mr-2" />
                    Book Transport
                  </Button>
                </div>
              </div>
            ) : null}
          </div>
        )}

        {/* Action Buttons */}
        {(entry.status === "needs-flight" || entry.status === "unplanned") && entry.termId && (
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <Button onClick={() => onAddFlight(entry.termId!)} className="flex-1">
              <Plane className="w-4 h-4 mr-2" />
              Add Flight
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
