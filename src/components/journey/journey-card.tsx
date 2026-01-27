import { format } from "date-fns";
import {
  Plane,
  Car,
  AlertCircle,
  CheckCircle2,
  Calendar,
  MapPin,
  Phone,
  User,
  Plus,
  ChevronRight,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Journey } from "@/types/journey";
import {
  getJourneyStatusLabel,
  getJourneyStatusColor,
  needsTransport,
} from "@/types/journey";

interface JourneyCardProps {
  journey: Journey;
  variant?: "default" | "compact" | "minimal";
  onAddTransport?: () => void;
  onEditTransport?: () => void;
  onEditFlight?: () => void;
  onAddFlight?: () => void;
  className?: string;
}

export function JourneyCard({
  journey,
  variant = "default",
  onAddTransport,
  onEditTransport,
  onEditFlight,
  onAddFlight,
  className,
}: JourneyCardProps) {
  const { flight, transport, direction, school, term, status } = journey;

  const isOutbound = direction === "outbound";
  const directionLabel = isOutbound ? "Departure" : "Return";
  const needsTransportBooking = needsTransport(journey);

  // Get school color
  const schoolColorClass =
    school === "benenden" ? "bg-benenden" : "bg-wycombe";

  // Status icon
  const StatusIcon =
    status === "complete"
      ? CheckCircle2
      : status === "not-travelling"
      ? CheckCircle2
      : AlertCircle;

  if (variant === "minimal") {
    return (
      <div
        className={cn(
          "flex items-center gap-3 p-3 rounded-lg border bg-card",
          className
        )}
      >
        <div
          className={cn(
            "w-2 h-12 rounded-full",
            status === "complete" ? "bg-journey-complete" : "bg-journey-pending"
          )}
        />
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm">{directionLabel}</p>
          <p className="text-xs text-muted-foreground truncate">
            {flight
              ? `${flight.airline} ${flight.flightNumber}`
              : "Flight not booked"}
          </p>
        </div>
        <StatusIcon
          className={cn(
            "w-4 h-4",
            status === "complete"
              ? "text-journey-complete"
              : "text-journey-pending"
          )}
        />
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <Card
        className={cn(
          "relative overflow-hidden transition-all duration-200",
          "hover:shadow-md cursor-pointer group",
          className
        )}
      >
        {/* School indicator */}
        <div className={cn("absolute left-0 top-0 bottom-0 w-1", schoolColorClass)} />

        <div className="p-4 pl-5">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {directionLabel}
              </span>
              <Badge
                variant="secondary"
                className={cn(
                  "text-[10px]",
                  school === "benenden"
                    ? "bg-benenden-subtle text-benenden"
                    : "bg-wycombe-subtle text-wycombe"
                )}
              >
                {school === "benenden" ? "Benenden" : "Wycombe"}
              </Badge>
            </div>
            <Badge
              variant="outline"
              className={cn("text-[10px]", getJourneyStatusColor(status))}
            >
              {getJourneyStatusLabel(status)}
            </Badge>
          </div>

          {/* Compact flight info */}
          {flight ? (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-transport-flight-subtle flex items-center justify-center">
                <Plane className="w-5 h-5 text-transport-flight" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold">
                  {flight.airline} {flight.flightNumber}
                </p>
                <p className="text-xs text-muted-foreground">
                  {format(flight.departure.date, "MMM d")} ·{" "}
                  {flight.departure.time || "TBD"}
                </p>
              </div>
            </div>
          ) : (
            <Button variant="outline" size="sm" onClick={onAddFlight} className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Add Flight
            </Button>
          )}

          {/* Compact transport indicator */}
          {flight && (
            <div className="mt-3 pl-12">
              {transport ? (
                <div className="flex items-center gap-2 text-sm">
                  <Car className="w-4 h-4 text-transport-ground" />
                  <span className="text-muted-foreground">
                    {transport.type === "school-coach" ? "School Coach" : "Taxi"}
                  </span>
                  <span className="text-xs">·</span>
                  <span className="text-xs">{transport.pickupTime}</span>
                </div>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onAddTransport}
                  className="text-journey-pending hover:text-journey-pending hover:bg-journey-pending/10 -ml-3"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Transport
                </Button>
              )}
            </div>
          )}
        </div>
      </Card>
    );
  }

  // Default full variant
  return (
    <Card
      className={cn(
        "relative overflow-hidden transition-all duration-200",
        "hover:shadow-lg cursor-pointer group",
        status === "complete" && "border-journey-complete/30",
        status === "flight-only" && "border-journey-pending/30",
        status === "empty" && "border-dashed",
        className
      )}
    >
      {/* School color indicator */}
      <div className={cn("absolute left-0 top-0 bottom-0 w-1.5", schoolColorClass)} />

      <div className="p-5 pl-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            {/* Direction indicator */}
            <div
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center",
                isOutbound ? "bg-primary/10" : "bg-secondary"
              )}
            >
              <Plane
                className={cn(
                  "w-5 h-5",
                  isOutbound ? "text-primary rotate-0" : "text-muted-foreground rotate-90"
                )}
              />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">{directionLabel}</h3>
                <Badge
                  variant="secondary"
                  className={cn(
                    "text-[10px]",
                    school === "benenden"
                      ? "bg-benenden-subtle text-benenden"
                      : "bg-wycombe-subtle text-wycombe"
                  )}
                >
                  {school === "benenden" ? "Ben" : "WA"}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {term.name}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className={cn("text-xs font-medium", getJourneyStatusColor(status))}
            >
              <StatusIcon className="w-3 h-3 mr-1" />
              {getJourneyStatusLabel(status)}
            </Badge>
            <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>

        {/* Flight Section */}
        {flight ? (
          <div className="bg-muted/30 rounded-xl p-4">
            {/* Flight Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-transport-flight-subtle flex items-center justify-center">
                  <Plane className="w-6 h-6 text-transport-flight" />
                </div>
                <div>
                  <p className="font-bold text-lg">
                    {flight.airline} {flight.flightNumber}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {flight.departure.airport} → {flight.arrival.airport}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold">
                  {format(flight.departure.date, "EEE, MMM d")}
                </p>
                <p className="text-lg font-bold text-primary">
                  {flight.departure.time || "TBD"}
                </p>
              </div>
            </div>

            {/* Flight Route Visualization */}
            <div className="flex items-center gap-3 mb-4 px-2">
              <div className="flex-1">
                <p className="font-medium">{flight.departure.airport}</p>
                <p className="text-xs text-muted-foreground">Departure</p>
              </div>
              <div className="flex-1 relative">
                <div className="border-t-2 border-dashed border-border" />
                <Plane className="w-4 h-4 text-muted-foreground absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-muted/30" />
              </div>
              <div className="flex-1 text-right">
                <p className="font-medium">{flight.arrival.airport}</p>
                <p className="text-xs text-muted-foreground">Arrival</p>
              </div>
            </div>

            {/* Flight Details */}
            <div className="flex flex-wrap gap-3 text-sm">
              {flight.confirmationCode && (
                <div className="flex items-center gap-1.5 text-muted-foreground bg-background rounded-full px-3 py-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{flight.confirmationCode}</span>
                </div>
              )}
              {flight.departure.terminal && (
                <div className="flex items-center gap-1.5 text-muted-foreground bg-background rounded-full px-3 py-1">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Terminal {flight.departure.terminal}</span>
                </div>
              )}
            </div>

            {/* Transport Panel - The Key Feature */}
            <div className="mt-4">
              {transport ? (
                <div
                  className="rounded-xl border-l-4 bg-transport-ground-subtle border-transport-ground p-4"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditTransport?.();
                  }}
                >
                  {/* Transport Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-transport-ground text-white flex items-center justify-center">
                        <Car className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-semibold">
                          {transport.type === "school-coach"
                            ? "School Coach"
                            : "Taxi / Car Service"}
                        </p>
                        <p className="text-xs text-transport-ground font-medium">
                          ✓ Transport Confirmed
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className="bg-white/50 text-transport-ground border-transport-ground/30"
                    >
                      {transport.pickupTime}
                    </Badge>
                  </div>

                  {/* Transport Details */}
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    {transport.driverName && (
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span>{transport.driverName}</span>
                      </div>
                    )}
                    {transport.phoneNumber && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        <span>{transport.phoneNumber}</span>
                      </div>
                    )}
                  </div>

                  {transport.notes && (
                    <p className="mt-3 text-sm text-muted-foreground bg-white/50 rounded-lg p-2">
                      <span className="font-medium">Note:</span> {transport.notes}
                    </p>
                  )}
                </div>
              ) : (
                /* Missing Transport Alert */
                <div className="rounded-xl border-l-4 border-journey-missing bg-journey-missing/5 p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-journey-missing flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium text-journey-missing">
                        Transport Not Booked
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        You need transport to catch this flight. Book a taxi or
                        school coach to get to the airport.
                      </p>
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onAddTransport?.();
                        }}
                        className="mt-3 bg-journey-missing hover:bg-journey-missing/90"
                      >
                        <Plus className="w-4 h-4 mr-1.5" />
                        Book Transport
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* No Flight State */
          <div className="bg-muted/30 rounded-xl p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <Plane className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="font-medium text-lg mb-2">No Flight Booked</p>
            <p className="text-sm text-muted-foreground mb-4">
              Add your {directionLabel.toLowerCase()} flight details to get
              started.
            </p>
            <Button onClick={onAddFlight}>
              <Plus className="w-4 h-4 mr-2" />
              Add Flight
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}
