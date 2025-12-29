import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Calendar } from "lucide-react";
import { NextTravelHero } from "@/components/dashboard/NextTravelHero";
import { PlanFastCard } from "@/components/dashboard/PlanFastCard";
import { NextTravelEntry } from "@/types/next-travel";
import { Term } from "@/types/school";
import { CalendarEvent } from "@/hooks/use-calendar-events";

interface TodayTabProps {
  heroEntry: NextTravelEntry | null;
  heroScope: "benenden" | "wycombe";
  onHeroScopeChange: (scope: "benenden" | "wycombe") => void;
  isOnline: boolean;
  earliestTerm: Term | null;
  onAddFlight: (termId: string) => void;
  onAddTransport: (termId: string) => void;
  onShareHero: () => void;
  searchTerm: string;
  statusFilter: "all" | "booked" | "needs" | "staying";
  onSearchChange: (value: string) => void;
  onStatusChange: (value: "all" | "booked" | "needs" | "staying") => void;
  onQuickAddFlight: () => void;
  onQuickAddTransport: () => void;
  onSharePlanFast: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  isBusy: boolean;
  schoolPills: ReactNode;
  filteredThisWeek: CalendarEvent[];
  onCalendarEventClick: (event: CalendarEvent) => void;
  onNavigateToCalendar: () => void;
}

export function TodayTab({
  heroEntry,
  heroScope,
  onHeroScopeChange,
  isOnline,
  earliestTerm,
  onAddFlight,
  onAddTransport,
  onShareHero,
  searchTerm,
  statusFilter,
  onSearchChange,
  onStatusChange,
  onQuickAddFlight,
  onQuickAddTransport,
  onSharePlanFast,
  onRefresh,
  isRefreshing,
  isBusy,
  schoolPills,
  filteredThisWeek,
  onCalendarEventClick,
  onNavigateToCalendar,
}: TodayTabProps) {
  return (
    <div className="space-y-5 px-4 py-5 md:px-6">
      <NextTravelHero
        isOnline={isOnline}
        scope={heroScope}
        onScopeChange={onHeroScopeChange}
        entry={heroEntry}
        earliestTerm={earliestTerm}
        onAddFlight={onAddFlight}
        onAddTransport={onAddTransport}
        onShare={onShareHero}
      />

      <PlanFastCard
        searchTerm={searchTerm}
        statusFilter={statusFilter}
        onSearchChange={onSearchChange}
        onStatusChange={onStatusChange}
        onAddFlight={onQuickAddFlight}
        onAddTransport={onQuickAddTransport}
        onShare={onSharePlanFast}
        onRefresh={onRefresh}
        isRefreshing={isRefreshing}
        isBusy={isBusy}
        contextLabel={earliestTerm?.name}
      />

      <div className="rounded-2xl border border-border/70 bg-card/80 p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase text-muted-foreground tracking-wide">This week</p>
            <h3 className="text-lg font-semibold">Upcoming</h3>
          </div>
          <Button variant="ghost" size="sm" onClick={onNavigateToCalendar}>
            <Calendar className="h-4 w-4 mr-2" />
            Calendar
          </Button>
        </div>
        {schoolPills}
        {filteredThisWeek.length === 0 && (
          <EmptyState
            variant="week"
            compact
            actions={
              earliestTerm
                ? [
                    { label: "Add Flight", onClick: () => onAddFlight(earliestTerm.id) },
                    { label: "Add Transport", onClick: () => onAddTransport(earliestTerm.id), variant: "outline" as const },
                  ]
                : undefined
            }
          />
        )}
        <div className="overflow-x-auto -mx-2 px-2">
          <div className="flex gap-3 snap-x snap-mandatory">
            {filteredThisWeek.map(event => (
              <button
                key={event.id}
                className="snap-start min-w-[260px] rounded-xl border border-border/60 bg-muted/40 p-3 text-left hover:bg-accent transition-colors"
                onClick={() => onCalendarEventClick(event)}
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-[11px] uppercase tracking-wide text-muted-foreground">
                    {event.type === "flight"
                      ? ((event.details as { type?: "outbound" | "return" })?.type === "outbound" ? "From School" : "To School")
                      : event.type === "transport"
                        ? "Transport"
                        : event.type === "term"
                          ? "School date"
                          : "Not travelling"}
                  </span>
                  <span className="text-[11px] text-muted-foreground">{Intl.DateTimeFormat(undefined, { weekday: "short", month: "short", day: "numeric" }).format(event.date)}</span>
                </div>
                <div className="text-sm font-semibold truncate">{event.title}</div>
                <div className="text-xs text-muted-foreground">{event.school === "benenden" ? "Benenden" : "Wycombe"}</div>
                {event.description && (
                  <div className="mt-2 text-xs text-muted-foreground line-clamp-2">
                    {event.description}
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
