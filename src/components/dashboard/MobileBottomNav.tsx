import { Button } from "@/components/ui/button";
import { CalendarDays, Home, Plane, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

export type MainNavTab = "today" | "trips" | "calendar" | "settings";

interface MobileBottomNavProps {
  activeTab: MainNavTab;
  onSelect: (tab: MainNavTab) => void;
}

const navItems: Array<{ key: MainNavTab; label: string; icon: typeof Home }> = [
  { key: "today", label: "Today", icon: Home },
  { key: "trips", label: "Trips", icon: Plane },
  { key: "calendar", label: "Calendar", icon: CalendarDays },
  { key: "settings", label: "Settings", icon: Settings },
];

export function MobileBottomNav({ activeTab, onSelect }: MobileBottomNavProps) {
  return (
    <div className="lg:hidden fixed inset-x-4 bottom-4 z-40" data-nav-touch="true">
      <div className="bg-card/95 backdrop-blur rounded-3xl border border-border/60 shadow-xl pb-[calc(env(safe-area-inset-bottom)+0.75rem)] pt-2 px-2">
        <div className="flex gap-2">
          {navItems.map(item => {
            const Icon = item.icon;
            const active = activeTab === item.key;
            return (
              <Button
                key={item.key}
                type="button"
                aria-pressed={active}
                variant={active ? "default" : "ghost"}
                className={cn(
                  "flex-1 flex flex-col items-center justify-center gap-1 h-14 rounded-2xl text-xs touch-manipulation transition-all",
                  active ? "shadow-lg" : "opacity-90"
                )}
                data-nav-touch="true"
                onClick={() => onSelect(item.key)}
              >
                <Icon className={cn("h-5 w-5", active && "fill-foreground")} />
                <span className="text-xs">{item.label}</span>
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
