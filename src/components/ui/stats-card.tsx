import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  icon: LucideIcon;
  label: string;
  value: number | string;
  trend?: {
    direction: "up" | "down" | "neutral";
    value: string;
  };
  color: "primary" | "success" | "warning" | "danger" | "benenden" | "wycombe";
  variant?: "default" | "glass" | "minimal";
  className?: string;
  onClick?: () => void;
}

const colorVariants = {
  primary: {
    bg: "bg-primary/10",
    text: "text-primary",
    border: "border-primary/20",
    glow: "shadow-glow-primary",
    gradient: "from-primary/20 to-primary/5",
  },
  success: {
    bg: "bg-journey-complete/10",
    text: "text-journey-complete",
    border: "border-journey-complete/20",
    glow: "shadow-glow-success",
    gradient: "from-journey-complete/20 to-journey-complete/5",
  },
  warning: {
    bg: "bg-journey-pending/10",
    text: "text-journey-pending",
    border: "border-journey-pending/20",
    glow: "",
    gradient: "from-journey-pending/20 to-journey-pending/5",
  },
  danger: {
    bg: "bg-journey-missing/10",
    text: "text-journey-missing",
    border: "border-journey-missing/20",
    glow: "",
    gradient: "from-journey-missing/20 to-journey-missing/5",
  },
  benenden: {
    bg: "bg-benenden/10",
    text: "text-benenden",
    border: "border-benenden/20",
    glow: "shadow-glow-benenden",
    gradient: "from-benenden/20 to-benenden/5",
  },
  wycombe: {
    bg: "bg-wycombe/10",
    text: "text-wycombe",
    border: "border-wycombe/20",
    glow: "shadow-glow-wycombe",
    gradient: "from-wycombe/20 to-wycombe/5",
  },
};

export function StatsCard({
  icon: Icon,
  label,
  value,
  trend,
  color,
  variant = "default",
  className,
  onClick,
}: StatsCardProps) {
  const colors = colorVariants[color];

  if (variant === "glass") {
    return (
      <div
        onClick={onClick}
        className={cn(
          "glass-card p-4 cursor-pointer glass-hover interactive",
          className
        )}
      >
        <div className="flex items-start justify-between">
          <div
            className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center",
              colors.bg
            )}
          >
            <Icon className={cn("w-5 h-5", colors.text)} />
          </div>
          {trend && (
            <span
              className={cn(
                "text-xs font-medium px-2 py-0.5 rounded-full",
                trend.direction === "up" && "bg-journey-complete/10 text-journey-complete",
                trend.direction === "down" && "bg-journey-missing/10 text-journey-missing",
                trend.direction === "neutral" && "bg-muted text-muted-foreground"
              )}
            >
              {trend.direction === "up" && "↑"}
              {trend.direction === "down" && "↓"}
              {trend.value}
            </span>
          )}
        </div>
        <div className="mt-3">
          <p className="text-2xl font-bold tracking-tight">{value}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
        </div>
      </div>
    );
  }

  if (variant === "minimal") {
    return (
      <div
        onClick={onClick}
        className={cn(
          "flex items-center gap-3 p-3 rounded-xl border bg-card interactive cursor-pointer",
          "hover:border-primary/20 hover:shadow-elevated transition-all",
          className
        )}
      >
        <div
          className={cn(
            "w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0",
            colors.bg
          )}
        >
          <Icon className={cn("w-4 h-4", colors.text)} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">{value}</p>
          <p className="text-xs text-muted-foreground truncate">{label}</p>
        </div>
      </div>
    );
  }

  // Default variant with gradient background
  return (
    <div
      onClick={onClick}
      className={cn(
        "relative overflow-hidden rounded-2xl border p-4 cursor-pointer interactive",
        "bg-gradient-to-br",
        colors.gradient,
        colors.border,
        className
      )}
    >
      {/* Decorative background element */}
      <div
        className={cn(
          "absolute -right-4 -top-4 w-20 h-20 rounded-full opacity-20 blur-2xl",
          colors.bg.replace("/10", "")
        )}
      />

      <div className="relative">
        <div className="flex items-start justify-between">
          <div
            className={cn(
              "w-11 h-11 rounded-xl flex items-center justify-center backdrop-blur-sm",
              "bg-white/50 dark:bg-black/20",
              colors.border
            )}
          >
            <Icon className={cn("w-5 h-5", colors.text)} />
          </div>
          {trend && (
            <span
              className={cn(
                "text-xs font-medium px-2 py-0.5 rounded-full backdrop-blur-sm",
                "bg-white/50 dark:bg-black/20",
                trend.direction === "up" && "text-journey-complete",
                trend.direction === "down" && "text-journey-missing",
                trend.direction === "neutral" && "text-muted-foreground"
              )}
            >
              {trend.direction === "up" && "↑"}
              {trend.direction === "down" && "↓"}
              {trend.value}
            </span>
          )}
        </div>

        <div className="mt-4">
          <p className="text-3xl font-bold tracking-tight">{value}</p>
          <p className="text-sm text-muted-foreground mt-1">{label}</p>
        </div>
      </div>
    </div>
  );
}

// Compact stat pill for inline use
interface StatPillProps {
  icon?: LucideIcon;
  label: string;
  value: string | number;
  color?: "default" | "primary" | "success" | "warning" | "danger";
  className?: string;
}

export function StatPill({
  icon: Icon,
  label,
  value,
  color = "default",
  className,
}: StatPillProps) {
  const colorClasses = {
    default: "bg-muted text-muted-foreground",
    primary: "bg-primary/10 text-primary",
    success: "bg-journey-complete/10 text-journey-complete",
    warning: "bg-journey-pending/10 text-journey-pending",
    danger: "bg-journey-missing/10 text-journey-missing",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm",
        colorClasses[color],
        className
      )}
    >
      {Icon && <Icon className="w-3.5 h-3.5" />}
      <span className="font-medium">{value}</span>
      <span className="opacity-70">{label}</span>
    </div>
  );
}

// Stat group for dashboard headers
interface StatGroupProps {
  stats: {
    label: string;
    value: string | number;
    icon?: LucideIcon;
  }[];
  className?: string;
}

export function StatGroup({ stats, className }: StatGroupProps) {
  return (
    <div className={cn("flex flex-wrap items-center gap-4", className)}>
      {stats.map((stat, index) => (
        <div key={index} className="flex items-center gap-2">
          {stat.icon && <stat.icon className="w-4 h-4 text-muted-foreground" />}
          <span className="text-sm">
            <span className="font-semibold">{stat.value}</span>{" "}
            <span className="text-muted-foreground">{stat.label}</span>
          </span>
        </div>
      ))}
    </div>
  );
}
