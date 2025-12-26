import { format } from "date-fns";
import { Calendar, Plane, Car, User, Phone, Clock, CreditCard, ChevronDown, ArrowRight, RefreshCw, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Term, FlightDetails, TransportDetails, NotTravellingStatus } from "@/types/school";
import { cn } from "@/lib/utils";
import { useState, useEffect, memo, useMemo } from "react";
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
  onSetNotTravelling: (termId: string, type: 'flights' | 'transport') => void;
  onClearNotTravelling: (termId: string, type: 'flights' | 'transport') => void;
  notTravellingStatus?: NotTravellingStatus;
  className?: string;
  isExpanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  onUpdateFlightStatus?: (flightId: string) => void;
  isUpdatingFlightStatus?: (flightId: string) => boolean;
  highlighted?: boolean;
}

const TermCard = memo(function TermCard({
  term,
  flights = [],
  transport = [],
  onAddFlight,
  onViewFlights,
  onAddTransport,
  onViewTransport,
  onSetNotTravelling,
  onClearNotTravelling,
  notTravellingStatus,
  className,
  isExpanded,
  onExpandedChange,
  onUpdateFlightStatus,
  isUpdatingFlightStatus,
  highlighted = false
}: TermCardProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [isOpen, setIsOpen] = useState(isExpanded || false);
  
  // Memoize computed values to prevent unnecessary recalculations
  const termTypeFlags = useMemo(() => ({
    isHoliday: term.type === 'holiday',
    isHalfTerm: term.type === 'half-term',
    isExeat: term.type === 'exeat',
    isShortLeave: term.type === 'short-leave',
    isLongLeave: term.type === 'long-leave'
  }), [term.type]);
  
  const { isHoliday, isHalfTerm, isExeat, isShortLeave, isLongLeave } = termTypeFlags;

  // Helper function to get flight status badge
  const getStatusBadge = (flight: FlightDetails) => {
    if (!flight.status) return null;
    
    const statusConfig = {
      scheduled: { color: 'bg-blue-100 text-blue-800', text: 'Scheduled' },
      active: { color: 'bg-green-100 text-green-800', text: 'In Flight' },
      landed: { color: 'bg-gray-100 text-gray-800', text: 'Landed' },
      cancelled: { color: 'bg-red-100 text-red-800', text: 'Cancelled' },
      delayed: { color: 'bg-orange-100 text-orange-800', text: 'Delayed' },
      diverted: { color: 'bg-purple-100 text-purple-800', text: 'Diverted' },
      unknown: { color: 'bg-gray-100 text-gray-600', text: 'Unknown' }
    };
    
    const config = statusConfig[flight.status.current] || statusConfig.unknown;
    
    return (
      <Badge className={`${config.color} text-xs px-2 py-0.5`}>
        {config.text}
        {flight.status.actualArrival?.delay && flight.status.actualArrival.delay > 0 && (
          <span className="ml-1">+{flight.status.actualArrival.delay}m</span>
        )}
      </Badge>
    );
  };

  // Helper function to get status icon
  const getStatusIcon = (flight: FlightDetails) => {
    if (!flight.status) return null;
    
    switch (flight.status.current) {
      case 'delayed':
      case 'cancelled':
        return <AlertCircle className="h-3 w-3 text-orange-500" />;
      case 'active':
        return <Plane className="h-3 w-3 text-green-500" />;
      case 'landed':
        return <span className="text-green-500">✓</span>;
      default:
        return null;
    }
  };
  const hasFlights = flights.length > 0;
  const hasTransport = transport.length > 0;

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
    
    // Get flights and transport for this direction
    const relevantFlights = flights.filter(f => {
      const isOutbound = f.type === 'outbound';
      return f.termId === term.id && (isStart ? isOutbound : !isOutbound);
    });

    // Filter transport by direction field (fallback to index-based for backwards compatibility)
    const transportDirection = isStart ? 'outbound' : 'return';
    const termTransport = transport.filter(t => t.termId === term.id);
    const relevantTransport = termTransport.filter((t, index) => {
      // If direction field exists, use it; otherwise fall back to index-based
      if (t.direction) {
        return t.direction === transportDirection;
      }
      // Fallback: index-based filtering for old data
      const isEvenIndex = index % 2 === 0;
      return isStart ? isEvenIndex : !isEvenIndex;
    });

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
          {/* Show existing flights */}
          {relevantFlights.length > 0 && (
            <div 
              className="space-y-2 cursor-pointer hover:bg-muted/10 p-2 rounded-md -m-2 transition-colors"
              onClick={() => onViewFlights(term.id)}
            >
              {relevantFlights.map((flight) => (
                <div key={flight.id} className="p-2 bg-muted/30 rounded-md">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-medium">{flight.airline} {flight.flightNumber}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">
                        {format(flight.departure.date, 'MMM dd')} {flight.departure.time}
                      </span>
                      {onUpdateFlightStatus && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-4 w-4 p-0"
                          disabled={isUpdatingFlightStatus?.(flight.id) || false}
                          onClick={async (e) => {
                            e.stopPropagation();
                            await onUpdateFlightStatus(flight.id);
                          }}
                          title="Update flight status"
                        >
                          <RefreshCw className={`h-2 w-2 ${isUpdatingFlightStatus?.(flight.id) ? 'animate-spin' : ''}`} />
                        </Button>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-xs text-muted-foreground">
                    <span>{flight.departure.airport} → {flight.arrival.airport}</span>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(flight)}
                      {flight.confirmationCode && (
                        <span className="font-medium">{flight.confirmationCode}</span>
                      )}
                    </div>
                  </div>
                  {flight.notes && (
                    <div className="text-xs text-muted-foreground mt-1">
                      <span className="font-medium">Notes:</span> {flight.notes}
                    </div>
                  )}
                  {flight.status && (
                    <div className="text-xs text-muted-foreground mt-1">
                      {flight.status.gate && (
                        <span className="mr-3">Gate: {flight.status.gate}</span>
                      )}
                      {flight.status.estimatedArrival && (
                        <span>Est. arrival: {flight.status.estimatedArrival.time}</span>
                      )}
                      {flight.status.lastUpdated && (
                        <div className="text-xs text-muted-foreground/70 mt-1">
                          Updated: {format(new Date(flight.status.lastUpdated), 'HH:mm')}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          
          {/* Show existing transport */}
          {relevantTransport.length > 0 && (
            <div 
              className="space-y-2 cursor-pointer hover:bg-muted/10 p-2 rounded-md -m-2 transition-colors"
              onClick={() => onViewTransport(term.id)}
            >
              {relevantTransport.map((transportItem) => (
                <div key={transportItem.id} className="p-3 bg-muted/20 rounded-lg border border-muted/40">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">
                        🚗
                      </span>
                      <span className="text-xs font-medium text-foreground">
                        {transportItem.type === 'school-coach' ? 'School Coach' : 'Taxi'}
                      </span>
                    </div>
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
                  
                  {transportItem.notes && (
                    <div className="mt-2 text-xs text-muted-foreground">
                      <span className="font-medium">Notes:</span> {transportItem.notes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
           
          {/* Flight and Transport buttons - inline layout */}
          <div className="space-y-2">
            {/* Flight section */}
            {notTravellingStatus?.noFlights ? (
              <Badge variant="secondary" className="text-xs">
                Not travelling (flights)
              </Badge>
            ) : relevantFlights.length === 0 && (
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="justify-start gap-2 flex-1"
                  onClick={() => onAddFlight(term.id)}
                >
                  <Plane className="h-4 w-4" />
                  Add Flight
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => onSetNotTravelling(term.id, 'flights')}
                  className="text-xs text-muted-foreground shrink-0"
                >
                  Not travelling
                </Button>
              </div>
            )}
            
            {/* Transport section */}
            {notTravellingStatus?.noTransport ? (
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  Not travelling (transport)
                </Badge>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => onClearNotTravelling(term.id, 'transport')}
                  className="text-xs h-6 px-2"
                >
                  Clear
                </Button>
              </div>
            ) : relevantTransport.length === 0 && (
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="justify-start gap-2 flex-1"
                  onClick={() => onAddTransport(term.id)}
                >
                  <Car className="h-4 w-4" />
                  Add Transport
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => onSetNotTravelling(term.id, 'transport')}
                  className="text-xs text-muted-foreground shrink-0"
                >
                  Not travelling
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const relevantEvent = getRelevantEvent();

  // Sync external expanded state with internal state
  useEffect(() => {
    if (isExpanded !== undefined && isExpanded !== isOpen) {
      setIsOpen(isExpanded);
    }
  }, [isExpanded, isOpen]);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    onExpandedChange?.(open);
  };

  return (
    <>
      <Card
        id={`term-card-${term.id}`}
        className={cn(
          "transition-all duration-300 hover:shadow-elegant group animate-fade-in overflow-hidden",
          highlighted && "ring-2 ring-primary ring-offset-2",
          className
        )}
      >
        <Collapsible open={isOpen} onOpenChange={handleOpenChange}>
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
                                   {getStatusIcon(flight)}
                                 </div>
                                 <div className="flex items-center gap-2">
                                   {getStatusBadge(flight)}
                                   {onUpdateFlightStatus && (
                                     <Button
                                       variant="ghost"
                                       size="sm"
                                       className="h-6 w-6 p-0"
                                       disabled={isUpdatingFlightStatus?.(flight.id) || false}
                                       onClick={async (e) => {
                                         e.stopPropagation();
                                         await onUpdateFlightStatus(flight.id);
                                       }}
                                       title="Update flight status"
                                     >
                                       <RefreshCw className={`h-3 w-3 ${isUpdatingFlightStatus?.(flight.id) ? 'animate-spin' : ''}`} />
                                     </Button>
                                   )}
                                 </div>
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
                                 {flight.notes && (
                                   <div className="text-xs text-muted-foreground mt-1">
                                     <span className="font-medium">Notes:</span> {flight.notes}
                                   </div>
                                 )}
                                 {flight.status && (
                                   <div className="text-xs text-muted-foreground mt-1">
                                     {flight.status.gate && (
                                       <span className="mr-3">Gate: {flight.status.gate}</span>
                                     )}
                                     {flight.status.estimatedArrival && (
                                       <span>Est. arrival: {flight.status.estimatedArrival.time}</span>
                                     )}
                                     {flight.status.lastUpdated && (
                                       <div className="text-xs text-muted-foreground/70 mt-1">
                                         Updated: {format(new Date(flight.status.lastUpdated), 'HH:mm')}
                                       </div>
                                     )}
                                   </div>
                                 )}
                               </div>
                            </div>
                          ))}
                          
                          {flights.length > 2 && (
                            <div className="text-xs text-muted-foreground text-center py-1">
                              +{flights.length - 2} more flights
                            </div>
                          )}
                          
                        </div>
                      ) : notTravellingStatus?.noFlights ? (
                        <div className="p-3 bg-muted/30 rounded-lg">
                          <div className="flex items-center justify-center">
                            <Badge variant="secondary" className="text-xs">
                              Not travelling
                            </Badge>
                          </div>
                        </div>
                       ) : (
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="justify-start gap-2 flex-1"
                            onClick={() => onAddFlight(term.id)}
                          >
                            <Plane className="h-4 w-4" />
                            Add Flight
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => onSetNotTravelling(term.id, 'flights')}
                            className="text-xs text-muted-foreground shrink-0"
                          >
                            Not travelling
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
                            
                            {transportItem.notes && (
                              <div className="mt-2 text-xs text-muted-foreground">
                                <span className="font-medium">Notes:</span> {transportItem.notes}
                              </div>
                            )}
                          </div>
                        ))}
                        
                        {transport.length > 2 && (
                          <div className="text-xs text-muted-foreground text-center py-1">
                            +{transport.length - 2} more transport
                          </div>
                        )}
                        
                      </div>
                    ) : notTravellingStatus?.noTransport ? (
                      <div className="p-3 bg-muted/20 rounded-lg">
                        <div className="flex items-center justify-center gap-3">
                          <Badge variant="secondary" className="text-xs">
                            Not travelling
                          </Badge>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => onClearNotTravelling(term.id, 'transport')}
                            className="text-xs h-7 px-3"
                          >
                            Clear Status
                          </Button>
                        </div>
                      </div>
                     ) : (
                       <div className="flex gap-2">
                         <Button 
                           variant="outline" 
                           size="sm" 
                           className="justify-start gap-2 flex-1"
                           onClick={() => onAddTransport(term.id)}
                         >
                           <Car className="h-4 w-4" />
                           Add Transport
                         </Button>
                         <Button 
                           variant="ghost" 
                           size="sm" 
                           onClick={() => onSetNotTravelling(term.id, 'transport')}
                           className="text-xs text-muted-foreground shrink-0"
                         >
                           Not travelling
                         </Button>
                       </div>
                     )}
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
});

export { TermCard };