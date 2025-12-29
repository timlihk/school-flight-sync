import { format, formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Share2, Clock, Hash, StickyNote } from "lucide-react";
import { Term } from "@/types/school";
import { NextTravelEntry } from "@/types/next-travel";
import { cn } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface NextTravelHeroProps {
  isOnline: boolean;
  scope: "benenden" | "wycombe";
  onScopeChange: (scope: "benenden" | "wycombe") => void;
  entry: NextTravelEntry | null;
  entryDetail: string;
  earliestTerm: Term | null;
  onAddFlight: (termId: string) => void;
  onAddTransport: (termId: string) => void;
  onShare: () => void;
}

export function NextTravelHero({
  isOnline,
  scope,
  onScopeChange,
  entry,
  entryDetail,
  earliestTerm,
  onAddFlight,
  onAddTransport,
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

      <div className="flex flex-wrap items-center justify-between gap-4 mb-5 relative z-10">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-white/60">Next travel</p>
          <h2 className="text-2xl font-semibold tracking-tight text-white">{entry ? entry.title : "No travel booked"}</h2>
        </div>
        <div className="flex items-center gap-1 rounded-full border border-white/15 bg-white/5 px-1 py-0.5 backdrop-blur">
          {(["benenden", "wycombe"] as const).map(option => (
            <button
              key={option}
              type="button"
              aria-pressed={scope === option}
              onClick={() => onScopeChange(option)}
              className={cn(
                "rounded-full px-3 py-1 text-[11px] font-medium tracking-tight transition",
                scope === option
                  ? "bg-white/25 text-white shadow-[0_8px_20px_rgba(15,23,42,0.25)]"
                  : "text-white/60 hover:text-white/90"
              )}
            >
              {option === "benenden" ? "Benenden" : "Wycombe"}
            </button>
          ))}
        </div>
      </div>

      {entry ? (
        <div className="space-y-4 relative z-10">
          <p className="text-base text-white/75">{entry.detail}</p>
          <div className="flex flex-wrap gap-2">
            <KeyChip
              label="Departure"
              value={`${format(entry.date, "EEE, MMM d")} · ${entry.meta?.timeLabel || format(entry.date, "h:mm a")}`}
              icon={<Clock className="h-3.5 w-3.5" />}
            />
            <KeyChip
              label="Time"
              value={`${formatDistanceToNow(entry.date, { addSuffix: true })} · ${entryDetail}`}
            />
            <KeyChip
              label="Confirmation"
              value={entry.meta?.confirmation ?? "Not provided"}
              icon={<Hash className="h-3.5 w-3.5" />}
            />
            <KeyChip
              label="Notes"
              value={entry.meta?.notes ?? "No notes yet"}
              icon={<StickyNote className="h-3.5 w-3.5" />}
            />
          </div>
        <div className="flex flex-wrap items-center gap-3">
          <StatusPill status={entry.status} school={entry.school} />
          <SubtleButton label="Share" icon={<Share2 className="h-3.5 w-3.5" />} onClick={onShare} />
        </div>
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

const KeyChip = ({
  label,
  value,
  icon,
}: {
  label: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
}) => (
  <div className="flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs text-white/80 backdrop-blur">
    {icon}
    <span className="uppercase tracking-[0.2em] text-[9px] text-white/60">{label}</span>
    <span className="text-sm font-medium text-white/90">{value}</span>
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
