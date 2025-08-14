import { format } from "date-fns";
import { Calendar, Plane, Plus, Info } from "lucide-react";
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
}

export function TermCard({ 
  term, 
  flights = [], 
  onAddFlight, 
  onViewFlights,
  className 
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
      <Card className={cn(
        "transition-all duration-300 hover:shadow-elegant group animate-fade-in",
        className
      )}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-foreground">
              {term.name}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDetails(true);
                }}
                className="h-8 w-8 p-0 hover:bg-background/80"
              >
                <Info className="h-4 w-4" />
              </Button>
              <Badge className={cn("text-xs font-medium", getTermTypeColor())}>
                {getTypeDisplayName()}
              </Badge>
            </div>
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
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Plane className="h-4 w-4" />
                  Flight Details
                </span>
                {hasFlights ? (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => onViewFlights(term.id)}
                    className="h-7 text-xs"
                  >
                    View ({flights.length})
                  </Button>
                ) : (
                  <Button 
                    variant="default" 
                    size="sm"
                    onClick={() => onAddFlight(term.id)}
                    className="h-7 text-xs bg-gradient-warm hover:opacity-90"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add
                  </Button>
                )}
              </div>
              
              {hasFlights && (
                <div className="space-y-2">
                  {flights.slice(0, 2).map((flight) => (
                    <div 
                      key={flight.id} 
                      className="text-xs p-2 rounded-md bg-muted/50 border border-muted"
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-foreground">
                          {flight.type === 'outbound' ? '✈️ Outbound' : '🛬 Return'}
                        </span>
                        <span className="text-muted-foreground">
                          {flight.flightNumber}
                        </span>
                      </div>
                      <div className="text-muted-foreground mt-1">
                        {flight.departure.airport} → {flight.arrival.airport}
                      </div>
                      <div className="text-muted-foreground">
                        {format(flight.departure.date, 'MMM dd')} at {flight.departure.time}
                      </div>
                    </div>
                  ))}
                  {flights.length > 2 && (
                    <div className="text-xs text-muted-foreground text-center py-1">
                      +{flights.length - 2} more flights
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
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