import { format } from "date-fns";
import { Calendar, Plane, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Term, FlightDetails } from "@/types/school";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { TermDetailsDialog } from "@/components/ui/term-details-dialog";

interface TermCardProps {
  term: Term;
  flights?: FlightDetails[];
  onAddFlight: (termId: string) => void;
  onViewFlights: (termId: string) => void;
  className?: string;
  onCardClick?: (term: Term) => void;
}

export function TermCard({ 
  term, 
  flights = [], 
  onAddFlight, 
  onViewFlights,
  className,
  onCardClick
}: TermCardProps) {
  const [showDetails, setShowDetails] = useState(false);
  const isHoliday = term.type === 'holiday';
  const isHalfTerm = term.type === 'half-term';
  const isExeat = term.type === 'exeat';
  const isShortLeave = term.type === 'short-leave';
  const isLongLeave = term.type === 'long-leave';
  const hasFlights = flights.length > 0;

  // Show flight options for holidays, half terms, exeats, and leaves
  const shouldShowFlights = isHoliday || isHalfTerm || isExeat || isShortLeave || isLongLeave;

  const getTermTypeColor = () => {
    switch (term.type) {
      case 'holiday':
        return 'bg-gradient-warm text-accent-foreground';
      case 'half-term':
      case 'long-leave':
        return 'bg-accent/20 text-accent-foreground border border-accent/30';
      case 'exeat':
        return 'bg-primary/10 text-benenden border border-primary/20';
      case 'short-leave':
        return 'bg-secondary/10 text-wycombe border border-secondary/20';
      default:
        return term.school === 'benenden' 
          ? 'bg-gradient-academic text-primary-foreground' 
          : 'bg-gradient-elegant text-secondary-foreground';
    }
  };

  const getTypeDisplayName = () => {
    switch (term.type) {
      case 'exeat':
        return 'Fixed Exeat';
      case 'short-leave':
        return 'Short Leave';
      case 'long-leave':
        return 'Long Leave';
      case 'half-term':
        return 'Half Term';
      default:
        return term.type.replace('-', ' ');
    }
  };

  const duration = Math.ceil((term.endDate.getTime() - term.startDate.getTime()) / (1000 * 60 * 60 * 24));

  return (
    <>
      <Card 
        className={cn(
          "transition-all duration-300 hover:shadow-elegant group animate-fade-in cursor-pointer",
          className
        )}
        onClick={() => setShowDetails(true)}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-foreground">
              {term.name}
            </CardTitle>
            <Badge className={cn("text-xs font-medium", getTermTypeColor())}>
              {getTypeDisplayName()}
            </Badge>
          </div>
          <div className="flex items-center text-sm text-muted-foreground gap-2">
            <Calendar className="h-4 w-4" />
            <span>
              {format(term.startDate, 'MMM dd')} - {format(term.endDate, 'MMM dd, yyyy')}
            </span>
            <span className="text-xs">({duration} days)</span>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          {shouldShowFlights && (
            <div className="space-y-3">
              {hasFlights ? (
                <div className="space-y-2">
                  {flights.slice(0, 2).map((flight) => (
                    <div 
                      key={flight.id}
                      className="p-3 bg-muted/30 rounded-lg border border-muted/50"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm">
                            {flight.type === 'outbound' ? '✈️' : '🛬'}
                          </span>
                          <span className="text-xs font-medium text-foreground">
                            {flight.type === 'outbound' ? 'Outbound' : 'Return'}
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onViewFlights(term.id);
                          }}
                          className="h-6 w-6 p-0 hover:bg-background/80"
                        >
                          <Plane className="h-3 w-3" />
                        </Button>
                      </div>
                      
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-foreground">
                            {flight.airline} {flight.flightNumber}
                          </span>
                          <span className="text-muted-foreground">
                            {format(flight.departure.date, 'MMM dd')}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-muted-foreground">
                          <span>{flight.departure.airport} → {flight.arrival.airport}</span>
                          <span>{flight.departure.time}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {flights.length > 2 && (
                    <div className="text-xs text-muted-foreground text-center py-1">
                      +{flights.length - 2} more flights
                    </div>
                  )}
                  
                  <div className="flex justify-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddFlight(term.id);
                      }}
                      className="h-7 text-xs hover:bg-background/80"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Add Flight
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <span className="text-sm text-muted-foreground flex items-center gap-2">
                    <Plane className="h-4 w-4" />
                    No flights yet
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddFlight(term.id);
                    }}
                    className="h-8 w-8 p-0 hover:bg-background/80"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          )}
          <div className="text-center py-2">
            <div className="text-xs text-muted-foreground">
              Click for detailed schedule
            </div>
          </div>
        </CardContent>
      </Card>
      
      <TermDetailsDialog 
        term={term}
        open={showDetails}
        onOpenChange={setShowDetails}
      />
    </>
  );
}