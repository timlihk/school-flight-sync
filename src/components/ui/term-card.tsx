import { format } from "date-fns";
import { Calendar, Plane, Plus, Car, User, Phone, Clock, CreditCard, ChevronDown, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Term, FlightDetails, TransportDetails } from "@/types/school";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { TermDetailsDialog } from "@/components/ui/term-details-dialog";
import { termDetails, getTermDetailsKey } from "@/data/term-details";

interface TermCardProps {
  term: Term;
  flights?: FlightDetails[];
  transport?: TransportDetails[];
  onAddFlight: (termId: string) => void;
  onViewFlights: (termId: string) => void;
  onAddTransport: (termId: string) => void;
  onViewTransport: (termId: string) => void;
  className?: string;
  onCardClick?: (term: Term) => void;
}

export function TermCard({ 
  term, 
  flights = [], 
  transport = [],
  onAddFlight, 
  onViewFlights,
  onAddTransport,
  onViewTransport,
  className,
  onCardClick
}: TermCardProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const isHoliday = term.type === 'holiday';
  const isHalfTerm = term.type === 'half-term';
  const isExeat = term.type === 'exeat';
  const isShortLeave = term.type === 'short-leave';
  const isLongLeave = term.type === 'long-leave';
  const hasFlights = flights.length > 0;
  const hasTransport = transport.length > 0;
  const isAutumnTermStart = term.type === 'term' && term.name.toLowerCase().includes('autumn');

  // Show flight options for holidays, half terms, exeats, leaves, and term starts
  const shouldShowFlights = isHoliday || isHalfTerm || isExeat || isShortLeave || isLongLeave || term.type === 'term';

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

  // Get specific timing information from term details
  const termDetailsKey = getTermDetailsKey(term.name, term.startDate, term.school);
  const termEventsData = termDetails[term.school]?.[termDetailsKey] || [];
  
  // Find the relevant event based on term type and dates
  const getRelevantEvent = () => {
    if (term.type === 'term') {
      // For term starts, look for "return to School" or "Term begins" events
      return termEventsData.find(event => 
        event.event.toLowerCase().includes('return to school') ||
        event.event.toLowerCase().includes('term begins') ||
        event.event.toLowerCase().includes('girls return')
      );
    } else if (term.type === 'holiday') {
      // For holidays, look for "Term ends" events
      return termEventsData.find(event => 
        event.event.toLowerCase().includes('term ends')
      );
    } else if (term.type === 'exeat' || term.type === 'short-leave') {
      // For exeats/short leaves, look for "begins" events
      return termEventsData.find(event => 
        (event.event.toLowerCase().includes('exeat begins') ||
         event.event.toLowerCase().includes('short leave')) &&
        event.date.toLowerCase().includes(format(term.startDate, 'MMMM').toLowerCase())
      );
    } else if (term.type === 'half-term' || term.type === 'long-leave') {
      // For half terms/long leaves, look for "begins" events
      return termEventsData.find(event => 
        (event.event.toLowerCase().includes('half term begins') ||
         event.event.toLowerCase().includes('long leave')) &&
        event.date.toLowerCase().includes(format(term.startDate, 'MMMM').toLowerCase())
      );
    }
    return null;
  };

  const renderTravelCard = (direction: 'start' | 'end') => {
    const isStart = direction === 'start';
    const date = isStart ? term.startDate : term.endDate;
    const title = isStart ? 'Travel from School' : 'Return to School';
    
    return (
      <Card className="border border-border">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={cn(
                "p-2 rounded-full",
                isStart ? "bg-red-100 dark:bg-red-900" : "bg-green-100 dark:bg-green-900"
              )}>
                <ArrowRight className={cn(
                  "h-4 w-4",
                  isStart ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400"
                )} />
              </div>
              <div>
                <h4 className="font-medium text-sm">{title}</h4>
                <p className="text-xs text-muted-foreground">
                  {format(date, 'EEE, MMM dd yyyy')}
                </p>
              </div>
            </div>
            <Badge 
              variant="outline" 
              className={cn(
                "text-xs",
                isStart ? "border-red-200 text-red-700" : "border-green-200 text-green-700"
              )}
            >
              {isStart ? 'Departure' : 'Return'}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0 space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="justify-start gap-2"
              onClick={() => onAddFlight(term.id)}
            >
              <Plane className="h-4 w-4" />
              Add Flight
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="justify-start gap-2"
              onClick={() => onAddTransport(term.id)}
            >
              <Car className="h-4 w-4" />
              Add Transport
            </Button>
          </div>
          
          <div className="text-xs text-muted-foreground space-y-1">
            <p>• No flights booked</p>
            <p>• No transport arranged</p>
          </div>
        </CardContent>
      </Card>
    );
  };

  const relevantEvent = getRelevantEvent();

  return (
    <>
      <Card 
        className={cn(
          "transition-all duration-300 hover:shadow-elegant group animate-fade-in overflow-hidden",
          className
        )}
      >
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleTrigger asChild>
            <CardHeader className="pb-3 cursor-pointer hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <CardTitle className="text-lg font-semibold text-foreground">
                        {term.name}
                      </CardTitle>
                      <div className="flex items-center text-sm text-muted-foreground gap-2">
                        <span>
                          {term.type === 'term' 
                            ? format(term.startDate, 'MMM dd yyyy')
                            : `${format(term.startDate, 'MMM dd')} - ${format(term.endDate, 'MMM dd, yyyy')}`
                          }
                          {relevantEvent && relevantEvent.time && (
                            <span className="ml-2 font-medium">{relevantEvent.time}</span>
                          )}
                        </span>
                        {term.type !== 'term' && <span className="text-xs">({duration} days)</span>}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Badge className={cn("text-xs font-medium", getTermTypeColor())}>
                    {getTypeDisplayName()}
                  </Badge>
                  <ChevronDown 
                    className={cn(
                      "h-4 w-4 transition-transform duration-200",
                      isOpen && "rotate-180"
                    )} 
                  />
                </div>
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          
          <CollapsibleContent>
            <CardContent className="pt-0">
              {/* Show travel cards for exeat and half-term events */}
              {(term.type === 'exeat' || term.type === 'half-term' || term.type === 'short-leave' || term.type === 'long-leave') ? (
                <div className="grid gap-4">
                  {renderTravelCard('start')}
                  {renderTravelCard('end')}
                </div>
              ) : (
                <>
                  {shouldShowFlights && (
                    <div 
                      className="space-y-3 cursor-pointer p-2 rounded-lg hover:bg-muted/10 transition-colors"
                      onClick={() => onViewFlights(term.id)}
                    >
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
                                    {format(flight.departure.date, 'MMM dd')} {flight.departure.time}
                                  </span>
                                </div>
                                <div className="flex justify-between items-center text-muted-foreground">
                                  <span>{flight.departure.airport} → {flight.arrival.airport}</span>
                                  {flight.confirmationCode && (
                                    <span className="font-medium">{flight.confirmationCode}</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                          
                          {flights.length > 2 && (
                            <div className="text-xs text-muted-foreground text-center py-1">
                              +{flights.length - 2} more flights
                            </div>
                          )}
                          
                          {!isAutumnTermStart && (
                            <div className="flex justify-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onViewFlights(term.id);
                                }}
                                className="h-7 text-xs hover:bg-background/80"
                              >
                                <Plane className="h-3 w-3 mr-1" />
                                View Flights
                              </Button>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div 
                          className="flex items-center justify-between p-3 bg-muted/30 rounded-lg cursor-pointer hover:bg-muted/10 transition-colors"
                          onClick={() => onAddFlight(term.id)}
                        >
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
                            <Plane className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Transport Section */}
                  <div 
                    className="space-y-3 cursor-pointer p-2 rounded-lg hover:bg-muted/10 transition-colors"
                    onClick={() => onViewTransport(term.id)}
                  >
                    {hasTransport ? (
                      <div className="space-y-2">
                        {transport.slice(0, 2).map((transportItem) => (
                          <div 
                            key={transportItem.id}
                            className="p-3 bg-muted/20 rounded-lg border border-muted/40"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <span className="text-sm">
                                  🚗
                                </span>
                                <span className="text-xs font-medium text-foreground">
                                  {transportItem.type === 'school-coach' ? 'School Coach' : 'Taxi'}
                                </span>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onViewTransport(term.id);
                                }}
                                className="h-6 w-6 p-0 hover:bg-background/80"
                              >
                                <Car className="h-3 w-3" />
                              </Button>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-1 text-xs">
                              <div className="flex items-center gap-1 text-muted-foreground">
                                <User className="h-3 w-3" />
                                <span className="truncate">{transportItem.driverName}</span>
                              </div>
                              <div className="flex items-center gap-1 text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                <span>{transportItem.pickupTime}</span>
                              </div>
                              <div className="flex items-center gap-1 text-muted-foreground">
                                <Phone className="h-3 w-3" />
                                <span className="truncate">{transportItem.phoneNumber}</span>
                              </div>
                              <div className="flex items-center gap-1 text-muted-foreground">
                                <CreditCard className="h-3 w-3" />
                                <span className="truncate">{transportItem.licenseNumber}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                        
                        {transport.length > 2 && (
                          <div className="text-xs text-muted-foreground text-center py-1">
                            +{transport.length - 2} more transport
                          </div>
                        )}
                        
                        {!isAutumnTermStart && (
                          <div className="flex justify-center">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                onViewTransport(term.id);
                              }}
                              className="h-8 w-8 p-0 hover:bg-background/80"
                            >
                              <Car className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div 
                        className="flex items-center justify-between p-3 bg-muted/20 rounded-lg cursor-pointer hover:bg-muted/10 transition-colors"
                        onClick={() => onAddTransport(term.id)}
                      >
                        <span className="text-sm text-muted-foreground flex items-center gap-2">
                          <Car className="h-4 w-4" />
                          No transport yet
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onAddTransport(term.id);
                          }}
                          className="h-8 w-8 p-0 hover:bg-background/80"
                        >
                          <Car className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                  <div 
                    className="text-center py-2 cursor-pointer hover:bg-muted/10 rounded-lg transition-colors"
                    onClick={() => setShowDetails(true)}
                  >
                    <div className="text-xs text-muted-foreground">
                      Click for detailed schedule
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>
      
      <TermDetailsDialog 
        term={term}
        open={showDetails}
        onOpenChange={setShowDetails}
      />
    </>
  );
}