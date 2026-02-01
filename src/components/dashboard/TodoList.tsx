import { useMemo } from 'react';
import { format, isAfter, startOfDay } from 'date-fns';
import { Plane, Car, AlertCircle, Plus, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { FlightDetails, TransportDetails, Term } from '@/types/school';

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
}

export function TodoList({ 
  selectedSchool, 
  flights, 
  transport, 
  terms, 
  onAddFlight, 
  onAddTransport 
}: TodoListProps) {
  const now = startOfDay(new Date());

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
            description: 'Flight & transport needed for departure'
          });
        } else if (outboundFlight && outboundTransport.length === 0) {
          // Has flight, needs transport
          items.push({
            id: `needs-transport-out-${term.id}`,
            type: 'needs-transport',
            term,
            date: term.startDate,
            title: `${term.name}`,
            description: `Transport to airport for ${outboundFlight.airline} ${outboundFlight.flightNumber}`
          });
        } else if (!outboundFlight && outboundTransport.length > 0) {
          // Has transport, needs flight
          items.push({
            id: `needs-flight-out-${term.id}`,
            type: 'needs-flight',
            term,
            date: term.startDate,
            title: `${term.name}`,
            description: 'Flight needed (transport booked)'
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
            description: 'Flight & transport needed for return'
          });
        } else if (returnFlight && returnTransport.length === 0) {
          // Has flight, needs transport
          items.push({
            id: `needs-transport-ret-${term.id}`,
            type: 'needs-transport',
            term,
            date: term.endDate,
            title: `${term.name} Return`,
            description: `Transport from airport for ${returnFlight.airline} ${returnFlight.flightNumber}`
          });
        } else if (!returnFlight && returnTransport.length > 0) {
          // Has transport, needs flight
          items.push({
            id: `needs-flight-ret-${term.id}`,
            type: 'needs-flight',
            term,
            date: term.endDate,
            title: `${term.name} Return`,
            description: 'Flight needed (transport booked)'
          });
        }
      }
    });

    // Sort by date
    return items.sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [selectedSchool, flights, transport, terms, now]);

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

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground mb-4">
        {todoItems.length} item{todoItems.length > 1 ? 's' : ''} need attention
      </p>
      
      {todoItems.map((item) => (
        <Card 
          key={item.id} 
          className={cn(
            "overflow-hidden",
            item.type === 'needs-flight' ? 'border-l-4 border-l-blue-500' : 'border-l-4 border-l-green-500'
          )}
        >
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              {/* Icon */}
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
                item.type === 'needs-flight' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'
              )}>
                {item.type === 'needs-flight' ? <Plane className="w-5 h-5" /> : <Car className="w-5 h-5" />}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-medium truncate">{item.title}</h3>
                  <Badge 
                    variant="outline" 
                    className={cn(
                      "text-[10px] shrink-0",
                      item.term.school === 'benenden' 
                        ? 'border-blue-200 text-blue-700' 
                        : 'border-green-200 text-green-700'
                    )}
                  >
                    {item.term.school === 'benenden' ? 'Ben' : 'WA'}
                  </Badge>
                </div>
                
                <p className="text-sm text-muted-foreground mb-2">{item.description}</p>
                
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{format(item.date, 'EEE, MMM d')}</span>
                </div>

                {/* Action Button */}
                <Button 
                  size="sm" 
                  className="w-full"
                  onClick={() => {
                    if (item.type === 'needs-flight') {
                      onAddFlight(item.term.id);
                    } else {
                      onAddTransport(item.term.id);
                    }
                  }}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  {item.type === 'needs-flight' ? 'Add Flight' : 'Add Transport'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default TodoList;
