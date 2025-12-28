import { format, formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Share2, Clock, Hash, StickyNote, ChevronDown, ChevronUp } from "lucide-react";
import { Term } from "@/types/school";
import { NextTravelEntry } from "@/types/next-travel";

interface NextTravelHeroProps {
  isOnline: boolean;
  scope: "benenden" | "wycombe";
  onScopeChange: (scope: "benenden" | "wycombe") => void;
  entry: NextTravelEntry | null;
  entryDetail: string;
  isExpanded: boolean;
  onToggleExpanded: () => void;
  earliestTerm: Term | null;
  onAddFlight: (termId: string) => void;
  onAddTransport: (termId: string) => void;
  onViewTrip: (termId: string) => void;
  onManageBooking: (entry: NextTravelEntry) => void;
  onShare: () => void;
}

export function NextTravelHero({
  isOnline,
  scope,
  onScopeChange,
  entry,
  entryDetail,
  isExpanded,
  onToggleExpanded,
  earliestTerm,
  onAddFlight,
  onAddTransport,
  onViewTrip,
  onManageBooking,
  onShare,
}: NextTravelHeroProps) {
  return (
    <div className="rounded-2xl border border-border/70 bg-card/80 p-4 shadow-sm relative">
      {!isOnline && (
        <Badge className="absolute top-3 right-3" variant="secondary">
          Cached
        </Badge>
      )}
      <div className="flex items-center justify-between mb-4">
        <div className="text-xs uppercase text-muted-foreground tracking-wide">
          Next travel
        </div>
        <div className="flex rounded-full border border-border/60 bg-muted/40 p-0.5">
          {(["benenden", "wycombe"] as const).map(option => (
            <Button
              key={option}
              size="sm"
              variant={scope === option ? "default" : "ghost"}
              className="h-10 px-3 text-xs"
              onClick={() => onScopeChange(option)}
            >
              {option === "benenden" ? "Ben" : "WA"}
            </Button>
          ))}
        </div>
      </div>

      {entry ? (
        <div className="space-y-4">
          <div className="space-y-1 text-center sm:text-left">
            <div className="text-xs uppercase text-muted-foreground tracking-wide">Departing next</div>
            <div className="text-2xl font-semibold leading-tight truncate">{entry.title}</div>
            <p className="text-sm text-muted-foreground truncate">{entry.detail}</p>
          </div>
          <div className="grid gap-3 text-sm sm:grid-cols-3">
            <div className={tileClass}>
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-[11px] uppercase text-muted-foreground">Timing</p>
                <p className="font-semibold">{format(entry.date, "EEE, MMM d")}</p>
                <p className="text-muted-foreground">
                  {entry.meta?.timeLabel || format(entry.date, "h:mm a")}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {formatDistanceToNow(entry.date, { addSuffix: true })} · {entryDetail}
                </p>
              </div>
            </div>
            <div className={tileClass}>
              <Hash className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-[11px] uppercase text-muted-foreground">Confirmation</p>
                <p className="font-semibold">
                  {entry.meta?.confirmation ?? "Not provided"}
                </p>
                <p className="text-muted-foreground text-xs">Tap edit to update</p>
              </div>
            </div>
            <div className={tileClass}>
              <StickyNote className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-[11px] uppercase text-muted-foreground">Notes</p>
                <p className="font-semibold text-muted-foreground line-clamp-2">
                  {entry.meta?.notes ?? "No notes yet"}
                </p>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
            <Badge
              variant={entry.status === "booked" ? "default" : entry.status === "staying" ? "secondary" : "outline"}
              className={
                entry.school === "benenden"
                  ? "bg-blue-500 hover:bg-blue-600"
                  : "bg-green-500 hover:bg-green-600"
              }
            >
              {entry.status === "booked"
                ? "Booked"
                : entry.status === "staying"
                  ? "Not travelling"
                  : "Needs booking"}
            </Badge>
            {entry.termId && (
              <Button
                size="sm"
                variant="ghost"
                className="h-8 px-3 text-xs"
                onClick={() => onViewTrip(entry.termId!)}
              >
                View trip
              </Button>
            )}
            <Button
              size="sm"
              variant={entry.status === "booked" ? "outline" : "default"}
              className="h-8 px-3 text-xs"
              onClick={() => onManageBooking(entry)}
            >
              {entry.status === "booked" ? "Edit booking" : "Add booking"}
            </Button>
            <Button size="sm" variant="ghost" className="h-8 px-3 text-xs" onClick={onShare}>
              <Share2 className="h-3 w-3 mr-1" /> Share
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-8 px-3 text-xs gap-1"
              onClick={onToggleExpanded}
            >
              {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              {isExpanded ? "Hide details" : "More details"}
            </Button>
          </div>
          {isExpanded && (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <DetailTile label="Departure">
                <p className="text-sm font-semibold">{format(entry.date, "EEE, MMM d")}</p>
                <p className="text-xs text-muted-foreground">
                  {entry.meta?.timeLabel || format(entry.date, "h:mm a")}
                </p>
              </DetailTile>
              <DetailTile label="Time remaining">
                <p className="text-sm font-semibold">
                  {formatDistanceToNow(entry.date, { addSuffix: true })}
                </p>
                <p className="text-xs text-muted-foreground">{entryDetail}</p>
              </DetailTile>
              <DetailTile label="Confirmation">
                <p className="text-sm font-semibold">{entry.meta?.confirmation ?? "Not provided"}</p>
              </DetailTile>
              <DetailTile label="Notes">
                <p className="text-sm font-medium text-muted-foreground line-clamp-2">
                  {entry.meta?.notes ?? "No notes yet"}
                </p>
              </DetailTile>
            </div>
          )}
        </div>
      ) : (
        <EmptyState
          variant="trips"
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
    </div>
  );
}

const tileClass = "flex items-start gap-2 rounded-xl bg-muted/30 p-3";

function DetailTile({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-muted/40 border border-border/60 p-3 text-left">
      <p className="text-xs uppercase text-muted-foreground">{label}</p>
      {children}
    </div>
  );
}
