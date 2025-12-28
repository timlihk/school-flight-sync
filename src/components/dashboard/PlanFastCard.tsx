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
    <div className="rounded-2xl border border-border/70 bg-card/80 p-4 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] uppercase text-muted-foreground">Actions</p>
          <h3 className="text-xl font-semibold">Plan fast</h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="gap-2"
          onClick={onRefresh}
          disabled={isRefreshing}
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>
      <div className="space-y-4">
        <div className="grid gap-3 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <Input
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search flights, transport, events"
            className="h-11 w-full"
          />
          <Select value={statusFilter} onValueChange={(value: PlanFastCardProps["statusFilter"]) => onStatusChange(value)}>
            <SelectTrigger className="h-11 w-full">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="booked">Booked</SelectItem>
              <SelectItem value="needs">Needs booking</SelectItem>
              <SelectItem value="staying">Staying</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          <Button
            variant="secondary"
            className="h-12 w-full justify-start gap-3"
            disabled={isBusy}
            onClick={onAddFlight}
          >
            <Plane className="h-4 w-4" />
            {contextLabel ? `Add flight (${contextLabel})` : "Add flight"}
          </Button>
          <Button
            variant="outline"
            className="h-12 w-full justify-start gap-3"
            disabled={isBusy}
            onClick={onAddTransport}
          >
            <BusFront className="h-4 w-4" />
            {contextLabel ? `Add transport (${contextLabel})` : "Add transport"}
          </Button>
          <Button
            variant="ghost"
            className="h-12 w-full justify-start gap-3"
            onClick={onShare}
          >
            <Share2 className="h-4 w-4" />
            Share schedule
          </Button>
        </div>
        {contextLabel && (
          <p className="text-xs text-muted-foreground">
            Actions default to {contextLabel}. Switch schools or highlight a term to change context.
          </p>
        )}
      </div>
    </div>
  );
}
