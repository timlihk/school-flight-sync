import type { Term, FlightDetails, TransportDetails } from "./school";

/**
 * Journey Status - Represents the complete state of a trip segment
 */
export type JourneyStatus =
  | "complete" // Has both flight and transport
  | "flight-only" // Has flight, needs transport
  | "transport-only" // Has transport, needs flight (rare)
  | "empty" // Nothing booked
  | "not-travelling"; // Explicitly marked as not needed

/**
 * Journey - The core entity combining flight and transport
 * 
 * This represents one direction of travel (outbound or return)
 * and always shows the relationship between flight and transport.
 */
export interface Journey {
  id: string;
  termId: string;
  direction: "outbound" | "return";
  school: "benenden" | "wycombe";

  // The term this journey belongs to
  term: Term;

  // Core components - always shown together
  flight?: FlightDetails;
  transport?: TransportDetails;

  // Computed status
  status: JourneyStatus;

  // Display metadata
  departureDate: Date;
  needsAttention: boolean;

  // Audit
  createdAt: string;
  updatedAt: string;
}

/**
 * Journey Pair - Both directions for a term
 */
export interface JourneyPair {
  term: Term;
  outbound?: Journey;
  return?: Journey;
  status: "complete" | "partial" | "empty" | "not-travelling";
}

/**
 * Helper to determine journey status
 */
export function getJourneyStatus(
  flight: FlightDetails | undefined,
  transport: TransportDetails | undefined,
  notTravelling?: boolean
): JourneyStatus {
  if (notTravelling) return "not-travelling";
  if (flight && transport) return "complete";
  if (flight && !transport) return "flight-only";
  if (!flight && transport) return "transport-only";
  return "empty";
}

/**
 * Get human-readable status label
 */
export function getJourneyStatusLabel(status: JourneyStatus): string {
  const labels: Record<JourneyStatus, string> = {
    complete: "Ready",
    "flight-only": "Needs Transport",
    "transport-only": "Needs Flight",
    empty: "Not Booked",
    "not-travelling": "Not Travelling",
  };
  return labels[status];
}

/**
 * Get status color classes
 */
export function getJourneyStatusColor(status: JourneyStatus): string {
  const colors: Record<JourneyStatus, string> = {
    complete: "text-journey-complete bg-journey-complete/10 border-journey-complete/20",
    "flight-only": "text-journey-pending bg-journey-pending/10 border-journey-pending/20",
    "transport-only": "text-journey-pending bg-journey-pending/10 border-journey-pending/20",
    empty: "text-muted-foreground bg-muted border-border",
    "not-travelling": "text-muted-foreground bg-muted border-border",
  };
  return colors[status];
}

/**
 * Check if a journey needs transport
 */
export function needsTransport(journey: Journey): boolean {
  return journey.status === "flight-only";
}

/**
 * Check if a journey needs flight
 */
export function needsFlight(journey: Journey): boolean {
  return journey.status === "transport-only" || journey.status === "empty";
}

/**
 * Build journeys from separate flights and transport arrays
 */
export function buildJourneys(
  term: Term,
  flights: FlightDetails[],
  transport: TransportDetails[],
  notTravelling?: { noFlights?: boolean; noTransport?: boolean }
): { outbound?: Journey; return?: Journey } {
  const outboundFlight = flights.find((f) => f.type === "outbound");
  const returnFlight = flights.find((f) => f.type === "return");

  const outboundTransport = transport.find(
    (t) => t.direction === "outbound" || (!t.direction && transport.indexOf(t) % 2 === 0)
  );
  const returnTransport = transport.find(
    (t) => t.direction === "return" || (!t.direction && transport.indexOf(t) % 2 === 1)
  );

  const journeys: { outbound?: Journey; return?: Journey } = {};

  // Build outbound journey
  if (outboundFlight || outboundTransport || !notTravelling?.noFlights) {
    journeys.outbound = {
      id: `${term.id}-outbound`,
      termId: term.id,
      direction: "outbound",
      school: term.school,
      term,
      flight: outboundFlight,
      transport: outboundTransport,
      status: getJourneyStatus(
        outboundFlight,
        outboundTransport,
        notTravelling?.noFlights
      ),
      departureDate: outboundFlight?.departure.date || term.startDate,
      needsAttention: !!outboundFlight && !outboundTransport,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  // Build return journey
  if (returnFlight || returnTransport || !notTravelling?.noFlights) {
    journeys.return = {
      id: `${term.id}-return`,
      termId: term.id,
      direction: "return",
      school: term.school,
      term,
      flight: returnFlight,
      transport: returnTransport,
      status: getJourneyStatus(
        returnFlight,
        returnTransport,
        notTravelling?.noFlights
      ),
      departureDate: returnFlight?.departure.date || term.endDate,
      needsAttention: !!returnFlight && !returnTransport,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  return journeys;
}
