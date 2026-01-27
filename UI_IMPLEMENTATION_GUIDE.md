# UI Implementation Guide - "Aether" Design System

## Quick Start: CSS Variables Update

First, update the CSS variables in `src/index.css`:

```css
@layer base {
  :root {
    /* Core Background */
    --background: 0 0% 100%;
    --foreground: 222 47% 11%;
    
    /* Card System */
    --card: 0 0% 100%;
    --card-foreground: 222 47% 11%;
    --card-elevated: 0 0% 100%;
    
    /* Primary - Neutral Slate */
    --primary: 222 47% 11%;
    --primary-foreground: 0 0% 100%;
    
    /* Secondary - Subtle Gray */
    --secondary: 210 40% 96%;
    --secondary-foreground: 222 47% 11%;
    
    /* Muted */
    --muted: 210 40% 96%;
    --muted-foreground: 215 16% 47%;
    
    /* Accent - Blue for actions */
    --accent: 217 91% 60%;
    --accent-foreground: 0 0% 100%;
    
    /* Destructive */
    --destructive: 0 84% 60%;
    --destructive-foreground: 0 0% 100%;
    
    /* Borders */
    --border: 214 32% 91%;
    --border-subtle: 210 40% 96%;
    --input: 214 32% 91%;
    --ring: 217 91% 60%;
    
    /* Radius */
    --radius: 0.75rem;
    
    /* School Colors */
    --benenden: 262 56% 34%;
    --benenden-light: 262 56% 96%;
    --wycombe: 168 76% 32%;
    --wycombe-light: 168 76% 96%;
    
    /* Semantic Colors */
    --flight: 217 91% 60%;
    --flight-light: 217 91% 96%;
    --transport: 35 95% 53%;
    --transport-light: 35 95% 96%;
    --success: 142 76% 36%;
    --warning: 38 92% 50%;
    --error: 0 84% 60%;
  }

  .dark {
    --background: 222 47% 6%;
    --foreground: 210 40% 98%;
    
    --card: 222 47% 8%;
    --card-foreground: 210 40% 98%;
    --card-elevated: 222 47% 11%;
    
    --primary: 210 40% 98%;
    --primary-foreground: 222 47% 11%;
    
    --secondary: 217 33% 17%;
    --secondary-foreground: 210 40% 98%;
    
    --muted: 217 33% 17%;
    --muted-foreground: 215 20% 65%;
    
    --accent: 217 91% 65%;
    --accent-foreground: 222 47% 11%;
    
    --destructive: 0 62% 30%;
    --destructive-foreground: 210 40% 98%;
    
    --border: 217 33% 17%;
    --border-subtle: 217 33% 14%;
    --input: 217 33% 17%;
    --ring: 217 91% 65%;
    
    /* School Colors - Lighter for dark mode */
    --benenden: 262 70% 65%;
    --benenden-light: 262 30% 20%;
    --wycombe: 168 60% 45%;
    --wycombe-light: 168 30% 18%;
    
    /* Semantic Colors - Brighter for dark mode */
    --flight: 217 91% 65%;
    --flight-light: 217 50% 20%;
    --transport: 35 92% 55%;
    --transport-light: 35 50% 18%;
  }
}
```

---

## Component Implementations

### 1. New TripCard Component

Create `src/components/ui/trip-card.tsx`:

```tsx
import { format, differenceInDays } from "date-fns";
import { 
  Plane, 
  Car, 
  Calendar, 
  ChevronRight,
  AlertCircle,
  CheckCircle2 
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Term, FlightDetails, TransportDetails } from "@/types/school";

interface TripCardProps {
  term: Term;
  departureFlight?: FlightDetails;
  returnFlight?: FlightDetails;
  departureTransport?: TransportDetails;
  returnTransport?: TransportDetails;
  status: 'complete' | 'needs-flight' | 'needs-transport' | 'unplanned' | 'not-travelling';
  onEdit: () => void;
  className?: string;
}

export function TripCard({
  term,
  departureFlight,
  returnFlight,
  departureTransport,
  returnTransport,
  status,
  onEdit,
  className
}: TripCardProps) {
  const duration = differenceInDays(term.endDate, term.startDate);
  const schoolColor = term.school === 'benenden' ? 'benenden' : 'wycombe';
  
  const getStatusIcon = () => {
    switch (status) {
      case 'complete': return <CheckCircle2 className="w-4 h-4 text-success" />;
      case 'not-travelling': return <CheckCircle2 className="w-4 h-4 text-muted-foreground" />;
      default: return <AlertCircle className="w-4 h-4 text-warning" />;
    }
  };

  return (
    <Card 
      className={cn(
        "relative overflow-hidden transition-all duration-200",
        "hover:shadow-md hover:scale-[1.01]",
        "cursor-pointer group",
        className
      )}
    >
      {/* School color indicator */}
      <div 
        className={cn(
          "absolute left-0 top-0 bottom-0 w-1",
          term.school === 'benenden' ? "bg-benenden" : "bg-wycombe"
        )} 
      />
      
      <div className="p-5 pl-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-lg">{term.name}</h3>
              <Badge 
                variant="secondary" 
                className={cn(
                  "text-[10px] font-medium",
                  term.school === 'benenden' 
                    ? "bg-benenden-light text-benenden" 
                    : "bg-wycombe-light text-wycombe"
                )}
              >
                {term.school === 'benenden' ? 'Benenden' : 'Wycombe'}
              </Badge>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="w-3.5 h-3.5" />
              <span>
                {format(term.startDate, 'MMM d')} - {format(term.endDate, 'MMM d, yyyy')}
              </span>
              <span className="text-muted-foreground/60">({duration} days)</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>

        {/* Trip Timeline */}
        <div className="space-y-4">
          {/* Departure */}
          <TripLeg
            direction="outbound"
            flight={departureFlight}
            transport={departureTransport}
            schoolColor={schoolColor}
          />
          
          {/* Return */}
          <TripLeg
            direction="return"
            flight={returnFlight}
            transport={returnTransport}
            schoolColor={schoolColor}
          />
        </div>
      </div>
    </Card>
  );
}

// Trip Leg Sub-component
interface TripLegProps {
  direction: 'outbound' | 'return';
  flight?: FlightDetails;
  transport?: TransportDetails;
  schoolColor: string;
}

function TripLeg({ direction, flight, transport, schoolColor }: TripLegProps) {
  const isComplete = flight && transport;
  const isPartial = flight || transport;
  const isEmpty = !flight && !transport;
  
  return (
    <div className="relative pl-4 border-l-2 border-dashed border-border">
      {/* Connection dot */}
      <div 
        className={cn(
          "absolute -left-[5px] top-0 w-2 h-2 rounded-full",
          isComplete ? "bg-success" : isPartial ? "bg-warning" : "bg-border"
        )} 
      />
      
      <div className="pb-2">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
          {direction === 'outbound' ? 'Departure' : 'Return'}
        </p>
        
        {isEmpty ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="italic">Not booked</span>
          </div>
        ) : (
          <div className="space-y-2">
            {flight && (
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center",
                  "bg-flight-light text-flight"
                )}>
                  <Plane className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">
                    {flight.airline} {flight.flightNumber}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {flight.departure.airport} → {flight.arrival.airport}
                  </p>
                </div>
                <p className="text-sm font-medium">
                  {format(flight.departure.date, 'MMM d')}
                </p>
              </div>
            )}
            
            {transport && (
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center",
                  "bg-transport-light text-transport"
                )}>
                  <Car className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">
                    {transport.type === 'school-coach' ? 'School Coach' : 'Taxi'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {transport.pickupTime} • {transport.driverName || 'Driver TBD'}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
```

### 2. Dashboard Stat Card

Create `src/components/ui/stat-card.tsx`:

```tsx
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface StatCardProps {
  value: string | number;
  label: string;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  className?: string;
}

export function StatCard({ 
  value, 
  label, 
  icon, 
  trend, 
  trendValue,
  className 
}: StatCardProps) {
  return (
    <div 
      className={cn(
        "p-4 rounded-xl border bg-card",
        "hover:border-border/80 transition-colors",
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className={cn(
          "w-10 h-10 rounded-lg flex items-center justify-center",
          "bg-secondary text-secondary-foreground"
        )}>
          {icon}
        </div>
        {trend && (
          <div className={cn(
            "flex items-center gap-1 text-xs font-medium",
            trend === 'up' && "text-success",
            trend === 'down' && "text-error",
            trend === 'neutral' && "text-muted-foreground"
          )}>
            {trend === 'up' && <TrendingUp className="w-3 h-3" />}
            {trend === 'down' && <TrendingDown className="w-3 h-3" />}
            {trend === 'neutral' && <Minus className="w-3 h-3" />}
            {trendValue}
          </div>
        )}
      </div>
      <div className="mt-3">
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-sm text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}
```

### 3. Redesigned Bottom Navigation

Create `src/components/ui/bottom-nav.tsx`:

```tsx
import { cn } from "@/lib/utils";
import { Home, Plane, Calendar, Bell, User } from "lucide-react";

export type NavTab = 'home' | 'trips' | 'calendar' | 'notifications' | 'profile';

interface BottomNavProps {
  activeTab: NavTab;
  onSelect: (tab: NavTab) => void;
  notificationCount?: number;
}

const navItems: Array<{
  key: NavTab;
  label: string;
  icon: typeof Home;
}> = [
  { key: 'home', label: 'Home', icon: Home },
  { key: 'trips', label: 'Trips', icon: Plane },
  { key: 'calendar', label: 'Calendar', icon: Calendar },
  { key: 'notifications', label: 'Alerts', icon: Bell },
  { key: 'profile', label: 'Profile', icon: User },
];

export function BottomNav({ activeTab, onSelect, notificationCount }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border">
      <div className="flex items-center justify-around px-2 pb-safe">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.key;
          
          return (
            <button
              key={item.key}
              onClick={() => onSelect(item.key)}
              className={cn(
                "flex flex-col items-center justify-center flex-1 py-2 px-3",
                "transition-colors duration-200",
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <div className="relative">
                <Icon className={cn(
                  "w-5 h-5 transition-transform duration-200",
                  isActive && "scale-110"
                )} />
                {item.key === 'notifications' && notificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-error text-error-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
                    {notificationCount > 9 ? '9+' : notificationCount}
                  </span>
                )}
              </div>
              <span className={cn(
                "text-[10px] font-medium mt-1",
                isActive && "font-semibold"
              )}>
                {item.label}
              </span>
              {isActive && (
                <div className="absolute bottom-0 w-8 h-0.5 bg-primary rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
```

### 4. Empty State Component (Enhanced)

Update `src/components/ui/empty-state.tsx`:

```tsx
import { cn } from "@/lib/utils";
import { Plane, Calendar, ClipboardList, Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  variant: 'trips' | 'calendar' | 'tasks' | 'notifications';
  title?: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  compact?: boolean;
  className?: string;
}

const variantConfig = {
  trips: {
    icon: Plane,
    defaultTitle: 'No trips planned',
    defaultDescription: 'Add a flight to get started with your travel planning.',
  },
  calendar: {
    icon: Calendar,
    defaultTitle: 'No upcoming events',
    defaultDescription: 'Your calendar is clear for the selected period.',
  },
  tasks: {
    icon: ClipboardList,
    defaultTitle: 'All caught up',
    defaultDescription: 'You have no pending tasks.',
  },
  notifications: {
    icon: Inbox,
    defaultTitle: 'No notifications',
    defaultDescription: 'You\'re all caught up!',
  },
};

export function EmptyState({
  variant,
  title,
  description,
  action,
  compact,
  className,
}: EmptyStateProps) {
  const config = variantConfig[variant];
  const Icon = config.icon;

  if (compact) {
    return (
      <div className={cn("text-center py-8", className)}>
        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
          <Icon className="w-5 h-5 text-muted-foreground" />
        </div>
        <p className="text-sm font-medium text-foreground">{title || config.defaultTitle}</p>
        <p className="text-xs text-muted-foreground mt-1">{description || config.defaultDescription}</p>
        {action && (
          <Button size="sm" className="mt-3" onClick={action.onClick}>
            {action.label}
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col items-center justify-center py-12 px-4", className)}>
      <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
        <Icon className="w-7 h-7 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold text-foreground">{title || config.defaultTitle}</h3>
      <p className="text-sm text-muted-foreground mt-1 text-center max-w-xs">
        {description || config.defaultDescription}
      </p>
      {action && (
        <Button className="mt-4" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}
```

---

## Page Layout Examples

### Dashboard (Today Tab)

```tsx
// src/pages/Dashboard.tsx
import { StatCard } from "@/components/ui/stat-card";
import { TripCard } from "@/components/ui/trip-card";
import { EmptyState } from "@/components/ui/empty-state";
import { Plane, Car, Calendar, AlertCircle } from "lucide-react";

export function Dashboard() {
  return (
    <div className="space-y-6 p-4 pb-24">
      {/* Hero Section - Next Trip */}
      <section>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
          Next Trip
        </h2>
        {nextTrip ? (
          <TripCard 
            term={nextTrip.term}
            departureFlight={nextTrip.departureFlight}
            returnFlight={nextTrip.returnFlight}
            departureTransport={nextTrip.departureTransport}
            returnTransport={nextTrip.returnTransport}
            status={nextTrip.status}
            onEdit={() => openTripDetails(nextTrip.term.id)}
          />
        ) : (
          <EmptyState 
            variant="trips" 
            action={{ label: 'Add Flight', onClick: () => {} }}
          />
        )}
      </section>

      {/* Stats Grid */}
      <section>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
          Quick Stats
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard
            value={stats.upcomingTrips}
            label="Upcoming Trips"
            icon={<Calendar className="w-4 h-4" />}
          />
          <StatCard
            value={stats.flightsBooked}
            label="Flights Booked"
            icon={<Plane className="w-4 h-4" />}
          />
          <StatCard
            value={stats.transportBooked}
            label="Transport Booked"
            icon={<Car className="w-4 h-4" />}
          />
          <StatCard
            value={stats.pendingTasks}
            label="Pending Tasks"
            icon={<AlertCircle className="w-4 h-4" />}
            trend={stats.pendingTasks > 0 ? 'up' : 'neutral'}
          />
        </div>
      </section>

      {/* This Week Preview */}
      <section>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
          This Week
        </h2>
        <div className="space-y-2">
          {thisWeekEvents.map(event => (
            <WeekPreviewItem key={event.id} event={event} />
          ))}
        </div>
      </section>
    </div>
  );
}
```

---

## Animation Standards

Create `src/lib/animations.ts`:

```typescript
// Standard animation configurations
export const transitions = {
  fast: { duration: 0.15 },
  default: { duration: 0.25 },
  slow: { duration: 0.35 },
  spring: { type: "spring", stiffness: 300, damping: 30 },
};

export const easings = {
  default: [0.4, 0, 0.2, 1],
  in: [0.4, 0, 1, 1],
  out: [0, 0, 0.2, 1],
  bounce: [0.68, -0.55, 0.265, 1.55],
};

// Framer Motion variants
export const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

export const slideUp = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

export const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

export const scaleOnTap = {
  scale: 0.98,
  transition: { duration: 0.1 },
};
```

---

## Migration Checklist

### Phase 1: Foundation
- [ ] Update CSS variables in `index.css`
- [ ] Update `tailwind.config.ts` with new colors
- [ ] Create animation utilities
- [ ] Test dark mode colors

### Phase 2: Components
- [ ] Create TripCard component
- [ ] Create StatCard component
- [ ] Update BottomNav component
- [ ] Update EmptyState component
- [ ] Create new Button variants if needed

### Phase 3: Pages
- [ ] Redesign Dashboard (Today tab)
- [ ] Redesign Trips tab
- [ ] Redesign Calendar tab
- [ ] Create Profile page (merge Settings)

### Phase 4: Polish
- [ ] Add page transitions
- [ ] Add card hover effects
- [ ] Implement loading skeletons
- [ ] Accessibility audit
- [ ] Performance optimization

---

## Accessibility Requirements

All components must meet WCAG 2.1 AA:

1. **Color Contrast**: Minimum 4.5:1 for text
2. **Focus States**: Visible focus rings on all interactive elements
3. **Touch Targets**: Minimum 44x44px for mobile
4. **Screen Readers**: Proper ARIA labels and roles
5. **Motion**: Respect `prefers-reduced-motion`

Example focus state:
```css
.focus-ring {
  @apply focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2;
}
```

---

This implementation guide provides a complete roadmap for applying the "Aether" design system to School Flight Sync. Start with Phase 1 and proceed incrementally, testing each phase before moving to the next.
