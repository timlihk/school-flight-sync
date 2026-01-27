import { useState } from "react";
import { format, formatDistanceToNow } from "date-fns";
import {
  Plane,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Clock,
  Bell,
  Settings,
  MapPin,
  Car,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { JourneyCard } from "@/components/journey/journey-card";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { cn } from "@/lib/utils";
import { useFamilyAuth } from "@/contexts/FamilyAuthContext";
import { useJourneys } from "@/hooks/use-journeys";
import { mockTerms } from "@/data/mock-terms";
import type { Journey } from "@/types/journey";

// Mock data - replace with actual hooks
const mockFlights: any[] = [];
const mockTransport: any[] = [];
const mockNotTravelling: any[] = [];

export default function Dashboard() {
  const { logout } = useFamilyAuth();
  const [selectedSchool, setSelectedSchool] = useState<"benenden" | "wycombe" | "both">("both");
  
  const {
    journeyPairs,
    allJourneys,
    journeysNeedingAttention,
    nextJourney,
    stats,
  } = useJourneys(mockTerms, mockFlights, mockTransport, mockNotTravelling, {
    school: selectedSchool,
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <Plane className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-semibold">School Flight Sync</h1>
              <p className="text-xs text-muted-foreground">Journey Planner</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5" />
              {journeysNeedingAttention.length > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-journey-pending rounded-full" />
              )}
            </Button>
            <Button variant="ghost" size="icon" onClick={logout}>
              <Settings className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6 pb-32">
        {/* School Filter */}
        <div className="flex gap-2 mb-6">
          {(["both", "benenden", "wycombe"] as const).map((school) => (
            <Button
              key={school}
              variant={selectedSchool === school ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedSchool(school)}
              className={cn(
                "rounded-full",
                school === "benenden" && selectedSchool === school && "bg-benenden hover:bg-benenden/90",
                school === "wycombe" && selectedSchool === school && "bg-wycombe hover:bg-wycombe/90"
              )}
            >
              {school === "both" ? "All Schools" : school === "benenden" ? "Benenden" : "Wycombe"}
            </Button>
          ))}
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          <StatCard
            icon={<Calendar className="w-4 h-4" />}
            label="Upcoming"
            value={stats.total}
            color="primary"
          />
          <StatCard
            icon={<CheckCircle2 className="w-4 h-4" />}
            label="Complete"
            value={stats.complete}
            color="success"
          />
          <StatCard
            icon={<Car className="w-4 h-4" />}
            label="Need Transport"
            value={stats.needsTransport}
            color="warning"
          />
          <StatCard
            icon={<AlertCircle className="w-4 h-4" />}
            label="Not Booked"
            value={stats.notBooked}
            color="danger"
          />
        </div>

        {/* Next Journey Hero */}
        {nextJourney && (
          <section className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Next Journey
              </h2>
              <Badge variant="outline" className="text-xs">
                {formatDistanceToNow(nextJourney.departureDate, { addSuffix: true })}
              </Badge>
            </div>
            <JourneyCard
              journey={nextJourney}
              variant="default"
              onAddTransport={() => console.log("Add transport for next journey")}
              onEditTransport={() => console.log("Edit transport")}
              onEditFlight={() => console.log("Edit flight")}
            />
          </section>
        )}

        {/* Need Attention Section */}
        {journeysNeedingAttention.length > 0 && (
          <section className="mb-8">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">
              Needs Attention
            </h2>
            <div className="space-y-3">
              {journeysNeedingAttention.slice(0, 3).map((journey) => (
                <JourneyCard
                  key={journey.id}
                  journey={journey}
                  variant="compact"
                  onAddTransport={() => console.log("Add transport")}
                  onAddFlight={() => console.log("Add flight")}
                />
              ))}
            </div>
          </section>
        )}

        {/* All Journeys */}
        <section>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">
            All Journeys
          </h2>
          <div className="space-y-6">
            {journeyPairs.map((pair) => (
              <div key={pair.term.id}>
                {/* Term Header */}
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className={cn(
                      "w-2 h-2 rounded-full",
                      pair.term.school === "benenden" ? "bg-benenden" : "bg-wycombe"
                    )}
                  />
                  <h3 className="font-medium">{pair.term.name}</h3>
                  <Badge variant="secondary" className="text-[10px]">
                    {format(pair.term.startDate, "MMM d")} -{" "}
                    {format(pair.term.endDate, "MMM d")}
                  </Badge>
                </div>

                {/* Journeys for this term */}
                <div className="space-y-3 pl-5 border-l-2 border-border">
                  {pair.outbound && (
                    <JourneyCard
                      journey={pair.outbound}
                      variant="compact"
                      onAddTransport={() => console.log("Add transport outbound")}
                      onEditTransport={() => console.log("Edit transport outbound")}
                      onEditFlight={() => console.log("Edit flight outbound")}
                      onAddFlight={() => console.log("Add flight outbound")}
                    />
                  )}
                  {pair.return && (
                    <JourneyCard
                      journey={pair.return}
                      variant="compact"
                      onAddTransport={() => console.log("Add transport return")}
                      onEditTransport={() => console.log("Edit transport return")}
                      onEditFlight={() => console.log("Edit flight return")}
                      onAddFlight={() => console.log("Add flight return")}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-40">
        <div className="max-w-5xl mx-auto px-4 flex items-center justify-around py-2">
          <NavButton icon={<Plane className="w-5 h-5" />} label="Journeys" active />
          <NavButton icon={<Calendar className="w-5 h-5" />} label="Calendar" />
          <NavButton icon={<MapPin className="w-5 h-5" />} label="Track" />
          <NavButton icon={<Settings className="w-5 h-5" />} label="Settings" />
        </div>
      </nav>
    </div>
  );
}

// Sub-components

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: "primary" | "success" | "warning" | "danger";
}) {
  const colorClasses = {
    primary: "bg-primary/10 text-primary",
    success: "bg-journey-complete/10 text-journey-complete",
    warning: "bg-journey-pending/10 text-journey-pending",
    danger: "bg-journey-missing/10 text-journey-missing",
  };

  return (
    <Card className="p-4">
      <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center mb-2", colorClasses[color])}>
        {icon}
      </div>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </Card>
  );
}

function NavButton({
  icon,
  label,
  active,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}) {
  return (
    <button
      className={cn(
        "flex flex-col items-center gap-1 py-2 px-4 rounded-lg transition-colors",
        active ? "text-primary" : "text-muted-foreground hover:text-foreground"
      )}
    >
      {icon}
      <span className="text-[10px] font-medium">{label}</span>
    </button>
  );
}
