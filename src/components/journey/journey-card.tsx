import { useState } from "react";
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
  Clock,
  Ticket,
  Terminal,
  Luggage,
  ExternalLink,
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
  variant?: "default" | "compact" | "minimal" | "hero";
  onAddTransport?: () => void;
  onEditTransport?: () => void;
  onEditFlight?: () => void;
  onAddFlight?: () => void;
  onViewFlightStatus?: () => void;
  className?: string;
}

export function JourneyCard({
  journey,
  variant = "default",
  onAddTransport,
  onEditTransport,
  onEditFlight,
  onAddFlight,
  onViewFlightStatus,
  className,
}: JourneyCardProps) {
  const { flight, transport, direction, school, term, status } = journey;
  const [isHovered, setIsHovered] = useState(false);

  const isOutbound = direction === "outbound";
  const directionLabel = isOutbound ? "Departure" : "Return";
  const needsTransportBooking = needsTransport(journey);

  // Get school color classes
  const schoolColorClass =
    school === "benenden" ? "bg-benenden" : "bg-wycombe";
  const schoolTextClass =
    school === "benenden" ? "text-benenden" : "text-wycombe";
  const schoolSubtleBg =
    school === "benenden" ? "bg-benenden-subtle" : "bg-wycombe-subtle";

  // Status icon
  const StatusIcon =
    status === "complete"
      ? CheckCircle2
      : status === "not-travelling"
      ? CheckCircle2
      : AlertCircle;

  // HERO variant - Large featured card
  if (variant === "hero") {
    return (
      <div
        className={cn(
          "relative overflow-hidden rounded-3xl",
          "bg-gradient-to-br from-card via-card to-muted/30",
          "border-2 transition-all duration-500",
          status === "complete"
            ? "border-journey-complete/30 shadow-glow-success"
            : "border-journey-pending/30",
          "hover:shadow-elevated-lg",
          className
        )}
      >
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className={cn(
              "absolute -top-20 -right-20 w-64 h-64 rounded-full blur-3xl opacity-20",
              school === "benenden" ? "bg-benenden" : "bg-wycombe"
            )}
          />
        </div>

        <div className="relative p-6 lg:p-8">
          {/* Header */}
          <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "w-14 h-14 rounded-2xl flex items-center justify-center",
                  "bg-gradient-to-br",
                  school === "benenden"
                    ? "from-benenden/20 to-benenden/5"
                    : "from-wycombe/20 to-wycombe/5"
                )}
              >
                <Plane
                  className={cn(
                    "w-7 h-7",
                    schoolTextClass,
                    !isOutbound && "rotate-90"
                  )}
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-semibold">{directionLabel}</h2>
                  <Badge
                    variant="secondary"
                    className={cn(
                      "font-medium",
                      school === "benenden"
                        ? "bg-benenden-subtle text-benenden"
                        : "bg-wycombe-subtle text-wycombe"
                    )}
                  >
                    {school === "benenden" ? "Benenden" : "Wycombe Abbey"}
                  </Badge>
                </div>
                <p className="text-muted-foreground">{term.name}</p>
              </div>
            </div>

            <Badge
              variant="outline"
              className={cn(
                "text-sm font-medium px-3 py-1",
                getJourneyStatusColor(status)
              )}
            >
              <StatusIcon className="w-4 h-4 mr-1.5" />
              {getJourneyStatusLabel(status)}
            </Badge>
          </div>

          {/* Flight Section */}
          {flight ? (
            <div className="glass-card p-5 mb-4">
              <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                {/* Flight Info */}
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-transport-flight-subtle flex items-center justify-center">
                    <Plane className="w-8 h-8 text-transport-flight" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      {flight.airline} {flight.flightNumber}
                    </p>
                    <p className="text-muted-foreground">
                      {flight.departure.airport} → {flight.arrival.airport}
                    </p>
                  </div>
                </div>

                {/* Date & Time */}
                <div className="lg:ml-auto flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-muted">
                    <Calendar className="w-5 h-5 text-muted-foreground" />
                    <span className="font-medium">
                      {format(flight.departure.date, "EEEE, MMMM d")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10">
                    <Clock className="w-5 h-5 text-primary" />
                    <span className="font-bold text-primary text-lg">
                      {flight.departure.time || "TBD"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Route Visualization */}
              <div className="mt-5 pt-5 border-t border-border/50">
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold">{flight.departure.airport}</p>
                    <p className="text-sm text-muted-foreground">Departure</p>
                  </div>
                  <div className="flex-1 relative px-4">
                    <div className="border-t-2 border-dashed border-border" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2">
                      <Plane className="w-5 h-5 text-primary rotate-90" />
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">{flight.arrival.airport}</p>
                    <p className="text-sm text-muted-foreground">Arrival</p>
                  </div>
                </div>

                {/* Flight Details */}
                <div className="flex flex-wrap gap-2 mt-4">
                  {flight.confirmationCode && (
                    <Badge variant="secondary" className="gap-1.5">
                      <Ticket className="w-3.5 h-3.5" />
                      {flight.confirmationCode}
                    </Badge>
                  )}
                  {flight.departure.terminal && (
                    <Badge variant="secondary" className="gap-1.5">
                      <Terminal className="w-3.5 h-3.5" />
                      Terminal {flight.departure.terminal}
                    </Badge>
                  )}
                  {flight.departure.gate && (
                    <Badge variant="secondary" className="gap-1.5">
                      <MapPin className="w-3.5 h-3.5" />
                      Gate {flight.departure.gate}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="glass-card p-8 text-center mb-4 border-dashed border-2 border-journey-missing/30">
              <div className="w-20 h-20 rounded-full bg-journey-missing/10 flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-10 h-10 text-journey-missing" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No Flight Booked</h3>
              <p className="text-muted-foreground mb-4">
                Add your flight details to start planning your journey
              </p>
              <Button size="lg" onClick={onAddFlight}>
                <Plus className="w-5 h-5 mr-2" />
                Add Flight
              </Button>
            </div>
          )}

          {/* Transport Section */}
          {flight && (
            <div className="mt-6">
              {transport ? (
                <div
                  className={cn(
                    "rounded-2xl p-5 border-l-4",
                    "bg-transport-ground-subtle border-transport-ground"
                  )}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-transport-ground text-white flex items-center justify-center">
                        <Car className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="font-semibold text-lg">
                          {transport.type === "school-coach"
                            ? "School Coach"
                            : "Taxi / Car Service"}
                        </p>
                        <div className="flex items-center gap-2 text-sm text-transport-ground">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Transport Confirmed</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 lg:ml-auto">
                      <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-background">
                        <Clock className="w-4 h-4 text-transport-ground" />
                        <span className="font-semibold">
                          Pickup: {transport.pickupTime}
                        </span>
                      </div>

                      {transport.driverName && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <User className="w-4 h-4" />
                          <span>{transport.driverName}</span>
                        </div>
                      )}

                      {transport.phoneNumber && (
                        <a
                          href={`tel:${transport.phoneNumber}`}
                          className="flex items-center gap-2 text-sm text-primary hover:underline"
                        >
                          <Phone className="w-4 h-4" />
                          <span>{transport.phoneNumber}</span>
                        </a>
                      )}

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={onEditTransport}
                        className="border-transport-ground/30 text-transport-ground hover:bg-transport-ground/10"
                      >
                        Edit
                      </Button>
                    </div>
                  </div>

                  {transport.notes && (
                    <p className="mt-4 text-sm text-muted-foreground bg-background/50 rounded-lg p-3">
                      <span className="font-medium">Note:</span> {transport.notes}
                    </p>
                  )}
                </div>
              ) : (
                <div
                  className={cn(
                    "rounded-2xl p-5 border-l-4",
                    "bg-journey-missing/5 border-journey-missing"
                  )}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-journey-missing/10 flex items-center justify-center">
                        <AlertCircle className="w-6 h-6 text-journey-missing" />
                      </div>
                      <div>
                        <p className="font-semibold text-journey-missing">
                          Transport Not Booked
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Book transport to reach your flight on time
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={onAddTransport}
                      size="lg"
                      className="sm:ml-auto bg-journey-missing hover:bg-journey-missing/90"
                    >
                      <Car className="w-5 h-5 mr-2" />
                      Book Transport
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // MINIMAL variant
  if (variant === "minimal") {
    return (
      <div
        className={cn(
          "flex items-center gap-3 p-3 rounded-xl border bg-card",
          "transition-all duration-200 hover:shadow-md cursor-pointer",
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
            "w-4 h-4 flex-shrink-0",
            status === "complete"
              ? "text-journey-complete"
              : "text-journey-pending"
          )}
        />
      </div>
    );
  }

  // COMPACT variant
  if (variant === "compact") {
    return (
      <Card
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={cn(
          "relative overflow-hidden transition-all duration-300",
          "hover:shadow-lg cursor-pointer group",
          isHovered && "scale-[1.02]",
          className
        )}
      >
        {/* School indicator */}
        <div className={cn("absolute left-0 top-0 bottom-0 w-1.5", schoolColorClass)} />

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

          {/* Flight info */}
          {flight ? (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-transport-flight-subtle flex items-center justify-center">
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
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onAddFlight?.();
              }}
              className="w-full"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Flight
            </Button>
          )}

          {/* Transport indicator */}
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
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddTransport?.();
                  }}
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

  // DEFAULT variant (full)
  return (
    <Card
      className={cn(
        "relative overflow-hidden transition-all duration-300",
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
              <p className="text-sm text-muted-foreground">{term.name}</p>
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

            {/* Transport Panel */}
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
