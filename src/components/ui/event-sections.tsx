import React from "react";
import { format } from "date-fns";
import { Calendar, ChevronDown, Plane, Car, ArrowRight } from "lucide-react";
import { Term } from "@/types/school";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

interface EventSectionsProps {
  terms: Term[];
  school: 'benenden' | 'wycombe';
  className?: string;
}

export function EventSections({ terms, school, className }: EventSectionsProps) {
  const [openEvents, setOpenEvents] = React.useState<Set<string>>(new Set());

  // Filter events by type (exeat/half-term for Benenden, short-leave/long-leave for Wycombe)
  const breakEvents = terms.filter(term => 
    school === 'benenden' 
      ? ['exeat', 'half-term'].includes(term.type)
      : ['short-leave', 'long-leave'].includes(term.type)
  );

  const toggleEvent = (eventId: string) => {
    const newOpenEvents = new Set(openEvents);
    if (newOpenEvents.has(eventId)) {
      newOpenEvents.delete(eventId);
    } else {
      newOpenEvents.add(eventId);
    }
    setOpenEvents(newOpenEvents);
  };

  const getEventBadgeColor = (type: Term['type']) => {
    switch (type) {
      case 'exeat':
      case 'short-leave':
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300";
      case 'half-term':
      case 'long-leave':
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const getEventTypeName = (type: Term['type']) => {
    switch (type) {
      case 'exeat':
        return 'Fixed Exeat';
      case 'short-leave':
        return 'Short Leave';
      case 'half-term':
        return 'Half Term';
      case 'long-leave':
        return 'Long Leave';
      default:
        return type;
    }
  };

  const renderTravelCard = (event: Term, direction: 'start' | 'end') => {
    const isStart = direction === 'start';
    const date = isStart ? event.startDate : event.endDate;
    const title = isStart ? 'Travel from School' : 'Return to School';
    const icon = isStart ? ArrowRight : ArrowRight;
    
    return (
      <Card className="border border-border">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={cn(
                "p-2 rounded-full",
                isStart ? "bg-red-100 dark:bg-red-900" : "bg-green-100 dark:bg-green-900"
              )}>
                {React.createElement(icon, { 
                  className: cn(
                    "h-4 w-4",
                    isStart ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400"
                  )
                })}
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
            <Button variant="outline" size="sm" className="justify-start gap-2">
              <Plane className="h-4 w-4" />
              Add Flight
            </Button>
            <Button variant="outline" size="sm" className="justify-start gap-2">
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

  if (breakEvents.length === 0) {
    return null;
  }

  return (
    <div className={cn("space-y-4", className)}>
      {breakEvents.map((event) => {
        const duration = Math.ceil((event.endDate.getTime() - event.startDate.getTime()) / (1000 * 60 * 60 * 24));
        const isOpen = openEvents.has(event.id);
        
        return (
          <Card key={event.id} className="overflow-hidden">
            <Collapsible open={isOpen} onOpenChange={() => toggleEvent(event.id)}>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <CardTitle className="text-base font-semibold">
                            {event.name}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground">
                            {`${format(event.startDate, 'MMM dd')} - ${format(event.endDate, 'MMM dd, yyyy')}`} ({duration} days)
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant="secondary" 
                        className={cn("text-xs", getEventBadgeColor(event.type))}
                      >
                        {getEventTypeName(event.type)}
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
                  <div className="grid gap-4 md:grid-cols-2">
                    {renderTravelCard(event, 'start')}
                    {renderTravelCard(event, 'end')}
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        );
      })}
    </div>
  );
}