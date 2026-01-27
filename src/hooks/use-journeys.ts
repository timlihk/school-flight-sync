import { useMemo } from "react";
import type { Term, FlightDetails, TransportDetails } from "@/types/school";
import type { Journey, JourneyPair } from "@/types/journey";
import { buildJourneys, getJourneyStatus } from "@/types/journey";

interface UseJourneysOptions {
  school?: "benenden" | "wycombe" | "both";
  upcomingOnly?: boolean;
}

export function useJourneys(
  terms: Term[],
  flights: FlightDetails[],
  transport: TransportDetails[],
  notTravelling: { termId: string; noFlights?: boolean; noTransport?: boolean }[],
  options: UseJourneysOptions = {}
) {
  const { school = "both", upcomingOnly = true } = options;

  // Build journey pairs from all data
  const journeyPairs = useMemo(() => {
    const now = new Date();
    
    return terms
      .filter((term) => {
        if (school !== "both" && term.school !== school) return false;
        if (upcomingOnly && term.endDate < now) return false;
        return true;
      })
      .sort((a, b) => a.startDate.getTime() - b.startDate.getTime())
      .map((term) => {
        const termFlights = flights.filter((f) => f.termId === term.id);
        const termTransport = transport.filter((t) => t.termId === term.id);
        const notTravellingStatus = notTravelling.find((nt) => nt.termId === term.id);

        const journeys = buildJourneys(term, termFlights, termTransport, notTravellingStatus);

        const pair: JourneyPair = {
          term,
          outbound: journeys.outbound,
          return: journeys.return,
          status: "empty",
        };

        // Calculate pair status
        const outboundStatus = journeys.outbound?.status || "empty";
        const returnStatus = journeys.return?.status || "empty";

        if (
          outboundStatus === "complete" &&
          (returnStatus === "complete" || returnStatus === "empty" || returnStatus === "not-travelling")
        ) {
          pair.status = "complete";
        } else if (
          outboundStatus === "not-travelling" &&
          (returnStatus === "not-travelling" || returnStatus === "empty")
        ) {
          pair.status = "not-travelling";
        } else if (outboundStatus !== "empty" || returnStatus !== "empty") {
          pair.status = "partial";
        }

        return pair;
      });
  }, [terms, flights, transport, notTravelling, school, upcomingOnly]);

  // Flatten all journeys for timeline view
  const allJourneys = useMemo(() => {
    const journeys: Journey[] = [];
    journeyPairs.forEach((pair) => {
      if (pair.outbound) journeys.push(pair.outbound);
      if (pair.return) journeys.push(pair.return);
    });
    return journeys.sort((a, b) => a.departureDate.getTime() - b.departureDate.getTime());
  }, [journeyPairs]);

  // Get upcoming journeys that need attention
  const journeysNeedingAttention = useMemo(() => {
    return allJourneys.filter(
      (j) => j.needsAttention || j.status === "empty" || j.status === "transport-only"
    );
  }, [allJourneys]);

  // Get next journey
  const nextJourney = useMemo(() => {
    const now = new Date();
    return allJourneys.find((j) => j.departureDate >= now);
  }, [allJourneys]);

  // Stats
  const stats = useMemo(() => {
    return {
      total: allJourneys.length,
      complete: allJourneys.filter((j) => j.status === "complete").length,
      needsTransport: allJourneys.filter((j) => j.status === "flight-only").length,
      notBooked: allJourneys.filter((j) => j.status === "empty").length,
      notTravelling: allJourneys.filter((j) => j.status === "not-travelling").length,
    };
  }, [allJourneys]);

  return {
    journeyPairs,
    allJourneys,
    journeysNeedingAttention,
    nextJourney,
    stats,
  };
}

export type { Journey, JourneyPair };
