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
    <div className="relative overflow-hidden rounded-[28px] border border-border/30 bg-gradient-to-br from-card via-card to-muted/40 p-6 shadow-[0_30px_60px_rgba(15,23,42,0.15)]">
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/0 pointer-events-none" />
      {!isOnline && (
        <Badge className="absolute top-4 right-4 bg-white/10 backdrop-blur text-[11px]" variant="secondary">
          Offline cache
        </Badge>
      )}

      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 relative z-10">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Next travel</p>
          <h2 className="text-3xl font-semibold tracking-tight">{entry ? entry.title : "No travel booked"}</h2>
        </div>
        <div className="flex items-center gap-1 rounded-full border border-white/20 bg-white/5 p-1 backdrop-blur">
          {(["benenden", "wycombe"] as const).map(option => (
            <Button
              key={option}
              size="sm"
              variant={scope === option ? "default" : "ghost"}
              className={`h-9 rounded-full px-4 text-sm ${scope === option ? "bg-white text-card-foreground" : "text-white/70 hover:text-white"}`}
              onClick={() => onScopeChange(option)}
            >
              {option === "benenden" ? "Benenden" : "Wycombe"}
            </Button>
          ))}
        </div>
      </div>

      {entry ? (
        <div className="space-y-5 relative z-10">
          <p className="text-lg text-muted-foreground">{entry.detail}</p>
          <div className="grid gap-4 text-sm sm:grid-cols-3">
            <InfoTile
              label="Departure"
              primary={format(entry.date, "EEE, MMM d")}
              secondary={entry.meta?.timeLabel || format(entry.date, "h:mm a")}
              footnote={`${formatDistanceToNow(entry.date, { addSuffix: true })} · ${entryDetail}`}
              icon={<Clock className="h-4 w-4" />}
            />
            <InfoTile
              label="Confirmation"
              primary={entry.meta?.confirmation ?? "Not provided"}
              secondary="Tap edit to update"
              icon={<Hash className="h-4 w-4" />}
            />
            <InfoTile
              label="Notes"
              primary={entry.meta?.notes ?? "No notes yet"}
              icon={<StickyNote className="h-4 w-4" />}
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <StatusPill status={entry.status} school={entry.school} />
            {entry.termId && (
              <SubtleButton label="View trip" onClick={() => onViewTrip(entry.termId!)} />
            )}
            <Button
              size="sm"
              variant={entry.status === "booked" ? "outline" : "default"}
              className="rounded-full px-5"
              onClick={() => onManageBooking(entry)}
            >
              {entry.status === "booked" ? "Edit booking" : "Add booking"}
            </Button>
            <SubtleButton label="Share" icon={<Share2 className="h-3.5 w-3.5" />} onClick={onShare} />
            <SubtleButton
              label={isExpanded ? "Hide details" : "More details"}
              icon={isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
              onClick={onToggleExpanded}
            />
          </div>
          {isExpanded && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
        <div className="relative z-10">
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
        </div>
      )}
    </div>
  );
}

const InfoTile = ({
  label,
  primary,
  secondary,
  footnote,
  icon,
}: {
  label: string;
  primary: React.ReactNode;
  secondary?: React.ReactNode;
  footnote?: React.ReactNode;
  icon?: React.ReactNode;
}) => (
  <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
    <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-white/60">
      {icon}
      {label}
    </div>
    <p className="mt-2 text-base font-semibold text-white">{primary}</p>
    {secondary && <p className="text-sm text-white/70">{secondary}</p>}
    {footnote && <p className="text-xs text-white/60 mt-1">{footnote}</p>}
  </div>
);

const StatusPill = ({ status, school }: { status: NextTravelEntry["status"]; school: "benenden" | "wycombe" }) => {
  const colors =
    school === "benenden"
      ? "bg-purple-500/30 text-purple-50"
      : "bg-emerald-500/30 text-emerald-50";
  const label =
    status === "booked" ? "Booked" : status === "staying" ? "Not travelling" : "Needs booking";
  return (
    <span className={`rounded-full px-4 py-1 text-xs font-medium ${colors}`}>
      {label}
    </span>
  );
};

const SubtleButton = ({ label, icon, onClick }: { label: string; icon?: React.ReactNode; onClick: () => void }) => (
  <button
    type="button"
    onClick={onClick}
    className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-1.5 text-xs font-medium text-white/80 transition hover:border-white/40 hover:text-white"
  >
    {icon}
    {label}
  </button>
);

function DetailTile({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-muted/40 border border-border/60 p-3 text-left">
      <p className="text-xs uppercase text-muted-foreground">{label}</p>
      {children}
    </div>
  );
}
