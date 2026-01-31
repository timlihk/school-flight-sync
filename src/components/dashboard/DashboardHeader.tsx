import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plane,
  LogOut,
  Settings,
  User,
  Bell,
  ChevronDown,
  RefreshCw,
  Share2,
  Printer,
} from "lucide-react";

interface DashboardHeaderProps {
  notifications?: number;
  isRefreshing?: boolean;
  onRefresh?: () => void;
  onShare?: () => void;
  onPrint?: () => void;
  onLogout?: () => void;
  className?: string;
}

export function DashboardHeader({
  notifications = 0,
  isRefreshing = false,
  onRefresh,
  onShare,
  onPrint,
  onLogout,
  className,
}: DashboardHeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);

  // Handle scroll effect
  if (typeof window !== "undefined") {
    window.addEventListener("scroll", () => {
      setIsScrolled(window.scrollY > 10);
    });
  }

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-all duration-300",
        isScrolled
          ? "bg-card/80 backdrop-blur-xl border-b border-border shadow-sm"
          : "bg-transparent",
        className
      )}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center",
                "bg-gradient-to-br from-primary to-primary/80",
                "shadow-glow-primary"
              )}
            >
              <Plane className="w-5 h-5 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="font-semibold text-lg leading-tight">
                School Flight Sync
              </h1>
              <p className="text-xs text-muted-foreground">Journey Planner</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Refresh Button */}
            {onRefresh && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onRefresh}
                disabled={isRefreshing}
                className="relative"
              >
                <RefreshCw
                  className={cn("w-5 h-5", isRefreshing && "animate-spin")}
                />
              </Button>
            )}

            {/* Notifications */}
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5" />
              {notifications > 0 && (
                <>
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-journey-pending rounded-full" />
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-journey-pending rounded-full animate-ping" />
                </>
              )}
            </Button>

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-9 w-9 rounded-full"
                >
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center border border-border">
                    <User className="w-4 h-4 text-muted-foreground" />
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex items-center gap-2 p-2">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex flex-col space-y-0.5">
                    <p className="text-sm font-medium">Family Account</p>
                    <p className="text-xs text-muted-foreground">
                      Private Access
                    </p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                {onShare && (
                  <DropdownMenuItem onClick={onShare}>
                    <Share2 className="mr-2 h-4 w-4" />
                    <span>Share Schedule</span>
                  </DropdownMenuItem>
                )}
                {onPrint && (
                  <DropdownMenuItem onClick={onPrint}>
                    <Printer className="mr-2 h-4 w-4" />
                    <span>Print View</span>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem disabled>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                  <Badge variant="secondary" className="ml-auto text-[10px]">
                    Soon
                  </Badge>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {onLogout && (
                  <DropdownMenuItem onClick={onLogout} className="text-journey-missing">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}

// School selector pills
interface SchoolSelectorProps {
  selected: "both" | "benenden" | "wycombe";
  onSelect: (school: "both" | "benenden" | "wycombe") => void;
  className?: string;
}

export function SchoolSelector({
  selected,
  onSelect,
  className,
}: SchoolSelectorProps) {
  const options = [
    { value: "both" as const, label: "All Schools", icon: null },
    { value: "benenden" as const, label: "Benenden", icon: null },
    { value: "wycombe" as const, label: "Wycombe", icon: null },
  ];

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onSelect(option.value)}
          className={cn(
            "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
            "border-2",
            selected === option.value
              ? option.value === "benenden"
                ? "bg-benenden text-white border-benenden shadow-glow-benenden"
                : option.value === "wycombe"
                ? "bg-wycombe text-white border-wycombe shadow-glow-wycombe"
                : "bg-primary text-white border-primary shadow-glow-primary"
              : "bg-card text-muted-foreground border-border hover:border-primary/30 hover:text-foreground"
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

// Quick stats bar
interface QuickStatsProps {
  stats: {
    label: string;
    value: number | string;
    color?: "default" | "primary" | "success" | "warning" | "danger";
  }[];
  className?: string;
}

export function QuickStats({ stats, className }: QuickStatsProps) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-4 p-4 rounded-2xl bg-card border",
        className
      )}
    >
      {stats.map((stat, index) => (
        <div key={index} className="flex items-center gap-2">
          <span
            className={cn(
              "text-lg font-bold",
              stat.color === "success" && "text-journey-complete",
              stat.color === "warning" && "text-journey-pending",
              stat.color === "danger" && "text-journey-missing",
              stat.color === "primary" && "text-primary",
              (!stat.color || stat.color === "default") && "text-foreground"
            )}
          >
            {stat.value}
          </span>
          <span className="text-sm text-muted-foreground">{stat.label}</span>
          {index < stats.length - 1 && (
            <div className="w-px h-4 bg-border ml-2" />
          )}
        </div>
      ))}
    </div>
  );
}
