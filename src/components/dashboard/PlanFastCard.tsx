import { Plane, BusFront, Share2, RefreshCw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface PlanFastCardProps {
  searchTerm: string;
  statusFilter: "all" | "booked" | "needs" | "staying";
  onSearchChange: (value: string) => void;
  onStatusChange: (value: PlanFastCardProps["statusFilter"]) => void;
  onAddFlight: () => void;
  onAddTransport: () => void;
  onShare: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  isBusy: boolean;
  contextLabel?: string;
}

export function PlanFastCard({
  searchTerm,
  statusFilter,
  onSearchChange,
  onStatusChange,
  onAddFlight,
  onAddTransport,
  onShare,
  onRefresh,
  isRefreshing,
  isBusy,
  contextLabel,
}: PlanFastCardProps) {
  return (
    <div className="rounded-[28px] border border-border/30 bg-card/95 p-6 shadow-[0_25px_45px_rgba(15,23,42,0.08)] space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Plan fast</p>
          <h3 className="text-2xl font-semibold tracking-tight">What's next?</h3>
        </div>
        <Button variant="ghost" size="sm" className="gap-2 rounded-full border border-border/40 px-4" onClick={onRefresh} disabled={isRefreshing}>
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>
      <div className="grid gap-3 sm:grid-cols-[minmax(0,3fr)_minmax(0,1.3fr)]">
        <Input
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search flights, transport, events"
          className="h-12 rounded-2xl border border-border/40 bg-muted/30 px-5 text-base"
        />
        <Select value={statusFilter} onValueChange={(value: PlanFastCardProps["statusFilter"]) => onStatusChange(value)}>
          <SelectTrigger className="h-12 rounded-2xl border border-border/40 bg-muted/30 px-5">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="booked">Booked</SelectItem>
            <SelectItem value="needs">Needs attention</SelectItem>
            <SelectItem value="staying">Staying</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <ActionButton
          label={contextLabel ? `Add flight (${contextLabel})` : "Add flight"}
          icon={<Plane className="h-4 w-4" />}
          onClick={onAddFlight}
          disabled={isBusy}
        />
        <ActionButton
          label={contextLabel ? `Add transport (${contextLabel})` : "Add transport"}
          icon={<BusFront className="h-4 w-4" />}
          onClick={onAddTransport}
          disabled={isBusy}
          variant="ghost"
        />
        <ActionButton
          label="Share schedule"
          icon={<Share2 className="h-4 w-4" />}
          onClick={onShare}
          variant="ghost"
        />
      </div>
      {contextLabel && (
        <p className="text-xs text-muted-foreground">
          Actions default to {contextLabel}. Switch schools or highlight a term to change context.
        </p>
      )}
    </div>
  );
}

const ActionButton = ({
  label,
  icon,
  onClick,
  disabled,
  variant = "secondary",
}: {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  variant?: "secondary" | "ghost";
}) => (
  <Button
    variant={variant}
    className={`h-12 w-full justify-between rounded-[18px] px-5 text-sm font-medium ${variant === "ghost" ? "border border-border/40 bg-transparent text-foreground" : ""}`}
    disabled={disabled}
    onClick={onClick}
  >
    <span className="flex items-center gap-3">
      {icon}
      {label}
    </span>
    <span className="text-muted-foreground">{">"}</span>
  </Button>
);
