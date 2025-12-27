import { memo, ReactNode } from "react";
import { Plane, Car, Calendar, Clock, MapPin, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type EmptyStateVariant = 'trips' | 'flights' | 'transport' | 'calendar' | 'week' | 'generic';

interface EmptyStateAction {
  label: string;
  onClick: () => void;
  variant?: 'default' | 'outline' | 'secondary';
  icon?: ReactNode;
}

interface EmptyStateProps {
  variant?: EmptyStateVariant;
  title?: string;
  description?: string;
  actions?: EmptyStateAction[];
  className?: string;
  compact?: boolean;
}

const variantConfig: Record<EmptyStateVariant, {
  icon: ReactNode;
  title: string;
  description: string;
  gradient: string;
}> = {
  trips: {
    icon: <Plane className="h-8 w-8" />,
    title: "No upcoming trips",
    description: "Add flights or transport to see your travel timeline here.",
    gradient: "from-blue-500/20 to-purple-500/20"
  },
  flights: {
    icon: <Plane className="h-8 w-8" />,
    title: "No flights booked",
    description: "Add a flight to track your journey.",
    gradient: "from-blue-500/20 to-sky-500/20"
  },
  transport: {
    icon: <Car className="h-8 w-8" />,
    title: "No transport arranged",
    description: "Add pickup details for school runs.",
    gradient: "from-green-500/20 to-emerald-500/20"
  },
  calendar: {
    icon: <Calendar className="h-8 w-8" />,
    title: "No events on this date",
    description: "Select a date with colored dots to see events.",
    gradient: "from-purple-500/20 to-pink-500/20"
  },
  week: {
    icon: <Clock className="h-8 w-8" />,
    title: "Clear week ahead",
    description: "No travel scheduled. Enjoy the downtime!",
    gradient: "from-amber-500/20 to-orange-500/20"
  },
  generic: {
    icon: <MapPin className="h-8 w-8" />,
    title: "Nothing here yet",
    description: "Get started by adding some data.",
    gradient: "from-gray-500/20 to-slate-500/20"
  }
};

export const EmptyState = memo(function EmptyState({
  variant = 'generic',
  title,
  description,
  actions,
  className,
  compact = false
}: EmptyStateProps) {
  const config = variantConfig[variant];

  return (
    <div className={cn(
      "flex flex-col items-center justify-center text-center",
      compact ? "py-6 px-4" : "py-12 px-6",
      className
    )}>
      {/* Icon with gradient background */}
      <div className={cn(
        "rounded-full flex items-center justify-center mb-4 bg-gradient-to-br",
        config.gradient,
        compact ? "w-12 h-12" : "w-16 h-16"
      )}>
        <div className="text-muted-foreground">
          {config.icon}
        </div>
      </div>

      {/* Title */}
      <h3 className={cn(
        "font-semibold mb-1",
        compact ? "text-base" : "text-lg"
      )}>
        {title || config.title}
      </h3>

      {/* Description */}
      <p className={cn(
        "text-muted-foreground max-w-xs mb-4",
        compact ? "text-xs" : "text-sm"
      )}>
        {description || config.description}
      </p>

      {/* Actions */}
      {actions && actions.length > 0 && (
        <div className={cn(
          "flex gap-2",
          compact ? "flex-row" : "flex-col sm:flex-row"
        )}>
          {actions.map((action, index) => (
            <Button
              key={index}
              variant={action.variant || (index === 0 ? 'default' : 'outline')}
              size={compact ? "sm" : "default"}
              onClick={action.onClick}
              className="gap-2"
            >
              {action.icon || <Plus className="h-4 w-4" />}
              {action.label}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
});

export default EmptyState;
