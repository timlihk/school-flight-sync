import { NextTravelHero } from "@/components/dashboard/NextTravelHero";
import { NextTravelEntry } from "@/types/next-travel";
import { Term } from "@/types/school";

interface TodayTabProps {
  heroEntry: NextTravelEntry | null;
  heroScope: "benenden" | "wycombe";
  onHeroScopeChange: (scope: "benenden" | "wycombe") => void;
  isOnline: boolean;
  earliestTerm: Term | null;
  onAddFlight: (termId: string) => void;
  onAddTransport: (termId: string) => void;
  onShareHero: () => void;
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
    </div>
  );
}
