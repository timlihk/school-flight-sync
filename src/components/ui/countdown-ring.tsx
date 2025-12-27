import { memo, useMemo } from "react";
import { differenceInDays, differenceInHours, isToday, isTomorrow } from "date-fns";
import { cn } from "@/lib/utils";

interface CountdownRingProps {
  targetDate: Date;
  size?: 'sm' | 'md' | 'lg';
  school?: 'benenden' | 'wycombe';
  className?: string;
}

export const CountdownRing = memo(function CountdownRing({
  targetDate,
  size = 'md',
  school,
  className
}: CountdownRingProps) {
  const { days, hours, label, progress, isUrgent, isPast } = useMemo(() => {
    const now = new Date();
    const diffDays = differenceInDays(targetDate, now);
    const diffHours = differenceInHours(targetDate, now) % 24;

    // Calculate progress (max 30 days = 100%)
    const maxDays = 30;
    const progressValue = Math.max(0, Math.min(100, ((maxDays - diffDays) / maxDays) * 100));

    let displayLabel = '';
    if (diffDays < 0) {
      displayLabel = 'Past';
    } else if (isToday(targetDate)) {
      displayLabel = 'Today';
    } else if (isTomorrow(targetDate)) {
      displayLabel = 'Tomorrow';
    } else if (diffDays < 7) {
      displayLabel = `${diffDays} days`;
    } else if (diffDays < 14) {
      displayLabel = '1 week';
    } else if (diffDays < 21) {
      displayLabel = '2 weeks';
    } else if (diffDays < 28) {
      displayLabel = '3 weeks';
    } else {
      displayLabel = `${Math.floor(diffDays / 7)} weeks`;
    }

    return {
      days: Math.max(0, diffDays),
      hours: Math.max(0, diffHours),
      label: displayLabel,
      progress: progressValue,
      isUrgent: diffDays <= 3 && diffDays >= 0,
      isPast: diffDays < 0
    };
  }, [targetDate]);

  const sizeConfig = {
    sm: { ring: 64, stroke: 4, text: 'text-lg', label: 'text-[10px]' },
    md: { ring: 88, stroke: 5, text: 'text-2xl', label: 'text-xs' },
    lg: { ring: 120, stroke: 6, text: 'text-4xl', label: 'text-sm' }
  };

  const config = sizeConfig[size];
  const radius = (config.ring - config.stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const ringColor = useMemo(() => {
    if (isPast) return 'stroke-muted-foreground';
    if (isUrgent) return 'stroke-orange-500';
    if (school === 'benenden') return 'stroke-blue-500';
    if (school === 'wycombe') return 'stroke-green-500';
    return 'stroke-primary';
  }, [isPast, isUrgent, school]);

  const bgRingColor = useMemo(() => {
    if (school === 'benenden') return 'stroke-blue-500/20';
    if (school === 'wycombe') return 'stroke-green-500/20';
    return 'stroke-muted';
  }, [school]);

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg
        width={config.ring}
        height={config.ring}
        viewBox={`0 0 ${config.ring} ${config.ring}`}
        className="transform -rotate-90"
      >
        {/* Background ring */}
        <circle
          cx={config.ring / 2}
          cy={config.ring / 2}
          r={radius}
          fill="none"
          strokeWidth={config.stroke}
          className={bgRingColor}
        />
        {/* Progress ring */}
        <circle
          cx={config.ring / 2}
          cy={config.ring / 2}
          r={radius}
          fill="none"
          strokeWidth={config.stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className={cn(ringColor, "transition-all duration-500 ease-out")}
        />
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {isPast ? (
          <span className={cn(config.label, "text-muted-foreground font-medium")}>Past</span>
        ) : isToday(targetDate) ? (
          <>
            <span className={cn(config.text, "font-bold leading-none", isUrgent && "text-orange-500")}>
              Now
            </span>
            <span className={cn(config.label, "text-muted-foreground mt-0.5")}>Today</span>
          </>
        ) : (
          <>
            <span className={cn(config.text, "font-bold leading-none", isUrgent && "text-orange-500")}>
              {days}
            </span>
            <span className={cn(config.label, "text-muted-foreground mt-0.5")}>
              {days === 1 ? 'day' : 'days'}
            </span>
          </>
        )}
      </div>
    </div>
  );
});

export default CountdownRing;
