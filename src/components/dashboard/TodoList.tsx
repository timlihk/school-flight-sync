import { useMemo, useState } from 'react';
import { format, isAfter, startOfDay, differenceInDays } from 'date-fns';
import { Plane, Car, AlertCircle, Plus, CheckCircle2, Flame, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { FlightDetails, TransportDetails, Term } from '@/types/school';

type FilterType = 'all' | 'flight' | 'transport';
type Priority = 'high' | 'medium' | 'low';

interface TodoListProps {
  selectedSchool: 'both' | 'benenden' | 'wycombe';
  flights: FlightDetails[];
  transport: TransportDetails[];
  terms: Term[];
  onAddFlight: (termId: string) => void;
  onAddTransport: (termId: string) => void;
}

interface TodoItem {
  id: string;
  type: 'needs-flight' | 'needs-transport';
  term: Term;
  date: Date;
  title: string;
  description: string;
  priority: Priority;
}

const HIGH_PRIORITY_DAYS = 90;

export function TodoList({ 
  selectedSchool, 
  flights, 
  transport, 
  terms, 
  onAddFlight, 
  onAddTransport 
}: TodoListProps) {
  const [filter, setFilter] = useState<FilterType>('all');
  const now = startOfDay(new Date());

  const getPriority = (date: Date): Priority => {
    const daysUntil = differenceInDays(date, now);
    if (daysUntil <= HIGH_PRIORITY_DAYS) return 'high';
    if (daysUntil <= 180) return 'medium';
    return 'low';
  };

  const todoItems = useMemo(() => {
    const items: TodoItem[] = [];

    // Filter terms by school
    const relevantTerms = terms.filter(
      term => selectedSchool === 'both' || term.school === selectedSchool
    );

    relevantTerms.forEach(term => {
      const termFlights = flights.filter(f => f.termId === term.id);
      const termTransport = transport.filter(t => t.termId === term.id);

      const outboundFlight = termFlights.find(f => f.type === 'outbound');
      const returnFlight = termFlights.find(f => f.type === 'return');
      const outboundTransport = termTransport.filter(t => t.direction === 'outbound' || !t.direction);
      const returnTransport = termTransport.filter(t => t.direction === 'return');

      // Check outbound (departure from school at term start)
      if (isAfter(term.startDate, now)) {
        if (!outboundFlight && outboundTransport.length === 0) {
          // Needs both flight and transport
          items.push({
            id: `needs-both-out-${term.id}`,
            type: 'needs-flight',
            term,
            date: term.startDate,
            title: `${term.name}`,
            description: 'Flight & transport needed',
            priority: getPriority(term.startDate)
          });
        } else if (outboundFlight && outboundTransport.length === 0) {
          // Has flight, needs transport
          items.push({
            id: `needs-transport-out-${term.id}`,
            type: 'needs-transport',
            term,
            date: term.startDate,
            title: `${term.name}`,
            description: `Transport for ${outboundFlight.airline} ${outboundFlight.flightNumber}`,
            priority: getPriority(term.startDate)
          });
        } else if (!outboundFlight && outboundTransport.length > 0) {
          // Has transport, needs flight
          items.push({
            id: `needs-flight-out-${term.id}`,
            type: 'needs-flight',
            term,
            date: term.startDate,
            title: `${term.name}`,
            description: 'Flight needed (transport booked)',
            priority: getPriority(term.startDate)
          });
        }
      }

      // Check return (to school at term end)
      if (isAfter(term.endDate, now)) {
        if (!returnFlight && returnTransport.length === 0) {
          // Needs both flight and transport
          items.push({
            id: `needs-both-ret-${term.id}`,
            type: 'needs-flight',
            term,
            date: term.endDate,
            title: `${term.name} Return`,
            description: 'Flight & transport needed',
            priority: getPriority(term.endDate)
          });
        } else if (returnFlight && returnTransport.length === 0) {
          // Has flight, needs transport
          items.push({
            id: `needs-transport-ret-${term.id}`,
            type: 'needs-transport',
            term,
            date: term.endDate,
            title: `${term.name} Return`,
            description: `Transport for ${returnFlight.airline} ${returnFlight.flightNumber}`,
            priority: getPriority(term.endDate)
          });
        } else if (!returnFlight && returnTransport.length > 0) {
          // Has transport, needs flight
          items.push({
            id: `needs-flight-ret-${term.id}`,
            type: 'needs-flight',
            term,
            date: term.endDate,
            title: `${term.name} Return`,
            description: 'Flight needed (transport booked)',
            priority: getPriority(term.endDate)
          });
        }
      }
    });

    // Sort by priority (high first) then by date
    return items.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      return a.date.getTime() - b.date.getTime();
    });
  }, [selectedSchool, flights, transport, terms, now]);

  // Apply filter
  const filteredItems = useMemo(() => {
    if (filter === 'all') return todoItems;
    return todoItems.filter(item => item.type === `needs-${filter}`);
  }, [todoItems, filter]);

  // Count high priority items
  const highPriorityCount = todoItems.filter(item => item.priority === 'high').length;

  if (todoItems.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-12 text-center">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-lg font-medium mb-2">All caught up!</h3>
          <p className="text-sm text-muted-foreground">
            No pending bookings for upcoming travels.
          </p>
        </CardContent>
      </Card>
    );
  }

  const filterButtons: { key: FilterType; label: string; count: number }[] = [
    { key: 'all', label: 'All', count: todoItems.length },
    { key: 'flight', label: 'Flights', count: todoItems.filter(i => i.type === 'needs-flight').length },
    { key: 'transport', label: 'Transport', count: todoItems.filter(i => i.type === 'needs-transport').length },
  ];

  return (
    <div className="space-y-3">
      {/* Filter buttons */}
      <div className="flex gap-2 mb-4">
        {filterButtons.map(({ key, label, count }) => (
          <Button
            key={key}
            size="sm"
            variant={filter === key ? 'default' : 'outline'}
            className="flex-1 h-9"
            onClick={() => setFilter(key)}
          >
            {label}
            <span className="ml-1.5 text-xs opacity-70">({count})</span>
          </Button>
        ))}
      </div>

      {/* Summary */}
      <div className="flex items-center justify-between text-sm">
        <p className="text-muted-foreground">
          {filteredItems.length} item{filteredItems.length !== 1 ? 's' : ''}
        </p>
        {highPriorityCount > 0 && (
          <div className="flex items-center gap-1.5 text-journey-pending">
            <Flame className="w-4 h-4" />
            <span className="font-medium">{highPriorityCount} urgent</span>
          </div>
        )}
      </div>
      
      {filteredItems.map((item) => (
        <Card 
          key={item.id} 
          className={cn(
            "overflow-hidden",
            item.type === 'needs-flight' ? 'border-l-4 border-l-blue-500' : 'border-l-4 border-l-green-500',
            item.priority === 'high' && 'ring-1 ring-journey-pending/30'
          )}
        >
          <CardContent className="p-3">
            <div className="flex items-start gap-2.5">
              {/* Icon */}
              <div className={cn(
                "w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0",
                item.type === 'needs-flight' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'
              )}>
                {item.type === 'needs-flight' ? <Plane className="w-4 h-4" /> : <Car className="w-4 h-4" />}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <h3 className="font-medium text-sm truncate">{item.title}</h3>
                  {item.priority === 'high' && (
                    <Flame className="w-3.5 h-3.5 text-journey-pending flex-shrink-0" />
                  )}
                </div>
                
                <p className="text-xs text-muted-foreground mb-1.5">{item.description}</p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {format(item.date, 'MMM d')}
                    </span>
                    <Badge 
                      variant="outline" 
                      className={cn(
                        "text-[9px] px-1 py-0 h-4",
                        item.term.school === 'benenden' 
                          ? 'border-blue-200 text-blue-700' 
                          : 'border-green-200 text-green-700'
                      )}
                    >
                      {item.term.school === 'benenden' ? 'Ben' : 'WA'}
                    </Badge>
                  </div>

                  {/* Action Button */}
                  <Button 
                    size="sm" 
                    className="h-7 text-xs px-2"
                    onClick={() => {
                      if (item.type === 'needs-flight') {
                        onAddFlight(item.term.id);
                      } else {
                        onAddTransport(item.term.id);
                      }
                    }}
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" />
                    {item.type === 'needs-flight' ? 'Flight' : 'Transport'}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default TodoList;
